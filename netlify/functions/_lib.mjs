import { getStore } from '@netlify/blobs';
export const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store'}});
export const adminOk=req=>Boolean(process.env.ADMIN_PIN)&&req.headers.get('x-admin-pin')===process.env.ADMIN_PIN;
export async function getJson(store,key,fallback=null){try{const v=await store.get(key,{type:'json',consistency:'strong'});return v??fallback}catch{return fallback}}
export { getStore };
