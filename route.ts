import {NextRequest,NextResponse} from 'next/server';
import {requestOrigin} from '@/lib/request-origin';
import {supabaseServer} from '@/lib/supabase/server';
export async function GET(request:NextRequest){const url=new URL(request.url);const origin=requestOrigin(request);const code=url.searchParams.get('code');const next=url.searchParams.get('next')==='/reset-password'?'/reset-password':'/worlds';if(code){try{const db=await supabaseServer();const {error}=await db.auth.exchangeCodeForSession(code);if(!error)return NextResponse.redirect(new URL(next,origin));}catch{/* Expired or unavailable callback. */}}return NextResponse.redirect(new URL('/login?notice=callback',origin));}
