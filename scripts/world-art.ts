/** Original, deterministic vector sprite atlas. Rasterize once with: npm run assets:world */
import {writeFile} from 'node:fs/promises';
import sharp from 'sharp';
const palette=[['water','#609faa','#467f8f','#3f7283'],['bank','#d1c093','#b19e72','#aa9166'],['grass','#9baa72','#7c8e5d','#6d8255'],['forest','#7d975d','#5c7949','#526c43'],['hill','#a7aa7e','#858d64','#78855e'],['mountain','#a4a794','#868d7e','#788475'],['snow','#dbe2d8','#b5c4bd','#a4b6b1']];
const frames:Record<string,unknown>={};let shapes='';let col=0,row=0;
function add(name:string,body:string,w=128,h=160){const x=col*128,y=row*160;shapes+=`<g transform="translate(${x} ${y})">${body}</g>`;frames[name]={frame:{x,y,w,h},rotated:false,trimmed:false,spriteSourceSize:{x:0,y:0,w,h},sourceSize:{w,h}};col++;if(col===8){col=0;row++;}}
const shade=(hex:string,d:number)=>'#'+hex.slice(1).match(/../g)!.map(x=>Math.max(0,Math.min(255,parseInt(x,16)+d)).toString(16).padStart(2,'0')).join('');
for(const [name,top,left,right]of palette)for(let v=0;v<4;v++){
 const c=shade(top,(v-1)*3);const marks=name==='water'?`<path d="M15 17l12-3m9 8 13-3" stroke="#bed9d0" stroke-width="1" opacity=".38"/>`:`<path d="M13 17l5-1m20-4 4 1M29 25l7-2" stroke="${shade(c,-20)}" opacity=".27"/>`;
 add(`${name}-${v}`,`<path d="M0 16l32 16v9L0 25z" fill="${left}"/><path d="m32 32 32-16v9L32 41z" fill="${right}"/><path d="M0 16 32 0l32 16-32 16z" fill="${c}"/>${marks}`,64,44);
}
const shadow='<ellipse cx="64" cy="143" rx="28" ry="10" fill="#34442d" opacity=".17"/>';
add('pine',`${shadow}<path d="M61 102h7v44l-7 3z" fill="#77664b"/><path d="M64 18 28 111l36 20 36-20z" fill="#4a7150"/><path d="M64 18v113l36-20z" fill="#355b43"/><path d="M64 2 35 77l29 17 29-17z" fill="#618256"/><path d="M64 2v92l29-17z" fill="#456b4c"/><path d="m48 68 10-6M41 99l13-8" stroke="#78925c" opacity=".6"/>`);
add('pine-small',`${shadow}<path d="M61 106h6v39h-6z" fill="#7e7050"/><path d="m64 34-30 74 30 18 30-18z" fill="#688a59"/><path d="M64 34v92l30-18z" fill="#486f4c"/><path d="m64 17-23 59 23 13 23-13z" fill="#789a66"/><path d="M64 17v72l23-13z" fill="#527e53"/>`);
add('broadleaf',`${shadow}<path d="M59 79h10v67l-10 3z" fill="#8c7755"/><path d="m65 108-17-16m16 8 18-16" stroke="#8c7755" stroke-width="5"/><path d="M25 75q-9-31 13-40 4-26 29-21 22-9 34 16 20 2 22 29 12 24-11 39-20 20-43 9-30 8-44-32" fill="#597c4d"/><path d="M64 17q23-9 37 13 20 2 22 29 12 24-11 39-20 20-43 9L64 17" fill="#45683f"/><path d="M31 62q-1-24 24-28 15-18 34 1-24-2-31 23z" fill="#7e985b"/><path d="M34 91q3-13 23-12" stroke="#779257" stroke-width="6"/>`);
add('peak',`${shadow}<path d="m5 126 46-95 23-14 48 111-57 26z" fill="#8d978b"/><path d="m51 31 14 123 57-26L74 17z" fill="#6d7d75"/><path d="m51 31 23-14 19 44-18-4-14 12z" fill="#c2c5ae"/><path d="m51 31-10 71 12-17 12 69" stroke="#acb19c" stroke-width="3" opacity=".6"/>`);
add('snow-peak',`${shadow}<path d="m6 128 48-101 21-14 47 114-57 28z" fill="#9aaea5"/><path d="m54 27 11 128 57-28L75 13z" fill="#7a938e"/><path d="m54 27 21-14 28 67-21-13-13 23-16-18-19 2z" fill="#e8ece0"/><path d="m75 13-6 77 13-23 21 13z" fill="#d0ded5"/>`);
add('rocks',`${shadow}<path d="m26 126 8-22 23-11 22 15 7 27-32 14z" fill="#a1a38e"/><path d="m57 93-3 56 32-14-7-27z" fill="#7b8977"/><path d="m83 128 7-17 19 4 9 21-20 9z" fill="#a6ab96"/><path d="m32 110 22-8 18 8" stroke="#c1c1aa" stroke-width="3"/>`);
add('flint',`${shadow}<path d="m36 129 7-31 20-15 20 17 7 31-26 20z" fill="#6e8279"/><path d="m63 83 1 68 26-20-7-31z" fill="#506b64"/><path d="m43 98 20-15-8 30z" fill="#b1bbb0"/><path d="m43 123 12-10 9 21" stroke="#d2d3b5" stroke-width="2"/>`);
add('berries',`${shadow}<path d="M24 131q-3-18 14-21-1-25 22-20 23-13 30 9 25 2 19 23 10 16-18 23-35 15-67-14" fill="#5d7b42"/><path d="M42 118q-4-16 16-20 17-8 25 6" stroke="#849653" stroke-width="6"/><g fill="#bd7b66"><circle cx="44" cy="127" r="4"/><circle cx="69" cy="111" r="4"/><circle cx="86" cy="130" r="4"/><circle cx="65" cy="138" r="4"/></g>`);
add('herbs',`${shadow}<path d="m64 147-4-45m4 37-20-22m20 14 19-25" stroke="#6d8150" stroke-width="4"/><path d="M58 117q-24 2-23-19 19 1 23 19m7 11q22 0 25-22-20 3-25 22m-7-21q-10-22 6-31 10 24-6 31" fill="#91a463"/><g fill="#e1d99b"><circle cx="42" cy="98" r="5"/><circle cx="88" cy="108" r="5"/><circle cx="63" cy="79" r="5"/></g>`);
add('reeds',`${shadow}<path d="M47 145V96m11 47 4-57m10 57 5-40m7 38 6-23" stroke="#8c9260" stroke-width="3"/><path d="m43 94 7-2v17l-7 2zm16-11 7-1-1 19-7 1zm16 17 6-1-2 16-6 1z" fill="#a18853"/>`);
const count=row+(col?1:0),width=1024,height=count*160;
const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${shapes}</svg>`;
await writeFile('public/assets/world-e0-atlas-v1.svg',svg);
await sharp(Buffer.from(svg)).png({compressionLevel:9}).toFile('public/assets/world-e0-atlas-v1.png');
await writeFile('public/assets/world-e0-atlas-v1.json',JSON.stringify({frames,meta:{app:'World Evolution original vector atlas',version:'1',image:'world-e0-atlas-v1.png',format:'RGBA8888',size:{w:width,h:height},scale:'1'}},null,2)+'\n');
console.log(`World atlas: ${Object.keys(frames).length} frames, ${width} × ${height}`);
