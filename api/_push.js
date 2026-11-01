// Общие функции push-уведомлений (файл с "_" — не отдельный API-маршрут Vercel).
// Нужные переменные окружения в Vercel:
//   VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, CRON_SECRET
//   KV_REST_API_URL + KV_REST_API_TOKEN  (или UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN)
import webpush from "web-push";
import crypto from "node:crypto";

const R_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const R_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
export const SUBS_KEY = "nl:push:subs";

export function missingConfig() {
  const miss = [];
  if (!process.env.VAPID_PUBLIC_KEY) miss.push("VAPID_PUBLIC_KEY");
  if (!process.env.VAPID_PRIVATE_KEY) miss.push("VAPID_PRIVATE_KEY");
  if (!R_URL || !R_TOKEN) miss.push("KV_REST_API_URL/KV_REST_API_TOKEN");
  return miss;
}

export async function redis(...cmd) {
  const r = await fetch(R_URL, { method: "POST", headers: { Authorization: "Bearer " + R_TOKEN, "Content-Type": "application/json" }, body: JSON.stringify(cmd) });
  const d = await r.json().catch(() => ({}));
  if (!r.ok || d.error) throw new Error("redis: " + (d.error || r.status));
  return d.result;
}

export function vapid() {
  webpush.setVapidDetails(process.env.VAPID_SUBJECT || "mailto:support@next-lvl.kz", process.env.VAPID_PUBLIC_KEY, process.env.VAPID_PRIVATE_KEY);
  return webpush;
}

export const subId = (endpoint) => crypto.createHash("sha256").update(String(endpoint)).digest("hex").slice(0, 32);

export function cors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

// Время напоминаний — по Астане (UTC+5, единое время Казахстана с 2024 г.)
export const TZ_OFFSET = 5;
export const SLOTS = [{ h: 7, type: "morning" }, { h: 10, type: "habits" }, { h: 13, type: "midday" }, { h: 17, type: "tasks" }, { h: 21, type: "evening" }];

const MSGS = {
  ru: {
    morning: (n) => [`Доброе утро${n}! Новый день — новый уровень`, `Начни день с плана${n}. Квесты дня ждут`],
    habits: (n) => [`Не забудь отметить привычки${n}`, `Серия не должна прерываться${n} — загляни в NextLVL`],
    midday: (n) => [`Как идёт день${n}? Проверь задачи`, `Самое время записать расходы${n}`],
    tasks: (n) => [`Вечер близко — закрой важные задачи${n}`, `Что ещё осталось в «Сделать сейчас»${n}?`],
    evening: (n) => [`Подведи итоги дня в NextLVL${n}`, `Отметь привычки перед сном${n}`],
    test: () => ["Уведомления работают. Напомним о привычках и задачах в течение дня"],
  },
  kk: {
    morning: (n) => [`Қайырлы таң${n}! Жаңа күн — жаңа деңгей`, `Күнді жоспардан баста${n}`],
    habits: (n) => [`Әдеттеріңді белгілеуді ұмытпа${n}`, `Серияны үзбе${n} — NextLVL-ге қара`],
    midday: (n) => [`Күн қалай өтіп жатыр${n}? Тапсырмаларды тексер`, `Шығындарды жазатын уақыт${n}`],
    tasks: (n) => [`Кеш жақын — маңызды тапсырмаларды бітір${n}`, `«Қазір істеу» бөлімінде не қалды${n}?`],
    evening: (n) => [`Күн қорытындысын шығар${n}`, `Ұйықтар алдында әдеттерді белгіле${n}`],
    test: () => ["Хабарландырулар жұмыс істейді. Күні бойы әдеттер мен тапсырмаларды еске саламыз"],
  },
  en: {
    morning: (n) => [`Good morning${n}! New day, new level`, `Start the day with a plan${n}`],
    habits: (n) => [`Don't forget your habits${n}`, `Keep your streak alive${n}`],
    midday: (n) => [`How's the day going${n}? Check your tasks`, `Good time to log expenses${n}`],
    tasks: (n) => [`Evening's close — wrap up key tasks${n}`, `What's left in “Do now”${n}?`],
    evening: (n) => [`Wrap up the day in NextLVL${n}`, `Check off habits before bed${n}`],
    test: () => ["Notifications work. We'll remind you about habits and tasks during the day"],
  },
};

export function message(lang, type, name) {
  const set = MSGS[lang] || MSGS.ru;
  const n = name ? ", " + String(name).slice(0, 40) : "";
  const list = (set[type] || set.habits)(n);
  return { title: "NextLVL", body: list[Math.floor(Math.random() * list.length)], url: "/", tag: "nl-" + type };
}

export async function sendTo(record, payload) {
  const wp = vapid();
  try {
    await wp.sendNotification(record.sub, JSON.stringify(payload), { TTL: 3 * 3600, urgency: "normal" });
    return "sent";
  } catch (e) {
    if (e && (e.statusCode === 404 || e.statusCode === 410)) return "gone"; // подписка больше не действует
    return "error:" + (e && (e.statusCode || e.message));
  }
}
