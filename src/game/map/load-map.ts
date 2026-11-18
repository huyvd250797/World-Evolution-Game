import {type WorldMap} from './world-map';
export function loadWorldMap(seed:string,climateId:string,signal:AbortSignal):Promise<WorldMap>{return new Promise((resolve,reject)=>{
 if(signal.aborted){reject(new DOMException('Aborted','AbortError'));return;}
 const worker=new Worker(new URL('./map.worker.ts',import.meta.url),{type:'module'});
 const stop=()=>{clearTimeout(timer);signal.removeEventListener('abort',abort);worker.terminate();};
 const abort=()=>{stop();reject(new DOMException('Aborted','AbortError'));};
 const timer=setTimeout(()=>{stop();reject(new Error('Sinh bản đồ quá lâu. Vui lòng thử lại.'));},30000);
 signal.addEventListener('abort',abort,{once:true});
 worker.onmessage=(event:MessageEvent<{map?:WorldMap;error?:string}>)=>{stop();if(event.data.error||!event.data.map)reject(new Error(event.data.error??'Thiếu dữ liệu bản đồ.'));else resolve(event.data.map);};
 worker.onerror=()=>{stop();reject(new Error('Không mở được bộ sinh bản đồ. Kiểm tra kết nối rồi thử lại.'));};worker.postMessage({seed,climateId});
});}
