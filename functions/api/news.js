import { json, getJson } from "./_lib.js";
export async function onRequest({ env }) {
  const items = await getJson(env.WUZZE_KV, "news", []);
  return json({ items: items.slice(0, 30) });
}
