import {z} from 'zod';
import data from '../../../data/generated/workforce.json';
import {citizenCommand,type Citizen} from '../population/model';
import type {Navigation} from '../population/navigation';
import type {Job} from '../survival/model';
import type {Cell} from '../planning/model';
export const ROLES=data.roles;
export const STAFFING=data.staffing;
export const TRAINING=data.training;
export const TICKS_PER_DAY=1800;
const roleId=z.string().refine(id=>ROLES.some(r=>r.id===id),'Nghề không thuộc Master Data');
const natural=z.number().int().min(0).max(1e12);
export const workerSchema=z.object({citizenId:z.string().min(1).max(100),roleId:roleId.nullable(),qualified:z.boolean(),assignment:z.object({siteId:z.uuid()}).strict().nullable(),training:z.object({siteId:z.uuid(),mentorId:z.string().min(1).max(100),progressTicks:natural,startedTick:natural,phase:z.enum(['outbound','studying','practice','blocked'])}).strict().nullable(),laborRemainder:z.number().int().min(0).max(99)}).strict();
export const workforceSchema=z.object({version:z.literal(1),workers:z.array(workerSchema).length(20),events:z.array(z.object({tick:natural,citizenId:z.string().min(1).max(100),type:z.enum(['enroll','graduate','cancel','assign','release','resume']),roleId:roleId.nullable()}).strict()).max(100)}).strict();
export type Workforce=z.infer<typeof workforceSchema>;
export type WorkerRecord=z.infer<typeof workerSchema>;
/** Completed construction/era/research hook. Blueprints must never be passed as completed. */
export interface LaborSite{id:string;buildingId:string;entrance:Cell;operational:boolean}
export interface LaborContext{era:string;technologies:string[];sites:LaborSite[]}
export const FOUNDATION_LABOR:LaborContext={era:'E0',technologies:['T001'],sites:[]};
export const roleById=(id:string|null)=>ROLES.find(r=>r.id===id);
export function initialWorkforce(citizens:Citizen[]):Workforce{return {version:1,workers:citizens.map(c=>({citizenId:c.id,roleId:null,qualified:false,assignment:null,training:null,laborRemainder:0})),events:[]};}
export function roleLocks(id:string,ctx=FOUNDATION_LABOR){const r=roleById(id);if(!r)return ['Không tìm thấy nghề trong Master Data.'];const reasons:string[]=[];if(Number(r.era.slice(1))>Number(ctx.era.slice(1)))reasons.push(`Cần thời đại ${r.era} — ${r.eraName}.`);if(!r.technologyId)reasons.push(`Tên công nghệ “${r.technologyName}” chưa khớp danh mục Frozen; nghề đang khóa để đối chiếu.`);else if(!ctx.technologies.includes(r.technologyId))reasons.push(`Cần ${r.technologyName} (${r.technologyId}).`);return reasons;}
function same(a:Cell,b:Cell){return a.x===b.x&&a.y===b.y;}
function site(ctx:LaborContext,id:string){const s=ctx.sites.find(s=>s.id===id&&s.operational);if(!s)throw new Error('Cần cơ sở đã hoàn thành và có thể hoạt động. Nền quy hoạch chưa sử dụng được.');return s;}
function present(c:Citizen|undefined,s:LaborSite){return !!c&&c.status==='idle'&&!c.progress&&same(c,s.entrance);}
function instructor(w:Workforce,citizens:Citizen[],s:LaborSite,role:string,busy:Set<string>){return w.workers.filter(p=>p.qualified&&p.roleId===role&&p.assignment?.siteId===s.id&&!p.training&&!busy.has(p.citizenId)&&present(citizens.find(c=>c.id===p.citizenId),s));}
function mentors(w:Workforce,citizens:Citizen[],s:LaborSite,busy:Set<string>){const spec=TRAINING.find(t=>t.buildingId===s.buildingId);if(!spec)return null;const found:string[]=[];for(const need of spec.instructors){const people=instructor(w,citizens,s,String(need.roleId),busy);if(people.length<Number(need.required))return null;found.push(...people.slice(0,Number(need.required)).map(p=>p.citizenId));}return found;}
function event(w:Workforce,p:WorkerRecord,tick:number,type:Workforce['events'][number]['type']){w.events.push({tick,citizenId:p.citizenId,type,roleId:p.roleId});if(w.events.length>100)w.events.splice(0,w.events.length-100);}
const idsSchema=z.array(z.string().min(1).max(100)).min(1).max(20).refine(a=>new Set(a).size===a.length,'Danh sách cư dân bị trùng');
export const laborCommandSchema=z.discriminatedUnion('type',[
 z.object({type:z.literal('train'),ids:idsSchema,roleId,siteId:z.uuid()}).strict(),
 z.object({type:z.literal('assign'),ids:idsSchema,siteId:z.uuid()}).strict(),
 z.object({type:z.literal('release'),ids:idsSchema}).strict(),
 z.object({type:z.literal('cancelTraining'),ids:idsSchema}).strict(),
 z.object({type:z.literal('resumeTraining'),ids:idsSchema}).strict()
]);
export type LaborCommand=z.infer<typeof laborCommandSchema>;
export function laborCommand(original:Workforce,people:Citizen[],nav:Navigation,tick:number,input:LaborCommand,ctx=FOUNDATION_LABOR,busyIds:string[]=[]){
 const cmd=laborCommandSchema.parse(input),w=structuredClone(original);let citizens=people;const busy=new Set(busyIds);
 for(const id of cmd.ids){if(!w.workers.some(p=>p.citizenId===id)||!people.some(p=>p.id===id))throw new Error('ID cư dân khác danh sách đã lưu.');if(busy.has(id))throw new Error(`${id} đang có việc/hàng sinh tồn; hoàn tất hoặc hủy việc hợp lệ trước khi điều chuyển.`);}
 for(const id of cmd.ids){const p=w.workers.find(p=>p.citizenId===id)!,c=citizens.find(c=>c.id===id)!;
  const move=(target:Cell)=>{if(nav.route(c.progress?c.path[0]:c,target)===null)throw new Error('Không có đường tới nơi học/làm.');citizens=citizenCommand(citizens,nav,{type:'move',ids:[id],target});};
  if(cmd.type==='train'){
   const locks=roleLocks(cmd.roleId,ctx);if(locks.length)throw new Error(locks.join(' '));const place=site(ctx,cmd.siteId),spec=TRAINING.find(t=>t.buildingId===place.buildingId),r=roleById(cmd.roleId)!;
   if(!spec||spec.era!==r.era)throw new Error('Chưa có cơ sở/định mức đào tạo phù hợp thời đại nghề này.');
   if(!ctx.technologies.includes(String(spec.technologyId)))throw new Error(`Cần Học nghề có hướng dẫn (${spec.technologyId}).`);
   if(p.training)throw new Error('Cư dân đang học; hủy khóa hiện tại trước khi đổi nghề.');
   if(w.workers.filter(q=>q.training?.siteId===place.id).length>=Number(spec.capacity))throw new Error(`Cơ sở chỉ có ${spec.capacity} chỗ đào tạo; đã đủ chỗ.`);
   const teachers=mentors(w,citizens,place,busy);if(!teachers?.length||teachers.includes(id))throw new Error('Thiếu người hướng dẫn đúng nghề, đã đào tạo, có mặt và không kiêm việc khác.');
   move(place.entrance);p.roleId=cmd.roleId;p.qualified=false;p.assignment=null;p.laborRemainder=0;p.training={siteId:place.id,mentorId:teachers[0],progressTicks:0,startedTick:tick,phase:present(c,place)?'studying':'outbound'};event(w,p,tick,'enroll');
  }else if(cmd.type==='assign'){
   const r=roleById(p.roleId);if(!r||!p.qualified&&!p.training)throw new Error('Cư dân chưa có nghề hoặc khóa tập sự hợp lệ; cần đào tạo trước.');const locks=roleLocks(String(p.roleId),ctx);if(locks.length)throw new Error(locks.join(' '));if(p.training){const classroom=site(ctx,p.training.siteId),teachers=mentors(w,citizens,classroom,busy),spec=TRAINING.find(t=>t.buildingId===classroom.buildingId);if(!spec||!ctx.technologies.includes(String(spec.technologyId))||!teachers?.includes(p.training.mentorId))throw new Error('Khóa tập sự cần cơ sở học và hướng dẫn viên hợp lệ trước khi thực hành.');}const place=site(ctx,cmd.siteId),need=STAFFING.find(n=>n.buildingId===place.buildingId&&n.roleId===p.roleId);if(!need)throw new Error('Cơ sở không có vị trí cho nghề hiện tại.');
   if(TRAINING.some(t=>t.buildingId===place.buildingId)&&!p.qualified)throw new Error('Người hướng dẫn phải hoàn tất đào tạo; tập sự không thay được hướng dẫn viên.');
   if(w.workers.filter(q=>q.citizenId!==id&&q.assignment?.siteId===place.id&&q.roleId===p.roleId).length>=Number(need.required))throw new Error('Vị trí nghề tại cơ sở đã đủ định biên.');
   move(place.entrance);p.assignment={siteId:place.id};if(p.training)p.training.phase='practice';event(w,p,tick,'assign');
  }else if(cmd.type==='release'){
   p.assignment=null;if(p.training)p.training.phase='blocked';citizens=citizenCommand(citizens,nav,{type:'rest',ids:[id]});event(w,p,tick,'release');
  }else if(cmd.type==='cancelTraining'){
   if(!p.training)throw new Error('Cư dân không có khóa đào tạo để hủy.');event(w,p,tick,'cancel');p.training=null;p.roleId=null;p.qualified=false;p.assignment=null;p.laborRemainder=0;citizens=citizenCommand(citizens,nav,{type:'rest',ids:[id]});
  }else{
   if(!p.training)throw new Error('Cư dân không có khóa đào tạo để tiếp tục.');const locks=roleLocks(String(p.roleId),ctx);if(locks.length)throw new Error(locks.join(' '));const place=site(ctx,p.training.siteId),spec=TRAINING.find(t=>t.buildingId===place.buildingId);if(!spec||spec.era!==roleById(p.roleId)?.era||!ctx.technologies.includes(String(spec.technologyId)))throw new Error('Cơ sở/công nghệ đào tạo chưa phù hợp.');const teachers=mentors(w,citizens,place,busy);if(!teachers?.length)throw new Error('Thiếu người hướng dẫn có mặt.');move(place.entrance);p.training.mentorId=teachers[0];p.training.phase='outbound';p.assignment=null;event(w,p,tick,'resume');
  }
 }
 return {workforce:w,citizens};
}
/** Called once after movement each tick. Travel, rest, field practice and missing mentors earn no classroom time. */
export function tickWorkforce(w:Workforce,citizens:Citizen[],tick:number,ctx=FOUNDATION_LABOR,jobs:Job[]=[],movingBefore:string[]=[],earn:(id:string)=>number=()=>1){const busy=new Set([...jobs.map(j=>j.citizenId),...movingBefore]);
 for(const p of w.workers){if(!p.training)continue;const t=p.training,r=roleById(p.roleId)!,place=ctx.sites.find(s=>s.id===t.siteId&&s.operational),spec=TRAINING.find(s=>s.buildingId===place?.buildingId);
  const teachers=place?mentors(w,citizens,place,busy):null;
  if(!place||!spec||spec.era!==r.era||roleLocks(r.id,ctx).length||!ctx.technologies.includes(String(spec.technologyId))||!teachers?.includes(t.mentorId)){t.phase='blocked';continue;}
  if(p.assignment){t.phase='practice';continue;}const c=citizens.find(c=>c.id===p.citizenId)!;
  if(movingBefore.includes(p.citizenId)){t.phase='outbound';continue;}if(busy.has(p.citizenId)){t.phase='practice';continue;}if(c.status==='moving'){t.phase='outbound';continue;}if(!present(c,place)){t.phase='blocked';continue;}
  t.phase='studying';t.progressTicks+=earn(p.citizenId);
  if(t.progressTicks>=Number(r.trainingDays)*TICKS_PER_DAY){p.training=null;p.qualified=true;p.laborRemainder=0;event(w,p,tick,'graduate');}
 }
}
const activityRole={gather:'J001',hunt:'J002',water:'J072',process:'J007'};
export function activityLocks(w:Workforce,citizenId:string,kind:Job['kind'],recipeId:string|null=null,ctx=FOUNDATION_LABOR){const p=w.workers.find(p=>p.citizenId===citizenId);if(!p)return ['Không có hồ sơ lao động.'];if(!p.roleId&&!p.training&&!p.assignment&&(kind==='gather'||kind==='process'&&['F001','F002'].includes(recipeId??'')))return [];
 if(p.roleId!==activityRole[kind])return [`Hoạt động cần nghề ${roleById(activityRole[kind])?.name}.`];if(!p.qualified&&!p.training)return ['Chưa có đào tạo hợp lệ.'];if(p.training?.phase==='blocked')return ['Khóa tập sự đang thiếu điều kiện; tiếp tục khóa học trước.'];if(!p.assignment)return ['Chưa được phân vào cơ sở làm việc phù hợp.'];const place=ctx.sites.find(s=>s.id===p.assignment!.siteId&&s.operational);if(!place||!STAFFING.some(n=>n.buildingId===place.buildingId&&n.roleId===p.roleId))return ['Cơ sở phân công chưa hoạt động hoặc không phù hợp nghề.'];return roleLocks(p.roleId,ctx);
}
/** Integer 100ths carry is saved; no drift across reload or timer batches. Invoked only during actual work. */
export function laborTick(w:Workforce,job:Job,ctx=FOUNDATION_LABOR){const p=w.workers.find(p=>p.citizenId===job.citizenId)!;if(activityLocks(w,p.citizenId,job.kind,job.recipeId,ctx).length)return 0;const efficiency=p.qualified||!p.roleId?100:Math.round(Number(roleById(p.roleId)!.traineeEfficiency)*100),credit=p.laborRemainder+efficiency;p.laborRemainder=credit%100;return Math.floor(credit/100);}
export function staffingSummary(w:Workforce,citizens:Citizen[],s:LaborSite){return STAFFING.filter(n=>n.buildingId===s.buildingId).map(n=>{const assigned=w.workers.filter(p=>p.assignment?.siteId===s.id&&p.roleId===n.roleId),presentWorkers=assigned.filter(p=>present(citizens.find(c=>c.id===p.citizenId),s));return {...n,assigned:assigned.length,present:presentWorkers.length,missing:Math.max(0,Number(n.required)-presentWorkers.length),effective:presentWorkers.reduce((a,p)=>a+(p.qualified?1:Number(roleById(p.roleId)?.traineeEfficiency??0)),0)};});}
export function laborStatus(p:WorkerRecord,c:Citizen,jobs:Job[],ctx=FOUNDATION_LABOR){if(c.status==='resting')return 'resting';if(c.status==='moving')return 'moving';if(c.status==='blocked')return 'blocked';if(p.training?.phase==='studying')return 'training';const job=jobs.find(j=>j.citizenId===c.id);if(job)return job.phase==='blocked'?'blocked':'working';if(p.assignment)return ctx.sites.some(s=>s.id===p.assignment!.siteId&&s.operational&&present(c,s))?'working':'blocked';if(p.training)return 'blocked';return 'idle';}
export function validateWorkforce(w:Workforce,citizens:Citizen[],tick:number){const expected=citizens.map(c=>c.id);const used=new Map<string,number>();for(const p of w.workers)if(p.training){used.set(p.training.siteId,(used.get(p.training.siteId)??0)+1);if(used.get(p.training.siteId)!>2)throw new Error('Cơ sở vượt quá 2 chỗ đào tạo.');}if(new Set(w.workers.map(p=>p.citizenId)).size!==20||w.workers.some(p=>!expected.includes(p.citizenId)))throw new Error('Hồ sơ nghề không khớp 20 ID cư dân đã lưu.');for(const p of w.workers){if(!p.roleId&&(p.qualified||p.training||p.assignment)||p.qualified&&p.training||!p.qualified&&p.roleId&&!p.training)throw new Error('Nghề, chứng nhận và tập sự không nhất quán.');if(p.training){const t=p.training,r=roleById(p.roleId)!;if(t.startedTick>tick||t.progressTicks>=Number(r.trainingDays)*TICKS_PER_DAY||t.progressTicks>tick-t.startedTick||t.mentorId===p.citizenId||!expected.includes(t.mentorId))throw new Error('Tiến độ hoặc người hướng dẫn không hợp lệ.');}}
 if(w.events.some(e=>e.tick>tick||!expected.includes(e.citizenId)))throw new Error('Nhật ký nghề không hợp lệ.');return w;}
