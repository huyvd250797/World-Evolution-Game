-- Read-only metadata checks after migration 006; no user save data is output.
select count(*)=96 as must_be_true from private.workforce_roles;
select has_table_privilege('authenticated','private.workforce_roles','select') as must_be_false;
select has_function_privilege('authenticated','private.sim_validate(jsonb,public.worlds)','execute') as must_be_false;
select position('INVALID_WORKFORCE' in pg_get_functiondef('private.sim_validate(jsonb,public.worlds)'::regprocedure))>0 as workforce_validator_installed;
select position('workforce' in pg_get_functiondef('private.simulation_rpc(uuid,uuid,text,integer,integer,uuid,text,text,text,integer)'::regprocedure))>0 as full_snapshot_guard_installed;
