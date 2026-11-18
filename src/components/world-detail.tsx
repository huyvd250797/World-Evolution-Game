'use client';
import Link from 'next/link';
import {useState} from 'react';
import {useRouter} from 'next/navigation';
import {ArrowLeft,Settings2,Users,CalendarDays,Pause,Mountain,Layers3,Hash,Check,Copy} from 'lucide-react';
import {type WorldDetail} from '@/game/core/world';
import {master,climateById} from '@/game/data';
import dynamic from 'next/dynamic';
const WorldMapView=dynamic(()=>import('./map/world-map-view').then(m=>m.WorldMapView),{ssr:false,loading:()=> <div className="map-explorer map-module-loading" role="status"><span className="loading-spinner"/>Đang mở trình xem bản đồ…</div>});
import {WorldDialog} from './world-manager';
export function WorldDetailView({world}:{world:WorldDetail}){const [edit,setEdit]=useState(false);const [message,setMessage]=useState('');const router=useRouter();
 async function copySeed(){try{await navigator.clipboard.writeText(world.seed);setMessage('Đã sao chép seed.');}catch{setMessage('Không sao chép tự động được. Bạn có thể chọn và sao chép seed bên dưới.');}}
 const valid=world.catalog_checksum===master.catalogSha256;
 return <><Link className="back-link" href="/worlds"><ArrowLeft size={17}/>Tất cả thế giới</Link><section className="page-heading"><div><span className="eyebrow">THẾ GIỚI CỦA BẠN</span><h1>{world.name}</h1><p className="muted"><span className="status-dot"/>Đã lưu trên đám mây · Bản lưu #{world.revision}</p></div><button className="button secondary" onClick={()=>setEdit(true)}><Settings2 size={17}/>Cấu hình</button></section>
 {message&&<p role="status" className="notice success">{message}</p>}{!valid&&<p role="alert" className="notice error">Checksum catalog của thế giới khác bản ứng dụng. Chưa thể chạy mô phỏng; cần đối chiếu phiên bản dữ liệu trước khi nâng cấp.</p>}
 {valid&&<WorldMapView key={world.id} worldId={world.id} seed={world.seed} climateId={world.climate_id} population={world.population} day={world.day}/>}

 <div className="detail-stats"><div><Users/><span>Dân cư<strong>{world.population}<small> / {world.population_limit.toLocaleString('vi-VN')}</small></strong></span></div><div><CalendarDays/><span>Ngày thế giới<strong>{world.day}</strong></span></div><div><Mountain/><span>Khí hậu<strong>{climateById(world.climate_id)?.name??world.climate_id}</strong></span></div><div><Pause/><span>Mô phỏng<strong>Tạm dừng</strong></span></div></div>
 <section className="detail-grid"><div className="panel"><div className="panel-title"><Layers3 size={19}/><h2>Thông tin bản lưu</h2></div><dl><div><dt>Seed bản đồ</dt><dd><code>{world.seed}</code><button onClick={copySeed} className="icon-button" aria-label="Sao chép seed"><Copy size={14}/></button></dd></div><div><dt>Master Data</dt><dd>V{world.master_data_version} · Frozen</dd></div><div><dt>Schema bản lưu</dt><dd>V{world.save_schema_version}</dd></div><div><dt>Lần lưu cuối</dt><dd>{new Intl.DateTimeFormat('vi-VN',{dateStyle:'short',timeStyle:'short',timeZone:'Asia/Ho_Chi_Minh'}).format(new Date(world.updated_at))} (VN)</dd></div><div><dt>Đối chiếu catalog</dt><dd><Check size={15}/>{valid?'Khớp checksum':'Cần đối chiếu'}</dd></div></dl><p className="checksum"><Hash size={14}/>{world.catalog_checksum}</p></div><div className="panel"><div className="panel-title"><Users size={19}/><h2>Trạng thái khởi tạo</h2></div><p className="muted">20 cư dân đã có ID riêng. Nhà ở và công việc sẽ được triển khai cùng gameplay ở các bản tiếp theo.</p><div className="people-grid" aria-label="20 cư dân ban đầu">{world.initial_state.people.map((person,i)=><span key={person.id} title={person.id}><Users size={15}/>{String(i+1).padStart(2,'0')}</span>)}</div><p className="field-help">0 công trình · 0 kho hàng · Khởi nguyên (T001) đã mở</p></div></section>
 {edit&&<WorldDialog mode="edit" world={world} onClose={()=>setEdit(false)} onSuccess={m=>{setMessage(m);setEdit(false);router.refresh();}}/>}</>;
}
