import { json, getJson, listAll } from "./_lib.js";
export async function onRequest({ env }) {
  const keys = await listAll(env.WUZZE_KV, "gallery-meta:");
  const rows = [];
  for (const k of keys) {
    const m = await getJson(env.WUZZE_KV, k.name);
    if (m?.status === "approved") rows.push({ ...m, url: `/api/gallery-photo?id=${encodeURIComponent(m.id)}` });
  }
  rows.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
  return json({ items: rows.slice(0, 100) });
}
