import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {loadWorkbook,validateCatalog,digest} from '../scripts/catalog';
import {master} from '../src/game/data/index';
test('Workbook Frozen and generated JSON are byte-verifiable',async()=>{const c=await loadWorkbook();assert.equal(c.sourceSha256,master.sourceSha256);assert.equal(digest(JSON.stringify(c)),master.catalogSha256);assert.equal(JSON.stringify(c)+'\n',await readFile('data/generated/catalog.json','utf8'));const r=validateCatalog(c);assert.deepEqual(r.errors,[]);assert.equal(r.checkedReferences,5984);});
test('Validator rejects duplicate IDs, absent IDs and broken foreign references',async()=>{const c=await loadWorkbook();const resources=c.sheets.find(s=>s.name==='TAI NGUYEN')!;resources.rows[1][0]=resources.rows[0][0];const refs=c.sheets.find(s=>s.name==='DINH MUC XAY DUNG')!;refs.rows[0][1]='B999999';resources.rows[2][0]=null;const errors=validateCatalog(c).errors;assert.ok(errors.some(e=>e.includes('khóa trùng')));assert.ok(errors.some(e=>e.includes('thiếu khóa')));assert.ok(errors.some(e=>e.includes('B999999')));});
test('Validator rejects invalid polymorphic technology references and changed defaults',async()=>{const c=await loadWorkbook();c.sheets.find(s=>s.name==='LIEN KET NGHIEN CUU')!.rows[0][4]='T9999';c.sheets.find(s=>s.name==='CAU HINH GAME')!.rows.find(r=>r[0]==='CFG003')![2]=21;const errors=validateCatalog(c).errors;assert.ok(errors.some(e=>e.includes('T9999')));assert.ok(errors.some(e=>e.includes('CFG003')));});
