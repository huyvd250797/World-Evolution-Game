import {z} from 'zod';
import {master} from '../data';
import {hashSeed,GENERATOR_VERSION} from '../map/world-map';
import {planningSchema,emptyPlanning,validatePlanning} from '../planning/model';
import {generateWorldMap} from '../map/world-map';
import {CLOCK,SEASONS} from './catalog';
export const ENGINE_VERSION='we-sim-1';
const natural=z.number().int().min(0).max(1_000_000_000_000);
const currentSchema=z.object({schemaVersion:z.literal(3),engineVersion:z.literal(ENGINE_VERSION),mapVersion:z.literal(GENERATOR_VERSION),masterDataVersion:z.literal('1.2'),catalogChecksum:z.literal(master.catalogSha256),worldId:z.uuid(),seed:z.string().regex(/^[A-Za-z0-9_-]{1,64}$/),climateId:z.enum(['B01','B02','B03','B04','B05','B06','B07']),population:z.literal(20),tick:natural,subTick:z.number().int().min(0).max(99),rngState:z.number().int().min(1).max(4294967295),rngDraws:natural,speed:z.union([z.literal(1),z.literal(2),z.literal(4)]),paused:z.boolean(),commandSeq:natural,activeMillis:natural,planning:planningSchema}).strict().refine(s=>s.rngDraws===s.tick,'RNG cursor khác tick');
export const stateSchema=z.preprocess(value=>{if(value&&typeof value==='object'&&'schemaVersion' in value&&value.schemaVersion===2)return {...value,schemaVersion:3,planning:emptyPlanning()};return value;},currentSchema);
export type SimState=z.infer<typeof stateSchema>;
export interface Identity{worldId:string;seed:string;climateId:string}
export function initialSimulation(i:Identity):SimState{return stateSchema.parse({schemaVersion:3,planning:emptyPlanning(),engineVersion:ENGINE_VERSION,mapVersion:GENERATOR_VERSION,masterDataVersion:'1.2',catalogChecksum:master.catalogSha256,...i,population:20,tick:0,subTick:0,rngState:hashSeed(i.seed+'|'+i.climateId)||1,rngDraws:0,speed:1,paused:true,commandSeq:0,activeMillis:0});}
export function validateState(value:unknown,i:Identity){const s=stateSchema.parse(value);if(s.worldId!==i.worldId||s.seed!==i.seed||s.climateId!==i.climateId)throw new Error('Bản lưu không thuộc thế giới/seed/khí hậu hiện tại.');if(s.planning.buildings.length||s.planning.roads.length)validatePlanning(s.planning,generateWorldMap(s.seed,s.climateId),s.tick);return s;}
export function nextRandom(state:number){let x=state>>>0;x^=x<<13;x^=x>>>17;x^=x<<5;return x>>>0;}
/** Integer fixed-step clock. Timer batching and speed cannot change RNG order. */
export function advance(s:SimState,elapsedMs:number):SimState{
 if(s.paused)return s;if(!Number.isSafeInteger(elapsedMs)||elapsedMs<0||elapsedMs>60000)throw new Error('Invalid elapsed time');
 const total=s.subTick+elapsedMs*s.speed,steps=Math.floor(total/CLOCK.tickMs);let rng=s.rngState;
 for(let n=0;n<steps;n++)rng=nextRandom(rng);
 return {...s,tick:s.tick+steps,subTick:total%CLOCK.tickMs,rngState:rng,rngDraws:s.rngDraws+steps,activeMillis:s.activeMillis+elapsedMs};
}
export function control(s:SimState,command:{paused?:boolean;speed?:1|2|4}){if(command.speed!==undefined&&![1,2,4].includes(command.speed))throw new Error('Invalid speed');if((command.paused===undefined||command.paused===s.paused)&&(command.speed===undefined||command.speed===s.speed))return s;return {...s,...command,commandSeq:s.commandSeq+1};}
export function calendar(tick:number,climateId:string){const day=Math.floor(tick/CLOCK.ticksPerDay)+1,dayOfYear=(day-1)%CLOCK.daysPerYear+1,season=SEASONS.find(s=>dayOfYear>=s.from&&dayOfYear<=s.to)!;const minute=Math.floor(tick%CLOCK.ticksPerDay*1440/CLOCK.ticksPerDay);return {day,year:Math.floor((day-1)/CLOCK.daysPerYear)+1,dayOfYear,season,dayOfSeason:(dayOfYear-1)%CLOCK.daysPerSeason+1,time:`${String(Math.floor(minute/60)).padStart(2,'0')}:${String(minute%60).padStart(2,'0')}`,regional:climateId==='B02'?(season.id==='S1'||season.id==='S3'?'Mùa mưa':season.id==='S2'?'Khô nóng':'Dịu hơn'):null};}
export const MUTABLE=['tick','subTick','rngState','rngDraws','speed','paused','commandSeq','activeMillis','planning'] as const;
export function delta(base:SimState,next:SimState){return Object.fromEntries(MUTABLE.filter(k=>k==='planning'?JSON.stringify(base[k])!==JSON.stringify(next[k]):base[k]!==next[k]).map(k=>[k,next[k]]));}
export async function sha256(text:string){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text))),b=>b.toString(16).padStart(2,'0')).join('');}
export interface SaveHead{revision:number;payload:string;checksum:string;savedAt:string;kind?:string}
export async function decodeHead(h:SaveHead,i:Identity){if(await sha256(h.payload)!==h.checksum)throw new Error('Checksum bản lưu không khớp. Chọn một bản hợp lệ trong Lịch sử để khôi phục.');return validateState(JSON.parse(h.payload),i);}
