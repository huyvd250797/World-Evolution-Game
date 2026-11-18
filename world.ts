import { z } from 'zod';
import { master } from '../data';
export const worldName=z.string().trim().min(2,'Tên thế giới cần ít nhất 2 ký tự.').max(60,'Tên thế giới tối đa 60 ký tự.').refine(s=>!/[\x00-\x1f\x7f]/.test(s),'Tên chứa ký tự điều khiển không hợp lệ.');
export const seedSchema=z.string().trim().min(1,'Vui lòng nhập seed.').max(64,'Seed tối đa 64 ký tự.').regex(/^[A-Za-z0-9_-]+$/,'Seed chỉ gồm chữ không dấu, số, dấu gạch ngang và gạch dưới.');
export const populationLimitSchema=z.coerce.number().int('Giới hạn dân số phải là số nguyên.').min(master.defaults.minPopulationLimit).max(master.defaults.maxPopulationLimit);
export const createWorldSchema=z.object({name:worldName,seed:seedSchema,climateId:z.string().refine(x=>master.climates.some(c=>c.id===x),'Khí hậu không hợp lệ.'),populationLimit:populationLimitSchema,requestId:z.uuid()});
export type CreateWorldInput=z.infer<typeof createWorldSchema>;
export function initialState(){return {schemaVersion:1,masterDataVersion:'1.2',catalogChecksum:master.catalogSha256,day:1,era:'E0',paused:true,population:master.defaults.initialPopulation,people:Array.from({length:master.defaults.initialPopulation},(_,i)=>({id:`person-${String(i+1).padStart(3,'0')}`,assignment:null,homeId:null})),buildings:[],inventories:[],unlockedTechnologyIds:['T001']};}
export const snapshotSchema=z.object({schemaVersion:z.literal(1),masterDataVersion:z.literal('1.2'),catalogChecksum:z.string(),day:z.literal(1),era:z.literal('E0'),paused:z.literal(true),population:z.literal(20),people:z.array(z.object({id:z.string(),assignment:z.null(),homeId:z.null()})).length(20),buildings:z.array(z.unknown()).length(0),inventories:z.array(z.unknown()).length(0),unlockedTechnologyIds:z.array(z.string())});
export const worldSummarySchema=z.object({id:z.uuid(),name:z.string(),seed:z.string(),climate_id:z.string(),population_limit:z.number(),population:z.number(),day:z.number(),era:z.string(),revision:z.number(),master_data_version:z.string(),save_schema_version:z.number(),catalog_checksum:z.string(),created_at:z.string(),updated_at:z.string()});
export type WorldSummary=z.infer<typeof worldSummarySchema>;
export const worldDetailSchema=worldSummarySchema.extend({initial_state:snapshotSchema});
export type WorldDetail=z.infer<typeof worldDetailSchema>;
