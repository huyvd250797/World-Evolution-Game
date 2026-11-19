import type {Camera,Viewport} from './camera';
import type {TileInfo,WorldMap} from './world-map';
export interface SceneOptions{quality:'auto'|'low';grid:boolean;resources:boolean;ecology?:boolean}
export interface SceneStats{chunks:number;tiles:number;objects:number;stride:number}
export interface MapScene{canvas:HTMLCanvasElement;kind:'WebGL'|'Canvas 2D';resize(width:number,height:number):void;draw(camera:Camera,viewport:Viewport,selected:TileInfo|null,options:SceneOptions):SceneStats;destroy():void}
export async function createScene(map:WorldMap,width:number,height:number):Promise<MapScene>{
 try{const {createPixiScene}=await import('./pixi-scene');return await createPixiScene(map,width,height);}catch(error){console.warn('WebGL unavailable, using Canvas compatibility renderer.',error);const {createCanvasScene}=await import('./canvas-scene');return createCanvasScene(map,width,height);}
}
