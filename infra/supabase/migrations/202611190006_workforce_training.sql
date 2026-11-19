-- World Evolution V0.7.0 — Workforce & Training
-- Source: infra/supabase/migrations/202611190006_workforce_training.sql
-- Upgrade V0.6.0 -> V0.7.0. Run ONCE after 001–005, before deploying the app.
-- Does not rewrite old heads/history or grant client access to private tables.
begin;
create table private.workforce_roles(id text primary key,training_ticks integer not null check(training_ticks>0));
alter table private.workforce_roles enable row level security;
revoke all on private.workforce_roles from public,anon,authenticated;
insert into private.workforce_roles(id,training_ticks) values ('J001',9000),('J002',18000),('J003',14400),('J004',14400),('J005',16200),('J006',7200),('J007',14400),('J008',21600),('J009',36000),('J010',21600),('J011',27000),('J012',14400),('J013',21600),('J014',25200),('J015',25200),('J016',28800),('J017',18000),('J018',21600),('J019',23400),('J020',25200),('J021',28800),('J022',21600),('J023',32400),('J024',32400),('J025',43200),('J026',39600),('J027',25200),('J028',37800),('J029',36000),('J030',46800),('J031',43200),('J032',32400),('J033',32400),('J034',28800),('J035',43200),('J036',46800),('J037',36000),('J038',54000),('J039',32400),('J040',36000),('J041',43200),('J042',28800),('J043',50400),('J044',63000),('J045',57600),('J046',45000),('J047',54000),('J048',54000),('J049',32400),('J050',57600),('J051',36000),('J052',48600),('J053',50400),('J054',39600),('J055',45000),('J056',63000),('J057',63000),('J058',45000),('J059',54000),('J060',43200),('J061',39600),('J062',54000),('J063',64800),('J064',72000),('J065',72000),('J066',72000),('J067',57600),('J068',68400),('J069',75600),('J070',64800),('J071',57600),('J072',9000),('J073',21600),('J074',12600),('J075',16200),('J076',21600),('J077',27000),('J078',39600),('J079',50400),('J080',63000),('J081',14400),('J082',9000),('J083',18000),('J084',39600),('J085',45000),('J086',27000),('J087',32400),('J088',16200),('J089',28800),('J090',18000),('J091',46800),('J092',50400),('J093',43200),('J094',32400),('J095',61200),('J096',28800);
alter function private.sim_validate(jsonb,public.worlds) rename to sim_validate_v5;
create function private.sim_validate(s jsonb,w public.worlds) returns void language plpgsql set search_path='' as $$
declare wf jsonb;p jsonb;t jsonb;a jsonb;e jsonb;ids text[];seen text[]:=array[]::text[];ticks bigint;duration integer;n text;
begin
 if s->'schemaVersion' in ('2'::jsonb,'3'::jsonb,'4'::jsonb,'5'::jsonb) then perform private.sim_validate_v5(s,w);return;end if;
 if s->'schemaVersion' is distinct from '6'::jsonb or s->>'engineVersion' is distinct from 'we-sim-4' or (select count(*) from jsonb_object_keys(s))<>21 then raise exception 'INVALID_SAVE' using errcode='22023';end if;
 perform private.sim_validate_v5((s-'workforce')||'{"schemaVersion":5,"engineVersion":"we-sim-3"}'::jsonb,w);
 ticks:=(s->>'tick')::bigint;wf:=s->'workforce';
 if jsonb_typeof(wf) is distinct from 'object' or (select count(*) from jsonb_object_keys(wf))<>3 or not(wf ?& array['version','workers','events']) or wf->'version' is distinct from '1'::jsonb or jsonb_typeof(wf->'workers') is distinct from 'array' or jsonb_typeof(wf->'events') is distinct from 'array' then raise exception 'INVALID_WORKFORCE' using errcode='22023';end if;
 if jsonb_array_length(wf->'workers')<>20 or jsonb_array_length(wf->'events')>100 then raise exception 'INVALID_WORKFORCE' using errcode='22023';end if;
 if exists(select 1 from jsonb_array_elements(wf->'workers') as seats(value) where seats.value->'training' is distinct from 'null'::jsonb group by seats.value->'training'->>'siteId' having count(*)>2) then raise exception 'INVALID_TRAINING' using errcode='22023';end if;
 select array_agg(c->>'id') into ids from jsonb_array_elements(s->'citizens') c;
 for p in select value from jsonb_array_elements(wf->'workers') loop
  if jsonb_typeof(p) is distinct from 'object' or (select count(*) from jsonb_object_keys(p))<>6 or not(p ?& array['citizenId','roleId','qualified','assignment','training','laborRemainder']) or jsonb_typeof(p->'citizenId') is distinct from 'string' or not((p->>'citizenId')=any(ids)) or p->>'citizenId'=any(seen) or jsonb_typeof(p->'qualified') is distinct from 'boolean' then raise exception 'INVALID_WORKFORCE' using errcode='22023';end if;
  seen:=array_append(seen,p->>'citizenId');
  if jsonb_typeof(p->'laborRemainder') is distinct from 'number' or (p->>'laborRemainder')::numeric<>trunc((p->>'laborRemainder')::numeric) or (p->>'laborRemainder')::numeric not between 0 and 99 then raise exception 'INVALID_WORKFORCE' using errcode='22023';end if;
  if p->'roleId' is distinct from 'null'::jsonb then
   select training_ticks into duration from private.workforce_roles where id=p->>'roleId';if not found then raise exception 'INVALID_WORKFORCE' using errcode='22023';end if;
  elsif p->'qualified'='true'::jsonb or p->'training' is distinct from 'null'::jsonb or p->'assignment' is distinct from 'null'::jsonb then raise exception 'INVALID_WORKFORCE' using errcode='22023';end if;
  a:=p->'assignment';if a is distinct from 'null'::jsonb then
   if jsonb_typeof(a) is distinct from 'object' or (select count(*) from jsonb_object_keys(a))<>1 or jsonb_typeof(a->'siteId') is distinct from 'string' then raise exception 'INVALID_WORKFORCE' using errcode='22023';end if;perform (a->>'siteId')::uuid;
  end if;
  t:=p->'training';if t is distinct from 'null'::jsonb then
   if p->'qualified' is distinct from 'false'::jsonb or jsonb_typeof(t) is distinct from 'object' or (select count(*) from jsonb_object_keys(t))<>5 or not(t ?& array['siteId','mentorId','progressTicks','startedTick','phase']) or jsonb_typeof(t->'siteId') is distinct from 'string' or jsonb_typeof(t->'mentorId') is distinct from 'string' or t->>'mentorId'=p->>'citizenId' or not((t->>'mentorId')=any(ids)) or t->>'phase' is null or t->>'phase' not in ('outbound','studying','practice','blocked') then raise exception 'INVALID_TRAINING' using errcode='22023';end if;
   perform (t->>'siteId')::uuid;
   foreach n in array array['progressTicks','startedTick'] loop if jsonb_typeof(t->n) is distinct from 'number' or (t->>n)::numeric<>trunc((t->>n)::numeric) or (t->>n)::numeric not between 0 and ticks then raise exception 'INVALID_TRAINING' using errcode='22023';end if;end loop;
   if (t->>'progressTicks')::bigint>=duration or (t->>'progressTicks')::bigint>ticks-(t->>'startedTick')::bigint then raise exception 'INVALID_TRAINING' using errcode='22023';end if;
  elsif p->'roleId' is distinct from 'null'::jsonb and p->'qualified' is distinct from 'true'::jsonb then raise exception 'INVALID_TRAINING' using errcode='22023';end if;
 end loop;
 for e in select value from jsonb_array_elements(wf->'events') loop
  if jsonb_typeof(e) is distinct from 'object' or (select count(*) from jsonb_object_keys(e))<>4 or not(e ?& array['tick','citizenId','type','roleId']) or jsonb_typeof(e->'tick') is distinct from 'number' or (e->>'tick')::numeric not between 0 and ticks or (e->>'tick')::numeric<>trunc((e->>'tick')::numeric) or jsonb_typeof(e->'citizenId') is distinct from 'string' or not((e->>'citizenId')=any(ids)) or e->>'type' is null or e->>'type' not in ('enroll','graduate','cancel','assign','release','resume') then raise exception 'INVALID_WORKFORCE' using errcode='22023';end if;
  if e->'roleId' is distinct from 'null'::jsonb and not exists(select 1 from private.workforce_roles where id=e->>'roleId') then raise exception 'INVALID_WORKFORCE' using errcode='22023';end if;
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
   if patch ? 'workforce' or patch ? 'survival' or patch ? 'citizens' or patch ? 'planning' then raise exception 'INVALID_DELTA' using errcode='22023';end if;
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
revoke all on function private.sim_validate_v5(jsonb,public.worlds) from public,anon,authenticated;
comment on table private.world_simulations is 'V0.7.0 schema 6/we-sim-4 workforce profiles, training time, assigned sites and integer labor carry; old save bytes retained.';
commit;
