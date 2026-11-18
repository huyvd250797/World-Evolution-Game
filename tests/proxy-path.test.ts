import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import ts from 'typescript';
const options=ts.convertCompilerOptionsFromJson(JSON.parse(await readFile('tsconfig.json','utf8')).compilerOptions,process.cwd()).options;
const modulePath=(specifier:string,entry:string)=>ts.resolveModuleName(specifier,resolve(entry),options,ts.sys).resolvedModule?.resolvedFileName;
test('Regression: old relative config import fails at repository root; alias resolves at either location',()=>{
 assert.equal(modulePath('./lib/config','proxy.ts'),undefined);
 assert.equal(modulePath('@/lib/config','proxy.ts'),modulePath('@/lib/config','src/proxy.ts'));
 assert.ok(modulePath('@/lib/config','proxy.ts')?.endsWith('/src/lib/config.ts'));
 assert.ok(modulePath('@/lib/supabase/proxy','proxy.ts')?.endsWith('/src/lib/supabase/proxy.ts'));
});
test('Root and src entries are identical and route to one session implementation',async()=>{
 const root=await readFile('proxy.ts','utf8'),src=await readFile('src/proxy.ts','utf8');assert.equal(root,src);assert.ok(root.includes("from '@/lib/supabase/proxy'"));assert.ok(!root.includes('./lib/config'));
});
test('All internal runtime TypeScript imports resolve including root entry',async()=>{
 async function walk(dir:string):Promise<string[]>{const out:string[]=[];for(const e of await readdir(dir,{withFileTypes:true})){const p=join(dir,e.name);if(e.isDirectory())out.push(...await walk(p));else if(/\.tsx?$/.test(p))out.push(p);}return out;}
 const errors:string[]=[];for(const file of ['proxy.ts',...await walk('src')]){
  const source=ts.createSourceFile(file,await readFile(file,'utf8'),ts.ScriptTarget.Latest,true);
  for(const stmt of source.statements){if((ts.isImportDeclaration(stmt)||ts.isExportDeclaration(stmt))&&stmt.moduleSpecifier&&ts.isStringLiteral(stmt.moduleSpecifier)){
   const name=stmt.moduleSpecifier.text;if((name.startsWith('.')||name.startsWith('@/'))&&!/\.css$/.test(name)&&!modulePath(name,file))errors.push(`${file}: ${name}`);
  }}
 }assert.deepEqual(errors,[]);
});
