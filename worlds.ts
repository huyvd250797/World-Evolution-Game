import { requireUser } from './session';
import { worldDetailSchema, worldSummarySchema } from '@/game/core/world';
export const summaryColumns='id,name,seed,climate_id,population_limit,population,day,era,revision,master_data_version,save_schema_version,catalog_checksum,created_at,updated_at';
export function databaseError(code?:string){if(code==='42P01'||code==='PGRST205'||code==='PGRST202')return 'Chưa có cấu trúc database. Chạy migration 202611180001_foundation.sql trong Supabase SQL Editor rồi thử lại.';return 'Không tải được dữ liệu đám mây. Kiểm tra kết nối và trạng thái Supabase, sau đó thử lại.';}
export async function listWorlds(){const {db}=await requireUser();const {data,error}=await db.from('worlds').select(summaryColumns).order('updated_at',{ascending:false});if(error)return {worlds:[],error:databaseError(error.code)};return {worlds:worldSummarySchema.array().parse(data),error:null};}
export async function getWorld(id:string){const {db}=await requireUser();const {data,error}=await db.from('worlds').select(summaryColumns+',initial_state').eq('id',id).maybeSingle();if(error)throw new Error(databaseError(error.code));return data?worldDetailSchema.parse(data):null;}
