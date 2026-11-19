import {z} from 'zod';
import data from '../../../data/generated/survival.json';
import {pointSchema,key,type Cell} from '../planning/model';
import {citizenCommand,advanceCitizens,type Citizen} from '../population/model';
import type {Navigation} from '../population/navigation';
import {hashSeed,TERRAIN} from '../map/world-map';
export const SURVIVAL=data;
export const DAY=1800;
const nat=z.number().int().min(0).max(1e12);
const resource=z.enum(['R001','R002','R003','R004','R005','R006','R007','R008','R009','R030','R031','R032','R033','R058','R062','R067','R125','R167','R213']);
export const lotSchema=z.object({id:z.string().min(1).max(150),resource,quantity:z.number().min(0).max(100000),createdTick:nat,ageTicks:nat,expiresTick:nat.nullable(),location:z.string().min(1).max(100),spoiled:z.boolean()}).strict();
export type Lot=z.infer<typeof lotSchema>;
const jobSchema=z.object({id:z.string().min(1).max(150),citizenId:z.string().min(1).max(100),kind:z.enum(['gather','water','hunt','process']),source:pointSchema,target:pointSchema,phase:z.enum(['outbound','working','returning','blocked']),workDone:nat,workRequired:z.number().int().min(1).max(DAY*10),recipeId:z.string().nullable(),output:z.array(z.object({resource,quantity:z.number().positive().max(3)}).strict()).max(3),cargo:z.array(z.string().max(150)).max(3),reservedTool:z.string().nullable()}).strict();
export type Job=z.infer<typeof jobSchema>;
export const survivalSchema=z.object({version:z.literal(1),depot:pointSchema,lots:z.array(lotSchema).max(1024),jobs:z.array(jobSchema).max(20),sources:z.array(z.object({key:z.string().max(30),remaining:z.number().int().min(0).max(5),readyTick:nat}).strict()).max(4096),day:nat,served:z.array(z.object({id:z.string().max(100),food:z.number().min(0).max(1),water:z.number().min(0).max(2)}).strict()).length(20),previous:z.object({day:nat,food:z.number().min(0).max(20),water:z.number().min(0).max(40)}).strict().nullable(),sequence:nat,waste:z.number().min(0).max(1e12)}).strict();
export type Survival=z.infer<typeof survivalSchema>;
/** Capabilities come from completed construction/research adapters, never blueprints. */
export interface Capabilities{technologies:string[];facilities:{id:string;buildingId:string;entrance:Cell;staffed:boolean;accepts?:string[]}[]}
export const FOUNDATION_CAPABILITIES:Capabilities={technologies:['T001'],facilities:[]};
export function initialSurvival(citizens:Citizen[],tick:number):Survival{return {version:1,depot:{x:citizens[0].x,y:citizens[0].y},lots:[],jobs:[],sources:[],day:Math.floor(tick/DAY)+1,served:citizens.map(c=>({id:c.id,food:0,water:0})),previous:null,sequence:0,waste:0};}
export function ttl(id:string){return data.resources.find(r=>r.id===id)?.ttlDays??null;}
export function resourceName(id:string){return data.resources.find(r=>r.id===id)?.name??id;}
function protectedLot(l:Lot,cap:Capabilities){const f=cap.facilities.find(f=>f.id===l.location&&f.staffed);return f?.buildingId==='B010'&&data.resources.find(r=>r.id===l.resource)?.storage==='Kho lương thực'||f?.buildingId==='B118'&&f.accepts?.includes('R213')===true&&l.resource==='R213';}
function ageLots(s:Survival,tick:number,cap:Capabilities){return s.lots.map(l=>{if(l.spoiled)return l;const days=ttl(l.resource);if(days===null)return l;const ageTicks=l.ageTicks+(protectedLot(l,cap)?0:1),spoiled=ageTicks>=days*DAY;return {...l,ageTicks,expiresTick:protectedLot(l,cap)?null:tick+Math.max(0,days*DAY-ageTicks),spoiled};});}
export function fresh(l:Lot){return l.quantity>0&&!l.spoiled;}
function available(s:Survival,id:string){return s.lots.filter(l=>fresh(l)&&l.resource===id&&l.location==='depot').reduce((n,l)=>n+l.quantity,0);}
function consume(s:Survival,id:string,amount:number){let remaining=amount;for(const l of s.lots.filter(l=>fresh(l)&&l.resource===id&&l.location==='depot').sort((a,b)=>(a.expiresTick??Infinity)-(b.expiresTick??Infinity)||a.createdTick-b.createdTick||a.id.localeCompare(b.id))){const n=Math.min(l.quantity,remaining);l.quantity-=n;remaining-=n;if(!remaining)break;}if(remaining>1e-8)throw new Error('Tồn kho không đủ; không thể trừ hai lần.');}
function newLot(s:Survival,id:Lot['resource'],quantity:number,tick:number,location:string){if(s.lots.length>=1024)throw new Error('Đã đạt giới hạn 1024 lô; dọn hàng hỏng trước khi tiếp tục.');const days=ttl(id);const l:Lot={id:`lot-${++s.sequence}`,resource:id,quantity,createdTick:tick,ageTicks:0,expiresTick:days===null?null:tick+days*DAY,location,spoiled:false};s.lots.push(l);return l.id;}
const foodValue=(id:string)=>['R001','R002','R030','R031','R032','R033'].includes(id)?1:0;
const waterValue=(id:string)=>['R067','R213'].includes(id)?1:0;
/** FEFO is global across edible types. Each citizen/day ledger prevents double allocation. */
function distribute(s:Survival,citizens:Citizen[],nav:Navigation){const eligible=citizens.filter(c=>nav.route(c,s.depot)!==null);for(const need of ['food','water'] as const){const value=need==='food'?foodValue:waterValue;const lots=s.lots.filter(l=>fresh(l)&&l.location==='depot'&&value(l.resource)).sort((a,b)=>(a.expiresTick??Infinity)-(b.expiresTick??Infinity)||a.createdTick-b.createdTick||a.id.localeCompare(b.id));let index=0;for(const c of eligible){const ledger=s.served.find(p=>p.id===c.id)!;let required=(need==='food'?data.foodPerPerson:data.waterPerPerson)-ledger[need];while(required>0&&index<lots.length){const l=lots[index],n=Math.min(required,l.quantity);l.quantity-=n;ledger[need]+=n;required-=n;if(!l.quantity)index++;}}}}
export function survivalSummary(s:Survival,population:number,tick=(s.day-1)*DAY){const valid=s.lots.filter(l=>fresh(l)&&l.location==='depot'),food=valid.reduce((n,l)=>n+l.quantity*foodValue(l.resource),0),water=valid.reduce((n,l)=>n+l.quantity*waterValue(l.resource),0),foodNeed=population*data.foodPerPerson,waterNeed=population*data.waterPerPerson,foodServed=s.served.reduce((n,p)=>n+p.food,0),waterServed=s.served.reduce((n,p)=>n+p.water,0);return {food,water,foodNeed,waterNeed,foodServed,waterServed,foodMissing:foodNeed-foodServed,waterMissing:waterNeed-waterServed,foodDays:foodNeed?food/foodNeed:0,waterDays:waterNeed?water/waterNeed:0,expiring:s.lots.filter(l=>fresh(l)&&l.expiresTick!==null&&l.expiresTick<=tick+DAY),carried:s.lots.filter(l=>fresh(l)&&l.location.startsWith('citizen:')).reduce((n,l)=>n+l.quantity,0)};}
export type SurvivalCommand={type:'assign';citizenId:string;kind:'gather'|'water'|'hunt';source:Cell}|{type:'process';citizenId:string;recipeId:string}|{type:'cancel';citizenId:string}|{type:'retry';citizenId:string}|{type:'clean'};
function same(a:Cell,b:Cell){return a.x===b.x&&a.y===b.y;}
function sourceRecord(s:Survival,p:Cell,tick:number,seed:string){const k=key(p);let r=s.sources.find(r=>r.key===k);if(!r){if(s.sources.length>=4096)throw new Error('Đã đạt giới hạn nguồn khảo sát.');r={key:k,remaining:2+hashSeed(seed+'|berries|'+k)%4,readyTick:0};s.sources.push(r);}if(r.remaining===0&&tick>=r.readyTick)r.remaining=2+hashSeed(seed+'|berries|'+k+'|'+r.readyTick)%4;return r;}
export function sourceInfo(nav:Navigation,p:Cell){const i=nav.index(p);return nav.map.resources[i]===4?'gather':nav.map.terrain[i]===TERRAIN.water?'water':nav.map.terrain[i]===TERRAIN.forest?'hunt':null;}
function requireFacility(cap:Capabilities,buildingId:string,tech:string,nav:Navigation,from:Cell){if(!cap.technologies.includes(tech))throw new Error(`Chưa mở công nghệ ${tech}; V0.6.0 không tự cấp công nghệ.`);const f=cap.facilities.find(f=>f.buildingId===buildingId&&f.staffed&&nav.route(from,f.entrance)!==null);if(!f)throw new Error(`Cần ${buildingId} đã hoàn thành, có nhân lực và lối đi. Nền quy hoạch chưa hoạt động.`);return f;}
export function survivalCommand(original:Survival,citizens:Citizen[],nav:Navigation,tick:number,command:SurvivalCommand,seed:string,cap=FOUNDATION_CAPABILITIES):{survival:Survival;citizens:Citizen[]}{
 const s=structuredClone(original);if(command.type==='clean'){s.waste+=s.lots.filter(l=>l.spoiled&&l.location==='depot').reduce((n,l)=>n+l.quantity,0);s.lots=s.lots.filter(l=>l.location!=='depot'||!l.spoiled&&l.quantity>0);return {survival:s,citizens};}
 const c=citizens.find(c=>c.id===command.citizenId);if(!c)throw new Error('Không tìm thấy ID cư dân đã lưu.');const job=s.jobs.find(j=>j.citizenId===c.id);
 if(command.type==='cancel'){if(job?.cargo.length)throw new Error('Cư dân đang mang hàng; dùng Thử giao lại để không làm mất hàng.');s.jobs=s.jobs.filter(j=>j.citizenId!==c.id);return {survival:s,citizens:citizenCommand(citizens,nav,{type:'rest',ids:[c.id]})};}
 if(command.type==='retry'){if(!job)throw new Error('Không có công việc để tiếp tục.');const target=job.cargo.length?s.depot:job.target;if(nav.route(c.progress?c.path[0]:c,target)===null)throw new Error('Không có đường đến nơi cần giao/thu.');job.phase=job.cargo.length?'returning':'outbound';return {survival:s,citizens:citizenCommand(citizens,nav,{type:'move',ids:[c.id],target})};}
 if(job)throw new Error('Cư dân đang có việc; hủy hoặc giao hàng xong trước.');if(c.status==='moving'||c.progress)throw new Error('Chờ cư dân dừng hẳn trước khi giao việc mới.');
 let target:Cell,source:Cell,output:Job['output']=[],recipeId:string|null=null,workRequired=DAY,kind:Job['kind'],reservedTool:string|null=null;
 if(command.type==='process'){
  kind='process';recipeId=command.recipeId;const recipe=data.recipes.find(r=>r[0]===recipeId);if(!recipe)throw new Error('Công thức chưa hỗ trợ.');target=s.depot;source=s.depot;
  if(!['F001','F002','F003'].includes(recipeId)){const f=requireFacility(cap,'B007','T002',nav,c);if(['F060','F087'].includes(recipeId)&&!cap.technologies.includes('T102'))throw new Error('Cần Làm sạch nước sơ khai (T102).');target=f.entrance;if(!same(target,s.depot))throw new Error('Nguyên liệu chưa được vận chuyển đến bếp. Cần bếp có điểm nhận tại bãi tập kết.');}
  if(recipeId==='F003')throw new Error('Chưa có nguồn nấm được xác định an toàn trong bản đồ này.');
  const ingredients=data.ingredients.filter(r=>r[1]===recipeId);for(const r of ingredients)if(available(s,String(r[4]))<Number(r[6]))throw new Error(`Thiếu ${r[5]}: cần ${r[6]}.`);
  if(!ingredients.length)throw new Error('Công thức thiếu định mức nguyên liệu.');
  // Reserve by consuming inputs once at assignment. Cancellation never refunds expired inputs.
  for(const r of ingredients)consume(s,String(r[4]),Number(r[6]));const out=data.resources.find(r=>r.name===recipe[5]);if(!out)throw new Error('Không tìm thấy tài nguyên đầu ra.');output=[{resource:resource.parse(out.id),quantity:Number(recipe[6])}];workRequired=150;
 }else{
  kind=command.kind;source=pointSchema.parse(command.source);const info=sourceInfo(nav,source);if(info!==kind)throw new Error('Ô chọn không có nguồn phù hợp cho hoạt động.');
  target=source;
  if(kind==='gather'){if(s.jobs.some(j=>j.kind==='gather'&&same(j.source,source)))throw new Error('Nguồn đang được một cư dân thu hái.');const r=sourceRecord(s,source,tick,seed);if(!r.remaining)throw new Error(`Nguồn đang tái sinh đến ngày ${Math.floor(r.readyTick/DAY)+1}.`);output=[{resource:'R001',quantity:Math.min(Number(data.carryingCapacity),r.remaining)}];workRequired=450;}
  if(kind==='water'){requireFacility(cap,'B117','T093',nav,c);const access=[{x:source.x-1,y:source.y},{x:source.x+1,y:source.y},{x:source.x,y:source.y-1},{x:source.x,y:source.y+1}].find(p=>nav.walkable(p)&&nav.route(c,p)!==null);if(!access)throw new Error('Không có đường tới bờ nước.');target=access;output=[{resource:'R062',quantity:3}];workRequired=DAY*3/data.rawWaterPerDay;}
  if(kind==='hunt'){if(s.jobs.some(j=>j.kind==='hunt'&&same(j.source,source)))throw new Error('Bãi săn đang có cư dân làm việc.');requireFacility(cap,'B002','T001',nav,c);const tool=s.lots.find(l=>fresh(l)&&l.resource==='R125'&&l.location==='depot'&&!s.jobs.some(j=>j.reservedTool===l.id));if(!tool)throw new Error('Cần Công cụ đá (R125) chưa cấp cho người khác.');reservedTool=tool.id;if(s.sources.some(r=>r.key==='hunt:'+key(source)&&tick<r.readyTick))throw new Error('Bãi săn chưa phục hồi; đổi nguồn.');output=[{resource:'R008',quantity:1},{resource:'R058',quantity:.5}];workRequired=DAY;}
 }
 if(nav.route(c,target)===null||nav.route(target,s.depot)===null)throw new Error('Không có đường đi hai chiều giữa cư dân, nguồn và bãi tập kết.');
 const created:Job={id:`job-${++s.sequence}`,citizenId:c.id,kind,source,target,phase:'outbound',workDone:0,workRequired,recipeId,output,cargo:[],reservedTool};s.jobs.push(created);return {survival:s,citizens:citizenCommand(citizens,nav,{type:'move',ids:[c.id],target})};
}
/** One integer tick at a time: timer batching, speed and reload preserve event ordering. */
export function advanceSurvival(state:Survival,people:Citizen[],nav:Navigation,startTick:number,steps:number,seed:string,cap=FOUNDATION_CAPABILITIES){
 const s=structuredClone(state);let citizens=people;
 for(let n=1;n<=steps;n++){
  const tick=startTick+n,day=Math.floor(tick/DAY)+1;
  if(day!==s.day){s.previous={day:s.day,food:s.served.reduce((a,p)=>a+p.food,0),water:s.served.reduce((a,p)=>a+p.water,0)};s.day=day;s.served=s.served.map(p=>({...p,food:0,water:0}));s.lots=s.lots.filter(l=>l.quantity>0);}
  citizens=advanceCitizens(citizens,1);s.lots=ageLots(s,tick,cap);
  for(const job of [...s.jobs]){
   const c=citizens.find(c=>c.id===job.citizenId)!;
   if(c.status==='blocked'){job.phase='blocked';continue;}if(c.status==='resting'||c.status==='moving'||job.phase==='blocked')continue;
   if(job.phase==='outbound'&&same(c,job.target)){job.phase='working';continue;}
   if(job.phase==='working'){
    if(!same(c,job.target)){job.phase='blocked';continue;}
    const required=job.kind==='water'?{building:'B117',tech:'T093'}:job.kind==='hunt'?{building:'B002',tech:'T001'}:job.kind==='process'&&!['F001','F002'].includes(job.recipeId??'')?{building:'B007',tech:'T002'}:null;
    if(required&&(!cap.technologies.includes(required.tech)||!cap.facilities.some(f=>f.buildingId===required.building&&f.staffed&&nav.route(c,f.entrance)!==null))||job.kind==='process'&&['F060','F087'].includes(job.recipeId??'')&&!cap.technologies.includes('T102')||job.kind==='hunt'&&!s.lots.some(l=>l.id===job.reservedTool&&l.resource==='R125'&&fresh(l)&&l.location==='depot')){job.phase='blocked';continue;}
    job.workDone=Math.min(job.workRequired,job.workDone+1);
    if(job.workDone<job.workRequired)continue;
    if(s.lots.length+job.output.length>1024){job.phase='blocked';continue;}
    if(job.kind==='gather'){const r=sourceRecord(s,job.source,tick,seed);if(r.remaining<job.output[0].quantity){job.phase='blocked';continue;}r.remaining-=job.output[0].quantity;if(!r.remaining)r.readyTick=tick+Number(data.species.find(r=>r[0]==='SP001')![6])*DAY;}
    if(job.kind==='hunt'&&s.sources.length>=4096){job.phase='blocked';continue;}
    if(job.kind==='hunt'){const k='hunt:'+key(job.source),existing=s.sources.find(r=>r.key===k),readyTick=tick+Number(data.species.find(r=>r[0]==='SP015')![6])*DAY;if(existing){existing.remaining=0;existing.readyTick=readyTick;}else s.sources.push({key:k,remaining:0,readyTick});}
    job.cargo=job.output.map(out=>newLot(s,out.resource,out.quantity,tick,'citizen:'+c.id));job.phase='returning';citizens=citizenCommand(citizens,nav,{type:'move',ids:[c.id],target:s.depot});
   }else if(job.phase==='returning'&&same(c,s.depot)){
    for(const id of job.cargo){const lot=s.lots.find(l=>l.id===id);if(lot)lot.location='depot';}s.jobs=s.jobs.filter(j=>j.id!==job.id);
   }
  }
  // At most once per 1/10 day, plus delivery, avoids repeated BFS searches each tick.
  if(tick%180===0||s.jobs.length<state.jobs.length)distribute(s,citizens,nav);
 }
 return {survival:s,citizens};
}
export function validateSurvival(s:Survival,citizens:Citizen[],nav:Navigation,tick:number){
 if(s.day!==Math.floor(tick/DAY)+1||!nav.walkable(s.depot))throw new Error('Ngày/bãi tập kết sinh tồn không hợp lệ.');
 const ids=citizens.map(c=>c.id);if(new Set(s.served.map(p=>p.id)).size!==20||s.served.some(p=>!ids.includes(p.id)))throw new Error('Sổ cấp phát không khớp ID dân.');
 if([...s.lots,...s.jobs].some(x=>/^(lot|job)-[1-9][0-9]*$/.test(x.id)&&Number(x.id.split('-')[1])>s.sequence))throw new Error('Bộ đếm ID lô/công việc không hợp lệ.');
 if(s.sources.some(r=>!/^((hunt:)?[0-9]{1,3},[0-9]{1,3})$/.test(r.key)))throw new Error('ID nguồn không hợp lệ.');
 if(new Set(s.lots.map(l=>l.id)).size!==s.lots.length||new Set(s.jobs.map(j=>j.id)).size!==s.jobs.length||new Set(s.jobs.map(j=>j.citizenId)).size!==s.jobs.length||new Set(s.sources.map(r=>r.key)).size!==s.sources.length)throw new Error('ID lô/việc/nguồn bị trùng.');
 for(const l of s.lots){const days=ttl(l.resource);if(l.createdTick>tick||l.ageTicks>tick-l.createdTick||(days===null&&(l.expiresTick!==null||l.spoiled))||(days!==null&&(l.spoiled!==(l.ageTicks>=days*DAY)||l.expiresTick!==tick+Math.max(0,days*DAY-l.ageTicks)&&!l.spoiled))||l.location!=='depot'&&!l.location.startsWith('citizen:'))throw new Error('Tuổi, hạn hoặc nơi chứa lô không hợp lệ.');if(l.location.startsWith('citizen:')&&!s.jobs.some(j=>j.citizenId===l.location.slice(8)&&j.cargo.includes(l.id)))throw new Error('Hàng mang thiếu công việc sở hữu.');}
 for(const j of s.jobs){if(!nav.walkable(j.target)&&j.phase!=='blocked')throw new Error('Điểm làm việc đã bị chặn.');if(j.kind==='water'||j.kind==='hunt'||j.kind==='process'&&!['F001','F002'].includes(j.recipeId??''))throw new Error('Hoạt động cần công trình/công nghệ chưa hoàn thành.');if(j.kind==='gather'&&(sourceInfo(nav,j.source)!=='gather'||j.workRequired!==450||j.output.length!==1||j.output[0].resource!=='R001'||j.output[0].quantity>3))throw new Error('Nguồn/sản lượng hái lượm không hợp lệ.');if(j.kind==='process'&&(j.workRequired!==150||j.output.length!==1||j.output[0].resource!=='R030'||j.output[0].quantity!==1))throw new Error('Công thức không hợp lệ.');if(new Set(j.cargo).size!==j.cargo.length||!ids.includes(j.citizenId)||j.workDone>j.workRequired||j.cargo.some(id=>!s.lots.some(l=>l.id===id&&l.location==='citizen:'+j.citizenId)))throw new Error('Công việc/hàng mang không hợp lệ.');}
 return s;
}
