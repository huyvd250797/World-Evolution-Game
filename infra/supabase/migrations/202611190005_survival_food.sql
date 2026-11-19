-- World Evolution V0.6.0 — Survival & Food
-- Apply ONCE after 001, 002, 003, 004. Never delete worlds, old heads or history.
begin;
alter function private.sim_validate(jsonb,public.worlds) rename to sim_validate_v4;
create function private.sim_validate(s jsonb,w public.worlds) returns void language plpgsql set search_path='' as $$
declare v jsonb;l jsonb;j jsonb;p jsonb;r jsonb;n text;ids text[];seen text[]:=array[]::text[];ttl integer;tick bigint;loc text;counted integer;
begin
 if s->'schemaVersion' in ('2'::jsonb,'3'::jsonb,'4'::jsonb) then perform private.sim_validate_v4(s,w);return;end if;
 if s->'schemaVersion' is distinct from '5'::jsonb or s->>'engineVersion' is distinct from 'we-sim-3' or (select count(*) from jsonb_object_keys(s))<>20 then raise exception 'INVALID_SAVE' using errcode='22023';end if;
 perform private.sim_validate_v4((s-'survival')||'{"schemaVersion":4,"engineVersion":"we-sim-2"}'::jsonb,w);
 tick:=(s->>'tick')::bigint;v:=s->'survival';
 if jsonb_typeof(v) is distinct from 'object' or (select count(*) from jsonb_object_keys(v))<>10 or not(v ?& array['version','depot','lots','jobs','sources','day','served','previous','sequence','waste']) then raise exception 'INVALID_SURVIVAL' using errcode='22023';end if;
 if v->'version' is distinct from '1'::jsonb or (v->>'day')::bigint<>tick/1800+1 then raise exception 'INVALID_SURVIVAL' using errcode='22023';end if;
 foreach n in array array['sequence','day','waste'] loop if jsonb_typeof(v->n) is distinct from 'number' or (v->>n)::numeric<0 or (v->>n)::numeric>1e12 then raise exception 'INVALID_SURVIVAL' using errcode='22023';end if;end loop;
 p:=v->'depot';if jsonb_typeof(p) is distinct from 'object' or jsonb_typeof(p->'x') is distinct from 'number' or jsonb_typeof(p->'y') is distinct from 'number' or (p->>'x')::numeric not between 0 and 255 or (p->>'y')::numeric not between 0 and 255 then raise exception 'INVALID_DEPOT' using errcode='22023';end if;
 foreach n in array array['lots','jobs','sources','served'] loop if jsonb_typeof(v->n) is distinct from 'array' then raise exception 'INVALID_SURVIVAL' using errcode='22023';end if;end loop;
 if jsonb_array_length(v->'lots')>1024 or jsonb_array_length(v->'jobs')>20 or jsonb_array_length(v->'sources')>4096 or jsonb_array_length(v->'served')<>20 then raise exception 'INVALID_SURVIVAL' using errcode='22023';end if;
 select array_agg(c->>'id') into ids from jsonb_array_elements(s->'citizens') c;
 for p in select value from jsonb_array_elements(v->'served') loop
  if jsonb_typeof(p) is distinct from 'object' or (select count(*) from jsonb_object_keys(p))<>3 or jsonb_typeof(p->'id') is distinct from 'string' or not((p->>'id')=any(ids)) or p->>'id'=any(seen) or jsonb_typeof(p->'food') is distinct from 'number' or jsonb_typeof(p->'water') is distinct from 'number' or (p->>'food')::numeric not between 0 and 1 or (p->>'water')::numeric not between 0 and 2 then raise exception 'INVALID_DISTRIBUTION' using errcode='22023';end if;
  seen:=array_append(seen,p->>'id');
 end loop;
 seen:=array[]::text[];
 for l in select value from jsonb_array_elements(v->'lots') loop
  if jsonb_typeof(l) is distinct from 'object' or (select count(*) from jsonb_object_keys(l))<>8 or not(l ?& array['id','resource','quantity','createdTick','ageTicks','expiresTick','location','spoiled']) then raise exception 'INVALID_LOT' using errcode='22023';end if;
  if jsonb_typeof(l->'id') is distinct from 'string' or length(l->>'id') not between 1 and 150 or l->>'id'=any(seen) or jsonb_typeof(l->'quantity') is distinct from 'number' or (l->>'quantity')::numeric not between 0 and 100000 or jsonb_typeof(l->'spoiled') is distinct from 'boolean' then raise exception 'INVALID_LOT' using errcode='22023';end if;
  seen:=array_append(seen,l->>'id');
  foreach n in array array['createdTick','ageTicks'] loop if jsonb_typeof(l->n) is distinct from 'number' or (l->>n)::numeric<>trunc((l->>n)::numeric) or (l->>n)::numeric not between 0 and tick then raise exception 'INVALID_LOT' using errcode='22023';end if;end loop;
  if (l->>'ageTicks')::bigint>tick-(l->>'createdTick')::bigint then raise exception 'INVALID_LOT' using errcode='22023';end if;
  ttl:=case l->>'resource' when 'R001' then 7 when 'R002' then 12 when 'R003' then 3 when 'R004' then 35 when 'R005' then 4 when 'R006' then 80 when 'R007' then 7 when 'R008' then 2 when 'R009' then 1 when 'R030' then 7 when 'R031' then 5 when 'R032' then 3 when 'R033' then 3 when 'R213' then 2 when 'R058' then 0 when 'R062' then 0 when 'R067' then 0 when 'R125' then 0 when 'R167' then 0 else -1 end;
  if ttl<0 or (ttl=0 and (l->'expiresTick' is distinct from 'null'::jsonb or l->'spoiled' is distinct from 'false'::jsonb)) or (ttl>0 and (((l->>'ageTicks')::bigint>=ttl*1800) is distinct from (l->>'spoiled')::boolean)) then raise exception 'INVALID_LOT' using errcode='22023';end if;
  if ttl>0 and l->'spoiled'='false'::jsonb and (jsonb_typeof(l->'expiresTick') is distinct from 'number' or (l->>'expiresTick')::numeric<>tick+ttl*1800-(l->>'ageTicks')::bigint) then raise exception 'INVALID_LOT' using errcode='22023';end if;
  loc:=l->>'location';if loc is null or (loc<>'depot' and not exists(select 1 from jsonb_array_elements(v->'jobs') as cargo_job(value) where loc='citizen:'||(cargo_job.value->>'citizenId') and cargo_job.value->'cargo' ? (l->>'id'))) then raise exception 'INVALID_CARGO' using errcode='22023';end if;
 end loop;
 seen:=array[]::text[];
 for j in select value from jsonb_array_elements(v->'jobs') loop
  if jsonb_typeof(j) is distinct from 'object' or (select count(*) from jsonb_object_keys(j))<>12 or not(j ?& array['id','citizenId','kind','source','target','phase','workDone','workRequired','recipeId','output','cargo','reservedTool']) or jsonb_typeof(j->'id') is distinct from 'string' or not((j->>'citizenId')=any(ids)) or j->>'citizenId'=any(seen) or j->>'phase' is null or j->>'phase' not in ('outbound','working','returning','blocked') or jsonb_typeof(j->'cargo') is distinct from 'array' or jsonb_typeof(j->'output') is distinct from 'array' or jsonb_typeof(j->'workDone') is distinct from 'number' or jsonb_typeof(j->'workRequired') is distinct from 'number' or (j->>'workRequired')::numeric not between 1 and 18000 or (j->>'workDone')::numeric<0 or (j->>'workDone')::numeric>(j->>'workRequired')::numeric then raise exception 'INVALID_JOB' using errcode='22023';end if;
  seen:=array_append(seen,j->>'citizenId');
  if j->>'kind' is null or j->>'kind' not in ('gather','process') or (j->>'kind'='process' and j->>'recipeId' not in ('F001','F002')) then raise exception 'SURVIVAL_CONDITION_LOCKED' using errcode='22023';end if;
  for p in select value from jsonb_array_elements(j->'cargo') loop if not exists(select 1 from jsonb_array_elements(v->'lots') as cargo_lot(value) where cargo_lot.value->'id'=p and cargo_lot.value->>'location'='citizen:'||(j->>'citizenId')) then raise exception 'INVALID_CARGO' using errcode='22023';end if;end loop;
 end loop;
 for r in select value from jsonb_array_elements(v->'sources') loop
  if jsonb_typeof(r) is distinct from 'object' or (select count(*) from jsonb_object_keys(r))<>3 or not(r ?& array['key','remaining','readyTick']) or jsonb_typeof(r->'key') is distinct from 'string' or jsonb_typeof(r->'remaining') is distinct from 'number' or jsonb_typeof(r->'readyTick') is distinct from 'number' or (r->>'remaining')::numeric not between 0 and 5 or (r->>'readyTick')::numeric<0 then raise exception 'INVALID_SOURCE' using errcode='22023';end if;
 end loop;
end;$$;
create or replace function private.simulation_rpc(p_world uuid,p_token uuid,p_action text,p_epoch integer default 0,p_revision integer default 0,
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
  if p_kind not in ('full','delta') or p_kind is null or p_payload is null or octet_length(p_payload)>1048576 or private.sim_hash(p_payload) is distinct from p_checksum then raise exception 'CHECKSUM_MISMATCH' using errcode='22023';end if;
  if private.sim_hash(s.payload)<>s.checksum then raise exception 'SAVE_CORRUPT' using errcode='22023';end if;
  patch:=p_payload::jsonb;
  if p_kind='delta' then
   if patch ? 'survival' or patch ? 'citizens' or patch ? 'planning' then raise exception 'INVALID_DELTA' using errcode='22023';end if;
   if jsonb_typeof(patch)<>'object' or exists(select 1 from jsonb_object_keys(patch) k where k not in ('tick','subTick','rngState','rngDraws','speed','paused','commandSeq','activeMillis','schemaVersion','planning')) then raise exception 'INVALID_DELTA' using errcode='22023';end if;
   next_state:=s.payload::jsonb||patch;
  else next_state:=patch;end if;
  if (next_state->>'tick')::bigint<(s.payload::jsonb->>'tick')::bigint or (next_state->>'commandSeq')::bigint<(s.payload::jsonb->>'commandSeq')::bigint or (next_state->>'activeMillis')::bigint<(s.payload::jsonb->>'activeMillis')::bigint then raise exception 'SAVE_REWIND' using errcode='22023';end if;
  if (next_state->>'schemaVersion')::integer < (s.payload::jsonb->>'schemaVersion')::integer then raise exception 'SAVE_SCHEMA_DOWNGRADE' using errcode='22023';end if;
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

revoke all on function private.sim_validate(jsonb,public.worlds) from public,anon,authenticated;
revoke all on function private.sim_validate_v4(jsonb,public.worlds) from public,anon,authenticated;
comment on table private.world_simulations is 'V0.6.0 schema 5/we-sim-3 survival jobs, cargo, per-lot expiry, daily distribution. Legacy bytes retained.';
commit;
