import { json, teamOk } from "./_lib.js";
export async function onRequest({ request, env }) {
  return teamOk(request, env) ? json({ ok: true }) : json({ error: "PIN falsch" }, 401);
}
