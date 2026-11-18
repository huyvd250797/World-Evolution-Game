-- Read-only diagnostics, run after migration 002 in Supabase SQL Editor.
select to_regclass('private.world_simulations') as head_table,to_regclass('private.world_save_history') as history_table,
 to_regprocedure('public.simulation_rpc(uuid,uuid,text,integer,integer,uuid,text,text,text,integer)') as rpc;
select n.nspname,c.relname,c.relrowsecurity from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='private' and c.relname in ('world_simulations','world_save_history');
select grantee,table_schema,table_name,privilege_type from information_schema.table_privileges where table_schema='private' and table_name in ('world_simulations','world_save_history') and grantee in ('anon','authenticated','PUBLIC');
-- The direct table privilege query above should return no client grants.
select n.nspname,p.proname,p.prosecdef,p.proconfig from pg_proc p join pg_namespace n on n.oid=p.pronamespace where p.proname='simulation_rpc';
