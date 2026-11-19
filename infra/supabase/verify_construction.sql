-- Read-only metadata checks, run in Supabase SQL Editor after 008.
select count(*) as construction_buildings from private.construction_catalog; -- 166
select count(*) as construction_resources from private.construction_resources; -- 230
select to_regprocedure('private.sim_validate(jsonb,public.worlds)') as current_validator,
 to_regprocedure('private.sim_validate_v7(jsonb,public.worlds)') as previous_validator;
select has_table_privilege('authenticated','private.construction_catalog','select') as client_catalog_read,
 has_table_privilege('authenticated','private.construction_resources','select') as client_resource_read; -- false/false
