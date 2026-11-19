import {gridToWorld,worldToScreen,visibleBounds,type Camera,type Viewport} from '../map/camera';
import type {WorldMap} from '../map/world-map';
import type {PollutionCell} from './model';
export type PollutionLayer='off'|'air'|'water'|'soil';
export const pollutionColor=(value:number)=>value>=7000?'#e34848':value>=4000?'#e59825':'#45a879';
/** Static sparse tile overlay. Animation frames reuse the previous drawing. */
export class PollutionRenderer{
 readonly canvas:HTMLCanvasElement;private ctx:CanvasRenderingContext2D;private key='';private signature='';private cells:PollutionCell[]=[];private layer:PollutionLayer='off';
 constructor(){this.canvas=document.createElement('canvas');this.canvas.className='planning-overlay pollution-overlay';this.canvas.style.pointerEvents='none';this.canvas.setAttribute('aria-hidden','true');this.ctx=this.canvas.getContext('2d')!;}
 set(cells:PollutionCell[],layer:PollutionLayer){const signature=JSON.stringify(cells);if(signature!==this.signature||layer!==this.layer){this.signature=signature;this.cells=cells;this.layer=layer;this.key='';}}
 draw(map:WorldMap,camera:Camera,v:Viewport,flat=false){const ratio=Math.min(globalThis.devicePixelRatio||1,1.5),key=[camera.x,camera.y,camera.zoom,v.width,v.height,ratio,flat,this.layer].join(':');if(this.key===key)return 0;this.key=key;const width=Math.round(v.width*ratio),height=Math.round(v.height*ratio);if(this.canvas.width!==width||this.canvas.height!==height){this.canvas.width=width;this.canvas.height=height;this.canvas.style.width=v.width+'px';this.canvas.style.height=v.height+'px';}const ctx=this.ctx;ctx.setTransform(ratio,0,0,ratio,0,0);ctx.clearRect(0,0,v.width,v.height);if(this.layer==='off')return 0;const b=visibleBounds(camera,v,256);let count=0;for(const c of this.cells){const x=c.cell%256,y=Math.floor(c.cell/256),value=c[this.layer];if(!value||x<b.minX||x>b.maxX||y<b.minY||y>b.maxY)continue;const p=worldToScreen(gridToWorld(x,y,flat?0:map.elevation[c.cell]),camera,v),w=32*camera.zoom,h=16*camera.zoom;ctx.globalAlpha=.22+Math.min(.48,value/14000);ctx.fillStyle=pollutionColor(value);ctx.beginPath();ctx.moveTo(p.x,p.y-h);ctx.lineTo(p.x+w,p.y);ctx.lineTo(p.x,p.y+h);ctx.lineTo(p.x-w,p.y);ctx.closePath();ctx.fill();count++;}ctx.globalAlpha=1;return count;}
 destroy(){this.canvas.width=1;this.canvas.height=1;this.canvas.remove();}
}
