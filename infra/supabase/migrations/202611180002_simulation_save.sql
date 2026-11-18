-- World Evolution V0.3.0 — Simulation & Save Engine
-- Upgrade V0.2.0: run AFTER 202611180001_foundation.sql, once. No reset.
-- SHA-256 uses PostgreSQL core sha256(bytea); no pgcrypto extension required.
begin;
alter table public.worlds drop constraint worlds_day_check;
alter table public.worlds add constraint worlds_day_check check(day>=1);
create table private.world_simulations(
 world_id uuid primary key references public.worlds(id) on delete cascade,
 revision integer not null default 0 check(revision>=0),payload text not null,checksum text not null,
 saved_at timestamptz not null default clock_timestamp(),lease_token uuid,lease_epoch integer not null default 0,
 lease_until timestamptz not null default '-infinity',save_count bigint not null default 0,write_bytes bigint not null default 0
);
create table private.world_save_history(
 world_id uuid not null references public.worlds(id) on delete cascade,revision integer not null,
 request_id uuid not null,request_checksum text not null,kind text not null check(kind in ('full','delta')),
 payload text not null,payload_checksum text not null,result_checksum text not null,
 tick bigint not null,saved_at timestamptz not null default clock_timestamp(),primary key(world_id,revision),unique(world_id,request_id)
);
alter table private.world_simulations enable row level security;
alter table private.world_save_history enable row level security;
-- No direct table access, including SELECT: only owner-checked RPC below.
revoke all on private.world_simulations,private.world_save_history from public,anon,authenticated;

create function private.sim_hash(p_text text) returns text language sql immutable set search_path='' as $$
 select encode(sha256(convert_to(p_text,'UTF8')),'hex');
$$;
create function private.sim_seed(p_seed text) returns bigint language plpgsql immutable set search_path='' as $$
declare v bigint:=2166136261;i integer;
begin for i in 1..length(p_seed) loop v:=((v # ascii(substr(p_seed,i,1))) * 16777619)%4294967296;end loop;return case when v=0 then 1 else v end;end;$$;
create function private.sim_initial(w public.worlds) returns text language sql stable set search_path='' as $$
 select jsonb_build_object('schemaVersion',2,'engineVersion','we-sim-1','mapVersion','we-map-1','masterDataVersion','1.2',
 'catalogChecksum',w.catalog_checksum,'worldId',w.id,'seed',w.seed,'climateId',w.climate_id,'population',20,
 'tick',0,'subTick',0,'rngState',private.sim_seed(w.seed||'|'||w.climate_id),'rngDraws',0,'speed',1,'paused',true,'commandSeq',0,'activeMillis',0)::text;
$$;
create function private.sim_validate(s jsonb,w public.worlds) returns void language plpgsql set search_path='' as $$
declare k text;v numeric;
begin
 if jsonb_typeof(s)<>'object' or (select count(*) from jsonb_object_keys(s))<>17
 or s->'schemaVersion' is distinct from '2'::jsonb or s->>'engineVersion' is distinct from 'we-sim-1'
 or s->>'mapVersion' is distinct from 'we-map-1' or s->'masterDataVersion' is distinct from '"1.2"'::jsonb
 or s->>'catalogChecksum' is distinct from w.catalog_checksum or s->>'worldId' is distinct from w.id::text
 or s->>'seed' is distinct from w.seed or s->>'climateId' is distinct from w.climate_id
 or s->'population' is distinct from '20'::jsonb or jsonb_typeof(s->'paused') is distinct from 'boolean'
 or s->'speed' not in ('1'::jsonb,'2'::jsonb,'4'::jsonb) then raise exception 'INVALID_SAVE' using errcode='22023';end if;
 foreach k in array array['tick','subTick','rngState','rngDraws','speed','commandSeq','activeMillis'] loop
  if jsonb_typeof(s->k) is distinct from 'number' then raise exception 'INVALID_SAVE' using errcode='22023';end if;
  v:=(s->>k)::numeric;if v<>trunc(v) or v<0 or v>1000000000000 then raise exception 'INVALID_SAVE' using errcode='22023';end if;
 end loop;
 if (s->>'subTick')::bigint>99 or (s->>'rngState')::bigint not between 1 and 4294967295 or s->>'rngDraws'<>s->>'tick' then raise exception 'INVALID_SAVE' using errcode='22023';end if;
end;$$;

create function private.sim_materialize(p_world uuid,p_revision integer) returns text language plpgsql set search_path='' as $$
declare r private.world_save_history;v text;previous integer;start_revision integer;
begin
 select max(revision) into start_revision from private.world_save_history where world_id=p_world and revision<=p_revision and kind='full';
 if start_revision is null then raise exception 'SAVE_NOT_FOUND' using errcode='P0002';end if;
 previous:=start_revision-1;
 for r in select * from private.world_save_history where world_id=p_world and revision between start_revision and p_revision order by revision loop
  if r.revision<>previous+1 or private.sim_hash(r.payload)<>r.payload_checksum then raise exception 'SAVE_CORRUPT' using errcode='22023';end if;
  if r.kind='full' then v:=r.payload;else v:=(v::jsonb||r.payload::jsonb)::text;end if;
  if private.sim_hash(v)<>r.result_checksum then raise exception 'SAVE_CORRUPT' using errcode='22023';end if;
  previous:=r.revision;
 end loop;
 if previous<>p_revision then raise exception 'SAVE_NOT_FOUND' using errcode='P0002';end if;return v;
end;$$;

create function private.sim_response(p_world uuid,p_token uuid) returns jsonb language sql stable set search_path='' as $$
 select jsonb_build_object('head',jsonb_build_object('revision',s.revision,'payload',s.payload,'checksum',s.checksum,'savedAt',s.saved_at),
 'owned',coalesce(s.lease_token=p_token and s.lease_until>clock_timestamp(),false),'epoch',s.lease_epoch,
 'remainingMs',greatest(0,extract(epoch from(s.lease_until-clock_timestamp()))*1000)::integer,
 'saveCount',s.save_count,'writeBytes',s.write_bytes,
 'storedBytes',octet_length(s.payload)+coalesce((select sum(octet_length(h.payload)) from private.world_save_history h where h.world_id=p_world),0))
 from private.world_simulations s where s.world_id=p_world;
$$;

create function private.simulation_rpc(p_world uuid,p_token uuid,p_action text,p_epoch integer default 0,p_revision integer default 0,
 p_request uuid default null,p_kind text default null,p_payload text default null,p_checksum text default null,p_target integer default null)
returns jsonb language plpgsql security definer set search_path='' as $$
declare w public.worlds;s private.world_simulations;old private.world_save_history;v text;patch jsonb;next_state jsonb;
 result_hash text;next_revision integer;kind text;history_payload text;cutoff integer;rows jsonb;inserted integer;
begin
 if auth.uid() is null then raise exception 'AUTH_REQUIRED' using errcode='42501';end if;
 select * into w from public.worlds where id=p_world and owner_id=auth.uid() for update;
 if not found then raise exception 'WORLD_NOT_FOUND' using errcode='P0002';end if;
 if p_token is null then raise exception 'INVALID_SESSION' using errcode='22023';end if;
 if p_action not in ('open','renew','takeover','release','save','history','read','restore') or p_action is null then raise exception 'INVALID_ACTION' using errcode='22023';end if;
 v:=private.sim_initial(w);
 insert into private.world_simulations(world_id,payload,checksum) values(w.id,v,private.sim_hash(v)) on conflict do nothing;
 get diagnostics inserted=row_count;
 if inserted=1 then
 insert into private.world_save_history(world_id,revision,request_id,request_checksum,kind,payload,payload_checksum,result_checksum,tick)
 values(w.id,0,w.id,private.sim_hash(v),'full',v,private.sim_hash(v),private.sim_hash(v),0) on conflict do nothing;
 end if;
 select * into s from private.world_simulations where world_id=w.id for update;
 if p_action='history' then
  select coalesce(jsonb_agg(jsonb_build_object('revision',h.revision,'kind',h.kind,'tick',h.tick,'savedAt',h.saved_at,'bytes',octet_length(h.payload)) order by h.revision desc),'[]'::jsonb) into rows from private.world_save_history h where h.world_id=w.id;
  return jsonb_build_object('history',rows);
 elsif p_action='read' then
  v:=private.sim_materialize(w.id,p_target);perform private.sim_validate(v::jsonb,w);
  return jsonb_build_object('head',jsonb_build_object('revision',p_target,'payload',v,'checksum',private.sim_hash(v),'savedAt',(select saved_at from private.world_save_history where world_id=w.id and revision=p_target)));
 elsif p_action in ('open','renew','takeover') then
  if p_action='takeover' or (p_action='open' and s.lease_until<=clock_timestamp()) then
   update private.world_simulations set lease_token=p_token,lease_epoch=lease_epoch+1,lease_until=clock_timestamp()+interval '75 seconds' where world_id=w.id;
  elsif s.lease_token=p_token and s.lease_until>clock_timestamp() then
   update private.world_simulations set lease_until=clock_timestamp()+interval '75 seconds' where world_id=w.id;
  end if;
  return private.sim_response(w.id,p_token);
 elsif p_action='release' then
  update private.world_simulations set lease_token=null,lease_until=clock_timestamp() where world_id=w.id and lease_token=p_token and lease_epoch=p_epoch;
  return jsonb_build_object('released',true);
 end if;
 -- Retry the exact request without creating another revision, even after a lost response.
 if p_request is null then raise exception 'INVALID_REQUEST' using errcode='22023';end if;
 select * into old from private.world_save_history where world_id=w.id and request_id=p_request;
 if found then
  if old.request_checksum<>coalesce(p_checksum,'restore:'||p_target::text) then raise exception 'REQUEST_MISMATCH' using errcode='22023';end if;
  v:=private.sim_materialize(w.id,old.revision);
  return private.sim_response(w.id,p_token)||jsonb_build_object('ack',jsonb_build_object('revision',old.revision,'payload',v,'checksum',private.sim_hash(v),'savedAt',old.saved_at));
 end if;
 if s.lease_token is distinct from p_token or s.lease_epoch is distinct from p_epoch or s.lease_until<=clock_timestamp() then raise exception 'LEASE_LOST' using errcode='40001';end if;
 if p_revision is distinct from s.revision then raise exception 'SAVE_CONFLICT' using errcode='40001';end if;
 next_revision:=s.revision+1;
 if p_action='restore' then
  v:=private.sim_materialize(w.id,p_target);next_state:=v::jsonb||'{"paused":true}'::jsonb;
  kind:='full';history_payload:=next_state::text;
 else
  if p_kind not in ('full','delta') or p_kind is null or p_payload is null or octet_length(p_payload)>16384 or private.sim_hash(p_payload) is distinct from p_checksum then raise exception 'CHECKSUM_MISMATCH' using errcode='22023';end if;
  if private.sim_hash(s.payload)<>s.checksum then raise exception 'SAVE_CORRUPT' using errcode='22023';end if;
  patch:=p_payload::jsonb;
  if p_kind='delta' then
   if jsonb_typeof(patch)<>'object' or exists(select 1 from jsonb_object_keys(patch) k where k not in ('tick','subTick','rngState','rngDraws','speed','paused','commandSeq','activeMillis')) then raise exception 'INVALID_DELTA' using errcode='22023';end if;
   next_state:=s.payload::jsonb||patch;
  else next_state:=patch;end if;
  if (next_state->>'tick')::bigint<(s.payload::jsonb->>'tick')::bigint or (next_state->>'commandSeq')::bigint<(s.payload::jsonb->>'commandSeq')::bigint or (next_state->>'activeMillis')::bigint<(s.payload::jsonb->>'activeMillis')::bigint then raise exception 'SAVE_REWIND' using errcode='22023';end if;
  -- Every eighth revision is a full anchor, even if a client only sends deltas.
  kind:=case when next_revision%8=0 or p_kind='full' then 'full' else 'delta' end;
  history_payload:=case when kind='full' then next_state::text else patch::text end;
 end if;
 perform private.sim_validate(next_state,w);v:=next_state::text;result_hash:=private.sim_hash(v);
 insert into private.world_save_history(world_id,revision,request_id,request_checksum,kind,payload,payload_checksum,result_checksum,tick)
 values(w.id,next_revision,p_request,coalesce(p_checksum,'restore:'||p_target::text),kind,history_payload,private.sim_hash(history_payload),result_hash,(next_state->>'tick')::bigint);
 update private.world_simulations set revision=next_revision,payload=v,checksum=result_hash,saved_at=clock_timestamp(),save_count=save_count+1,write_bytes=write_bytes+octet_length(coalesce(p_payload,history_payload)) where world_id=w.id;
 update public.worlds set day=((next_state->>'tick')::bigint/1800+1)::integer,updated_at=clock_timestamp() where id=w.id;
 select max(h.revision) into cutoff from private.world_save_history h where h.world_id=w.id and h.kind='full' and h.revision<=next_revision-24;
 if cutoff is not null then delete from private.world_save_history where world_id=w.id and revision<cutoff;end if;
 return private.sim_response(w.id,p_token)||jsonb_build_object('ack',jsonb_build_object('revision',next_revision,'payload',v,'checksum',result_hash,'savedAt',(select saved_at from private.world_simulations where world_id=w.id)));
end;$$;
create function public.simulation_rpc(p_world uuid,p_token uuid,p_action text,p_epoch integer default 0,p_revision integer default 0,
 p_request uuid default null,p_kind text default null,p_payload text default null,p_checksum text default null,p_target integer default null)
returns jsonb language sql security invoker set search_path='' as $$
 select private.simulation_rpc(p_world,p_token,p_action,p_epoch,p_revision,p_request,p_kind,p_payload,p_checksum,p_target);
$$;
revoke all on function private.sim_hash(text),private.sim_seed(text),private.sim_initial(public.worlds),private.sim_validate(jsonb,public.worlds),private.sim_materialize(uuid,integer),private.sim_response(uuid,uuid) from public,anon,authenticated;
revoke all on function private.simulation_rpc(uuid,uuid,text,integer,integer,uuid,text,text,text,integer),public.simulation_rpc(uuid,uuid,text,integer,integer,uuid,text,text,text,integer) from public,anon,authenticated;
grant execute on function private.simulation_rpc(uuid,uuid,text,integer,integer,uuid,text,text,text,integer),public.simulation_rpc(uuid,uuid,text,integer,integer,uuid,text,text,text,integer) to authenticated;
comment on table private.world_simulations is 'V0.3.0 single-writer lease, full current head; payload SHA-256. No direct client grants.';
comment on table public.worlds is 'Foundation immutable initial_state plus simulation day summary; config revision separate from simulation revision.';
commit;
