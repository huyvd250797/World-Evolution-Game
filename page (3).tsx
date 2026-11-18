import {redirect} from 'next/navigation';
import {isConfigured} from '@/lib/config';
import {supabaseServer} from '@/lib/supabase/server';
export const dynamic='force-dynamic';
export default async function Home(){if(isConfigured()){const db=await supabaseServer();const {data:{user}}=await db.auth.getUser();if(user)redirect('/worlds');}redirect('/login');}
