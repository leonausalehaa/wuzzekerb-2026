import {json} from './_lib.mjs';export default async()=>json({publicKey:process.env.VAPID_PUBLIC_KEY||''});
