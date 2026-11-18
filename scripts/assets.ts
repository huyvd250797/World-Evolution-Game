import {readFile,writeFile} from 'node:fs/promises';
import {digest} from './catalog';
const definitions={landscape:{path:'/assets/landscape-v1.svg',kind:'illustration',gameplay:false},icon:{path:'/assets/icon-v1.svg',kind:'icon',gameplay:false}};
const assets:Record<string,unknown>={};for(const[id,asset]of Object.entries(definitions)){const bytes=await readFile(`public${asset.path}`);assets[id]={...asset,sizeBytes:bytes.length,sha256:digest(bytes)};}
const json=JSON.stringify({version:'0.1.0',assets},null,2)+'\n';
if(process.argv.includes('--check')){if(await readFile('data/generated/assets.json','utf8')!==json)throw new Error('Asset manifest khác file tĩnh. Chạy npm run assets:manifest và đổi URL nếu đã phát hành.');console.log('Asset manifest verified.');}else await writeFile('data/generated/assets.json',json);
