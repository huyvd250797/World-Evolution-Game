-- Read-only diagnostics after 004. No data changes.
select to_regprocedure('private.sim_validate(jsonb,public.worlds)') as current_validator,to_regprocedure('private.sim_validate_v3(jsonb,public.worlds)') as legacy_validator;
select n.nspname,p.proname,p.prosecdef,p.proconfig from pg_proc p join pg_namespace n on n.oid=p.pronamespace where p.proname in ('sim_validate','sim_validate_v3','simulation_rpc') and n.nspname in ('private','public');
select grantee,table_schema,table_name,privilege_type from information_schema.table_privileges where table_schema='private' and table_name in ('world_simulations','world_save_history','planning_catalog') and grantee in ('PUBLIC','anon','authenticated');
-- The table privilege query must return zero direct client grants.
