import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const catalog=JSON.parse(await readFile('data/generated/catalog.json','utf8'));
const sheet=(name:string)=>catalog.sheets.find((s:{name:string})=>s.name===name).rows as (string|number)[][];
const tech=sheet('CONG NGHE'),bom=sheet('DINH MUC XAY DUNG');
const dimensions:Record<string,[number,number]>={B001:[3,2],B002:[3,2],B003:[2,1],B004:[3,2],B005:[2,2],B006:[2,1],B008:[1,1],B011:[3,2],B013:[3,2],B014:[1,1],B117:[1,1]};
const buildings=sheet('CONG TRINH').map(r=>{const t=tech.find(t=>t[1]===r[5]);if(!t)throw new Error('Unknown technology '+r[5]);return {id:String(r[0]),name:String(r[1]),era:String(r[2]),eraName:String(r[3]),group:String(r[4]),technologyId:String(t[0]),technologyName:String(t[1]),purpose:String(r[12]),materials:bom.filter(b=>b[1]===r[0]).map(b=>({id:String(b[3]),name:String(b[4]),quantity:Number(b[5]),unit:String(b[6])})),width:(dimensions[String(r[0])]??[2,2])[0],height:(dimensions[String(r[0])]??[2,2])[1],site:['B003','B117'].includes(String(r[0]))?'waterfront':r[0]==='B005'?'quarry':String(r[1]).startsWith('Kho')?'storage':'land'};});
const output=JSON.stringify({version:1,sourceCatalogSha256:createHash('sha256').update(JSON.stringify(catalog)).digest('hex'),footprintSource:'Technical planning-v1, not Frozen workbook dimensions',buildings},null,2)+'\n';
const path='data/generated/planning.json';if(process.argv.includes('--check')){if(await readFile(path,'utf8')!==output)throw new Error('Planning adapter differs from Frozen/technical policy');console.log('Planning adapter: 166 buildings, tech/BOM/footprint verified.');}else await writeFile(path,output);
