import { json } from './_lib.mjs';
export default async req=>{const pin=process.env.TEAM_PIN||process.env.ADMIN_PIN||'';return pin&&req.headers.get('x-team-pin')===pin?json({ok:true}):json({error:'PIN falsch'},401)};
