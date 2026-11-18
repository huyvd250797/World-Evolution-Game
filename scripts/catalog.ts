import { unzipSync, strFromU8 } from 'fflate';
import { XMLParser } from 'fast-xml-parser';
import { posix } from 'node:path';
import { createHash } from 'node:crypto';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
export type Cell = string | number | boolean | null;
export type Sheet = { name: string; title: string; description: string; headers: string[]; rows: Cell[][] };
export type Catalog = { version: '1.2'; schemaVersion: 1; sourceSha256: string; sheets: Sheet[] };
export const sourcePath = 'data/source/World-Evolution-Master-Data-v1.2-Canonical.xlsx';
export const digest = (bytes: string | Buffer) => createHash('sha256').update(bytes).digest('hex');
// Parse OOXML namespace prefixes without rewriting the Frozen workbook.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const list = (v: any): any[] => v == null ? [] : Array.isArray(v) ? v : [v];
export async function loadWorkbook(path = sourcePath): Promise<Catalog> {
 const bytes=await readFile(path);const zip=unzipSync(bytes);
 const parser=new XMLParser({ignoreAttributes:false,removeNSPrefix:true,parseTagValue:false,trimValues:false});
 const xml=(name:string)=>{if(!zip[name])throw new Error(`Thiếu OOXML ${name}`);return parser.parse(strFromU8(zip[name]));};
 // eslint-disable-next-line @typescript-eslint/no-explicit-any
 const text=(v:any):string=>typeof v==='string'?v: v?.['#text']??list(v?.r).map(r=>text(r.t)).join('');
 const shared=zip['xl/sharedStrings.xml']?list(xml('xl/sharedStrings.xml').sst.si).map(si=>text(si.t??si)):[];
 const relationships=new Map(list(xml('xl/_rels/workbook.xml.rels').Relationships.Relationship).map(r=>[r['@_Id'],r['@_Target']]));
 const sheets:Sheet[]=list(xml('xl/workbook.xml').workbook.sheets.sheet).map(s=>{
  const target=String(relationships.get(s['@_id']));
  const name=target.startsWith('/')?target.slice(1):posix.normalize(posix.join('xl',target));
  const rows:Cell[][]=[];let columns=0;
  for(const r of list(xml(name).worksheet.sheetData.row)){
   const row:Cell[]=[];
   for(const c of list(r.c)){
    const letters=String(c['@_r']).match(/^[A-Z]+/)?.[0];if(!letters)throw new Error('Ô thiếu địa chỉ');
    const col=[...letters].reduce((n,x)=>n*26+x.charCodeAt(0)-64,0)-1;
    const v=c.v;let val:Cell=null;
    if(c['@_t']==='s')val=shared[Number(v)];
    else if(c['@_t']==='inlineStr')val=text(c.is?.t??c.is);
    else if(c['@_t']==='b')val=v==='1';
    else if(v!==undefined)val=c['@_t']==='str'?String(v):Number(v);
    if(val===undefined || (typeof val==='number'&&!Number.isFinite(val)))throw new Error(`Ô không hợp lệ ${s['@_name']}/${c['@_r']}`);
    row[col]=val;columns=Math.max(columns,col+1);
   }
   rows[Number(r['@_r'])-1]=row;
  }
  const normalized=Array.from({length:rows.length},(_,i)=>Array.from({length:columns},(_,j)=>rows[i]?.[j]??null));
  return {name:s['@_name'],title:String(normalized[0]?.[0]??''),description:String(normalized[1]?.[0]??''),headers:normalized[3].map(x=>String(x??'')),rows:normalized.slice(4).filter(r=>r.some(x=>x!==null))};
 });
 return {version:'1.2',schemaVersion:1,sourceSha256:digest(bytes),sheets};
}
export function validateCatalog(c: Catalog) {
 const errors: string[]=[]; const sheet=(name:string)=>c.sheets.find(s=>s.name===name);
 const expected: Record<string,number>={'THOI DAI':9,'TAI NGUYEN':230,'VAI TRO':96,'CONG TRINH':166,'CONG NGHE':140,'CONG THUC':102};
 if(c.sheets.length!==38)errors.push(`Cần 38 sheet, nhận ${c.sheets.length}`);
 for(const [name,n] of Object.entries(expected))if(sheet(name)?.rows.length!==n)errors.push(`${name}: cần ${n} bản ghi`);
 const idSheets=c.sheets.filter(s=>!['TONG QUAN','HUONG DAN','KIEM TRA DU LIEU'].includes(s.name));
 for(const s of idSheets){const ids=new Set<Cell>(); for(const row of s.rows){if(row[0]===null||row[0]==='') errors.push(`${s.name}: thiếu khóa`); if(ids.has(row[0]))errors.push(`${s.name}: khóa trùng ${row[0]}`);ids.add(row[0]);}}
 const targets: Record<string,string>={'Công trình ID':'CONG TRINH','Tài nguyên ID':'TAI NGUYEN','ID tài nguyên':'TAI NGUYEN','ID vật phẩm':'TAI NGUYEN','Vai trò ID':'VAI TRO','Nghề ID':'VAI TRO','Công nghệ ID':'CONG NGHE','Tech ID':'CONG NGHE','Công thức ID':'CONG THUC','Loài ID':'HE SINH THAI','ID thú săn':'HE SINH THAI','ID con mồi':'HE SINH THAI','Nơi đào tạo ID':'CONG TRINH','Chuồng ID':'CONG TRINH','Ô nhiễm ID':'O NHIEM & XU LY'};
 let checked=0;
 for(const s of c.sheets){s.headers.forEach((header,col)=>{let target=targets[header]; if(header==='ID liên kết'&&s.name==='LIEN KET NGHIEN CUU')target='';
  if(['Thời đại','Từ thời đại','Sang','Tiến đến','Mở từ','Xuất hiện từ'].includes(header))target='THOI DAI';
  if(s.name==='THOI DAI'&&header==='Thời đại')return;
  if(!target)return; const valid=new Set(sheet(target)?.rows.map(r=>String(r[0])));
  for(const row of s.rows){const v=row[col];if(v===null||v===''||v==='—'||v==='-')continue;const tokens=String(v).split(/[;,]/).map(x=>x.trim());for(const token of tokens){checked++;if(!valid.has(token))errors.push(`${s.name}/${row[0]}/${header}: ${token} không có trong ${target}`);}}
 });}
 for(const row of sheet('LIEN KET NGHIEN CUU')?.rows??[]){const target=String(row[3]).includes('tiên quyết')?'CONG NGHE':'CONG TRINH';checked++;if(!sheet(target)?.rows.some(r=>r[0]===row[4]))errors.push(`LIEN KET NGHIEN CUU/${row[0]}: liên kết ${row[4]} không hợp lệ`);}
 const config=sheet('CAU HINH GAME');const cfg=(id:string)=>config?.rows.find(r=>r[0]===id)?.[2];
 for(const [id,n] of Object.entries({CFG003:20,CFG047:200,CFG048:20,CFG049:100000}))if(cfg(id)!==n)errors.push(`${id}: khác baseline Frozen`);
 return {errors,checkedReferences:checked,counts:Object.fromEntries(c.sheets.map(s=>[s.name,s.rows.length]))};
}
export async function generate(check=false){
 const c=await loadWorkbook();const frozen=JSON.parse(await readFile('data/source/frozen.json','utf8'));if(c.sourceSha256!==frozen.sourceSha256)throw new Error('Workbook khác checksum Frozen V1.2. Không tự cập nhật baseline.');const report=validateCatalog(c);if(report.errors.length)throw new Error(report.errors.join('\n'));
 const raw=JSON.stringify(c);const checksum=digest(raw);
 const get=(name:string)=>c.sheets.find(s=>s.name===name)!;
 const cfg=(id:string)=>Number(get('CAU HINH GAME').rows.find(r=>r[0]===id)![2]);
 const summary={version:c.version,schemaVersion:1,sourceSha256:c.sourceSha256,catalogSha256:checksum,checkedReferences:report.checkedReferences,counts:report.counts,
  defaults:{initialPopulation:cfg('CFG003'),populationLimit:cfg('CFG047'),minPopulationLimit:cfg('CFG048'),maxPopulationLimit:cfg('CFG049')},
  climates:get('VUNG KHI HAU').rows.map(r=>({id:String(r[0]),name:String(r[1]),description:String(r[2])})),
  eras:get('THOI DAI').rows.map(r=>({id:String(r[0]),name:String(r[1])})),
  sheets:c.sheets.map(s=>({name:s.name,title:s.title,count:s.rows.length,description:s.description}))};
 const artifacts:{[key:string]:string}={'catalog.json':raw+'\n','summary.json':JSON.stringify(summary,null,2)+'\n'};
 await mkdir('data/generated',{recursive:true});
 for(const [name,content]of Object.entries(artifacts)){const path=`data/generated/${name}`;if(check){if(await readFile(path,'utf8')!==content)throw new Error(`${path} không khớp workbook, chạy npm run data:import`);}else await writeFile(path,content);}
 console.log(`Catalog V1.2: 38 sheets; ${report.checkedReferences} references; SHA256 ${checksum}`);
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href)generate(process.argv.includes('--check')).catch(e=>{console.error(e.message);process.exitCode=1;});
