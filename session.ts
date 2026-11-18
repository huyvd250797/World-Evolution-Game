import { cache } from 'react';
import { redirect } from 'next/navigation';
import { isConfigured } from './config';
import { supabaseServer } from './supabase/server';
export const requireUser=cache(async()=>{
 if(!isConfigured())redirect('/login');const db=await supabaseServer();
 const {data:{user},error}=await db.auth.getUser();
 if(error||!user)redirect('/login?notice=session');return {db,user};
});
