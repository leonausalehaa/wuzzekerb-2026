import webpush from "web-push";
import { json, adminOk, getJson, putJson, listAll } from "./_lib.js";

export async function onRequest({ request, env }) {
  if (!adminOk(request, env)) return json({ error: "Nicht autorisiert" }, 401);
  if (!env.VAPID_PUBLIC_KEY || !env.VAPID_PRIVATE_KEY) return json({ error: "VAPID noch nicht eingerichtet" }, 500);

  const { title, body } = await request.json();
  if (!title || !body) return json({ error: "Titel und Nachricht fehlen" }, 400);

  webpush.setVapidDetails(
    env.VAPID_SUBJECT || "mailto:info@altenhainer-kerbeverein.de",
    env.VAPID_PUBLIC_KEY,
    env.VAPID_PRIVATE_KEY
  );

  const keys = await listAll(env.WUZZE_KV, "push-sub:");
  let sent = 0, removed = 0;
  for (const k of keys) {
    const sub = await getJson(env.WUZZE_KV, k.name);
    try {
      await webpush.sendNotification(sub, JSON.stringify({ title, body }));
      sent++;
    } catch (e) {
      if (e?.statusCode === 404 || e?.statusCode === 410) {
        await env.WUZZE_KV.delete(k.name);
        removed++;
      }
    }
  }

  const news = await getJson(env.WUZZE_KV, "news", []);
  news.unshift({ id: crypto.randomUUID(), title, body, createdAt: new Date().toISOString() });
  await putJson(env.WUZZE_KV, "news", news.slice(0, 50));
  return json({ ok: true, sent, removed });
}
