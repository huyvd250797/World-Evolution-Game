import {redirect} from 'next/navigation';
import {Brand} from '@/components/brand';
import {AuthForm} from '@/components/auth-form';
import {isConfigured} from '@/lib/config';
import {supabaseServer} from '@/lib/supabase/server';
import {assetUrl} from '@/game/renderer/assets';
import {ArrowUpRight,Monitor,Smartphone,Leaf} from 'lucide-react';
export const dynamic='force-dynamic';
export default async function Login({searchParams}:{searchParams:Promise<{notice?:string}>}){const configured=isConfigured();if(configured){const db=await supabaseServer();const {data:{user}}=await db.auth.getUser();if(user)redirect('/worlds');}const {notice}=await searchParams;
 return <main id="main-content" className="auth-layout"><section className="auth-scene"><Brand/><div className="scene-heading"><span className="scene-pill"><Leaf size={14}/>MỘT THẾ GIỚI ĐANG CHỜ BẠN</span><h2>Nền văn minh lớn.<br/>Khởi đầu từ bạn.</h2><p>Đặt nền móng hôm nay.<br/>Viết nên lịch sử của thế giới riêng mình.</p></div><div className="landscape-auth" role="img" aria-label="Minh họa định hướng thế giới 2.5D, chưa phải bản đồ gameplay" style={{backgroundImage:`url(${assetUrl('landscape')})`}}/><div className="scene-footer"><span><Monitor size={17}/>PC <i/> <Smartphone size={16}/>Mobile</span><span>V0.6.0<ArrowUpRight size={15}/></span></div></section><section className="auth-panel"><div className="auth-mobile-brand"><Brand/></div><AuthForm configured={configured} notice={notice}/><div className="auth-version">SURVIVAL & FOOD <span>·</span> MASTER DATA V1.2</div></section></main>}
