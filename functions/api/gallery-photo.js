export async function onRequest({ request, env }) {
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return new Response("Missing id", { status: 400 });
  const object = await env.WUZZE_PHOTOS.get(id);
  if (!object) return new Response("Not found", { status: 404 });
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);
  headers.set("cache-control", "public,max-age=3600");
  return new Response(object.body, { headers });
}
