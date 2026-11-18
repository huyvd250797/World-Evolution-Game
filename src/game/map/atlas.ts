import {Assets,type Spritesheet} from 'pixi.js';
import {assetUrl} from '../renderer/assets';
let references=0,pending:Promise<Spritesheet>|null=null,cleanup=Promise.resolve();
/** Serial cleanup protects StrictMode remounts from unloading a newly acquired sheet. */
export async function acquireAtlas(){
 references++;await cleanup;
 pending??=Assets.load<Spritesheet>(assetUrl('worldAtlas'));
 let released=false;
 function release(){if(released)return;released=true;references--;if(references===0){cleanup=cleanup.then(async()=>{if(references!==0)return;const old=pending;pending=null;if(old){try{await old;await Assets.unload(assetUrl('worldAtlas'));}catch{/* A failed load owns no usable textures. */}}});}}
 try{return {sheet:await pending,release};}catch(error){release();throw error;}
}
