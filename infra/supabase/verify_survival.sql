-- Read-only verification after 005. No user data or secrets emitted.
select n.nspname as schema_name,p.proname as function_name
from pg_proc p join pg_namespace n on n.oid=p.pronamespace
where n.nspname='private' and p.proname in ('sim_validate','sim_validate_v4','simulation_rpc');
select has_function_privilege('authenticated','private.sim_validate(jsonb,public.worlds)','execute') as must_be_false;
select position('SURVIVAL_CONDITION_LOCKED' in pg_get_functiondef('private.sim_validate(jsonb,public.worlds)'::regprocedure))>0 as survival_validator_installed;
select position('survival' in pg_get_functiondef('private.simulation_rpc(uuid,uuid,text,integer,integer,uuid,text,text,text,integer)'::regprocedure))>0 as full_save_guard_installed;
