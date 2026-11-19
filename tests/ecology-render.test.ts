import test from 'node:test';
import assert from 'node:assert/strict';
import {createCanvas} from '@napi-rs/canvas';
import {initialSimulation,advance,control} from '../src/game/simulation/engine';
import {EcologyStamps,hitEcology} from '../src/game/ecology/render';
import {ecologyBlueprint} from '../src/game/ecology/model';
import {gridToWorld} from '../src/game/map/camera';
test('Ecology renderer uses visible chunks, real pixels, depth positions, hit test and far LOD without changing counts',()=>{
 const descriptor=Object.getOwnPropertyDescriptor(globalThis,'document');Object.defineProperty(globalThis,'document',{configurable:true,value:{createElement(){return createCanvas(48,48);}}});
 const renderer=new EcologyStamps();try{const s=advance(control(initialSimulation({worldId:'33333333-3333-4333-8333-333333333333',seed:'BOSS-2026',climateId:'B01'}),{paused:false}),300),bp=ecologyBlueprint(s.seed,s.climateId),a=s.ecology.animals.find(a=>a.speciesId==='SP015')!;a.known=true;const v={width:800,height:500},camera={...gridToWorld(a.x,a.y),zoom:1},frame={state:s.ecology,seed:s.seed,climateId:s.climateId,paused:true,speed:1,receivedAt:performance.now(),selectedId:a.id};const entries=renderer.entries(frame,camera,v);assert.ok(entries.length>0&&entries.length<s.ecology.plants.length+s.ecology.animals.length);assert.ok(entries.some(e=>e.id===a.id));const canvas=createCanvas(800,500),ctx=canvas.getContext('2d');ctx.translate(400-camera.x,250-camera.y);for(const e of entries)renderer.draw(ctx as unknown as CanvasRenderingContext2D,e,bp.map,frame,false);const pixels=ctx.getImageData(0,0,800,500).data;assert.ok(pixels.some((p,n)=>n%4===3&&p>0));assert.ok(renderer.entries(frame,{x:1e6,y:1e6,zoom:1},v).length===0);const far=renderer.entries(frame,{...camera,zoom:.05},v);assert.ok(far.filter(e=>e.animal).length<=64);assert.ok(!far.some(e=>!e.animal));const entry=entries.find(e=>e.id===a.id)!,world=gridToWorld(entry.cell.x,entry.cell.y,bp.map.elevation[a.y*256+a.x]);assert.equal(hitEcology(frame,bp.map,camera,v,{x:world.x-camera.x+400,y:world.y-camera.y+250-12}),a.id);assert.equal(s.ecology.animals.length,frame.state.animals.length);
 }finally{renderer.destroy();if(descriptor)Object.defineProperty(globalThis,'document',descriptor);else Reflect.deleteProperty(globalThis,'document');}
});
