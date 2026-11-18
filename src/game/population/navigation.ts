import {generateWorldMap,TERRAIN,type WorldMap} from '../map/world-map';
import {footprint,key,type Planning,type Cell} from '../planning/model';
const maps=new Map<string,WorldMap>();
export function populationMap(seed:string,climateId:string){const k=seed+'|'+climateId;let m=maps.get(k);if(!m){m=generateWorldMap(seed,climateId);maps.set(k,m);if(maps.size>2)maps.delete(maps.keys().next().value!);}return m;}
/** Reverse BFS field shares one target search across a batch of citizens; bounded LRU. */
export class Navigation{
 readonly blocked:Uint8Array;private fields=new Map<number,Int32Array>();searches=0;
 constructor(readonly map:WorldMap,planning:Planning){this.blocked=new Uint8Array(map.size*map.size);for(let n=0;n<this.blocked.length;n++)this.blocked[n]=Number(map.terrain[n]===TERRAIN.water||map.terrain[n]===TERRAIN.mountain);for(const b of planning.buildings)for(const p of footprint(b))this.blocked[p.y*map.size+p.x]=1;}
 index(p:Cell){return p.y*this.map.size+p.x;}
 cell(n:number):Cell{return {x:n%this.map.size,y:Math.floor(n/this.map.size)};}
 walkable(p:Cell){return Number.isInteger(p.x)&&Number.isInteger(p.y)&&p.x>=0&&p.y>=0&&p.x<this.map.size&&p.y<this.map.size&&!this.blocked[this.index(p)];}
 adjacent(a:Cell,b:Cell){return this.walkable(a)&&this.walkable(b)&&Math.abs(a.x-b.x)+Math.abs(a.y-b.y)===1&&Math.abs(this.map.elevation[this.index(a)]-this.map.elevation[this.index(b)])<=1;}
 route(from:Cell,to:Cell):Cell[]|null{
  if(!this.walkable(from)||!this.walkable(to))return null;const target=this.index(to),origin=this.index(from);if(origin===target)return [];
  let next=this.fields.get(target);if(next){this.fields.delete(target);this.fields.set(target,next);}else{this.searches++;next=new Int32Array(this.blocked.length);next.fill(-2);next[target]=-1;const queue=new Uint32Array(this.blocked.length);let head=0,tail=1;queue[0]=target;
   while(head<tail){const n=queue[head++],x=n%this.map.size,y=Math.floor(n/this.map.size);for(const q of [y>0?n-this.map.size:-1,x>0?n-1:-1,x<this.map.size-1?n+1:-1,y<this.map.size-1?n+this.map.size:-1]){if(q<0||this.blocked[q]||next[q]!==-2||Math.abs(this.map.elevation[q]-this.map.elevation[n])>1)continue;next[q]=n;queue[tail++]=q;}}
   this.fields.set(target,next);if(this.fields.size>8)this.fields.delete(this.fields.keys().next().value!);
  }
  if(next[origin]===-2)return null;let n=origin;const path:Cell[]=[];while(n!==target){n=next[n];if(n<0||path.length>=512)return null;path.push(this.cell(n));}return path;
 }
 spawn(ids:string[]){const result:Cell[]=[];const seen=new Set<string>();for(let radius=0;radius<this.map.size*2&&result.length<ids.length;radius++)for(let dx=-radius;dx<=radius&&result.length<ids.length;dx++){const distance=radius-Math.abs(dx);for(const dy of distance?[distance,-distance]:[0]){const p={x:this.map.focus.x+dx,y:this.map.focus.y+dy};if(this.walkable(p)&&!seen.has(key(p))){seen.add(key(p));result.push(p);if(result.length===ids.length)break;}}}if(result.length!==ids.length)throw new Error('Không đủ vị trí đất hợp lệ để khởi tạo cư dân.');return result;}
}
let cached:{seed:string;climateId:string;signature:string;nav:Navigation}|null=null;
export function navigation(seed:string,climateId:string,p:Planning){const signature=p.buildings.map(b=>`${b.id}:${b.buildingId}:${b.x}:${b.y}:${b.rotation}`).join('|');if(!cached||cached.seed!==seed||cached.climateId!==climateId||cached.signature!==signature)cached={seed,climateId,signature,nav:new Navigation(populationMap(seed,climateId),p)};return cached.nav;}
