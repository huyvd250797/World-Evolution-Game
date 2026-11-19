import {readFile,writeFile} from 'node:fs/promises';
const c=JSON.parse(await readFile('data/generated/catalog.json','utf8'));
const sheet=(n:string)=>c.sheets.find((s:{name:string})=>s.name===n).rows as (string|number|null)[][];
const cfg=(id:string)=>Number(sheet('CAU HINH GAME').find(r=>r[0]===id)![2]);
const resources=sheet('TAI NGUYEN');
const ids=['R001','R002','R003','R004','R005','R006','R007','R008','R009','R030','R031','R032','R033','R058','R062','R067','R125','R167','R213'];
const result=JSON.stringify({version:1,foodPerPerson:cfg('CFG004'),waterPerPerson:cfg('CFG005'),rawWaterPerDay:cfg('CFG018'),carryingCapacity:sheet('GIAO THONG & HAU CAN')[0][7],resources:resources.filter(r=>ids.includes(String(r[0]))).map(r=>({id:r[0],name:r[1],unit:r[5],ttlDays:typeof r[6]==='number'?r[6]:null,storage:r[7]})),preservation:sheet('BAO QUAN & KHO').filter(r=>ids.includes(String(r[0]))),recipes:sheet('CONG THUC').filter(r=>['F001','F002','F003','F004','F005','F006','F060','F087'].includes(String(r[0]))),ingredients:sheet('NGUYEN LIEU CONG THUC').filter(r=>['F001','F002','F003','F004','F005','F006','F060','F087'].includes(String(r[1]))),species:sheet('HE SINH THAI').filter(r=>['SP001','SP015'].includes(String(r[0])))},null,2)+'\n';
const path='data/generated/survival.json';if(process.argv.includes('--check')){if(await readFile(path,'utf8')!==result)throw new Error('Survival adapter differs from Frozen');console.log('Survival: demand, storage, recipes, ecology and carrying capacity verified.');}else await writeFile(path,result);
