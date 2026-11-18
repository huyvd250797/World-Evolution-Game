-- Read-only check after 003. No data reset.
select to_regclass('private.planning_catalog') as planning_catalog;
select count(*) as expected_166 from private.planning_catalog;
select n.nspname,c.relname,c.relrowsecurity from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='private' and c.relname='planning_catalog';
select grantee,privilege_type from information_schema.table_privileges where table_schema='private' and table_name='planning_catalog' and grantee in ('PUBLIC','anon','authenticated');
-- Client privilege query should return zero rows.
select to_regprocedure('private.sim_validate(jsonb,public.worlds)') as new_validator,to_regprocedure('private.sim_validate_v2(jsonb,public.worlds)') as legacy_validator;
