-- Read-only metadata verification after migration 007. Does not output user saves.
select count(*)=52 as must_be_true from private.ecology_species;
select has_table_privilege('authenticated','private.ecology_species','select') as must_be_false;
select has_function_privilege('authenticated','private.sim_validate(jsonb,public.worlds)','execute') as must_be_false;
select position('INVALID_ECOLOGY' in pg_get_functiondef('private.sim_validate(jsonb,public.worlds)'::regprocedure))>0 as ecosystem_validator_installed;
select position('ecology' in pg_get_functiondef('private.simulation_rpc(uuid,uuid,text,integer,integer,uuid,text,text,text,integer)'::regprocedure))>0 as full_snapshot_guard_installed;
