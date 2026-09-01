import { json } from "./_lib.js";
export async function onRequest({ env }) {
  return json({ publicKey: env.VAPID_PUBLIC_KEY || "" });
}
