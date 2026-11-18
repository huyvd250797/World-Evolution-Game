'use server';
import { z } from 'zod';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { supabaseServer } from '@/lib/supabase/server';
import { requireUser } from '@/lib/session';
import { createWorldSchema,worldName,populationLimitSchema } from '@/game/core/world';
import { databaseError } from '@/lib/worlds';
export type ActionResult={error?:string;success?:string;worldId?:string};
const authSchema=z.object({email:z.email('Email chưa đúng định dạng.').max(254),password:z.string().min(8,'Mật khẩu cần ít nhất 8 ký tự.').max(128,'Mật khẩu tối đa 128 ký tự.')});
function authError(message:string){
 if(/invalid login/i.test(message))return 'Email hoặc mật khẩu chưa đúng.';
 if(/email not confirmed/i.test(message))return 'Vui lòng xác nhận email trước khi đăng nhập.';
 if(/rate|too many|security purposes/i.test(message))return 'Đã gửi quá nhiều yêu cầu. Vui lòng đợi một lúc rồi thử lại.';
 if(/already registered/i.test(message))return 'Email đã được đăng ký. Hãy đăng nhập hoặc đặt lại mật khẩu.';
 return 'Chưa hoàn tất xác thực. Kiểm tra kết nối và cấu hình Supabase rồi thử lại.';
}
export async function authenticate(_:ActionResult,form:FormData):Promise<ActionResult>{
 const parsed=authSchema.safeParse({email:String(form.get('email')??'').trim(),password:form.get('password')});if(!parsed.success)return {error:parsed.error.issues[0].message};
 let done=false;
 try{
 const db=await supabaseServer();
 if(form.get('mode')==='register'){
  if(form.get('confirmation')!==parsed.data.password)return {error:'Mật khẩu nhập lại chưa khớp.'};
  const origin=(await headers()).get('origin');if(!origin)return {error:'Không xác định được địa chỉ ứng dụng. Hãy tải lại trang.'};
  const {data,error}=await db.auth.signUp({...parsed.data,options:{emailRedirectTo:`${origin}/auth/callback`}});
  if(error)return {error:authError(error.message)};
  if(!data.session)return {success:'Nếu email đủ điều kiện, thư xác nhận đã được gửi. Mở email và xác nhận để tiếp tục.'};done=true;
 }else{
  const {error}=await db.auth.signInWithPassword(parsed.data);if(error)return {error:authError(error.message)};done=true;
 }
 }catch{return {error:'Không kết nối được dịch vụ tài khoản. Vui lòng thử lại.'};}
 if(done)redirect('/worlds');return {};
}
export async function signOut():Promise<ActionResult>{
 try{const db=await supabaseServer();const {error}=await db.auth.signOut({scope:'local'});if(error)return {error:'Chưa đăng xuất được. Kiểm tra kết nối rồi thử lại.'};}catch{return {error:'Chưa đăng xuất được. Vui lòng thử lại.'};}
 redirect('/login');
}
export async function requestReset(_:ActionResult,form:FormData):Promise<ActionResult>{
 const email=z.email().safeParse(String(form.get('email')??'').trim());if(!email.success)return {error:'Vui lòng nhập email hợp lệ.'};
 try{const db=await supabaseServer();const origin=(await headers()).get('origin');if(!origin)return {error:'Hãy tải lại trang rồi thử lại.'};const {error}=await db.auth.resetPasswordForEmail(email.data,{redirectTo:`${origin}/auth/callback?next=/reset-password`});if(error)return {error:authError(error.message)};return {success:'Nếu email đã đăng ký, thư đặt lại mật khẩu sẽ được gửi. Vui lòng kiểm tra hộp thư.'};}catch{return {error:'Không gửi được yêu cầu. Kiểm tra kết nối rồi thử lại.'};}
}
export async function resetPassword(_:ActionResult,form:FormData):Promise<ActionResult>{
 const {db}=await requireUser();const password=z.string().min(8).max(128).safeParse(form.get('password'));if(!password.success)return {error:'Mật khẩu cần từ 8 đến 128 ký tự.'};if(password.data!==form.get('confirmation'))return {error:'Mật khẩu nhập lại chưa khớp.'};
 try{const {error}=await db.auth.updateUser({password:password.data});if(error)return {error:authError(error.message)};}catch{return {error:'Không cập nhật được mật khẩu. Hãy thử lại.'};}redirect('/worlds');
}
function mutationError(code?:string,message?:string){if(code==='40001')return 'Thế giới đã được cập nhật ở phiên khác. Đóng hộp thoại, tải lại danh sách rồi thử lại.';if(code==='P0002')return 'Thế giới không còn tồn tại hoặc bạn không có quyền truy cập.';if(message?.includes('CONFIRMATION_MISMATCH'))return 'Tên xác nhận chưa khớp. Vui lòng nhập đúng tên thế giới.';if(code==='22023')return 'Cấu hình thế giới không hợp lệ. Kiểm tra lại các ô nhập.';return databaseError(code);}
export async function createWorld(input:unknown):Promise<ActionResult>{
 const {db}=await requireUser();const parsed=createWorldSchema.safeParse(input);if(!parsed.success)return {error:parsed.error.issues[0].message};
 try{const x=parsed.data;const {data,error}=await db.rpc('create_world',{p_name:x.name,p_seed:x.seed,p_climate_id:x.climateId,p_population_limit:x.populationLimit,p_request_id:x.requestId});if(error)return {error:mutationError(error.code,error.message)};if(typeof data!=='string')return {error:'Phản hồi tạo thế giới không hợp lệ. Hãy tải lại danh sách trước khi thử lại.'};revalidatePath('/worlds');return {worldId:data};}catch{return {error:'Kết nối bị gián đoạn. Thử lại để kiểm tra cùng yêu cầu; hệ thống tránh tạo trùng thế giới.'};}
}
export async function updateWorld(input:unknown):Promise<ActionResult>{
 const {db}=await requireUser();const parsed=z.object({id:z.uuid(),name:worldName,populationLimit:populationLimitSchema,revision:z.number().int().positive()}).safeParse(input);if(!parsed.success)return {error:parsed.error.issues[0].message};
 try{const x=parsed.data;const {error}=await db.rpc('update_world',{p_id:x.id,p_name:x.name,p_population_limit:x.populationLimit,p_expected_revision:x.revision});if(error)return {error:mutationError(error.code,error.message)};revalidatePath('/worlds');revalidatePath(`/worlds/${x.id}`);return {success:'Đã lưu cấu hình lên đám mây.'};}catch{return {error:'Chưa xác nhận được lần lưu. Tải lại dữ liệu trước khi thử lại để tránh ghi đè.'};}
}
export async function deleteWorld(input:unknown):Promise<ActionResult>{
 const {db}=await requireUser();const parsed=z.object({id:z.uuid(),confirmation:z.string().max(60),revision:z.number().int().positive()}).safeParse(input);if(!parsed.success)return {error:'Thông tin xác nhận không hợp lệ.'};
 try{const x=parsed.data;const {error}=await db.rpc('delete_world',{p_id:x.id,p_confirmation:x.confirmation,p_expected_revision:x.revision});if(error)return {error:mutationError(error.code,error.message)};revalidatePath('/worlds');return {success:'Đã xóa thế giới.'};}catch{return {error:'Chưa xác nhận được thao tác xóa. Hãy tải lại danh sách để kiểm tra.'};}
}
