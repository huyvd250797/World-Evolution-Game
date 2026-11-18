import {initialSimulation,decodeHead,delta,calendar,validateState,sha256,type Identity,type SimState,type SaveHead} from './engine';
import type {PlanCommand} from '../planning/model';
import {SimulationWorker} from './worker-client';
import {simulationApi,SaveError,type SessionResponse,type HistoryItem} from './api';
import {makeBackup,writeBackup,readBackups,backupKey,type LocalBackup,type PendingSave} from './backup';
export type SaveStatus='saved'|'saving'|'dirty'|'error';
export interface SimulationView{state:SimState;loading:boolean;busy:boolean;owned:boolean;revision:number;status:SaveStatus;error:string;notice:string;savedAt:string|null;history:HistoryItem[];candidates:LocalBackup[];storageWarning:string;saveCount:number;writeBytes:number;storedBytes:number;transferBytes:number}
const signature=(state:SimState)=>JSON.stringify({...state,paused:true});
export class SimulationSession{
 readonly token=crypto.randomUUID();private worker:SimulationWorker;private disposed=false;private netBusy=false;private savePromise:Promise<void>|null=null;private baseline:SimState;private epoch=0;private pending:PendingSave|null=null;private deadline=0;private backupVersion=0;private cachedBackup:LocalBackup|null=null;private timers:ReturnType<typeof setInterval>[]=[];
 view:SimulationView;
 constructor(private identity:Identity,private ownerId:string,private publish:(view:SimulationView)=>void){
  this.baseline=initialSimulation(identity);this.view={state:this.baseline,loading:true,busy:false,owned:false,revision:0,status:'saved',error:'',notice:'',savedAt:null,history:[],candidates:[],storageWarning:'',saveCount:0,writeBytes:0,storedBytes:0,transferBytes:0};
  this.worker=new SimulationWorker(s=>{if(this.disposed)return;this.view.state=s;if(this.view.status!=='saving'&&this.view.status!=='error')this.view.status=this.dirty?'dirty':'saved';this.emit();},message=>{if(this.disposed)return;this.view.owned=false;this.view.state={...this.view.state,paused:true};this.view.error=message;this.view.status='error';void this.backup();this.emit();});
 }
 get dirty(){return signature(this.view.state)!==signature(this.baseline);}
 private emit(){if(!this.disposed)this.publish({...this.view,candidates:[...this.view.candidates]});}
 private api(params:Parameters<typeof simulationApi>[2],keepalive=false){return simulationApi(this.identity.worldId,this.token,params,n=>{this.view.transferBytes+=n;},keepalive);}
 async start(){await this.worker.call('load',{state:this.view.state});await this.open();if(this.disposed)return;this.timers=[setInterval(()=>{void this.renew();},20000),setInterval(()=>{if(this.view.owned&&this.dirty&&!document.hidden)void this.save();},30000),setInterval(()=>{if(this.view.owned&&this.dirty)void this.backup();if(this.view.owned&&performance.now()>=this.deadline)void this.loseLease('Quyền điều khiển hết hạn. Bấm Kết nối lại để đối chiếu bản đám mây.');},1000)];document.addEventListener('visibilitychange',this.visibility);window.addEventListener('pagehide',this.pagehide);window.addEventListener('online',this.online);window.addEventListener('offline',this.offline);}
 async open(takeover=false){
  if(this.netBusy||this.disposed)return;this.netBusy=true;this.view.busy=true;this.view.error='';this.emit();
  try{
   if(!this.view.loading&&this.dirty){this.view.state=await this.worker.call('control',{command:{paused:true}});await this.backup();}
   const response:SessionResponse=await this.api({action:takeover?'takeover':'open'});
   if(this.disposed){if(response.owned)void this.api({action:'release',epoch:response.epoch}).catch(()=>{});return;}
   this.epoch=response.epoch;this.view.owned=response.owned;this.deadline=performance.now()+Math.max(0,response.remainingMs-3000);
   this.view.revision=response.head.revision;this.view.savedAt=response.head.savedAt;
   const saved=await decodeHead(response.head,this.identity);
   this.setHead(response.head,saved,response);this.pending=null;await this.worker.call('load',{state:saved});await this.worker.call('lease',{remainingMs:response.owned?Math.max(0,this.deadline-performance.now()):0});
   try{const local=await readBackups(localStorage,this.ownerId,this.identity);this.view.candidates=local.backups.filter(b=>signature(validateState(JSON.parse(b.payload),this.identity))!==signature(saved));if(local.invalid)this.view.storageWarning=`Có ${local.invalid} bản tạm hỏng; không tự áp dụng.`;}catch{this.view.storageWarning='Trình duyệt không cho đọc/lưu tạm; cần giữ kết nối để lưu đám mây.';}
   if(!response.owned)this.view.notice='Thiết bị/tab khác đang điều khiển. Có thể xem bản lưu; bấm Tiếp quản nếu muốn chạy ở đây.';else this.view.notice='Đã nhận quyền điều khiển. Bấm Chạy để tiếp tục; game không tự chạy bù thời gian đã đóng.';

  }catch(e){this.view.error=this.message(e);this.view.status='error';if(this.view.owned)await this.worker.call('lease',{remainingMs:Math.max(0,this.deadline-performance.now())}).catch(()=>{});}
  finally{this.netBusy=false;this.view.busy=false;this.view.loading=false;this.emit();}
 }
 private setHead(head:SaveHead,state:SimState,response?:SessionResponse){this.baseline=state;this.view.revision=head.revision;this.view.savedAt=head.savedAt;this.view.status='saved';this.view.error='';if(response){this.view.saveCount=response.saveCount;this.view.writeBytes=response.writeBytes;this.view.storedBytes=response.storedBytes;}}
 private async renew(){
  if(this.disposed||this.netBusy||this.view.loading||document.hidden)return;this.netBusy=true;
  try{const r:SessionResponse=await this.api({action:'renew'});if(this.disposed)return;
   if(!r.owned){if(this.view.owned){await this.loseLease('Thiết bị khác đã tiếp quản. Đã tạm dừng và giữ tiến trình chưa đồng bộ.');}else if(!this.dirty&&r.head.revision!==this.view.revision){const s=await decodeHead(r.head,this.identity);this.setHead(r.head,s,r);await this.worker.call('load',{state:s});}return;}
   if(r.epoch!==this.epoch){await this.loseLease('Phiên điều khiển đã thay đổi. Cần kết nối lại.');return;}
   if(r.head.revision!==this.view.revision&&!this.pending){await this.loseLease('Bản đám mây đã thay đổi. Đã dừng để tránh ghi đè.');return;}
   this.deadline=performance.now()+Math.max(0,r.remainingMs-3000);await this.worker.call('lease',{remainingMs:Math.max(0,this.deadline-performance.now())});
  }catch(e){await this.pauseForError(e);}finally{this.netBusy=false;this.emit();}
 }
 async plan(command:PlanCommand){if(!this.view.owned||this.view.loading||this.view.busy||this.view.status==='error'||this.view.candidates.length||performance.now()>=this.deadline)throw new Error('Cần quyền điều khiển và kết nối hợp lệ để quy hoạch.');this.view.state=await this.worker.call('plan',{command});await this.backup();this.emit();}
 async command(command:{paused?:boolean;speed?:1|2|4}){if(!this.view.owned||this.view.loading||this.disposed)return;try{if(command.paused===false&&(document.hidden||performance.now()>=this.deadline||this.view.candidates.length||this.view.status==='error'))throw new Error('Đối chiếu bản lưu/kết nối lại trước khi chạy.');this.view.state=await this.worker.call('control',{command});if(command.paused===true){await this.backup();void this.save();}}catch(e){this.view.error=this.message(e);}this.emit();}
 save(manual=false,keepalive=false):Promise<void>{if(this.savePromise)return this.savePromise;const p=this.doSave(manual,keepalive);this.savePromise=p;p.finally(()=>{if(this.savePromise===p)this.savePromise=null;}).catch(()=>{});return p;}
 private async doSave(manual:boolean,keepalive:boolean){
  if(this.disposed||this.netBusy||!this.view.owned||this.view.candidates.length||this.view.loading)return;this.netBusy=true;this.view.status='saving';this.emit();
  try{
   if(!this.pending){const state=await this.worker.call('snapshot');this.view.state=state;if(!manual&&!this.dirty){this.view.status='saved';return;}const kind=manual||JSON.stringify(state.planning)!==JSON.stringify(this.baseline.planning)||state.schemaVersion!==this.baseline.schemaVersion?'full':'delta',payload=JSON.stringify(kind==='full'?state:delta(this.baseline,state));this.pending={requestId:crypto.randomUUID(),epoch:this.epoch,revision:this.view.revision,kind,payload,checksum:await sha256(payload),state};}
   await this.backup();const p=this.pending!;
   const r:SessionResponse=await this.api({action:'save',epoch:p.epoch,revision:p.revision,requestId:p.requestId,kind:p.kind,payload:p.payload,checksum:p.checksum},keepalive);
   if(this.disposed){void this.api({action:'release',epoch:this.epoch},true).catch(()=>{});return;}const ack=r.ack;if(!ack)throw new Error('Thiếu xác nhận lưu.');const saved=await decodeHead(ack,this.identity);this.backupVersion++;this.setHead(ack,saved,r);this.pending=null;
   if(!r.owned||r.epoch!==this.epoch||r.head.revision!==ack.revision)await this.loseLease('Bản lưu đã được xác nhận nhưng thiết bị khác đang điều khiển.');
   this.view.status=this.dirty?'dirty':'saved';if(this.dirty)await this.backup();else this.clearOwnBackup();
  }catch(e){await this.pauseForError(e);}finally{this.netBusy=false;if(this.view.status==='saving')this.view.status=this.dirty?'dirty':'saved';this.emit();}
 }
 private message(e:unknown){return e instanceof Error?e.message:'Không hoàn tất được thao tác lưu.';}
 private async pauseForError(e:unknown){if(this.disposed)return;this.view.error=this.message(e);this.view.status='error';await this.worker.call('control',{command:{paused:true}}).then(s=>{this.view.state=s;}).catch(()=>{});if(e instanceof SaveError&&['LEASE_LOST','SAVE_CONFLICT','AUTH_REQUIRED'].includes(e.code)){this.view.owned=false;await this.worker.call('lease',{remainingMs:0}).catch(()=>{});}await this.backup();}
 private async loseLease(message:string){if(this.disposed)return;this.view.owned=false;this.view.error=message;this.view.status='error';await this.worker.call('lease',{remainingMs:0}).then(s=>{this.view.state=s;}).catch(()=>{});await this.backup();this.emit();}
 async backup(){if(this.disposed||(!this.dirty&&!this.pending))return;const version=++this.backupVersion;try{const b=await makeBackup(this.ownerId,this.token,this.view.state,this.view.revision,this.epoch,this.pending);if(version!==this.backupVersion||this.disposed)return;writeBackup(localStorage,b);this.cachedBackup=b;}catch{this.view.storageWarning='Trình duyệt không cho lưu tạm. Giữ trang mở và dùng Lưu ngay khi có mạng.';}}
 private clearOwnBackup(){this.backupVersion++;this.cachedBackup=null;try{localStorage.removeItem(backupKey({ownerId:this.ownerId,worldId:this.identity.worldId,token:this.token}));}catch{}}
 async applyLocal(b:LocalBackup){if(!this.view.owned||b.baseRevision!==this.view.revision||this.netBusy)return;try{if(await sha256(b.payload)!==b.checksum)throw new Error('Bản tạm không khớp checksum.');const state=validateState(JSON.parse(b.payload),this.identity);this.pending=null;await this.worker.call('load',{state});this.view.state={...state,paused:true};this.view.candidates=[];this.view.error='';this.view.status='dirty';await this.backup();if(b.token!==this.token)localStorage.removeItem(backupKey(b));await this.save(true);this.emit();}catch(e){this.view.error=this.message(e);this.emit();}}
 discardCandidates(){for(const b of this.view.candidates)try{localStorage.removeItem(backupKey(b));}catch{}this.view.candidates=[];this.view.notice='Đã chọn bản đám mây. Các bản tạm được bỏ theo xác nhận của bạn.';this.emit();}
 async history(){try{const r=await this.api({action:'history'});this.view.history=r.history;this.emit();}catch(e){this.view.error=this.message(e);this.emit();}}
 async findLatestValid(){
  this.view.busy=true;this.emit();
  try{await this.history();for(const h of this.view.history){try{const r=await this.api({action:'read',target:h.revision});await decodeHead(r.head,this.identity);this.view.notice=`Bản #${h.revision} là mốc hợp lệ gần nhất đã kiểm tra.`;return h;}catch(e){if(e instanceof SaveError&&!['SAVE_CORRUPT','SAVE_NOT_FOUND','INVALID_SAVE'].includes(e.code)){this.view.error=this.message(e);return null;}}}this.view.error='Không tìm thấy bản lưu hợp lệ trong lịch sử còn giữ.';return null;
  }finally{this.view.busy=false;this.emit();}
 }
 async restore(target:number){if(!this.view.owned||this.netBusy)return;this.netBusy=true;this.view.busy=true;try{await this.worker.call('control',{command:{paused:true}});await this.backup();const r:SessionResponse=await this.api({action:'restore',epoch:this.epoch,revision:this.view.revision,requestId:crypto.randomUUID(),target});if(this.disposed)return;const saved=await decodeHead(r.ack!,this.identity);this.pending=null;this.setHead(r.ack!,saved,r);this.view.state=await this.worker.call('load',{state:saved});this.clearOwnBackup();this.view.notice=`Đã khôi phục bản #${target} thành bản mới #${r.ack!.revision}. Game đang tạm dừng.`;await this.history();}catch(e){await this.pauseForError(e);}finally{this.netBusy=false;this.view.busy=false;this.emit();}}
 private visibility=()=>{if(document.hidden){void this.pauseAndFlush();}else if(this.view.owned)void this.renew();};
 private pagehide=()=>{if(this.cachedBackup)try{writeBackup(localStorage,this.cachedBackup);}catch{}void this.pauseAndFlush();};
 private online=()=>{if(!this.view.owned)return;void this.save();};
 private offline=()=>{void this.pauseForError(new SaveError('NETWORK','Đã mất mạng. Game tạm dừng; tiến trình chưa đồng bộ được giữ trên thiết bị.')).then(()=>this.emit());};
 private async pauseAndFlush(){if(!this.view.owned||this.disposed)return;try{this.view.state=await this.worker.call('control',{command:{paused:true}});await this.backup();await this.save(false,true);}catch{}}
 destroy(){if(this.disposed)return;if(this.dirty||this.pending)void makeBackup(this.ownerId,this.token,this.view.state,this.view.revision,this.epoch,this.pending).then(b=>writeBackup(localStorage,b)).catch(()=>{});if(this.cachedBackup)try{writeBackup(localStorage,this.cachedBackup);}catch{}this.disposed=true;this.backupVersion++;this.timers.forEach(clearInterval);document.removeEventListener('visibilitychange',this.visibility);window.removeEventListener('pagehide',this.pagehide);window.removeEventListener('online',this.online);window.removeEventListener('offline',this.offline);this.worker.destroy();if(!this.netBusy)void this.api({action:'release',epoch:this.epoch},true).catch(()=>{});}
}
export function clockView(view:SimulationView){return {...calendar(view.state.tick,view.state.climateId),paused:view.state.paused,speed:view.state.speed};}
