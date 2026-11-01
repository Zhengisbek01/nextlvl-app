// Рассылка напоминаний. Вызывается по расписанию (GitHub Actions или cron-job.org)
// в 07:00, 10:00, 13:00, 17:00, 21:00 по Астане.
// Защита: заголовок  Authorization: Bearer <CRON_SECRET>   (или ?key=<CRON_SECRET>)
// Необязательно: ?slot=morning|habits|midday|tasks|evening  — отправить конкретный слот
import { cors, missingConfig, redis, SUBS_KEY, SLOTS, TZ_OFFSET, message, sendTo } from "./_push.js";

export default async function handler(req, res) {
  cors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  const secret = process.env.CRON_SECRET;
  const auth = String(req.headers.authorization || "");
  const key = (req.query && req.query.key) || "";
  if (!secret || (auth !== "Bearer " + secret && key !== secret)) return res.status(401).json({ error: "unauthorized" });
  const miss = missingConfig();
  if (miss.length) return res.status(503).json({ error: "not_configured", missing: miss });

  // текущее время в Астане
  const now = new Date(Date.now() + TZ_OFFSET * 3600 * 1000);
  const hour = now.getUTCHours();
  const day = now.toISOString().slice(0, 10);
  let slot = req.query && SLOTS.find((s) => s.type === req.query.slot);
  // расписание GitHub может опаздывать — берём слот, начавшийся не более 2 часов назад
  if (!slot) slot = SLOTS.slice().reverse().find((s) => hour >= s.h && hour - s.h < 2);
  if (!slot) return res.status(200).json({ skipped: "no_slot", hour });

  try {
    // защита от повторной отправки одного слота за день
    const fresh = await redis("SET", "nl:push:sent:" + day + ":" + slot.type, "1", "NX", "EX", "93600");
    if (fresh !== "OK" && !(req.query && req.query.force === "1")) return res.status(200).json({ skipped: "already_sent", slot: slot.type, day });

    const raw = (await redis("HGETALL", SUBS_KEY)) || [];
    const entries = [];
    for (let i = 0; i < raw.length; i += 2) entries.push([raw[i], raw[i + 1]]);
    const stats = { slot: slot.type, total: entries.length, sent: 0, removed: 0, errors: 0 };

    for (let i = 0; i < entries.length; i += 50) {
      const batch = entries.slice(i, i + 50);
      const results = await Promise.all(batch.map(async ([id, json]) => {
        let rec; try { rec = JSON.parse(json); } catch (e) { return ["gone", id]; }
        if (rec.paused) return ["paused", id];
        return [await sendTo(rec, message(rec.lang, slot.type, rec.name)), id];
      }));
      for (const [r, id] of results) {
        if (r === "sent") stats.sent++;
        else if (r === "gone") { stats.removed++; await redis("HDEL", SUBS_KEY, id); }
        else if (r !== "paused") stats.errors++;
      }
    }
    return res.status(200).json(stats);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
