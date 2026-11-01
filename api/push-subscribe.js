// Подписка на push-уведомления.
// GET    → публичный VAPID-ключ
// POST   { subscription, lang, name, test } → сохранить подписку (test: true — сразу прислать проверочное уведомление)
// DELETE { endpoint } → удалить подписку
import { cors, missingConfig, redis, subId, SUBS_KEY, message, sendTo } from "./_push.js";

export default async function handler(req, res) {
  cors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  const miss = missingConfig();
  if (req.method === "GET") return res.status(200).json({ publicKey: process.env.VAPID_PUBLIC_KEY || null, configured: miss.length === 0 });
  if (miss.length) return res.status(503).json({ error: "not_configured", missing: miss });

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
    if (req.method === "DELETE") {
      if (body.endpoint) await redis("HDEL", SUBS_KEY, subId(body.endpoint));
      return res.status(200).json({ ok: true });
    }
    if (req.method !== "POST") return res.status(405).json({ error: "method" });

    const sub = body.subscription;
    if (!sub || typeof sub.endpoint !== "string" || !/^https:\/\//.test(sub.endpoint) || !sub.keys || !sub.keys.p256dh || !sub.keys.auth) {
      return res.status(400).json({ error: "bad_subscription" });
    }
    const record = {
      sub: { endpoint: sub.endpoint, keys: { p256dh: String(sub.keys.p256dh), auth: String(sub.keys.auth) } },
      lang: ["ru", "kk", "en"].includes(body.lang) ? body.lang : "ru",
      name: typeof body.name === "string" ? body.name.slice(0, 40) : "",
      updatedAt: new Date().toISOString(),
    };
    await redis("HSET", SUBS_KEY, subId(sub.endpoint), JSON.stringify(record));

    let test = null;
    if (body.test) {
      test = await sendTo(record, message(record.lang, "test", ""));
      if (test === "gone") await redis("HDEL", SUBS_KEY, subId(sub.endpoint));
    }
    return res.status(200).json({ ok: true, test });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
