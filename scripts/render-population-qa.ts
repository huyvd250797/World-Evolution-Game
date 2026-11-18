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


import {PlanOverlayRenderer} from '../src/game/planning/overlay';
import {emptyPlanning,applyPlanning,checkBuilding} from '../src/game/planning/model';
import {spawnCitizens,citizenCommand,advanceCitizens} from '../src/game/population/model';
import {Navigation} from '../src/game/population/navigation';
const map=generateWorldMap('BOSS-2026','B01');let plan=emptyPlanning();for(let n=0;n<4;n++){outer:for(let y=map.focus.y+4;y<map.focus.y+14;y++)for(let x=map.focus.x-6;x<map.focus.x+12;x++){const b={buildingId:'B006',x,y,rotation:n%2};if(checkBuilding(map,plan,b).length)continue;plan=applyPlanning(plan,map,0,{type:'building',id:crypto.randomUUID(),...b});break outer;}}
let citizens=spawnCitizens('BOSS-2026','B01',plan);const nav=new Navigation(map,plan),c=citizens[0],target=[{x:c.x+1,y:c.y},{x:c.x-1,y:c.y},{x:c.x,y:c.y+1},{x:c.x,y:c.y-1}].find(q=>nav.adjacent(c,q))!;citizens=advanceCitizens(citizenCommand(citizens,nav,{type:'move',ids:[c.id],target}),75);
const scene=await createCanvasScene(map,1100,650),overlay=new PlanOverlayRenderer(),v={width:1100,height:650},camera={...gridToWorld(map.focus.x,map.focus.y),zoom:1.3};scene.draw(camera,v,null,{quality:'low',grid:false,resources:false});overlay.draw(map,camera,v,{planning:plan,ghost:null},false,{citizens,paused:true,speed:1,selectedId:c.id,receivedAt:performance.now()});const composite=createCanvas(1100,650),ctx=composite.getContext('2d');ctx.drawImage(scene.canvas as unknown as Canvas,0,0);ctx.drawImage(overlay.canvas as unknown as Canvas,0,0);await mkdir('qa-map-out',{recursive:true});await writeFile('qa-map-out/population.png',composite.toBuffer('image/png'));console.log('Population QA:',citizens.length,'citizens and',plan.buildings.length,'planned tents; no completed beds');overlay.destroy();scene.destroy();
