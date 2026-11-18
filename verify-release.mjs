import {readFile,access} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
export async function verifyRelease(root=process.cwd()){
 const read=async path=>{try{return await readFile(resolve(root,path));}catch{throw new Error(`Thiếu file phát hành: ${path}. Upload đầy đủ source và chọn Root Directory chứa package.json.`);}};
 const json=async path=>JSON.parse((await read(path)).toString('utf8'));
 const pkg=await json('package.json'),catalog=await json('data/generated/catalog.json'),summary=await json('data/generated/summary.json'),assets=await json('data/generated/assets.json');
 if(catalog.version!=='1.2'||catalog.sheets?.length!==38)throw new Error('Catalog Frozen V1.2 cần đủ 38 sheet.');
 const checksum=sha(JSON.stringify(catalog));
 if(checksum!==pkg.worldEvolution.catalogSha256||checksum!==summary.catalogSha256)throw new Error('Checksum catalog khác bản Canonical đã chốt. Khôi phục data/generated từ gói source.');
 if(catalog.sourceSha256!==pkg.worldEvolution.sourceSha256||summary.sourceSha256!==catalog.sourceSha256)throw new Error('Checksum nguồn Master Data không nhất quán.');
 for(const sheet of catalog.sheets)if(sheet.rows.length!==summary.counts[sheet.name])throw new Error(`Số dòng không khớp: ${sheet.name}`);
 const cfg=id=>catalog.sheets.find(s=>s.name==='CAU HINH GAME').rows.find(r=>r[0]===id)?.[2];
 for(const[key,id]of Object.entries({initialPopulation:'CFG003',populationLimit:'CFG047',minPopulationLimit:'CFG048',maxPopulationLimit:'CFG049'}))if(summary.defaults[key]!==cfg(id))throw new Error(`Cấu hình ${key} không khớp Canonical.`);
 for(const[id,asset]of Object.entries(assets.assets)){
  if(!/^\/assets\/[a-zA-Z0-9_.-]+$/.test(asset.path))throw new Error(`Asset path không hợp lệ: ${id}`);
  const bytes=await read('public'+asset.path);if(bytes.length!==asset.sizeBytes||sha(bytes)!==asset.sha256)throw new Error(`Asset không khớp manifest: ${id}`);
 }
 // Workbook is a build-time authoring input, not a web runtime dependency.
 const workbook='data/source/World-Evolution-Master-Data-v1.2-Canonical.xlsx';
 let included=true;try{await access(resolve(root,workbook));}catch{included=false;}
 if(included&&sha(await read(workbook))!==pkg.worldEvolution.sourceSha256)throw new Error('Workbook Frozen đã bị thay đổi.');
 console.log(`Release ${pkg.version}: Canonical V1.2, 38 sheets, catalog SHA-256 và assets hợp lệ.`);
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href)verifyRelease().catch(e=>{console.error('Release verification failed:',e.message);process.exitCode=1;});
