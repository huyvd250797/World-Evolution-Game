import test from 'node:test';
import assert from 'node:assert/strict';
import {createCanvas} from '@napi-rs/canvas';
import {PlanOverlayRenderer} from '../src/game/planning/overlay';
import {generateWorldMap} from '../src/game/map/world-map';
import {gridToWorld} from '../src/game/map/camera';
import {emptyConstruction,materialWork} from '../src/game/construction/model';
import {emptyPlanning} from '../src/game/planning/model';
test('Foundation, worksite, completed house and yard render distinct real pixels, shared stamps and viewport culling',()=>{
 const descriptor=Object.getOwnPropertyDescriptor(globalThis,'document');Object.defineProperty(globalThis,'document',{configurable:true,value:{createElement(){return Object.assign(createCanvas(80,80),{style:{},className:'',setAttribute(){},remove(){}});}}});const renderer=new PlanOverlayRenderer();
 try{const map=generateWorldMap('RENDER-CONSTRUCTION','B01'),id=crypto.randomUUID(),planning=emptyPlanning();planning.buildings.push({id,buildingId:'B006',x:100,y:100,rotation:0,status:'planned',createdTick:0});const camera={...gridToWorld(100,100,map.elevation[100*256+100]),zoom:1},viewport={width:640,height:420};const pixels=()=>Buffer.from(renderer.canvas.getContext('2d')!.getImageData(0,0,640,420).data);
 renderer.draw(map,camera,viewport,{planning,ghost:null});const foundation=pixels();assert.ok(foundation.some(x=>x));const construction=emptyConstruction();construction.sites.push({id,entrance:{x:99,y:100},status:'active',createdTick:0,completedTick:null,workDone:0,workRequired:materialWork('B006')});renderer.draw(map,camera,viewport,{planning,ghost:null,construction});const worksite=pixels();assert.notDeepEqual(foundation,worksite);construction.sites[0].status='complete';construction.sites[0].workDone=construction.sites[0].workRequired;construction.sites[0].completedTick=5000;renderer.draw(map,camera,viewport,{planning,ghost:null,construction});assert.notDeepEqual(pixels(),worksite);construction.yards.push({id:crypto.randomUUID(),cell:{x:98,y:100}});const before=pixels();renderer.draw(map,camera,viewport,{planning,ghost:null,construction});assert.notDeepEqual(before,pixels());renderer.draw(map,{x:1e6,y:1e6,zoom:1},viewport,{planning,ghost:null,construction});assert.ok(pixels().every(x=>x===0));
 }finally{renderer.destroy();if(descriptor)Object.defineProperty(globalThis,'document',descriptor);else Reflect.deleteProperty(globalThis,'document');}
});
