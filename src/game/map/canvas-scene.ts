import frames from '../../../public/assets/world-e0-atlas-v1.json';
import {assetUrl} from '../renderer/assets';
import {gridToWorld,lodStride,visibleChunks,type Camera,type Viewport} from './camera';
import {CHUNK_SIZE,RESOURCES,tileAt,objectFor,type WorldMap,type TileInfo} from './world-map';
import type {MapScene,SceneOptions} from './scene';
const names=['water','bank','grass','forest','hill','mountain','snow'];
type FrameName=keyof typeof frames.frames;
export async function createCanvasScene(map:WorldMap,width:number,height:number):Promise<MapScene>{
 const image=new Image();image.crossOrigin='anonymous';await new Promise<void>((resolve,reject)=>{const timer=setTimeout(()=>{image.src='';reject(new Error('Tải đồ họa quá lâu. Kiểm tra mạng/CDN rồi thử lại.'));},15000);image.onload=()=>{clearTimeout(timer);resolve();};image.onerror=()=>{clearTimeout(timer);reject(new Error('Không tải được atlas bản đồ. Kiểm tra đường dẫn asset/CDN.'));};image.src=assetUrl('worldAtlasImage');});
 const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d',{alpha:false});if(!ctx)throw new Error('Thiết bị không hỗ trợ canvas.');const ratio=Math.min(devicePixelRatio||1,1.25);let disposed=false;
 function resize(w:number,h:number){canvas.width=Math.round(w*ratio);canvas.height=Math.round(h*ratio);canvas.style.width=`${w}px`;canvas.style.height=`${h}px`;}
 resize(width,height);
 function sprite(name:FrameName,x:number,y:number,scale:number,ground=false){const f=frames.frames[name].frame;ctx!.drawImage(image,f.x,f.y,f.w,f.h,x-f.w*.5*scale,y-(ground?16:f.h*.9)*scale,f.w*scale,f.h*scale);}
 function diamond(p:{x:number;y:number}){ctx!.beginPath();ctx!.moveTo(p.x,p.y-16);ctx!.lineTo(p.x+32,p.y);ctx!.lineTo(p.x,p.y+16);ctx!.lineTo(p.x-32,p.y);ctx!.closePath();}
 function draw(camera:Camera,v:Viewport,selected:TileInfo|null,options:SceneOptions){
  const stride=lodStride(camera.zoom,'low'),chunks=visibleChunks(camera,v,map.size),tiles:TileInfo[]=[];let objects=0;
  ctx!.setTransform(ratio,0,0,ratio,0,0);ctx!.fillStyle='#e1e6d4';ctx!.fillRect(0,0,v.width,v.height);ctx!.translate(v.width/2-camera.x*camera.zoom,v.height/2-camera.y*camera.zoom);ctx!.scale(camera.zoom,camera.zoom);
  for(const c of chunks)for(let y=c.y*CHUNK_SIZE;y<Math.min(map.size,(c.y+1)*CHUNK_SIZE);y+=stride)for(let x=c.x*CHUNK_SIZE;x<Math.min(map.size,(c.x+1)*CHUNK_SIZE);x+=stride)tiles.push(tileAt(map,x,y)!);
  tiles.sort((a,b)=>(a.x+a.y)-(b.x+b.y)||a.x-b.x);
  for(const t of tiles){const p=gridToWorld(t.x+(stride-1)/2,t.y+(stride-1)/2,stride===1?t.elevation:0);sprite(`${names[t.terrain]}-${t.variation%4}` as FrameName,p.x,p.y,stride,true);}
  if(stride<4)for(const t of tiles){const name=objectFor(t,map.climateId);if(options.ecology&&['berries','herbs'].includes(name??''))continue;if(!name||t.variation%3!==0)continue;const p=gridToWorld(t.x,t.y,stride===1?t.elevation:0);sprite(name,p.x,p.y,name.includes('peak')?.9:.56+(t.variation%4)*.035);objects++;}
  if(options.grid&&camera.zoom>=.45){ctx!.strokeStyle='#35563e30';ctx!.lineWidth=1/camera.zoom;for(const t of tiles){diamond(gridToWorld(t.x,t.y,t.elevation));ctx!.stroke();}}
  if(options.resources&&camera.zoom>=.18)for(const t of tiles){const r=RESOURCES[t.resource];if(!r||t.resource===6||t.x%2||t.y%2||t.variation%5!==0)continue;const p=gridToWorld(t.x,t.y,stride===1?t.elevation:0);ctx!.fillStyle=r.color;ctx!.beginPath();ctx!.arc(p.x,p.y-8,4/camera.zoom,0,Math.PI*2);ctx!.fill();}
  if(selected){const p=gridToWorld(selected.x,selected.y,stride===1?selected.elevation:0);diamond(p);ctx!.fillStyle='#f3e1a233';ctx!.fill();ctx!.strokeStyle='#ffedb0';ctx!.lineWidth=2.5/camera.zoom;ctx!.stroke();}
  return {chunks:chunks.length,tiles:tiles.length,objects,stride};
 }
 return {canvas,kind:'Canvas 2D',resize,draw,destroy(){if(disposed)return;disposed=true;canvas.width=1;canvas.height=1;image.src='';canvas.remove();}};
}
