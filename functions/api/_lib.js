export function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8"
    }
  });
}

export function adminOk(request, env) {
  const pin = request.headers.get("x-admin-pin") || "";
  return !!env.ADMIN_PIN && pin === env.ADMIN_PIN;
}

/*
  TEAM-BEREICH IST ÖFFENTLICH.
  Deshalb wird keine TEAM_PIN-Prüfung mehr durchgeführt.
*/
export function teamOk(request, env) {
  return true;
}

export async function getJson(kv, key, fallback = null) {
  if (!kv) return fallback;

  try {
    const value = await kv.get(key, "json");
    return value ?? fallback;
  } catch {
    return fallback;
  }
}

export async function putJson(kv, key, value) {
  if (!kv) {
    throw new Error("WUZZE_KV binding fehlt");
  }

  await kv.put(
    key,
    JSON.stringify(value)
  );
}

export async function listAll(kv, options = {}) {
  if (!kv) return [];

  const items = [];
  let cursor;

  do {
    const result = await kv.list({
      ...options,
      ...(cursor ? { cursor } : {})
    });

    if (Array.isArray(result.keys)) {
      items.push(...result.keys);
    }

    cursor = result.list_complete
      ? undefined
      : result.cursor;

  } while (cursor);

  return items;
}