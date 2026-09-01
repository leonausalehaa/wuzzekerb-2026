import { json, adminOk, getJson, putJson, listAll } from "./_lib.js";
export async function onRequest({ request, env }) {
  if (!adminOk(request, env)) return json({ error: "Nicht autorisiert" }, 401);
  if (request.method === "GET") {
    const keys = await listAll(env.WUZZE_KV, "gallery-meta:");
    const items = [];
    for (const k of keys) {
      const m = await getJson(env.WUZZE_KV, k.name);
      if (m?.status === "pending") items.push({ ...m, url: `/api/gallery-photo?id=${encodeURIComponent(m.id)}` });
    }
    items.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
    return json({ items });
  }
  if (request.method === "POST") {
    const { id, action } = await request.json();
    const key = `gallery-meta:${id}`;
    const m = await getJson(env.WUZZE_KV, key);
    if (!m) return json({ error: "Nicht gefunden" }, 404);
    if (action === "approve") {
      m.status = "approved";
      m.approvedAt = new Date().toISOString();
      await putJson(env.WUZZE_KV, key, m);
      return json({ ok: true });
    }
    if (action === "delete") {
      await Promise.all([env.WUZZE_KV.delete(key), env.WUZZE_PHOTOS.delete(id)]);
      return json({ ok: true });
    }
    return json({ error: "Ungültige Aktion" }, 400);
  }
  return json({ error: "Methode nicht erlaubt" }, 405);
}
