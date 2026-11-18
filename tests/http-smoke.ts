import {spawn} from 'node:child_process';
import {readFile} from 'node:fs/promises';
import {createServerClient} from '@supabase/ssr';
import assert from 'node:assert/strict';
import {decodeHead,control,advance,sha256} from '../src/game/simulation/engine';
const env={...process.env,NEXT_PUBLIC_SUPABASE_URL:'http://127.0.0.1:54329',NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:'fixture-public-key',NEXT_PUBLIC_ASSET_BASE_URL:''};
const fixture=spawn(process.execPath,['--import','tsx','tests/fixture-server.ts'],{env,stdio:['ignore','pipe','pipe']});
const app=spawn(process.execPath,['node_modules/next/dist/bin/next','dev','--hostname','127.0.0.1','--port','3000'],{env,stdio:['ignore','pipe','pipe']});
let logs='';for(const p of [fixture,app])for(const stream of [p.stdout,p.stderr])stream?.on('data',x=>{logs+=x;});
async function wait(url:string){for(let i=0;i<120;i++){try{const r=await fetch(url);if(r.ok)return;}catch{}await new Promise(r=>setTimeout(r,250));}throw new Error('Server startup failed '+logs);}
try{
 await wait('http://127.0.0.1:54329/health');await wait('http://127.0.0.1:3000/login');
 const base='http://127.0.0.1:3000';
 const unauth=await fetch(base+'/worlds',{redirect:'manual'});const unauthHTML=await unauth.text();assert.ok(unauth.status===307?unauth.headers.get('location')?.includes('/login'):unauthHTML.includes('NEXT_REDIRECT')&&unauthHTML.includes('/login'));
 const loginHTML=await(await fetch(base+'/login')).text();
 const cookies=new Map<string,string>();const auth=createServerClient(env.NEXT_PUBLIC_SUPABASE_URL,env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,{cookies:{getAll:()=>[...cookies].map(([name,value])=>({name,value})),setAll:items=>items.forEach(x=>cookies.set(x.name,x.value))}});
 const {error}=await auth.auth.signInWithPassword({email:'alice@example.test',password:'Password123!'});assert.equal(error,null);
 const cookie=()=>[...cookies].map(([k,v])=>`${k}=${encodeURIComponent(v)}`).join('; ');
 const decode=(s:string)=>s.replaceAll('&quot;','"').replaceAll('&amp;','&').replaceAll('&#x27;',"'");
 function loginForm(password:string,mode='login'){const form=new FormData();for(const tag of loginHTML.match(/<input[^>]*type="hidden"[^>]*>/g)??[]){const name=tag.match(/name="([^"]+)"/)?.[1];const value=tag.match(/value="([^"]*)"/)?.[1]??'';if(name)form.set(decode(name),decode(value));}form.set('mode',mode);form.set('email','alice@example.test');form.set('password',password);form.set('confirmation',password);return form;}
 const rejected=await fetch(base+'/login',{method:'POST',headers:{Origin:base},body:loginForm('WrongPassword'),redirect:'manual'});assert.ok((await rejected.text()).includes('Email hoặc mật khẩu chưa đúng'));
 const accepted=await fetch(base+'/login',{method:'POST',headers:{Origin:base},body:loginForm('Password123!'),redirect:'manual'});assert.equal(accepted.status,303);assert.equal(accepted.headers.get('location'),'/worlds');assert.ok(accepted.headers.getSetCookie().some(x=>x.includes('auth-token')));
 const register=loginForm('Password123!','register');register.set('email','new@example.test');const signup=await fetch(base+'/login',{method:'POST',headers:{Origin:base},body:register});assert.ok((await signup.text()).includes('thư xác nhận đã được gửi'));
 const callback=await fetch(base+'/auth/callback?next=https://evil.example',{redirect:'manual'});assert.equal(callback.headers.get('location'),base+'/login?notice=callback');
 
 const list=await fetch(base+'/worlds',{headers:{cookie:cookie()}});const html=await list.text();assert.equal(list.status,200);assert.ok(html.includes('Trang đầu tiên còn để ngỏ'));
 // Client action references compile lazily when the page loads.
 const manifest=JSON.parse(await readFile('.next/dev/server/server-reference-manifest.json','utf8'));
 const findAction=(name:string)=>Object.entries(manifest.node).find(([,v])=>JSON.stringify(v).includes(`\"exportedName\":\"${name}\"`))?.[0];
 const ids=Object.fromEntries(['createWorld','updateWorld','deleteWorld'].map(n=>[n,findAction(n)]));
 if(Object.values(ids).some(x=>!x))throw new Error('Action IDs absent: '+JSON.stringify(manifest).slice(0,2500));
 async function action(name:string,input:unknown){const r=await fetch(base+'/worlds',{method:'POST',headers:{cookie:cookie(),'Next-Action':ids[name]!,Origin:base,'Content-Type':'text/plain;charset=UTF-8'},body:JSON.stringify([input])});const text=await r.text();assert.equal(r.status,200,text.slice(0,1200));return text;}
 const created=await action('createWorld',{name:'HTTP Smoke',seed:'HTTP-2026',climateId:'B01',populationLimit:200,requestId:crypto.randomUUID()});const id=created.match(/"worldId":"([a-f0-9-]+)"/)?.[1];assert.ok(id,created.slice(0,1500));
 const detail=await(await fetch(base+`/worlds/${id}`,{headers:{cookie:cookie()}})).text();assert.ok(detail.includes('HTTP Smoke'));assert.ok(detail.includes('person-020'));
 const simToken=crypto.randomUUID();
 async function sim(action:string,extra:Record<string,unknown>={}){const r=await fetch(base+'/api/simulation',{method:'POST',headers:{cookie:cookie(),Origin:base,'Content-Type':'application/json'},body:JSON.stringify({worldId:id,token:simToken,action,...extra})});return {status:r.status,data:await r.json()};}
 const opened=await sim('open');assert.equal(opened.status,200);assert.equal(opened.data.owned,true);const identity={worldId:id,seed:'HTTP-2026',climateId:'B01'};let simState=control(await decodeHead(opened.data.head,identity),{paused:false});for(let n=0;n<3;n++)simState=advance(simState,60000);simState=control(simState,{paused:true});const payload=JSON.stringify(simState),saveRequest={epoch:opened.data.epoch,revision:0,requestId:crypto.randomUUID(),kind:'full',payload,checksum:await sha256(payload)};
 const saved=await sim('save',saveRequest);assert.equal(saved.status,200);assert.equal((await decodeHead(saved.data.ack,identity)).tick,1800);const retry=await sim('save',saveRequest);assert.equal(retry.data.ack.revision,1);assert.equal(retry.data.saveCount,1);const history=await sim('history');assert.equal(history.data.history.length,2);const restored=await sim('restore',{epoch:opened.data.epoch,revision:1,requestId:crypto.randomUUID(),target:0});assert.equal(restored.status,200);assert.equal((await decodeHead(restored.data.ack,identity)).tick,0);
 const csrf=await fetch(base+'/api/simulation',{method:'POST',headers:{cookie:cookie(),Origin:'https://evil.example','Content-Type':'application/json'},body:JSON.stringify({worldId:id,token:simToken,action:'open'})});assert.equal(csrf.status,403);
 const anonApi=await fetch(base+'/api/simulation',{method:'POST',headers:{Origin:base,'Content-Type':'application/json'},body:JSON.stringify({worldId:id,token:simToken,action:'open'})});assert.equal(anonApi.status,401);
 const malformed=await sim('save',{payload:'{}'});assert.equal(malformed.status,400);
 console.log('PASS Simulation HTTP: owner auth, lease open, full save/day 2, lost-ACK retry, history, restore, CSRF and request validation.');
 const updated=await action('updateWorld',{id,name:'HTTP Renamed',populationLimit:300,revision:1});assert.ok(updated.includes('success'),updated.slice(0,1500));
 const stale=await action('updateWorld',{id,name:'Stale',populationLimit:300,revision:1});assert.ok(stale.includes('error'));
 const deleted=await action('deleteWorld',{id,confirmation:'HTTP Renamed',revision:2});assert.ok(deleted.includes('success'));
 const missing=await fetch(base+`/worlds/${id}`,{headers:{cookie:cookie()}});assert.ok((await missing.text()).includes('Không tìm thấy thế giới'));
 console.log('PASS HTTP: protected routes, SSR cookie session, login action success/error, registration notice, safe callback, list, create, detail, rename, revision conflict, delete, not-found.');
}catch(e){console.error(e);console.error(logs.slice(-5000));process.exitCode=1;}finally{app.kill('SIGTERM');fixture.kill('SIGTERM');}
