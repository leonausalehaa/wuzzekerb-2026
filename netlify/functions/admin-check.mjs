import {json,adminOk} from './_lib.mjs';
export default async req=>adminOk(req)?json({ok:true}):json({error:'Nicht autorisiert'},401);
