'use client';
import Link from 'next/link';
import { useActionState,useState } from 'react';
import { ArrowRight,Eye,EyeOff,LockKeyhole,Mail,CheckCircle2,AlertCircle } from 'lucide-react';
import { authenticate,requestReset,resetPassword } from '@/app/actions';
export function AuthForm({configured,reset=false,notice}:{configured:boolean;reset?:boolean;notice?:string}){
 const [mode,setMode]=useState<'login'|'register'|'forgot'>(notice==='forgot'?'forgot':'login');const [visible,setVisible]=useState(false);
 const [state,action,pending]=useActionState(reset?resetPassword:mode==='forgot'?requestReset:authenticate,{});
 return <div className="auth-form-wrap"><span className="eyebrow">BẮT ĐẦU HÀNH TRÌNH</span><h1>{reset?'Mật khẩu mới':mode==='register'?'Tạo tài khoản':mode==='forgot'?'Đặt lại mật khẩu':'Chào mừng trở lại'}</h1><p className="muted">{reset?'Đặt mật khẩu mới để tiếp tục hành trình.':mode==='forgot'?'Nhận đường dẫn khôi phục qua email của bạn.':'Một tài khoản. Thế giới của bạn trên PC và điện thoại.'}</p>
 {!reset&&mode!=='forgot'&&<div className="auth-tabs" role="group" aria-label="Chọn hình thức xác thực"><button type="button" aria-pressed={mode==='login'} className={mode==='login'?'selected':''} onClick={()=>setMode('login')}>Đăng nhập</button><button type="button" aria-pressed={mode==='register'} className={mode==='register'?'selected':''} onClick={()=>setMode('register')}>Đăng ký</button></div>}
 {!configured&&<div className="notice warning"><AlertCircle size={19}/><div><strong>Chưa cấu hình kết nối</strong><p>Thêm URL và khóa public Supabase vào biến môi trường, chạy SQL khởi tạo rồi mở lại ứng dụng. Hướng dẫn đầy đủ trong README.md của source.</p></div></div>}
 {notice==='session'&&<p className="notice">Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.</p>}
 {notice==='callback'&&<p className="notice error">Đường dẫn xác nhận hết hạn hoặc không hợp lệ. Hãy đăng nhập hoặc yêu cầu thư mới.</p>}
 <form action={action} key={`${reset}-${mode}`}><input type="hidden" name="mode" value={mode}/>
 {!reset&&<label>Email<div className="input-with-icon"><Mail size={18}/><input type="email" name="email" placeholder="ban@example.com" autoComplete="email" required maxLength={254}/></div></label>}
 {mode!=='forgot'&&<><label>Mật khẩu<div className="input-with-icon"><LockKeyhole size={18}/><input type={visible?'text':'password'} name="password" placeholder="Ít nhất 8 ký tự" autoComplete={reset||mode==='register'?'new-password':'current-password'} minLength={8} maxLength={128} required/><button type="button" className="show-password" aria-label={visible?'Ẩn mật khẩu':'Hiện mật khẩu'} onClick={()=>setVisible(!visible)}>{visible?<EyeOff size={18}/>:<Eye size={18}/>}</button></div></label>{(reset||mode==='register')&&<label>Nhập lại mật khẩu<input type={visible?'text':'password'} name="confirmation" autoComplete="new-password" required minLength={8} maxLength={128}/></label>}</>}
 {!reset&&mode==='login'&&<div className="auth-options"><span><CheckCircle2 size={14}/>Duy trì phiên an toàn</span><button type="button" className="text-button" onClick={()=>setMode('forgot')}>Quên mật khẩu?</button></div>}
 {state.error&&<p className="notice error" role="alert">{state.error}</p>}{state.success&&<p className="notice success" role="status">{state.success}</p>}
 <button disabled={!configured||pending} className="button primary auth-submit" type="submit">{pending?'Đang xử lý…':reset?'Lưu mật khẩu':mode==='login'?'Vào thế giới của bạn':mode==='register'?'Tạo tài khoản':'Gửi thư khôi phục'}<ArrowRight size={18}/></button>
 </form>{!reset&&mode==='forgot'&&<button className="text-button back-login" onClick={()=>setMode('login')}>Quay lại đăng nhập</button>}
 <div className="auth-footnote"><LockKeyhole size={16}/><span>Dữ liệu riêng tư theo tài khoản.<br/>Tiếp tục thế giới đã lưu trên thiết bị khác.</span></div><Link className="catalog-link" href="/data">Khám phá dữ liệu nền tảng <ArrowRight size={15}/></Link></div>;
}
