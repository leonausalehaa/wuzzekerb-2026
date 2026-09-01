import { json,getStore,getJson } from './_lib.mjs';
const key='team-shifts-v1';
function ok(req){const pin=process.env.TEAM_PIN||process.env.ADMIN_PIN||'';return Boolean(pin)&&req.headers.get('x-team-pin')===pin}
export default async req=>{
 if(!ok(req))return json({error:'PIN falsch'},401);
 const store=getStore('wuzzekerb-team');
 const d=await getJson(store,key,{shifts:[],updatedAt:null});
 if(req.method==='GET')return json(d);
 const b=await req.json().catch(()=>({}));
 if(req.method==='POST'){
  if(!String(b.title||'').trim()||!b.date||!b.start)return json({error:'Dienst, Datum und Startzeit fehlen'},400);
  d.shifts.push({
   id:'shift-'+Date.now()+'-'+Math.random().toString(36).slice(2,7),
   title:String(b.title).trim().slice(0,160),date:String(b.date).slice(0,10),
   start:String(b.start).slice(0,5),end:String(b.end||'').slice(0,5),
   owner:String(b.owner||'').trim().slice(0,160),location:String(b.location||'').trim().slice(0,160),
   note:String(b.note||'').trim().slice(0,400),createdBy:String(b.createdBy||'Team').slice(0,80),
   createdAt:new Date().toISOString()
  });
 } else if(req.method==='DELETE'){
  if(!b.id)return json({error:'ID fehlt'},400);d.shifts=d.shifts.filter(x=>x.id!==b.id);
 } else return json({error:'Method not allowed'},405);
 d.updatedAt=new Date().toISOString();await store.setJSON(key,d);return json(d);
};
