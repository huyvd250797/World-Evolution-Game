import {NextRequest,NextResponse} from 'next/server';
import {requestOrigin} from '@/lib/request-origin';
import {supabaseServer} from '@/lib/supabase/server';
export async function GET(request:NextRequest){const url=new URL(request.url);const origin=requestOrigin(request);const token_hash=url.searchParams.get('token_hash');const type=url.searchParams.get('type');if(token_hash&&(type==='signup'||type==='recovery'||type==='email')){try{const db=await supabaseServer();const {error}=await db.auth.verifyOtp({type,token_hash});if(!error)return NextResponse.redirect(new URL(type==='recovery'?'/reset-password':'/worlds',origin));}catch{/* handled below */}}return NextResponse.redirect(new URL('/login?notice=callback',origin));}
