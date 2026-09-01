import { json, teamOk, getJson, putJson } from "./_lib.js";
const key = "team-shifts-v1";
export async function onRequest({ request, env }) {
  if (!teamOk(request, env)) return json({ error:"PIN falsch" }, 401);
  const d = await getJson(env.WUZZE_KV, key, { shifts:[], updatedAt:null });
  if (request.method === "GET") return json(d);
  const b = await request.json().catch(() => ({}));
  if (request.method === "POST") {
    if (!String(b.title || "").trim() || !b.date || !b.start) return json({ error:"Dienst, Datum und Startzeit fehlen" }, 400);
    d.shifts.push({
      id:"shift-"+Date.now()+"-"+Math.random().toString(36).slice(2,7),
      title:String(b.title).trim().slice(0,160), date:String(b.date).slice(0,10),
      start:String(b.start).slice(0,5), end:String(b.end || "").slice(0,5),
      owner:String(b.owner || "").trim().slice(0,160), location:String(b.location || "").trim().slice(0,160),
      note:String(b.note || "").trim().slice(0,400), createdBy:String(b.createdBy || "Team").slice(0,80),
      createdAt:new Date().toISOString()
    });
  } else if (request.method === "DELETE") {
    if (!b.id) return json({ error:"ID fehlt" }, 400);
    d.shifts = d.shifts.filter(x => x.id !== b.id);
  } else return json({ error:"Method not allowed" }, 405);
  d.updatedAt = new Date().toISOString();
  await putJson(env.WUZZE_KV, key, d);
  return json(d);
}
