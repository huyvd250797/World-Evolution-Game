import {readFile,writeFile} from 'node:fs/promises';
const c=JSON.parse(await readFile('data/generated/catalog.json','utf8'));
const sheet=(n:string)=>c.sheets.find((s:{name:string})=>s.name===n).rows as (string|number)[][];
const cfg=(id:string)=>Number(sheet('CAU HINH GAME').find(r=>r[0]===id)![2]);
const result=JSON.stringify({version:1,walkingTilesPerDay:cfg('CFG059'),homelessGraceDays:cfg('CFG053'),initialPopulation:cfg('CFG003'),homes:sheet('NHA O & DAN SO').map(r=>({id:r[0],buildingId:r[1],name:r[2],era:r[3],capacity:r[4],conditions:r[9],rule:r[10]}))},null,2)+'\n';
const path='data/generated/population.json';if(process.argv.includes('--check')){if(await readFile(path,'utf8')!==result)throw new Error('Population adapter differs from Frozen');console.log('Population: CFG059/CFG053/CFG003 and 8 housing rows verified.');}else await writeFile(path,result);
