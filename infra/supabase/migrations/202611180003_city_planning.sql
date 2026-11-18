-- World Evolution V0.4.0 — Construction & City Planning
-- Upgrade V0.3.0: apply once after 001 and 002. Do not edit/reapply earlier migrations.
begin;
create table private.planning_catalog(id text primary key,width integer not null,height integer not null,unlocked boolean not null);
revoke all on private.planning_catalog from public,anon,authenticated;
alter table private.planning_catalog enable row level security;
insert into private.planning_catalog values ('B001',3,2,true),('B002',3,2,true),('B003',2,1,true),('B004',3,2,true),('B005',2,2,true),('B006',2,1,true),('B007',2,2,false),('B008',1,1,true),('B009',2,2,false),('B010',2,2,false),('B011',3,2,true),('B012',2,2,false),('B013',3,2,true),('B014',1,1,true),('B015',2,2,false),('B016',2,2,false),('B017',2,2,false),('B018',2,2,false),('B019',2,2,false),('B020',2,2,false),('B021',2,2,false),('B022',2,2,false),('B023',2,2,false),('B024',2,2,false),('B025',2,2,false),('B026',2,2,false),('B027',2,2,false),('B028',2,2,false),('B029',2,2,false),('B030',2,2,false),('B031',2,2,false),('B032',2,2,false),('B033',2,2,false),('B034',2,2,false),('B035',2,2,false),('B036',2,2,false),('B037',2,2,false),('B038',2,2,false),('B039',2,2,false),('B040',2,2,false),('B041',2,2,false),('B042',2,2,false),('B043',2,2,false),('B044',2,2,false),('B045',2,2,false),('B046',2,2,false),('B047',2,2,false),('B048',2,2,false),('B049',2,2,false),('B050',2,2,false),('B051',2,2,false),('B052',2,2,false),('B053',2,2,false),('B054',2,2,false),('B055',2,2,false),('B056',2,2,false),('B057',2,2,false),('B058',2,2,false),('B059',2,2,false),('B060',2,2,false),('B061',2,2,false),('B062',2,2,false),('B063',2,2,false),('B064',2,2,false),('B065',2,2,false),('B066',2,2,false),('B067',2,2,false),('B068',2,2,false),('B069',2,2,false),('B070',2,2,false),('B071',2,2,false),('B072',2,2,false),('B073',2,2,false),('B074',2,2,false),('B075',2,2,false),('B076',2,2,false),('B077',2,2,false),('B078',2,2,false),('B079',2,2,false),('B080',2,2,false),('B081',2,2,false),('B082',2,2,false),('B083',2,2,false),('B084',2,2,false),('B085',2,2,false),('B086',2,2,false),('B087',2,2,false),('B088',2,2,false),('B089',2,2,false),('B090',2,2,false),('B091',2,2,false),('B092',2,2,false),('B093',2,2,false),('B094',2,2,false),('B095',2,2,false),('B096',2,2,false),('B097',2,2,false),('B098',2,2,false),('B099',2,2,false),('B100',2,2,false),('B101',2,2,false),('B102',2,2,false),('B103',2,2,false),('B104',2,2,false),('B105',2,2,false),('B106',2,2,false),('B107',2,2,false),('B108',2,2,false),('B109',2,2,false),('B110',2,2,false),('B111',2,2,false),('B112',2,2,false),('B113',2,2,false),('B114',2,2,false),('B115',2,2,false),('B116',2,2,false),('B117',1,1,false),('B118',2,2,false),('B119',2,2,false),('B120',2,2,false),('B121',2,2,false),('B122',2,2,false),('B123',2,2,false),('B124',2,2,false),('B125',2,2,false),('B126',2,2,false),('B127',2,2,false),('B128',2,2,false),('B129',2,2,false),('B130',2,2,false),('B131',2,2,false),('B132',2,2,false),('B133',2,2,false),('B134',2,2,false),('B135',2,2,false),('B136',2,2,false),('B137',2,2,false),('B138',2,2,false),('B139',2,2,false),('B140',2,2,false),('B141',2,2,false),('B142',2,2,false),('B143',2,2,false),('B144',2,2,false),('B145',2,2,false),('B146',2,2,false),('B147',2,2,false),('B148',2,2,false),('B149',2,2,false),('B150',2,2,false),('B151',2,2,false),('B152',2,2,false),('B153',2,2,false),('B154',2,2,false),('B155',2,2,false),('B156',2,2,false),('B157',2,2,false),('B158',2,2,false),('B159',2,2,false),('B160',2,2,false),('B161',2,2,false),('B162',2,2,false),('B163',2,2,false),('B164',2,2,false),('B165',2,2,false),('B166',2,2,false);
alter function private.sim_validate(jsonb,public.worlds) rename to sim_validate_v2;
create function private.sim_validate(s jsonb,w public.worlds) returns void language plpgsql set search_path='' as $$
declare p jsonb;b jsonb;r jsonb;c jsonb;spec private.planning_catalog;ids text[]:=array[]::text[];occupied text[]:=array[]::text[];seen text[];cx integer;cy integer;bw integer;bh integer;dx integer;dy integer;rot integer;lastx integer;lasty integer;total integer:=0;v text;
begin
 if s->'schemaVersion'='2'::jsonb then perform private.sim_validate_v2(s,w);return;end if;
 if s->'schemaVersion' is distinct from '3'::jsonb or (select count(*) from jsonb_object_keys(s))<>18 then raise exception 'INVALID_SAVE' using errcode='22023';end if;
 perform private.sim_validate_v2((s-'planning')||'{"schemaVersion":2}'::jsonb,w);
 p:=s->'planning';
 if jsonb_typeof(p) is distinct from 'object' or (select count(*) from jsonb_object_keys(p))<>3 or p->'version' is distinct from '1'::jsonb
 or jsonb_typeof(p->'buildings') is distinct from 'array' or jsonb_typeof(p->'roads') is distinct from 'array'
 then raise exception 'INVALID_PLANNING' using errcode='22023';end if;
 if jsonb_array_length(p->'buildings')>256 or jsonb_array_length(p->'roads')>128 then raise exception 'PLAN_LIMIT' using errcode='22023';end if;
 for b in select value from jsonb_array_elements(p->'buildings') loop
  if jsonb_typeof(b)<>'object' or (select count(*) from jsonb_object_keys(b))<>7 or b->>'status' is distinct from 'planned' or b->>'id' is null or (b->>'id')=any(ids) then raise exception 'INVALID_BLUEPRINT' using errcode='22023';end if;
  perform (b->>'id')::uuid;ids:=array_append(ids,b->>'id');
  foreach v in array array['x','y','rotation','createdTick'] loop
   if jsonb_typeof(b->v) is distinct from 'number' or (b->>v)::numeric<>trunc((b->>v)::numeric) then raise exception 'INVALID_BLUEPRINT' using errcode='22023';end if;
  end loop;
  cx:=(b->>'x')::integer;cy:=(b->>'y')::integer;rot:=(b->>'rotation')::integer;
  if rot not between 0 and 3 or (b->>'createdTick')::bigint not between 0 and (s->>'tick')::bigint then raise exception 'INVALID_BLUEPRINT' using errcode='22023';end if;
  select * into spec from private.planning_catalog where id=b->>'buildingId';
  if not found or not spec.unlocked then raise exception 'BUILDING_LOCKED' using errcode='22023';end if;
  bw:=case when rot%2=0 then spec.width else spec.height end;bh:=case when rot%2=0 then spec.height else spec.width end;
  if cx<0 or cy<0 or cx+bw>256 or cy+bh>256 then raise exception 'PLAN_BOUNDS' using errcode='22023';end if;
  for dx in 0..bw-1 loop for dy in 0..bh-1 loop v:=(cx+dx)::text||','||(cy+dy)::text;if v=any(occupied) then raise exception 'PLAN_OVERLAP' using errcode='22023';end if;occupied:=array_append(occupied,v);end loop;end loop;
 end loop;
 for r in select value from jsonb_array_elements(p->'roads') loop
  if jsonb_typeof(r)<>'object' or (select count(*) from jsonb_object_keys(r))<>4 or r->>'status' is distinct from 'planned' or r->>'id' is null or (r->>'id')=any(ids) or jsonb_typeof(r->'points') is distinct from 'array' or jsonb_typeof(r->'createdTick') is distinct from 'number' then raise exception 'INVALID_ROUTE' using errcode='22023';end if;
  perform (r->>'id')::uuid;ids:=array_append(ids,r->>'id');
  if (r->>'createdTick')::numeric<>trunc((r->>'createdTick')::numeric) or (r->>'createdTick')::bigint not between 0 and (s->>'tick')::bigint or jsonb_array_length(r->'points') not between 2 and 256 then raise exception 'INVALID_ROUTE' using errcode='22023';end if;
  seen:=array[]::text[];lastx:=null;lasty:=null;
  for c in select value from jsonb_array_elements(r->'points') loop
   if jsonb_typeof(c)<>'object' or (select count(*) from jsonb_object_keys(c))<>2 or jsonb_typeof(c->'x') is distinct from 'number' or jsonb_typeof(c->'y') is distinct from 'number' or (c->>'x')::numeric<>trunc((c->>'x')::numeric) or (c->>'y')::numeric<>trunc((c->>'y')::numeric) then raise exception 'INVALID_ROUTE' using errcode='22023';end if;
   cx:=(c->>'x')::integer;cy:=(c->>'y')::integer;v:=cx::text||','||cy::text;
   if cx not between 0 and 255 or cy not between 0 and 255 or v=any(occupied) or v=any(seen) or (lastx is not null and abs(cx-lastx)+abs(cy-lasty)<>1) then raise exception 'PLAN_OVERLAP_OR_ROUTE' using errcode='22023';end if;
   seen:=array_append(seen,v);lastx:=cx;lasty:=cy;total:=total+1;
  end loop;
 end loop;
 if total>8192 then raise exception 'PLAN_LIMIT' using errcode='22023';end if;
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
  if p_kind not in ('full','delta') or p_kind is null or p_payload is null or octet_length(p_payload)>262144 or private.sim_hash(p_payload) is distinct from p_checksum then raise exception 'CHECKSUM_MISMATCH' using errcode='22023';end if;
  if private.sim_hash(s.payload)<>s.checksum then raise exception 'SAVE_CORRUPT' using errcode='22023';end if;
  patch:=p_payload::jsonb;
  if p_kind='delta' then
   if jsonb_typeof(patch)<>'object' or exists(select 1 from jsonb_object_keys(patch) k where k not in ('tick','subTick','rngState','rngDraws','speed','paused','commandSeq','activeMillis','schemaVersion','planning')) then raise exception 'INVALID_DELTA' using errcode='22023';end if;
   next_state:=s.payload::jsonb||patch;
  else next_state:=patch;end if;
  if (next_state->>'tick')::bigint<(s.payload::jsonb->>'tick')::bigint or (next_state->>'commandSeq')::bigint<(s.payload::jsonb->>'commandSeq')::bigint or (next_state->>'activeMillis')::bigint<(s.payload::jsonb->>'activeMillis')::bigint then raise exception 'SAVE_REWIND' using errcode='22023';end if;
  if (s.payload::jsonb->>'schemaVersion')='3' and (next_state->>'schemaVersion')<>'3' then raise exception 'SAVE_SCHEMA_DOWNGRADE' using errcode='22023';end if;
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
comment on table private.planning_catalog is 'Frozen-derived IDs/unlocks plus separate planning-v1 technical footprints; not a change to Canonical workbook.';
commit;
