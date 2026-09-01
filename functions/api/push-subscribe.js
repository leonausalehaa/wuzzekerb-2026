import { json, putJson } from "./_lib.js";
export async function onRequest({ request, env }) {
  if (request.method !== "POST") return json({ error: "Methode nicht erlaubt" }, 405);
  const sub = await request.json();
  if (!sub?.endpoint) return json({ error: "Ungültiges Abo" }, 400);
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(sub.endpoint));
  const id = [...new Uint8Array(digest)].map(x => x.toString(16).padStart(2,"0")).join("");
  await putJson(env.WUZZE_KV, `push-sub:${id}`, sub);
  return json({ ok: true });
}
