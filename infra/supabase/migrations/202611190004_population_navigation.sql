-- World Evolution V0.5.0 — Population Housing & Pathfinding
-- Apply once AFTER 001, 002, 003. Preserve world/head/history; no reset.
begin;
alter function private.sim_validate(jsonb,public.worlds) rename to sim_validate_v3;
create function private.sim_validate(s jsonb,w public.worlds) returns void language plpgsql set search_path='' as $$
declare citizens jsonb;c jsonb;q jsonb;d jsonb;b jsonb;spec private.planning_catalog;ids text[]:=array[]::text[];expected text[];v text;cx integer;cy integer;px integer;py integer;dx integer;dy integer;bw integer;bh integer;progress integer;occupied jsonb:='{}'::jsonb;
begin
 if s->'schemaVersion' in ('2'::jsonb,'3'::jsonb) then perform private.sim_validate_v3(s,w);return;end if;
 if s->'schemaVersion' is distinct from '4'::jsonb or s->>'engineVersion' is distinct from 'we-sim-2' or (select count(*) from jsonb_object_keys(s))<>19 then raise exception 'INVALID_SAVE' using errcode='22023';end if;
 perform private.sim_validate_v3((s-'citizens')||'{"schemaVersion":3,"engineVersion":"we-sim-1"}'::jsonb,w);
 select array_agg(p->>'id') into expected from jsonb_array_elements(w.initial_state->'people') p;
 citizens:=s->'citizens';if jsonb_typeof(citizens) is distinct from 'array' then raise exception 'INVALID_CITIZENS' using errcode='22023';end if;
 if jsonb_array_length(citizens)<>20 or cardinality(expected)<>20 then raise exception 'INVALID_CITIZENS' using errcode='22023';end if;
 for b in select value from jsonb_array_elements(s->'planning'->'buildings') loop
  select * into spec from private.planning_catalog where id=b->>'buildingId';bw:=case when (b->>'rotation')::integer%2=0 then spec.width else spec.height end;bh:=case when (b->>'rotation')::integer%2=0 then spec.height else spec.width end;
  for dx in 0..bw-1 loop for dy in 0..bh-1 loop occupied:=occupied||jsonb_build_object(((b->>'x')::integer+dx)::text||','||((b->>'y')::integer+dy)::text,true);end loop;end loop;
 end loop;
 for c in select value from jsonb_array_elements(citizens) loop
  if jsonb_typeof(c) is distinct from 'object' or (select count(*) from jsonb_object_keys(c))<>8 or jsonb_typeof(c->'id') is distinct from 'string' or not((c->>'id')=any(expected)) or (c->>'id')=any(ids) or c->'homeId' is distinct from 'null'::jsonb or c->>'status' is null or c->>'status' not in ('idle','moving','resting','blocked') or jsonb_typeof(c->'path') is distinct from 'array' then raise exception 'INVALID_CITIZENS' using errcode='22023';end if;
  ids:=array_append(ids,c->>'id');
  foreach v in array array['x','y','progress'] loop if jsonb_typeof(c->v) is distinct from 'number' or (c->>v)::numeric<>trunc((c->>v)::numeric) then raise exception 'INVALID_CITIZENS' using errcode='22023';end if;end loop;
  cx:=(c->>'x')::integer;cy:=(c->>'y')::integer;progress:=(c->>'progress')::integer;
  if cx not between 0 and 255 or cy not between 0 and 255 or progress not between 0 and 149 or occupied ? (cx::text||','||cy::text) or jsonb_array_length(c->'path')>512 then raise exception 'INVALID_CITIZENS' using errcode='22023';end if;
  d:=c->'destination';if d is distinct from 'null'::jsonb then
   if jsonb_typeof(d) is distinct from 'object' or (select count(*) from jsonb_object_keys(d))<>2 or jsonb_typeof(d->'x') is distinct from 'number' or jsonb_typeof(d->'y') is distinct from 'number' or (d->>'x')::numeric<>trunc((d->>'x')::numeric) or (d->>'y')::numeric<>trunc((d->>'y')::numeric) or (d->>'x')::numeric not between 0 and 255 or (d->>'y')::numeric not between 0 and 255 then raise exception 'INVALID_CITIZENS' using errcode='22023';end if;
  end if;
  if (progress>0 and jsonb_array_length(c->'path')=0) or (c->>'status'='moving' and (jsonb_array_length(c->'path')=0 or d='null'::jsonb)) or (c->>'status'='idle' and (progress<>0 or jsonb_array_length(c->'path')<>0)) or (jsonb_array_length(c->'path')>0 and d='null'::jsonb) then raise exception 'INVALID_CITIZENS' using errcode='22023';end if;
  px:=cx;py:=cy;
  for q in select value from jsonb_array_elements(c->'path') loop
   if jsonb_typeof(q) is distinct from 'object' or (select count(*) from jsonb_object_keys(q))<>2 or jsonb_typeof(q->'x') is distinct from 'number' or jsonb_typeof(q->'y') is distinct from 'number' or (q->>'x')::numeric<>trunc((q->>'x')::numeric) or (q->>'y')::numeric<>trunc((q->>'y')::numeric) then raise exception 'INVALID_PATH' using errcode='22023';end if;
   cx:=(q->>'x')::integer;cy:=(q->>'y')::integer;
   if cx not between 0 and 255 or cy not between 0 and 255 or abs(cx-px)+abs(cy-py)<>1 or occupied ? (cx::text||','||cy::text) then raise exception 'INVALID_PATH' using errcode='22023';end if;px:=cx;py:=cy;
  end loop;
  if jsonb_array_length(c->'path')>0 and c->>'status' not in ('blocked','resting') and (px<>(d->>'x')::integer or py<>(d->>'y')::integer) then raise exception 'INVALID_PATH' using errcode='22023';end if;
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
   if patch ? 'citizens' or patch ? 'planning' then raise exception 'INVALID_DELTA' using errcode='22023';end if;
   if jsonb_typeof(patch)<>'object' or exists(select 1 from jsonb_object_keys(patch) k where k not in ('tick','subTick','rngState','rngDraws','speed','paused','commandSeq','activeMillis','schemaVersion','planning')) then raise exception 'INVALID_DELTA' using errcode='22023';end if;
   next_state:=s.payload::jsonb||patch;
  else next_state:=patch;end if;
  if (next_state->>'tick')::bigint<(s.payload::jsonb->>'tick')::bigint or (next_state->>'commandSeq')::bigint<(s.payload::jsonb->>'commandSeq')::bigint or (next_state->>'activeMillis')::bigint<(s.payload::jsonb->>'activeMillis')::bigint then raise exception 'SAVE_REWIND' using errcode='22023';end if;
  if ((s.payload::jsonb->>'schemaVersion')='3' and (next_state->>'schemaVersion') not in ('3','4')) or ((s.payload::jsonb->>'schemaVersion')='4' and (next_state->>'schemaVersion')<>'4') then raise exception 'SAVE_SCHEMA_DOWNGRADE' using errcode='22023';end if;
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
comment on table private.world_simulations is 'V0.5.0 schema 4/we-sim-2 citizens; legacy snapshots retained, single-writer fences, 1 MiB incoming payload cap.';
commit;
