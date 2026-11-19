import type {Weather} from './model';
export type WeatherQuality='off'|'low'|'normal';
export interface WeatherFrame{weather:Weather;tick:number;paused:boolean;speed:number;quality:WeatherQuality;receivedAt:number}
/** Screen-space decorative particles. No simulation RNG or terrain textures are modified. */
export class WeatherRenderer{
 readonly canvas:HTMLCanvasElement;private ctx:CanvasRenderingContext2D;
 constructor(){this.canvas=document.createElement('canvas');this.canvas.className='planning-overlay weather-overlay';this.canvas.style.pointerEvents='none';this.canvas.setAttribute('aria-hidden','true');this.ctx=this.canvas.getContext('2d')!;}
 draw(width:number,height:number,frame?:WeatherFrame){const ratio=Math.min(globalThis.devicePixelRatio||1,1.5);if(this.canvas.width!==Math.round(width*ratio)||this.canvas.height!==Math.round(height*ratio)){this.canvas.width=Math.round(width*ratio);this.canvas.height=Math.round(height*ratio);this.canvas.style.width=width+'px';this.canvas.style.height=height+'px';}const ctx=this.ctx;ctx.setTransform(ratio,0,0,ratio,0,0);ctx.clearRect(0,0,width,height);if(!frame||frame.quality==='off')return false;const w=frame.weather;if(w.kind==='clear')return false;const snowy=w.kind==='snow'||w.kind==='blizzard',phase=frame.tick+(frame.paused?0:Math.min(350,Math.max(0,performance.now()-frame.receivedAt))/100*frame.speed),count=frame.quality==='low'?24:84;ctx.fillStyle=snowy?'#adc8df12':'#3e587c16';ctx.fillRect(0,0,width,height);ctx.strokeStyle='#c5e1f58a';ctx.lineWidth=1;for(let i=0;i<count;i++){const x=((i*137.53+phase*(w.wind+1)*1.1)%(width+40)+width+40)%(width+40)-20,y=((i*83.91+phase*(snowy?1.3:11))%(height+30)+height+30)%(height+30)-15;if(snowy){ctx.fillStyle='#f0f8ffd0';ctx.beginPath();ctx.arc(x,y,i%3+1,0,Math.PI*2);ctx.fill();}else{ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+w.wind*2,y+9);ctx.stroke();}}return !frame.paused;
 }
 destroy(){this.canvas.width=1;this.canvas.height=1;this.canvas.remove();}
}
