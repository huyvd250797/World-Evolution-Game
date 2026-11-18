import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {createCanvas,Image as NativeImage,type Canvas} from '@napi-rs/canvas';
import {generateWorldMap,tileAt} from '../src/game/map/world-map';
import {gridToWorld} from '../src/game/map/camera';
import {PlanOverlayRenderer} from '../src/game/planning/overlay';
import {emptyPlanning} from '../src/game/planning/model';
import {createCanvasScene} from '../src/game/map/canvas-scene';

test('Canvas compatibility renderer draws terrain, LOD, selected tile and grid, resizes and releases backing store',async()=>{
 const keys=['Image','document','devicePixelRatio'] as const,originals=keys.map(k=>Object.getOwnPropertyDescriptor(globalThis,k));
 const descriptor=Object.getOwnPropertyDescriptor(NativeImage.prototype,'src')!;
 class LocalImage extends NativeImage{}
 Object.defineProperty(LocalImage.prototype,'src',{get(){return descriptor.get!.call(this);},set(value:string|Uint8Array){descriptor.set!.call(this,typeof value==='string'&&value.startsWith('/assets/')?readFileSync(resolve('public'+value)):value);}});
 Object.defineProperty(globalThis,'Image',{configurable:true,value:LocalImage});
 Object.defineProperty(globalThis,'devicePixelRatio',{configurable:true,value:1});
 Object.defineProperty(globalThis,'document',{configurable:true,value:{createElement(name:string){assert.equal(name,'canvas');const canvas=createCanvas(800,600);Object.defineProperty(canvas,'style',{value:{}});Object.defineProperty(canvas,'setAttribute',{value:()=>{}});Object.defineProperty(canvas,'remove',{value:()=>{}});return canvas;}}});
 try{
  const map=generateWorldMap('BOSS-2026','B01'),scene=await createCanvasScene(map,800,600),canvas=scene.canvas as unknown as Canvas;
  const digest=()=>createHash('sha256').update(canvas.toBuffer('image/png')).digest('hex');
  const camera={...gridToWorld(map.focus.x,map.focus.y),zoom:.85},viewport={width:800,height:600},options={quality:'low' as const,grid:false,resources:false};
  const near=scene.draw(camera,viewport,null,options),base=digest();
  assert.equal(near.stride,1);assert.ok(near.tiles>0&&near.objects>0&&near.chunks<256);
  scene.draw(camera,viewport,tileAt(map,map.focus.x,map.focus.y),options);assert.notEqual(digest(),base,'Selected diamond must be visible');
  scene.draw(camera,viewport,null,{...options,grid:true,resources:true});assert.notEqual(digest(),base,'Grid/resources must affect rendered pixels');
  const far=scene.draw({...gridToWorld(127.5,127.5),zoom:.035},viewport,null,options);assert.equal(far.stride,8);assert.ok(far.tiles<near.tiles);assert.equal(far.objects,0);assert.notEqual(digest(),base);
  scene.resize(390,540);scene.draw(camera,{width:390,height:540},null,options);assert.equal(canvas.width,390);assert.equal(canvas.height,540);
  const overlay=new PlanOverlayRenderer(),plan=emptyPlanning();plan.buildings.push({id:crypto.randomUUID(),buildingId:'B008',x:map.focus.x,y:map.focus.y,rotation:0,status:'planned',createdTick:0});const oc=overlay.canvas as unknown as Canvas;overlay.draw(map,camera,viewport,{planning:plan,ghost:{cells:[map.focus],valid:true}});const valid=oc.toBuffer('image/png');overlay.draw(map,camera,viewport,{planning:plan,ghost:{cells:[map.focus],valid:false}});assert.notDeepEqual(oc.toBuffer('image/png'),valid,'Valid/invalid ghost must render differently');overlay.draw(map,{...gridToWorld(255,255),zoom:1},viewport,{planning:plan,ghost:null});assert.notDeepEqual(oc.toBuffer('image/png'),valid,'Offscreen plan chunks must be culled');overlay.destroy();overlay.destroy();assert.equal(oc.width,1);
  scene.destroy();scene.destroy();assert.equal(canvas.width,1);assert.equal(canvas.height,1);
 }finally{keys.forEach((k,i)=>{if(originals[i])Object.defineProperty(globalThis,k,originals[i]!);else Reflect.deleteProperty(globalThis,k);});}
});
