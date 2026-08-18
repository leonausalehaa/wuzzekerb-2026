import {json,getStore,getJson} from './_lib.mjs';
export default async()=>{const s=getStore('wuzzekerb-data');const items=await getJson(s,'news',[]);return json({items:items.slice(0,30)})};
