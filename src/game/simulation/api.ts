import type {SaveHead} from './engine';
export interface HistoryItem{revision:number;kind:'full'|'delta';tick:number;savedAt:string;bytes:number}
export interface SessionResponse{head:SaveHead;ack?:SaveHead;owned:boolean;epoch:number;remainingMs:number;saveCount:number;writeBytes:number;storedBytes:number}
export class SaveError extends Error{constructor(public code:string,message:string){super(message);}}
export type ApiInput={action:string;epoch?:number;revision?:number;requestId?:string;kind?:'full'|'delta';payload?:string;checksum?:string;target?:number};
export async function simulationApi(worldId:string,token:string,params:ApiInput,onBytes?:(n:number)=>void,keepalive=false){
 const began=performance.now();const body=JSON.stringify({worldId,token,...params}),controller=new AbortController(),timer=setTimeout(()=>controller.abort(),15000);
 try{const response=await fetch('/api/simulation',{method:'POST',headers:{'Content-Type':'application/json'},body,cache:'no-store',credentials:'same-origin',signal:controller.signal,keepalive});const text=await response.text();onBytes?.(new TextEncoder().encode(body+text).byteLength);let data;try{data=JSON.parse(text);}catch{throw new SaveError('NETWORK','Không nhận được phản hồi lưu hợp lệ. Tiến trình được giữ trên thiết bị.');}if(!response.ok)throw new SaveError(data.code??'NETWORK',data.error??'Lưu thất bại.');if(typeof data.remainingMs==='number')data.remainingMs=Math.max(0,data.remainingMs-(performance.now()-began));return data;
 }catch(e){if(e instanceof SaveError)throw e;throw new SaveError('NETWORK','Mất kết nối hoặc yêu cầu quá hạn. Đã giữ tiến trình trên thiết bị; thử lại khi có mạng.');}finally{clearTimeout(timer);}
}
