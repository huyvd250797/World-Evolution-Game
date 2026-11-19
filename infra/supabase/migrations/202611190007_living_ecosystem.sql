-- World Evolution V0.8.0 — Living Ecosystem
-- File: infra/supabase/migrations/202611190007_living_ecosystem.sql
-- Upgrade V0.7 -> V0.8. Run ONCE after 001–006, before deploying the app.
-- Original saves/history are retained; no data reset or direct client table access.
begin;
create table private.ecology_species(id text primary key,regeneration_ticks integer not null check(regeneration_ticks>0));
alter table private.ecology_species enable row level security;
revoke all on private.ecology_species from public,anon,authenticated;
insert into private.ecology_species(id,regeneration_ticks) values ('SP001',21600),('SP002',45000),('SP003',25200),('SP004',216000),('SP005',54000),('SP006',63000),('SP007',43200),('SP008',36000),('SP009',18000),('SP010',21600),('SP011',25200),('SP012',72000),('SP013',36000),('SP014',72000),('SP015',54000),('SP016',45000),('SP017',43200),('SP018',153000),('SP019',162000),('SP020',108000),('SP021',99000),('SP022',198000),('SP023',288000),('SP024',21600),('SP025',36000),('SP026',72000),('SP027',216000),('SP028',270000),('SP029',288000),('SP030',324000),('SP031',198000),('SP032',234000),('SP033',450000),('SP034',396000),('SP035',414000),('SP036',288000),('SP037',180000),('SP038',270000),('SP039',216000),('SP040',360000),('SP041',117000),('SP042',117000),('SP043',144000),('SP044',144000),('SP045',90000),('SP046',162000),('SP047',288000),('SP048',612000),('SP049',216000),('SP050',68400),('SP051',72000),('SP052',234000);
alter function private.sim_validate(jsonb,public.worlds) rename to sim_validate_v6;
create function private.sim_validate(s jsonb,w public.worlds) returns void language plpgsql set search_path='' as $$
declare e jsonb;p jsonb;a jsonb;r jsonb;j jsonb;n text;t bigint;ids text[]:=array[]::text[];base jsonb;lots jsonb;job_rows jsonb;
begin
 if s->'schemaVersion' in ('2'::jsonb,'3'::jsonb,'4'::jsonb,'5'::jsonb,'6'::jsonb) then perform private.sim_validate_v6(s,w);return;end if;
 if s->'schemaVersion' is distinct from '7'::jsonb or s->>'engineVersion' is distinct from 'we-sim-5' or (select count(*) from jsonb_object_keys(s))<>22 then raise exception 'INVALID_SAVE' using errcode='22023';end if;
 -- Validation-only projection for legacy validators. The actual saved payload is never rewritten this way.
 select coalesce(jsonb_agg(case when item.value->>'resource' in ('R059','R061') then jsonb_set(item.value,'{resource}','"R058"'::jsonb) else item.value end),'[]'::jsonb) into lots from jsonb_array_elements(s->'survival'->'lots') as item(value);
 select coalesce(jsonb_agg(case when item.value->>'kind'='hunt' and exists(select 1 from jsonb_array_elements(s->'ecology'->'reservations') as res(value) where res.value->>'jobId'=item.value->>'id' and res.value->>'kind'='animal') then jsonb_set(item.value,'{kind}','"gather"'::jsonb) else item.value end),'[]'::jsonb) into job_rows from jsonb_array_elements(s->'survival'->'jobs') as item(value);
 base:=(s-'ecology')||'{"schemaVersion":6,"engineVersion":"we-sim-4"}'::jsonb;
 base:=jsonb_set(jsonb_set(base,'{survival,lots}',lots),'{survival,jobs}',job_rows);perform private.sim_validate_v6(base,w);
 e:=s->'ecology';t:=(s->>'tick')::bigint;
 if jsonb_typeof(e) is distinct from 'object' or (select count(*) from jsonb_object_keys(e))<>10 or not(e ?& array['version','startedTick','lastTick','rngState','sequence','plants','animals','regions','reservations','stats']) or e->'version' is distinct from '1'::jsonb then raise exception 'INVALID_ECOLOGY' using errcode='22023';end if;
 foreach n in array array['startedTick','lastTick','rngState','sequence'] loop if jsonb_typeof(e->n) is distinct from 'number' or (e->>n)::numeric<>trunc((e->>n)::numeric) or (e->>n)::numeric not between 0 and 1e12 then raise exception 'INVALID_ECOLOGY' using errcode='22023';end if;end loop;
 if (e->>'startedTick')::bigint>t or (e->>'lastTick')::bigint<>t or (e->>'rngState')::bigint not between 1 and 4294967295 then raise exception 'INVALID_ECOLOGY' using errcode='22023';end if;
 foreach n in array array['plants','animals','regions','reservations'] loop if jsonb_typeof(e->n) is distinct from 'array' then raise exception 'INVALID_ECOLOGY' using errcode='22023';end if;end loop;
 if jsonb_array_length(e->'plants')>16384 or jsonb_array_length(e->'animals')>768 or jsonb_array_length(e->'regions')<>64 or jsonb_array_length(e->'reservations')>20 then raise exception 'INVALID_ECOLOGY' using errcode='22023';end if;
 for p in select value from jsonb_array_elements(e->'plants') loop
  if jsonb_typeof(p) is distinct from 'object' or (select count(*) from jsonb_object_keys(p))<>4 or not(p ?& array['id','stock','readyTick','known']) or jsonb_typeof(p->'known') is distinct from 'boolean' then raise exception 'INVALID_PLANT' using errcode='22023';end if;
  foreach n in array array['id','stock','readyTick'] loop if jsonb_typeof(p->n) is distinct from 'number' or (p->>n)::numeric<>trunc((p->>n)::numeric) or (p->>n)::numeric not between 0 and 1e12 then raise exception 'INVALID_PLANT' using errcode='22023';end if;end loop;
  if (p->>'id')::bigint>65535 or (p->>'stock')::integer>12 then raise exception 'INVALID_PLANT' using errcode='22023';end if;
 end loop;
 if (select count(distinct v.value->>'id') from jsonb_array_elements(e->'plants') as v(value))<>jsonb_array_length(e->'plants') then raise exception 'INVALID_PLANT' using errcode='22023';end if;
 for a in select value from jsonb_array_elements(e->'animals') loop
  if jsonb_typeof(a) is distinct from 'object' or (select count(*) from jsonb_object_keys(a))<>11 or not(a ?& array['id','speciesId','regionId','x','y','next','progress','hunger','bornTick','lastBirthTick','known']) or jsonb_typeof(a->'id') is distinct from 'string' or (a->>'id')!~'^animal-[1-9][0-9]*$' or a->>'id'=any(ids) or jsonb_typeof(a->'known') is distinct from 'boolean' or not exists(select 1 from private.ecology_species where id=a->>'speciesId') or (a->>'regionId')!~'^region-[0-7]-[0-7]$' then raise exception 'INVALID_ANIMAL' using errcode='22023';end if;
  ids:=array_append(ids,a->>'id');
  foreach n in array array['x','y','progress','hunger','bornTick','lastBirthTick'] loop if jsonb_typeof(a->n) is distinct from 'number' or (a->>n)::numeric<>trunc((a->>n)::numeric) or (a->>n)::numeric not between 0 and 1e12 then raise exception 'INVALID_ANIMAL' using errcode='22023';end if;end loop;
  if substring(a->>'id' from 8)::bigint>(e->>'sequence')::bigint or (a->>'x')::integer>255 or (a->>'y')::integer>255 or (a->>'progress')::integer>1000 or (a->>'hunger')::integer>30 or (a->>'bornTick')::bigint>t or (a->>'lastBirthTick')::bigint>t then raise exception 'INVALID_ANIMAL' using errcode='22023';end if;
  p:=a->'next';if p is distinct from 'null'::jsonb then if jsonb_typeof(p) is distinct from 'object' or (select count(*) from jsonb_object_keys(p))<>2 or jsonb_typeof(p->'x') is distinct from 'number' or jsonb_typeof(p->'y') is distinct from 'number' or (p->>'x')::numeric<>trunc((p->>'x')::numeric) or (p->>'y')::numeric<>trunc((p->>'y')::numeric) or (p->>'x')::numeric not between 0 and 255 or (p->>'y')::numeric not between 0 and 255 or abs((p->>'x')::integer-(a->>'x')::integer)+abs((p->>'y')::integer-(a->>'y')::integer)<>1 then raise exception 'INVALID_ANIMAL' using errcode='22023';end if;elsif (a->>'progress')::integer<>0 then raise exception 'INVALID_ANIMAL' using errcode='22023';end if;
 end loop;
 ids:=array[]::text[];
 for r in select value from jsonb_array_elements(e->'regions') loop
  if jsonb_typeof(r) is distinct from 'object' or (select count(*) from jsonb_object_keys(r))<>2 or not(r ?& array['id','forage']) or jsonb_typeof(r->'id') is distinct from 'string' or (r->>'id')!~'^region-[0-7]-[0-7]$' or r->>'id'=any(ids) or jsonb_typeof(r->'forage') is distinct from 'number' or (r->>'forage')::numeric<>trunc((r->>'forage')::numeric) or (r->>'forage')::numeric not between 0 and 192 then raise exception 'INVALID_ECOLOGY' using errcode='22023';end if;ids:=array_append(ids,r->>'id');
 end loop;
 ids:=array[]::text[];
 for r in select value from jsonb_array_elements(e->'reservations') loop
  if jsonb_typeof(r) is distinct from 'object' or (select count(*) from jsonb_object_keys(r))<>7 or not(r ?& array['jobId','targetId','kind','quantity','speciesId','committed','producedTick']) or r->>'jobId'=any(ids) or jsonb_typeof(r->'committed') is distinct from 'boolean' or r->>'kind' is null or r->>'kind' not in ('plant','animal') or jsonb_typeof(r->'quantity') is distinct from 'number' or (r->>'quantity')::numeric not between 1 and 3 or not exists(select 1 from private.ecology_species where id=r->>'speciesId') then raise exception 'INVALID_ECOLOGY_RESERVATION' using errcode='22023';end if;
  ids:=array_append(ids,r->>'jobId');select jr.value into j from jsonb_array_elements(s->'survival'->'jobs') as jr(value) where jr.value->>'id'=r->>'jobId';if not found or ((r->>'committed')::boolean is distinct from (jsonb_array_length(j->'cargo')>0)) then raise exception 'INVALID_ECOLOGY_RESERVATION' using errcode='22023';end if;
  if r->'committed'='true'::jsonb then if jsonb_typeof(r->'producedTick') is distinct from 'number' or (r->>'producedTick')::numeric not between 0 and t then raise exception 'INVALID_ECOLOGY_RESERVATION' using errcode='22023';end if;elsif r->'producedTick' is distinct from 'null'::jsonb then raise exception 'INVALID_ECOLOGY_RESERVATION' using errcode='22023';end if;
 end loop;
 p:=e->'stats';if jsonb_typeof(p) is distinct from 'object' or (select count(*) from jsonb_object_keys(p))<>5 or not(p ?& array['harvested','hunted','born','predated','starved']) then raise exception 'INVALID_ECOLOGY' using errcode='22023';end if;foreach n in array array['harvested','hunted','born','predated','starved'] loop if jsonb_typeof(p->n) is distinct from 'number' or (p->>n)::numeric<>trunc((p->>n)::numeric) or (p->>n)::numeric not between 0 and 1e12 then raise exception 'INVALID_ECOLOGY' using errcode='22023';end if;end loop;
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
  if p_kind not in ('full','delta') or p_kind is null or p_payload is null or octet_length(p_payload)>2097152 or private.sim_hash(p_payload) is distinct from p_checksum then raise exception 'CHECKSUM_MISMATCH' using errcode='22023';end if;
  if private.sim_hash(s.payload)<>s.checksum then raise exception 'SAVE_CORRUPT' using errcode='22023';end if;
  patch:=p_payload::jsonb;
  if p_kind='delta' then
   if patch ? 'ecology' or patch ? 'workforce' or patch ? 'survival' or patch ? 'citizens' or patch ? 'planning' then raise exception 'INVALID_DELTA' using errcode='22023';end if;
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
revoke all on function private.sim_validate_v6(jsonb,public.worlds) from public,anon,authenticated;
comment on table private.world_simulations is 'V0.8.0 schema 7/we-sim-5: bounded plants, animals, ecology RNG, food web and harvest reservations. 2 MiB save cap, old head/history retained.';
commit;
