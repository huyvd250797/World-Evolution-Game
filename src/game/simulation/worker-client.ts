import type {SimState} from './engine';
export class SimulationWorker{
 private worker:Worker;private destroyed=false;private seq=0;private pending=new Map<number,{resolve:(s:SimState)=>void;reject:(e:Error)=>void;timer:ReturnType<typeof setTimeout>}>();
 constructor(onState:(s:SimState)=>void,onError:(message:string)=>void){this.worker=new Worker(new URL('./simulation.worker.ts',import.meta.url),{type:'module'});this.worker.onmessage=e=>{const m=e.data;if(m.type==='state')onState(m.state);else if(m.type==='reply'){const p=this.pending.get(m.id);if(p){clearTimeout(p.timer);this.pending.delete(m.id);if(m.error)p.reject(new Error(m.error));else p.resolve(m.state);}}else onError(m.error??'Quyền điều khiển đã hết hạn. Game đã tạm dừng.');};this.worker.onerror=()=>{onError('Bộ máy mô phỏng gặp lỗi. Đã giữ tiến trình gần nhất trên thiết bị.');this.rejectAll();};}
 call(type:string,extra:Record<string,unknown>={}){if(this.destroyed)return Promise.reject(new Error('Engine stopped'));const id=++this.seq;return new Promise<SimState>((resolve,reject)=>{const timer=setTimeout(()=>{this.pending.delete(id);reject(new Error('Bộ máy mô phỏng không phản hồi.'));},5000);this.pending.set(id,{resolve,reject,timer});this.worker.postMessage({type,id,...extra});});}
 private rejectAll(){for(const p of this.pending.values()){clearTimeout(p.timer);p.reject(new Error('Engine stopped'));}this.pending.clear();}
 destroy(){if(this.destroyed)return;this.destroyed=true;this.worker.terminate();this.rejectAll();}
}
