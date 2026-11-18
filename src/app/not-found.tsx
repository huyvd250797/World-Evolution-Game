import Link from 'next/link';
export default function NotFound(){return <main id="main-content" className="error-screen"><span className="eyebrow">WORLD EVOLUTION · 404</span><h1>Không tìm thấy thế giới</h1><p>Thế giới không tồn tại hoặc tài khoản của bạn không có quyền truy cập.</p><Link className="button primary" href="/worlds">Về danh sách thế giới</Link></main>}
