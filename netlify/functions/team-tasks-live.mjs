import { json,getStore,getJson } from './_lib.mjs';
const key='team-custom-tasks-v1';
function ok(req){const pin=process.env.TEAM_PIN||process.env.ADMIN_PIN||'';return Boolean(pin)&&req.headers.get('x-team-pin')===pin}
export default async req=>{
  if(!ok(req))return json({error:'PIN falsch'},401);
  const store=getStore('wuzzekerb-team');
  const d=await getJson(store,key,{tasks:[],updatedAt:null});
  if(req.method==='GET')return json(d);
  const b=await req.json().catch(()=>({}));
  if(req.method==='POST'){
    if(!String(b.title||'').trim())return json({error:'Aufgabe fehlt'},400);
    d.tasks.unshift({id:'custom-'+Date.now()+'-'+Math.random().toString(36).slice(2,7),title:String(b.title).trim().slice(0,160),date:String(b.date||'').slice(0,10),time:String(b.time||'').slice(0,5),owner:String(b.owner||'').trim().slice(0,100),note:String(b.note||'').trim().slice(0,400),createdBy:String(b.createdBy||'Team').trim().slice(0,80),status:'open',createdAt:new Date().toISOString()});
  }else if(req.method==='PATCH'){
    if(!b.id||!['open','doing','done'].includes(b.status))return json({error:'Ungültige Daten'},400);
    const t=d.tasks.find(x=>x.id===b.id);if(!t)return json({error:'Nicht gefunden'},404);t.status=b.status;t.updatedBy=String(b.by||'Team').slice(0,80);t.updatedAt=new Date().toISOString();
  }else return json({error:'Method not allowed'},405);
  d.updatedAt=new Date().toISOString();await store.setJSON(key,d);return json(d);
};
