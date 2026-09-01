export const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store"
    }
  });

export const adminOk = (request, env) =>
  Boolean(env.ADMIN_PIN) && request.headers.get("x-admin-pin") === env.ADMIN_PIN;

export const teamOk = (request, env) => {
  const pin = env.TEAM_PIN || env.ADMIN_PIN || "";
  return Boolean(pin) && request.headers.get("x-team-pin") === pin;
};

export async function getJson(kv, key, fallback = null) {
  try {
    const value = await kv.get(key, "json");
    return value ?? fallback;
  } catch {
    return fallback;
  }
}

export async function putJson(kv, key, value) {
  await kv.put(key, JSON.stringify(value));
}

export async function listAll(kv, prefix) {
  let cursor;
  const keys = [];
  do {
    const page = await kv.list({ prefix, cursor });
    keys.push(...page.keys);
    cursor = page.list_complete ? undefined : page.cursor;
  } while (cursor);
  return keys;
}
