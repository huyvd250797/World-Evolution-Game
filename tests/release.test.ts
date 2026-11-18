import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,cp,rm,readFile,writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {resolve,join} from 'node:path';
import {spawnSync} from 'node:child_process';
test('Production release verification works independently of import tooling and rejects incomplete/corrupt data',async t=>{
 const dir=await mkdtemp(join(tmpdir(),'we-release-'));const script=resolve('verify-release.mjs');
 const run=()=>spawnSync(process.execPath,[script],{cwd:dir,encoding:'utf8'});
 try{
  await cp('data/generated',join(dir,'data/generated'),{recursive:true});await cp('public/assets',join(dir,'public/assets'),{recursive:true});await cp('package.json',join(dir,'package.json'));
  await t.test('No scripts/tests/workbook required for production verification',()=>{const result=run();assert.equal(result.status,0,result.stderr);assert.match(result.stdout,/38 sheets/);});
  await t.test('Catalog corruption fails checksum verification',async()=>{const path=join(dir,'data/generated/catalog.json');const original=await readFile(path,'utf8');const data=JSON.parse(original);data.sheets[0].title='changed';await writeFile(path,JSON.stringify(data));const result=run();assert.notEqual(result.status,0);assert.match(result.stderr,/Checksum catalog/);await writeFile(path,original);});
  await t.test('Missing generated file gives actionable upload/root error',async()=>{await rm(join(dir,'data/generated/summary.json'));const result=run();assert.notEqual(result.status,0);assert.match(result.stderr,/Thiếu file phát hành.*summary.json/);});
 }finally{await rm(dir,{recursive:true,force:true});}
});
