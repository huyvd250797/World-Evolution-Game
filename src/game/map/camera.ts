import {CHUNK_SIZE,type WorldMap,tileAt,type TileInfo} from './world-map';
export const TILE_W=64,TILE_H=32,HEIGHT_STEP=6,MIN_ZOOM=.018,MAX_ZOOM=2.4;
export interface Point{x:number;y:number}
export interface Camera extends Point{zoom:number}
export interface Viewport{width:number;height:number}
export function gridToWorld(x:number,y:number,elevation=0):Point{return {x:(x-y)*TILE_W/2,y:(x+y)*TILE_H/2-elevation*HEIGHT_STEP};}
export function worldToGrid(p:Point):Point{return {x:p.x/TILE_W+p.y/TILE_H,y:p.y/TILE_H-p.x/TILE_W};}
export function screenToWorld(p:Point,c:Camera,v:Viewport):Point{return {x:(p.x-v.width/2)/c.zoom+c.x,y:(p.y-v.height/2)/c.zoom+c.y};}
export function worldToScreen(p:Point,c:Camera,v:Viewport):Point{return {x:(p.x-c.x)*c.zoom+v.width/2,y:(p.y-c.y)*c.zoom+v.height/2};}
export function clampCamera(c:Camera,size:number):Camera{const g=worldToGrid(c);g.x=Math.max(0,Math.min(size-1,g.x));g.y=Math.max(0,Math.min(size-1,g.y));return {...gridToWorld(g.x,g.y),zoom:Math.max(MIN_ZOOM,Math.min(MAX_ZOOM,c.zoom))};}
export function zoomAt(c:Camera,zoom:number,anchor:Point,v:Viewport,size:number):Camera{const before=screenToWorld(anchor,c,v);zoom=Math.max(MIN_ZOOM,Math.min(MAX_ZOOM,zoom));return clampCamera({x:before.x-(anchor.x-v.width/2)/zoom,y:before.y-(anchor.y-v.height/2)/zoom,zoom},size);}
export function panBy(c:Camera,dx:number,dy:number,size:number):Camera{return clampCamera({x:c.x-dx/c.zoom,y:c.y-dy/c.zoom,zoom:c.zoom},size);}
export function lodStride(zoom:number,quality:'auto'|'low'='auto'){return zoom<.075?8:zoom<.14?4:zoom<(quality==='low'?.35:.25)?2:1;}
export function visibleBounds(c:Camera,v:Viewport,size:number){const corners=[{x:-150,y:-180},{x:v.width+150,y:-180},{x:-150,y:v.height+180},{x:v.width+150,y:v.height+180}].map(p=>worldToGrid(screenToWorld(p,c,v)));return {minX:Math.max(0,Math.floor(Math.min(...corners.map(p=>p.x)))-8),maxX:Math.min(size-1,Math.ceil(Math.max(...corners.map(p=>p.x)))+8),minY:Math.max(0,Math.floor(Math.min(...corners.map(p=>p.y)))-8),maxY:Math.min(size-1,Math.ceil(Math.max(...corners.map(p=>p.y)))+8)};}
export function visibleChunks(c:Camera,v:Viewport,size:number){const b=visibleBounds(c,v,size),chunks:Point[]=[];for(let y=Math.floor(b.minY/CHUNK_SIZE);y<=Math.floor(b.maxY/CHUNK_SIZE);y++)for(let x=Math.floor(b.minX/CHUNK_SIZE);x<=Math.floor(b.maxX/CHUNK_SIZE);x++){const corners=[gridToWorld(x*CHUNK_SIZE,y*CHUNK_SIZE),gridToWorld((x+1)*CHUNK_SIZE,y*CHUNK_SIZE),gridToWorld(x*CHUNK_SIZE,(y+1)*CHUNK_SIZE),gridToWorld((x+1)*CHUNK_SIZE,(y+1)*CHUNK_SIZE)].map(p=>worldToScreen(p,c,v));if(Math.max(...corners.map(p=>p.x))>=-120&&Math.min(...corners.map(p=>p.x))<=v.width+120&&Math.max(...corners.map(p=>p.y))>=-120&&Math.min(...corners.map(p=>p.y))<=v.height+180)chunks.push({x,y});}return chunks;}
/** Candidate scan accounts for lifted terrain; hit test uses visible top diamond. */
export function pickTile(map:WorldMap,p:Point,c:Camera,v:Viewport,flat=c.zoom<.25):TileInfo|null{const w=screenToWorld(p,c,v),g=worldToGrid(w),candidates:TileInfo[]=[];for(let y=Math.floor(g.y)-2;y<=Math.ceil(g.y)+7;y++)for(let x=Math.floor(g.x)-2;x<=Math.ceil(g.x)+7;x++){const t=tileAt(map,x,y);if(!t)continue;const center=gridToWorld(x,y,flat?0:t.elevation);if(Math.abs(w.x-center.x)/(TILE_W/2)+Math.abs(w.y-center.y)/(TILE_H/2)<=1.02)candidates.push(t);}return candidates.sort((a,b)=>(b.x+b.y)-(a.x+a.y)||b.y-a.y)[0]??null;}
export interface PointerState {points:Map<number,Point>;dragged:boolean;start:Point|null}
/** Input logic is pure and tested independently from WebGL/browser frame timing. */
export class CameraGestures{
 points=new Map<number,Point>();start:Point|null=null;dragged=false;private hadMultiple=false;
 down(id:number,p:Point){this.points.set(id,p);if(this.points.size===1){this.start=p;this.dragged=false;this.hadMultiple=false;}else{this.hadMultiple=true;this.dragged=true;}}
 move(id:number,p:Point,c:Camera,v:Viewport,size:number):Camera{
  const old=this.points.get(id);if(!old)return c;
  if(this.start&&Math.hypot(p.x-this.start.x,p.y-this.start.y)>6)this.dragged=true;
  const before=[...this.points.values()];this.points.set(id,p);const after=[...this.points.values()];
  if(before.length>=2){const a=before.slice(0,2),b=after.slice(0,2);const centerA={x:(a[0].x+a[1].x)/2,y:(a[0].y+a[1].y)/2},centerB={x:(b[0].x+b[1].x)/2,y:(b[0].y+b[1].y)/2};const distA=Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y),distB=Math.hypot(b[0].x-b[1].x,b[0].y-b[1].y);const shifted=panBy(c,centerB.x-centerA.x,centerB.y-centerA.y,size);return distA>4?zoomAt(shifted,c.zoom*distB/distA,centerB,v,size):shifted;}
  return this.dragged?panBy(c,p.x-old.x,p.y-old.y,size):c;
 }
 up(id:number){const select=this.points.size===1&&!this.dragged&&!this.hadMultiple;this.points.delete(id);if(!this.points.size)this.start=null;return select;}
 cancel(){this.points.clear();this.start=null;this.dragged=true;this.hadMultiple=false;}
}
