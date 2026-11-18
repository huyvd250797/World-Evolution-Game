// Local-only contract fixture: real PostgreSQL engine, simulated GoTrue/PostgREST.
// Never imported by production application. Not a replacement for hosted Supabase QA.
import {createServer} from 'node:http';
import {database,asUser,alice,bob} from './database';
const db=await database();const tokens=new Map<string,string>();
const users=[{id:alice,email:'alice@example.test',password:'Password123!'},{id:bob,email:'bob@example.test',password:'Password123!'}];
function account(uid:string){const u=users.find(u=>u.id===uid)!;return {id:u.id,email:u.email,aud:'authenticated',role:'authenticated',email_confirmed_at:new Date().toISOString(),app_metadata:{provider:'email',providers:['email']},user_metadata:{},created_at:new Date().toISOString(),identities:[]};}
function session(uid:string){const exp=Math.floor(Date.now()/1000)+3600;const jwt=[Buffer.from(JSON.stringify({alg:'HS256',typ:'JWT'})).toString('base64url'),Buffer.from(JSON.stringify({sub:uid,role:'authenticated',aud:'authenticated',exp,iat:exp-3600})).toString('base64url'),'fixture-signature'].join('.');tokens.set(jwt,uid);return {access_token:jwt,refresh_token:`refresh-${uid}`,token_type:'bearer',expires_in:3600,expires_at:exp,user:account(uid)};}
const server=createServer(async(req,res)=>{
 const url=new URL(req.url!,'http://127.0.0.1:54329');res.setHeader('Content-Type','application/json');
 const send=(code:number,body:unknown)=>{res.statusCode=code;res.end(JSON.stringify(body));};
 let raw='';for await(const chunk of req)raw+=chunk;const body=raw?JSON.parse(raw):{};
 const uid=tokens.get((req.headers.authorization??'').replace(/^Bearer /,''))??null;
 try{
 if(url.pathname==='/health')return send(200,{ok:true});
 if(url.pathname==='/auth/v1/token'){
  if(url.searchParams.get('grant_type')==='refresh_token'){const id=String(body.refresh_token).replace('refresh-','');if(users.some(u=>u.id===id))return send(200,session(id));}
  const u=users.find(u=>u.email===body.email&&u.password===body.password);return u?send(200,session(u.id)):send(400,{error:'invalid_grant',error_description:'Invalid login credentials'});
 }
 if(url.pathname==='/auth/v1/signup'){const u=users.find(u=>u.email===body.email);if(u)return send(200,session(u.id));return send(200,{id:alice,email:body.email,identities:[]});}
 if(url.pathname==='/auth/v1/logout'){res.statusCode=204;res.end();return;}
 if(url.pathname==='/auth/v1/recover')return send(200,{});
 if(url.pathname==='/auth/v1/user')return uid?send(200,account(uid)):send(401,{message:'JWT expired',code:'bad_jwt'});
 if(url.pathname==='/rest/v1/worlds'){
  const allowed=['id','name','seed','climate_id','population_limit','population','day','era','revision','master_data_version','save_schema_version','catalog_checksum','created_at','updated_at','initial_state'];
  const cols=(url.searchParams.get('select')??'id').split(',');if(cols.some(c=>!allowed.includes(c)))throw new Error('Unexpected columns');
  const id=url.searchParams.get('id')?.replace(/^eq\./,'');const r=await asUser(db,uid,`select ${cols.join(',')} from public.worlds ${id?'where id=$1':''} order by updated_at desc`,id?[id]:[]);
  return send(200,r.rows);
 }
 if(url.pathname.startsWith('/rest/v1/rpc/')){
  if(!uid)return send(401,{code:'42501',message:'AUTH_REQUIRED'});
  const op=url.pathname.split('/').at(-1);let sql='',params:unknown[]=[];
  if(op==='create_world'){sql='select public.create_world($1,$2,$3,$4,$5) as result';params=[body.p_name,body.p_seed,body.p_climate_id,body.p_population_limit,body.p_request_id];}
  else if(op==='update_world'){sql='select public.update_world($1,$2,$3,$4) as result';params=[body.p_id,body.p_name,body.p_population_limit,body.p_expected_revision];}
  else if(op==='delete_world'){sql='select public.delete_world($1,$2,$3) as result';params=[body.p_id,body.p_confirmation,body.p_expected_revision];}
  else return send(404,{message:'RPC not found'});
  const r=await asUser<{result:unknown}>(db,uid,sql,params);return send(200,r.rows[0].result);
 }
 return send(404,{message:'Not found'});
 }catch(e){const err=e as {code?:string;message:string};send(400,{code:err.code??'unknown',message:err.message});}
});
server.listen(54329,'127.0.0.1',()=>console.log('Contract fixture on 127.0.0.1:54329'));
process.on('SIGTERM',()=>{server.close();void db.close().then(()=>process.exit(0));});
