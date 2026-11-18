-- Read-only checks. Run in Supabase SQL Editor after migration 001.
select tablename, rowsecurity from pg_tables where schemaname='public' and tablename='worlds';
select policyname, roles, cmd, qual from pg_policies where schemaname='public' and tablename='worlds';
select grantee, privilege_type from information_schema.role_table_grants where table_schema='public' and table_name='worlds' and grantee in ('anon','authenticated');
-- Expected authenticated SELECT only; no anon table permissions.
select n.nspname as schema_name,p.proname,p.prosecdef as security_definer,p.proconfig
from pg_proc p join pg_namespace n on n.oid=p.pronamespace
where n.nspname in ('public','private') and p.proname in ('create_world','update_world','delete_world');
-- Expected public wrappers invoker(false), private implementations definer(true), search_path empty.
select has_function_privilege('anon','public.create_world(text,text,text,integer,uuid)','EXECUTE') as anon_can_create,
has_function_privilege('authenticated','public.create_world(text,text,text,integer,uuid)','EXECUTE') as signed_in_can_create;
-- Expected false, true. Keep private schema out of API Exposed schemas.
