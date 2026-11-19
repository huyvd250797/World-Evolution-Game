-- Read-only checks after migration010; run as project SQL Editor owner.
select jsonb_array_length(spec->'diseases') as diseases,
 jsonb_array_length(spec->'pollutants') as pollutants,
 jsonb_array_length(spec->'emissions') as emission_rules
from private.health_catalog; -- 12,14,18
select to_regprocedure('private.sim_validate(jsonb,public.worlds)') as current_validator,
 to_regprocedure('private.sim_validate_v9(jsonb,public.worlds)') as previous_validator;
select has_table_privilege('authenticated','private.health_catalog','select') as client_catalog_read; -- false
