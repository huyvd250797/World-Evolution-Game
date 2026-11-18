import type {Metadata,Viewport} from 'next';
import './globals.css';
export const metadata:Metadata={title:{default:'World Evolution — Khởi đầu nền văn minh',template:'%s | World Evolution'},description:'Xây dựng và quản lý thế giới của bạn. Nền tảng PC và mobile.',manifest:'/manifest.webmanifest',icons:{icon:'/assets/icon-v1.svg',apple:'/assets/icon-v1.svg'}};
export const viewport:Viewport={width:'device-width',initialScale:1,viewportFit:'cover',themeColor:'#263e34'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="vi"><body><a className="skip-link" href="#main-content">Đến nội dung chính</a>{children}</body></html>}
