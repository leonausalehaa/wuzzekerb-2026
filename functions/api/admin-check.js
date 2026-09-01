import { json, adminOk } from "./_lib.js";
export async function onRequest({ request, env }) {
  return adminOk(request, env) ? json({ ok: true }) : json({ error: "Nicht autorisiert" }, 401);
}
