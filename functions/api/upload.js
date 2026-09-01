import { json, putJson } from "./_lib.js";
export async function onRequest({ request, env }) {
  if (request.method !== "POST") return json({ error: "Methode nicht erlaubt" }, 405);
  const fd = await request.formData();
  const file = fd.get("photo");
  if (!file || typeof file === "string") return json({ error: "Kein Foto" }, 400);
  if (file.size > 5 * 1024 * 1024) return json({ error: "Maximal 5 MB" }, 413);
  const allowed = ["image/jpeg","image/png","image/webp"];
  if (!allowed.includes(file.type)) return json({ error: "Nur JPG, PNG oder WebP" }, 415);
  if (fd.get("consent") !== "on") return json({ error: "Zustimmung fehlt" }, 400);

  const id = crypto.randomUUID();
  await env.WUZZE_PHOTOS.put(id, await file.arrayBuffer(), {
    httpMetadata: { contentType: file.type }
  });
  await putJson(env.WUZZE_KV, `gallery-meta:${id}`, {
    id,
    status: "pending",
    name: String(fd.get("name") || "").slice(0, 50),
    caption: String(fd.get("caption") || "").slice(0, 120),
    contentType: file.type,
    createdAt: new Date().toISOString()
  });
  return json({ ok: true, id }, 201);
}
