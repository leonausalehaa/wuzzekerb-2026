import { json, teamOk } from "./_lib.js";
import tasks from "./_team-build-plan.js";

export async function onRequest({ request, env }) {
  if (!teamOk(request, env)) {
    return json({ error: "PIN falsch" }, 401);
  }

  if (request.method !== "GET") {
    return json({ error: "Method not allowed" }, 405);
  }

  return json({ tasks });
}
