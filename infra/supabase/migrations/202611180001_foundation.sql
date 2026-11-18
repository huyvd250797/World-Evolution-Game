-- World Evolution V0.1.0 — Cross-Platform Foundation
-- Apply once on a new Supabase project. No reset, no service-role key in app.
-- Master Data V1.2 source SHA256: 9583ccb1398a0e45dc1c4e415b9749f5a22c3f7b24dd403df92ecd675c42836c
-- Catalog SHA256: b375ca03e5123d07ddd9a317a3e75b607f91c680bd69e72198b97e980013a5ea
begin;
create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;
create table public.worlds (
 id uuid primary key default gen_random_uuid(),
 owner_id uuid not null references auth.users(id) on delete cascade,
 creation_request_id uuid not null,
 name text not null check (char_length(btrim(name)) between 2 and 60 and name !~ '[[:cntrl:]]'),
 seed text not null check (char_length(seed) between 1 and 64 and seed ~ '^[A-Za-z0-9_-]+$'),
 climate_id text not null check (climate_id in ('B01','B02','B03','B04','B05','B06','B07')),
 population_limit integer not null check (population_limit between 20 and 100000),
 population integer not null default 20 check (population = 20),
 day integer not null default 1 check(day=1), era text not null default 'E0' check(era='E0'),
 revision integer not null default 1 check(revision>0),
 master_data_version text not null default '1.2' check(master_data_version='1.2'),
 save_schema_version integer not null default 1 check(save_schema_version=1),
 catalog_checksum text not null default 'b375ca03e5123d07ddd9a317a3e75b607f91c680bd69e72198b97e980013a5ea' check(catalog_checksum='b375ca03e5123d07ddd9a317a3e75b607f91c680bd69e72198b97e980013a5ea'),
 initial_state jsonb not null default '{"schemaVersion":1,"masterDataVersion":"1.2","catalogChecksum":"b375ca03e5123d07ddd9a317a3e75b607f91c680bd69e72198b97e980013a5ea","day":1,"era":"E0","paused":true,"population":20,"people":[{"id":"person-001","assignment":null,"homeId":null},{"id":"person-002","assignment":null,"homeId":null},{"id":"person-003","assignment":null,"homeId":null},{"id":"person-004","assignment":null,"homeId":null},{"id":"person-005","assignment":null,"homeId":null},{"id":"person-006","assignment":null,"homeId":null},{"id":"person-007","assignment":null,"homeId":null},{"id":"person-008","assignment":null,"homeId":null},{"id":"person-009","assignment":null,"homeId":null},{"id":"person-010","assignment":null,"homeId":null},{"id":"person-011","assignment":null,"homeId":null},{"id":"person-012","assignment":null,"homeId":null},{"id":"person-013","assignment":null,"homeId":null},{"id":"person-014","assignment":null,"homeId":null},{"id":"person-015","assignment":null,"homeId":null},{"id":"person-016","assignment":null,"homeId":null},{"id":"person-017","assignment":null,"homeId":null},{"id":"person-018","assignment":null,"homeId":null},{"id":"person-019","assignment":null,"homeId":null},{"id":"person-020","assignment":null,"homeId":null}],"buildings":[],"inventories":[],"unlockedTechnologyIds":["T001"]}'::jsonb,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique(owner_id,creation_request_id)
);
create index worlds_owner_updated_idx on public.worlds(owner_id,updated_at desc);
alter table public.worlds enable row level security;
create policy worlds_owner_select on public.worlds for select to authenticated
 using ((select auth.uid()) is not null and owner_id=(select auth.uid()));
revoke all on table public.worlds from public,anon,authenticated;
grant select on table public.worlds to authenticated;

create function private.create_world(p_name text,p_seed text,p_climate_id text,p_population_limit integer,p_request_id uuid)
returns uuid language plpgsql security definer set search_path='' as $$
declare v_uid uuid:=auth.uid(); v_id uuid;
begin
 if v_uid is null then raise exception 'AUTH_REQUIRED' using errcode='42501'; end if;
 if p_name is null or char_length(btrim(p_name)) not between 2 and 60 or p_name ~ '[[:cntrl:]]'
 or p_seed is null or char_length(p_seed) not between 1 and 64 or p_seed !~ '^[A-Za-z0-9_-]+$'
 or p_climate_id is null or p_climate_id not in ('B01','B02','B03','B04','B05','B06','B07')
 or p_population_limit is null or p_population_limit not between 20 and 100000
 or p_request_id is null then raise exception 'INVALID_WORLD' using errcode='22023'; end if;
 -- Serialize retries for one account; same request ID never creates two worlds.
 perform pg_advisory_xact_lock(hashtextextended(v_uid::text,0));
 select id into v_id from public.worlds where owner_id=v_uid and creation_request_id=p_request_id;
 if v_id is not null then return v_id; end if;
 insert into public.worlds(owner_id,creation_request_id,name,seed,climate_id,population_limit)
 values(v_uid,p_request_id,btrim(p_name),p_seed,p_climate_id,p_population_limit) returning id into v_id;
 return v_id;
end; $$;
create function public.create_world(p_name text,p_seed text,p_climate_id text,p_population_limit integer,p_request_id uuid)
returns uuid language sql security invoker set search_path='' as $$
 select private.create_world(p_name,p_seed,p_climate_id,p_population_limit,p_request_id);
$$;

create function private.update_world(p_id uuid,p_name text,p_population_limit integer,p_expected_revision integer)
returns integer language plpgsql security definer set search_path='' as $$
declare v_world public.worlds; v_uid uuid:=auth.uid();
begin
 if v_uid is null then raise exception 'AUTH_REQUIRED' using errcode='42501'; end if;
 if p_name is null or char_length(btrim(p_name)) not between 2 and 60 or p_name ~ '[[:cntrl:]]'
 or p_population_limit is null or p_population_limit not between 20 and 100000
 or p_expected_revision is null then raise exception 'INVALID_WORLD' using errcode='22023'; end if;
 select * into v_world from public.worlds where id=p_id and owner_id=v_uid for update;
 if not found then raise exception 'WORLD_NOT_FOUND' using errcode='P0002';end if;
 if v_world.revision<>p_expected_revision then raise exception 'REVISION_CONFLICT' using errcode='40001';end if;
 update public.worlds set name=btrim(p_name),population_limit=p_population_limit,revision=revision+1,updated_at=now()
 where id=p_id returning revision into v_world.revision;
 return v_world.revision;
end; $$;
create function public.update_world(p_id uuid,p_name text,p_population_limit integer,p_expected_revision integer)
returns integer language sql security invoker set search_path='' as $$
 select private.update_world(p_id,p_name,p_population_limit,p_expected_revision);
$$;

create function private.delete_world(p_id uuid,p_confirmation text,p_expected_revision integer)
returns void language plpgsql security definer set search_path='' as $$
declare v_world public.worlds; v_uid uuid:=auth.uid();
begin
 if v_uid is null then raise exception 'AUTH_REQUIRED' using errcode='42501';end if;
 select * into v_world from public.worlds where id=p_id and owner_id=v_uid for update;
 if not found then raise exception 'WORLD_NOT_FOUND' using errcode='P0002';end if;
 if p_expected_revision is null or v_world.revision<>p_expected_revision then raise exception 'REVISION_CONFLICT' using errcode='40001';end if;
 if p_confirmation is null or btrim(p_confirmation)<>v_world.name then raise exception 'CONFIRMATION_MISMATCH' using errcode='22023';end if;
 delete from public.worlds where id=p_id;
end; $$;
create function public.delete_world(p_id uuid,p_confirmation text,p_expected_revision integer)
returns void language sql security invoker set search_path='' as $$
 select private.delete_world(p_id,p_confirmation,p_expected_revision);
$$;

revoke all on function private.create_world(text,text,text,integer,uuid),public.create_world(text,text,text,integer,uuid),
 private.update_world(uuid,text,integer,integer),public.update_world(uuid,text,integer,integer),
 private.delete_world(uuid,text,integer),public.delete_world(uuid,text,integer) from public,anon,authenticated;
grant execute on function private.create_world(text,text,text,integer,uuid),public.create_world(text,text,text,integer,uuid),
 private.update_world(uuid,text,integer,integer),public.update_world(uuid,text,integer,integer),
 private.delete_world(uuid,text,integer),public.delete_world(uuid,text,integer) to authenticated;
comment on table public.worlds is 'V0.1.0 initial saves only; simulation/leases in V0.3.0. No client state overwrite.';
commit;
