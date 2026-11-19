/** Browserless Canvas renderer QA. These images are not browser screenshots. */
import {createCanvas,Image as NativeImage,type Canvas} from '@napi-rs/canvas';
import {readFileSync} from 'node:fs';
import {mkdir,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {generateWorldMap} from '../src/game/map/world-map';
import {gridToWorld} from '../src/game/map/camera';
import {createCanvasScene} from '../src/game/map/canvas-scene';
const srcDescriptor=Object.getOwnPropertyDescriptor(NativeImage.prototype,'src')!;
class LocalImage extends NativeImage{}
Object.defineProperty(LocalImage.prototype,'src',{get(){return srcDescriptor.get!.call(this);},set(value:string|Uint8Array){srcDescriptor.set!.call(this,typeof value==='string'&&value.startsWith('/assets/')?readFileSync(resolve('public'+value)):value);}});
Object.defineProperty(globalThis,'Image',{configurable:true,value:LocalImage});
Object.defineProperty(globalThis,'devicePixelRatio',{configurable:true,value:1});
Object.defineProperty(globalThis,'document',{configurable:true,value:{createElement(name:string){if(name!=='canvas')throw new Error(name);const canvas=createCanvas(1000,650);Object.defineProperty(canvas,'style',{value:{},configurable:true});Object.defineProperty(canvas,'setAttribute',{value:()=>{}});Object.defineProperty(canvas,'remove',{value:()=>{},configurable:true});return canvas;}}});

import {emptyConstruction,materialWork} from '../src/game/construction/model';
import {PlanOverlayRenderer} from '../src/game/planning/overlay';
import {applyPlanning,emptyPlanning,checkBuilding,checkRoad,roadPath} from '../src/game/planning/model';
const map=generateWorldMap('BOSS-2026','B01'),scene=await createCanvasScene(map,1100,650),overlay=new PlanOverlayRenderer();let plan=emptyPlanning();
for(const id of ['B001','B006','B008','B011']){outer:for(let y=map.focus.y-8;y<map.focus.y+16;y++)for(let x=map.focus.x-8;x<map.focus.x+16;x++){const b={buildingId:id,x,y,rotation:0};if(checkBuilding(map,plan,b).length)continue;plan=applyPlanning(plan,map,0,{type:'building',id:crypto.randomUUID(),...b});break outer;}}
outer:for(let y=map.focus.y-6;y<map.focus.y+20;y++)for(let x=map.focus.x-6;x<map.focus.x+10;x++){const points=roadPath({x,y},{x:x+8,y});if(checkRoad(map,plan,points).length)continue;plan=applyPlanning(plan,map,0,{type:'road',id:crypto.randomUUID(),points});break outer;}
const v={width:1100,height:650},camera={...gridToWorld(map.focus.x,map.focus.y),zoom:.85};scene.draw(camera,v,null,{quality:'low',grid:false,resources:false});const construction=emptyConstruction();plan.buildings.slice(1,3).forEach((b,i)=>construction.sites.push({id:b.id,entrance:{x:b.x-1,y:b.y},status:i?'active':'complete',createdTick:0,completedTick:i?null:5000,workDone:i?100:materialWork(b.buildingId),workRequired:materialWork(b.buildingId)}));construction.yards.push({id:crypto.randomUUID(),cell:{x:map.focus.x-2,y:map.focus.y}});overlay.draw(map,camera,v,{planning:plan,construction,ghost:{cells:[{x:map.focus.x,y:map.focus.y},{x:map.focus.x+1,y:map.focus.y}],valid:true}});const composite=createCanvas(1100,650),ctx=composite.getContext('2d');ctx.drawImage(scene.canvas as unknown as Canvas,0,0);ctx.drawImage(overlay.canvas as unknown as Canvas,0,0);await mkdir('qa-map-out',{recursive:true});await writeFile('qa-map-out/construction.png',composite.toBuffer('image/png'));console.log('Construction phase rendering QA:',plan.buildings.length,'foundations,',plan.roads.length,'route');overlay.destroy();scene.destroy();
