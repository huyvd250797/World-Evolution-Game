import {Application,Container,Sprite,Graphics} from 'pixi.js';
import {acquireAtlas} from './atlas';
import {gridToWorld,lodStride,visibleChunks,type Camera,type Viewport} from './camera';
import {CHUNK_SIZE,RESOURCES,tileAt,objectFor,type WorldMap,type TileInfo} from './world-map';
import type {MapScene,SceneOptions,SceneStats} from './scene';
const names=['water','bank','grass','forest','hill','mountain','snow'];
interface Chunk{ground:Sprite[];objects:Sprite[];stamp:number}
export async function createPixiScene(map:WorldMap,width:number,height:number):Promise<MapScene>{
 const app=new Application();let lease:Awaited<ReturnType<typeof acquireAtlas>>|undefined;
 try{
  await app.init({width,height,preference:'webgl',background:0xe1e6d4,resolution:Math.min(devicePixelRatio||1,1.5),autoDensity:true,antialias:true,autoStart:false,sharedTicker:false,powerPreference:'low-power'});
  app.stage.eventMode='none';lease=await acquireAtlas();
 }catch(error){if(app.renderer)app.destroy(true,{children:true});lease?.release();throw error;}
 const sheet=lease.sheet,world=new Container(),ground=new Container(),objects=new Container(),overlay=new Graphics();
 ground.sortableChildren=true;objects.sortableChildren=true;world.addChild(ground,objects,overlay);app.stage.addChild(world);
 const cache=new Map<string,Chunk>();let lastStride=0,lastQuality='',stamp=0,disposed=false;
 const drop=(record:Chunk)=>{for(const sprite of [...record.ground,...record.objects])sprite.destroy();};
 function build(cx:number,cy:number,stride:number,quality:string):Chunk{
  const record:Chunk={ground:[],objects:[],stamp};
  for(let y=cy*CHUNK_SIZE;y<Math.min(map.size,(cy+1)*CHUNK_SIZE);y+=stride)for(let x=cx*CHUNK_SIZE;x<Math.min(map.size,(cx+1)*CHUNK_SIZE);x+=stride){
   const tile=tileAt(map,x,y)!;const p=gridToWorld(x+(stride-1)/2,y+(stride-1)/2,stride===1?tile.elevation:0);
   const sprite=new Sprite(sheet.textures[`${names[tile.terrain]}-${tile.variation%4}`]);sprite.anchor.set(.5,16/44);sprite.position.set(p.x,p.y);sprite.scale.set(stride);sprite.zIndex=(x+y)*32+x*.001;ground.addChild(sprite);record.ground.push(sprite);
   if(stride>=4)continue;
   const object=objectFor(tile,map.climateId);if(!object||((stride===2||quality==='low')&&tile.variation%3!==0))continue;
   const op=gridToWorld(x,y,stride===1?tile.elevation:0),node=new Sprite(sheet.textures[object]);node.anchor.set(.5,.9);node.position.set(op.x,op.y);node.zIndex=(x+y)*32+x*.001;node.scale.set(object.includes('peak')?.9:.56+(tile.variation%4)*.035);objects.addChild(node);record.objects.push(node);
  }return record;
 }
 function draw(camera:Camera,viewport:Viewport,selected:TileInfo|null,options:SceneOptions):SceneStats{
  if(disposed)return {chunks:0,tiles:0,objects:0,stride:1};
  stamp++;const stride=lodStride(camera.zoom,options.quality);
  if(stride!==lastStride||options.quality!==lastQuality){for(const c of cache.values())drop(c);cache.clear();lastStride=stride;lastQuality=options.quality;}
  const chunks=visibleChunks(camera,viewport,map.size),visible=new Set(chunks.map(c=>`${c.x},${c.y}`));let tiles=0,count=0;
  for(const record of cache.values()){for(const s of record.ground)s.visible=false;for(const s of record.objects)s.visible=false;}
  for(const c of chunks){const key=`${c.x},${c.y}`;let record=cache.get(key);if(!record){record=build(c.x,c.y,stride,options.quality);cache.set(key,record);}record.stamp=stamp;for(const s of record.ground)s.visible=true;for(const s of record.objects)s.visible=true;tiles+=record.ground.length;count+=record.objects.length;}
  const limit=Math.max(48,chunks.length+12);if(cache.size>limit){for(const [key,c]of [...cache.entries()].sort((a,b)=>a[1].stamp-b[1].stamp)){if(cache.size<=limit)break;if(!visible.has(key)){drop(c);cache.delete(key);}}}
  world.position.set(viewport.width/2-camera.x*camera.zoom,viewport.height/2-camera.y*camera.zoom);world.scale.set(camera.zoom);overlay.clear();
  if(options.grid&&camera.zoom>=.45){for(const c of chunks)for(let y=c.y*CHUNK_SIZE;y<(c.y+1)*CHUNK_SIZE&&y<map.size;y++)for(let x=c.x*CHUNK_SIZE;x<(c.x+1)*CHUNK_SIZE&&x<map.size;x++){const t=tileAt(map,x,y)!,p=gridToWorld(x,y,t.elevation);overlay.poly([p.x,p.y-16,p.x+32,p.y,p.x,p.y+16,p.x-32,p.y],true).stroke({color:0x35563e,alpha:.17,width:1/camera.zoom});}}
  if(options.resources&&camera.zoom>=.18){for(const c of chunks)for(let y=c.y*CHUNK_SIZE;y<(c.y+1)*CHUNK_SIZE&&y<map.size;y+=2)for(let x=c.x*CHUNK_SIZE;x<(c.x+1)*CHUNK_SIZE&&x<map.size;x+=2){const t=tileAt(map,x,y)!,r=RESOURCES[t.resource];if(!r||t.resource===6||t.variation%5!==0)continue;const p=gridToWorld(x,y,stride===1?t.elevation:0);overlay.circle(p.x,p.y-8,4/camera.zoom).fill(r.color).stroke({color:0xffffff,alpha:.7,width:1/camera.zoom});}}
  if(selected){const p=gridToWorld(selected.x,selected.y,stride===1?selected.elevation:0);overlay.poly([p.x,p.y-16,p.x+32,p.y,p.x,p.y+16,p.x-32,p.y],true).fill({color:0xf3e1a2,alpha:.2}).stroke({color:0xffedb0,width:2.5/camera.zoom});overlay.circle(p.x,p.y,2.5/camera.zoom).fill(0xffedb0);}
  app.render();return {chunks:chunks.length,tiles,objects:count,stride};
 }
 return {canvas:app.canvas,kind:'WebGL',resize(w,h){if(!disposed)app.renderer.resize(w,h);},draw,destroy(){if(disposed)return;disposed=true;cache.clear();app.destroy(true,{children:true});lease.release();}};
}
