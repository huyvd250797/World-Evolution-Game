-- Read-only metadata checks after 009.
select jsonb_array_length(spec->'seasons') as seasons,
 jsonb_array_length(spec->'regions') as climate_regions,
 jsonb_array_length(spec->'hazards') as hazard_catalog,
 jsonb_array_length(spec->'gear') as gear_catalog from private.climate_catalog; -- 4,7,15,18
select to_regprocedure('private.sim_validate(jsonb,public.worlds)') as current_validator,
 to_regprocedure('private.sim_validate_v8(jsonb,public.worlds)') as previous_validator;
select has_table_privilege('authenticated','private.climate_catalog','select') as client_catalog_read; -- false
