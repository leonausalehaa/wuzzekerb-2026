import { json, teamOk, getJson, putJson } from "./_lib.js";
const key = "team-status-v1";
export async function onRequest({ request, env }) {
  if (!teamOk(request, env)) return json({ error: "PIN falsch" }, 401);
  if (request.method === "GET") return json(await getJson(env.WUZZE_KV, key, { statuses:{}, updatedAt:null }));
  if (request.method === "POST") {
    const b = await request.json().catch(() => ({}));
    if (!b.id || !["open","doing","done"].includes(b.status)) return json({ error: "Ungültige Daten" }, 400);
    const d = await getJson(env.WUZZE_KV, key, { statuses:{} });
    d.statuses[b.id] = { status:b.status, by:b.by || "", updatedAt:new Date().toISOString() };
    d.updatedAt = new Date().toISOString();
    await putJson(env.WUZZE_KV, key, d);
    return json(d);
  }
  return json({ error: "Method not allowed" }, 405);
}
