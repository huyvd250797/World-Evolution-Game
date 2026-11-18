/** Immutable generator contract. Never change we-map-1 for an existing saved world. */
export const GENERATOR_VERSION='we-map-1' as const;
export const MAP_SIZE=256;
export const CHUNK_SIZE=16;
export const TERRAIN={water:0,bank:1,grass:2,forest:3,hill:4,mountain:5,snow:6} as const;
export type Terrain=typeof TERRAIN[keyof typeof TERRAIN];
export const TERRAIN_NAMES=['Sông / nước','Bờ cát','Đồng cỏ','Rừng','Đồi','Núi đá','Đất phủ tuyết'] as const;
export const TERRAIN_COLORS=['#579caa','#d0bf8d','#97ad69','#638751','#8b9565','#93988b','#d5dfd6'] as const;
export const RESOURCES=[null,{id:'R045',name:'Gỗ thô',short:'Gỗ',color:'#bdce81'},{id:'R052',name:'Đá thô',short:'Đá',color:'#c5ccbe'},{id:'R053',name:'Đá lửa',short:'Đá lửa',color:'#f3c08a'},{id:'R001',name:'Quả rừng',short:'Quả',color:'#deb0a5'},{id:'R054',name:'Đất sét',short:'Sét',color:'#cf9f73'},{id:'R062',name:'Nước thô',short:'Nước',color:'#83c5dc'},{id:'R061',name:'Thảo dược',short:'Thảo dược',color:'#d0d590'}] as const;
export interface WorldMap {version:typeof GENERATOR_VERSION;size:number;seed:string;climateId:string;terrain:Uint8Array;elevation:Uint8Array;resources:Uint8Array;variation:Uint8Array;focus:{x:number;y:number}}
export interface TileInfo{x:number;y:number;terrain:Terrain;elevation:number;resource:number;variation:number}
export function hashSeed(input:string){let h=2166136261;for(let i=0;i<input.length;i++){h^=input.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}
function hash(x:number,y:number,seed:number){let n=Math.imul(x,374761393)^Math.imul(y,668265263)^seed;n=Math.imul(n^(n>>>13),1274126177);return ((n^(n>>>16))>>>0)/4294967295;}
const smooth=(x:number)=>x*x*(3-2*x);
function noise(x:number,y:number,seed:number){const ix=Math.floor(x),iy=Math.floor(y),fx=smooth(x-ix),fy=smooth(y-iy);const a=hash(ix,iy,seed),b=hash(ix+1,iy,seed),c=hash(ix,iy+1,seed),d=hash(ix+1,iy+1,seed);return (a+(b-a)*fx)*(1-fy)+(c+(d-c)*fx)*fy;}
function fbm(x:number,y:number,seed:number){return noise(x,y,seed)*.58+noise(x*2.03,y*2.03,seed+31)*.28+noise(x*4.17,y*4.17,seed+71)*.14;}
function river(y:number,seed:number,size:number){return size*.49+(noise(y*.012,4,seed+11)-.5)*size*.38+(noise(y*.049,9,seed+19)-.5)*size*.075;}
/** Only seed/config/version influence terrain, never frame rate, viewport or device. */
export function generateWorldMap(seed:string,climateId:string,size=MAP_SIZE):WorldMap{
 if(!Number.isInteger(size)||size<32||size>512)throw new Error('Map size must be an integer from 32 to 512');
 if(!/^B0[1-7]$/.test(climateId))throw new Error('Unknown Canonical climate');
 const key=hashSeed(`${GENERATOR_VERSION}|${seed}|${climateId}`),length=size*size;
 const terrain=new Uint8Array(length),elevation=new Uint8Array(length),resources=new Uint8Array(length),variation=new Uint8Array(length);
 const dry=climateId==='B03'||climateId==='B07',cold=climateId==='B05'||climateId==='B06',high=climateId==='B06'||climateId==='B07';
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  const i=y*size+x,r=hash(x,y,key),wet=fbm(x*.038,y*.038,key+137),height=fbm(x*.022,y*.022,key+301);
  const riverWidth=2.1+noise(y*.03,6,key+44)*2.7,main=Math.abs(x-river(y,key,size));
  // A connected tributary converges on the main river, rather than arbitrary blue noise.
  const confluence=size*.56,branchCenter=river(confluence,key,size)+(confluence-y)*.62+(noise(y*.035,3,key+83)-.5)*4;
  const branch=y<confluence&&y>size*.03?Math.abs(x-branchCenter):Infinity;
  const dist=Math.min(main,branch*1.7);let t:Terrain;
  if(dist<riverWidth)t=TERRAIN.water;
  else if(dist<riverWidth+1.3)t=TERRAIN.bank;
  else if(height>(high?.61:.71))t=cold?TERRAIN.snow:TERRAIN.mountain;
  else if(height>(high?.49:.59))t=TERRAIN.hill;
  else if(wet>(dry?.63:.48))t=TERRAIN.forest;
  else t=cold&&height>.46?TERRAIN.snow:TERRAIN.grass;
  const level=t===TERRAIN.water?0:Math.min(Math.floor(Math.max(0,dist-riverWidth)*.8),Math.max(0,Math.floor((height-.27)*14)));
  terrain[i]=t;elevation[i]=level;variation[i]=Math.floor(r*255);
  if(t===TERRAIN.water)resources[i]=6;
  else if(t===TERRAIN.forest)resources[i]=r<.12?4:r>.94?7:1;
  else if(t===TERRAIN.mountain||t===TERRAIN.snow)resources[i]=r>.88?3:r<.58?2:0;
  else if(t===TERRAIN.bank)resources[i]=r<.15?5:0;
  else if(t===TERRAIN.hill)resources[i]=r<.13?2:r>.96?3:0;
  else resources[i]=r<.012?7:r>.986?4:0;
 }
 const cy=Math.floor(size*.52);let cx=Math.min(size-3,Math.round(river(cy,key,size)+11));
 while(cx<size-2&&terrain[cy*size+cx]===TERRAIN.water)cx++;
 return {version:GENERATOR_VERSION,size,seed,climateId,terrain,elevation,resources,variation,focus:{x:cx,y:cy}};
}
export function tileAt(map:WorldMap,x:number,y:number):TileInfo|null{if(!Number.isInteger(x)||!Number.isInteger(y)||x<0||y<0||x>=map.size||y>=map.size)return null;const i=y*map.size+x;return {x,y,terrain:map.terrain[i] as Terrain,elevation:map.elevation[i],resource:map.resources[i],variation:map.variation[i]};}
export function objectFor(tile:TileInfo,climateId:string){const v=tile.variation;
 if(tile.terrain===TERRAIN.forest&&v%5<3)return climateId==='B02'||climateId==='B04'?'broadleaf':v%3===0?'pine-small':'pine';
 if((tile.terrain===TERRAIN.mountain||tile.terrain===TERRAIN.snow)&&v%9===0)return tile.terrain===TERRAIN.snow?'snow-peak':'peak';
 if(tile.resource===3)return 'flint';if(tile.resource===4)return 'berries';if(tile.resource===7)return 'herbs';
 if(tile.resource===2&&v%3===0)return 'rocks';if(tile.terrain===TERRAIN.bank&&v%7===0)return 'reeds';return null;
}
