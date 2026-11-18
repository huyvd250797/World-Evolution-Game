/** Browserless Canvas renderer QA. These images are not browser screenshots. */
import {createCanvas,Image as NativeImage,type Canvas} from '@napi-rs/canvas';
import {readFileSync} from 'node:fs';
import {mkdir,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {generateWorldMap,tileAt} from '../src/game/map/world-map';
import {gridToWorld} from '../src/game/map/camera';
import {createCanvasScene} from '../src/game/map/canvas-scene';
const srcDescriptor=Object.getOwnPropertyDescriptor(NativeImage.prototype,'src')!;
class LocalImage extends NativeImage{}
Object.defineProperty(LocalImage.prototype,'src',{get(){return srcDescriptor.get!.call(this);},set(value:string|Uint8Array){srcDescriptor.set!.call(this,typeof value==='string'&&value.startsWith('/assets/')?readFileSync(resolve('public'+value)):value);}});
Object.defineProperty(globalThis,'Image',{configurable:true,value:LocalImage});
Object.defineProperty(globalThis,'devicePixelRatio',{configurable:true,value:1});
Object.defineProperty(globalThis,'document',{configurable:true,value:{createElement(name:string){if(name!=='canvas')throw new Error(name);const canvas=createCanvas(1000,650);Object.defineProperty(canvas,'style',{value:{},configurable:true});Object.defineProperty(canvas,'remove',{value:()=>{},configurable:true});return canvas;}}});
await mkdir('qa-map-out',{recursive:true});
for(const climate of ['B01','B02','B06']){
 const map=generateWorldMap('BOSS-2026',climate),scene=await createCanvasScene(map,1100,650),focus=gridToWorld(map.focus.x,map.focus.y);
 const stats=scene.draw({...focus,zoom:.85},{width:1100,height:650},tileAt(map,map.focus.x,map.focus.y),{quality:'auto',grid:false,resources:false});
 const canvas=scene.canvas as unknown as Canvas;
 await writeFile(`qa-map-out/${climate}-near.png`,canvas.toBuffer('image/png'));
 scene.draw({...gridToWorld(127.5,127.5),zoom:.059},{width:1100,height:650},null,{quality:'low',grid:false,resources:false});await writeFile(`qa-map-out/${climate}-far.png`,canvas.toBuffer('image/png'));
 console.log(climate,stats);scene.destroy();
}
