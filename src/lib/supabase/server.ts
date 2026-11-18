import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { supabaseEnv } from '../config';
export async function supabaseServer(){
 const store=await cookies();const env=supabaseEnv();
 return createServerClient(env.url,env.key,{cookies:{getAll(){return store.getAll();},setAll(items){try{items.forEach(({name,value,options})=>store.set(name,value,options));}catch{/* Server Components use proxy to refresh cookies. */}}}});
}
