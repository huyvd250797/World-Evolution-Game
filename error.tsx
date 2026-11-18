'use client';
import Link from 'next/link';
export default function ErrorPage({reset}:{reset:()=>void}){return <main id="main-content" className="error-screen"><span className="eyebrow">WORLD EVOLUTION</span><h1>Chưa mở được dữ liệu</h1><p>Kiểm tra kết nối, cấu hình Supabase và migration database. Dữ liệu đám mây đã xác nhận vẫn được giữ.</p><div className="button-row"><Link className="button secondary" href="/worlds">Về danh sách</Link><button className="button primary" onClick={reset}>Thử lại</button></div></main>}
