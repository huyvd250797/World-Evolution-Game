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
import {emptyPlanning} from '../src/game/planning/model';
import {initialSimulation,advance,control} from '../src/game/simulation/engine';
const state=advance(control(initialSimulation({worldId:'33333333-3333-4333-8333-333333333333',seed:'BOSS-2026',climateId:'B01'}),{paused:false}),3500);
state.ecology.animals=state.ecology.animals.map(a=>({...a,known:true}));
const animal=state.ecology.animals.find(a=>a.speciesId==='SP015')!,map=generateWorldMap(state.seed,state.climateId),v={width:1100,height:650},camera={...gridToWorld(animal.x,animal.y),zoom:1.3};
const scene=await createCanvasScene(map,v.width,v.height),overlay=new PlanOverlayRenderer();scene.draw(camera,v,null,{quality:'low',grid:false,resources:false,ecology:true});overlay.draw(map,camera,v,{planning:emptyPlanning(),ghost:null},false,{citizens:state.citizens,paused:true,speed:1,selectedId:null,receivedAt:performance.now()},{state:state.ecology,seed:state.seed,climateId:state.climateId,paused:true,speed:1,receivedAt:performance.now(),selectedId:animal.id});
const composite=createCanvas(v.width,v.height),ctx=composite.getContext('2d');ctx.drawImage(scene.canvas as unknown as Canvas,0,0);ctx.drawImage(overlay.canvas as unknown as Canvas,0,0);await mkdir('qa-map-out',{recursive:true});await writeFile('qa-map-out/ecology.png',composite.toBuffer('image/png'));console.log('Ecology QA:',state.ecology.plants.length,'sources;',state.ecology.animals.length,'animals; source renderer/overlay composite.');overlay.destroy();scene.destroy();
