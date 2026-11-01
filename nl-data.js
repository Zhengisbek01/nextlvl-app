// ─────────────────────────────────────────────────────────────────────────────
// NextLVL · слой данных
// Хранилище, миграция старых записей, даты, справочники, переводы.
// ВАЖНО: ключи localStorage НЕ меняются (nl-user, nl-habits, nl-tasks, nl-txns),
// поэтому все записи пользователей сохраняются при обновлении приложения.
// ─────────────────────────────────────────────────────────────────────────────

export const APP_VERSION = "3.0.0";
export const SCHEMA_VERSION = 2;
export const TERMS_VERSION = "2026-11-01";

export const KEYS = {
  user: "nl-user",
  habits: "nl-habits",
  tasks: "nl-tasks",
  txns: "nl-txns",
  goal: "nl-goal",
  settings: "nl-settings",
  terms: "nl-terms",
  schema: "nl-schema",
  backup: "nl-backup-v1",        // снимок данных до первой миграции (создаётся один раз)
  backupAuto: "nl-backup-auto",  // снимок перед восстановлением из файла
  notif: "nl-notif",
};

// ─── ДАТЫ (локальное время, без сдвига UTC) ──────────────────────────────────
// Раньше дата бралась через toISOString() — в Казахстане (UTC+5) до 05:00
// «сегодня» считалось вчерашним днём. Теперь везде локальная дата.
export const pad = (n) => String(n).padStart(2, "0");
export const dkey = (d) => d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
export const today = () => dkey(new Date());
export const nowTime = () => { const d = new Date(); return pad(d.getHours()) + ":" + pad(d.getMinutes()); };
export const isKey = (k) => typeof k === "string" && /^\d{4}-\d{2}-\d{2}$/.test(k);
export const parseKey = (k) => { const [y, m, d] = k.split("-").map(Number); return new Date(y, m - 1, d); };
export const addDays = (k, n) => { const d = parseKey(k); d.setDate(d.getDate() + n); return dkey(d); };
export const daysBetween = (a, b) => Math.round((parseKey(b) - parseKey(a)) / 86400000);
export const monthKey = (k) => (k || today()).slice(0, 7);
export const shiftMonthKey = (mk, delta) => {
  let [y, m] = mk.split("-").map(Number);
  m += delta;
  while (m < 1) { m += 12; y -= 1; }
  while (m > 12) { m -= 12; y += 1; }
  return y + "-" + pad(m);
};
export const monthStart = (mk) => mk + "-01";
export const monthEnd = (mk) => { const [y, m] = mk.split("-").map(Number); return dkey(new Date(y, m, 0)); };
export const weekStart = (k) => { const d = parseKey(k); const dow = (d.getDay() + 6) % 7; d.setDate(d.getDate() - dow); return dkey(d); };
export const rangeDays = (from, to) => { const out = []; let k = from; let guard = 0; while (k <= to && guard < 4000) { out.push(k); k = addDays(k, 1); guard++; } return out; };
export const fmtNum = (n) => new Intl.NumberFormat("ru-RU").format(Math.abs(Math.round(Number(n) || 0)));
export const fmtShort = (n) => { const a = Math.abs(n); const s = n < 0 ? "−" : "+"; if (a >= 1e6) return s + (a / 1e6).toFixed(1).replace(".0", "") + "м"; if (a >= 1000) return s + Math.round(a / 1000) + "к"; return s + Math.round(a); };
export const fmtDM = (k) => { const [, m, d] = k.split("-"); return d + "." + m; };
export const fmtDMY = (k) => { const [y, m, d] = k.split("-"); return d + "." + m + "." + y; };

export const uid = () => Date.now() + Math.floor(Math.random() * 100000) / 100000;

// ─── ХРАНИЛИЩЕ ───────────────────────────────────────────────────────────────
export function readRaw(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
export function readJSON(k, fallback) {
  const raw = readRaw(k);
  if (raw == null) return fallback;
  try { return JSON.parse(raw); }
  catch (e) {
    // повреждённые данные не затираем — откладываем копию
    try { localStorage.setItem(k + "-corrupt-" + Date.now(), raw); } catch (_) {}
    return fallback;
  }
}
let lastWriteError = null;
export function writeJSON(k, v) {
  try { localStorage.setItem(k, JSON.stringify(v)); lastWriteError = null; return true; }
  catch (e) { lastWriteError = e; return false; }
}
export const getWriteError = () => lastWriteError;

// ─── СПРАВОЧНИКИ ─────────────────────────────────────────────────────────────
export const SPHERES = ["body", "mind", "work", "health", "finance"];

// Иконки (SVG path, viewBox 24, stroke)
export const IC = {
  shield: "M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z M8 13l3-3 2 2 3-3",
  plant: "M12 21v-9 M12 12C12 7 8 4 4 4c0 5 3 8 8 8z M12 14c0-4 3-7 8-7 0 4-3 7-8 7z",
  leaf: "M5 19C5 10 10 5 20 4c-1 10-6 15-15 15z M5 19l7-7",
  bolt: "M13 2L4 14h7l-1 8 9-12h-7z",
  flame: "M12 3c1 4 5 5 5 10a5 5 0 0 1-10 0c0-3 2-4 2-7 2 1 3 2 3 4",
  barbell: "M2 12h20 M6 7v10 M18 7v10 M3 9v6 M21 9v6",
  trophy: "M8 4h8v5a4 4 0 0 1-8 0z M8 6H5v1a3 3 0 0 0 3 3 M16 6h3v1a3 3 0 0 1-3 3 M12 13v4 M8 21h8 M10 17h4",
  crown: "M3 8l4 4 5-7 5 7 4-4-2 11H5z",
  gem: "M6 3h12l4 6-10 12L2 9z M2 9h20 M9 3l3 18 3-18",
  star: "M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z",
  medal: "M12 15m-5 0a5 5 0 1 0 10 0a5 5 0 1 0-10 0 M8 3l4 7 4-7",
  target: "M12 12m-8 0a8 8 0 1 0 16 0a8 8 0 1 0-16 0 M12 12m-4 0a4 4 0 1 0 8 0a4 4 0 1 0-8 0",
  gift: "M3 9h18v4H3z M5 13v8h14v-8 M12 9v12 M12 9c-2-4-6-4-6-1s6 1 6 1c2-4 6-4 6-1s-6 1-6 1",
  sparkles: "M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z M19 16l.7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7z",
  home: "M3 11l9-8 9 8 M5 9v11h14V9 M10 20v-6h4v6",
  coins: "M4 7a8 3 0 1 0 16 0a8 3 0 1 0-16 0 M4 7v5c0 1.7 3.6 3 8 3s8-1.3 8-3V7 M4 12v5c0 1.7 3.6 3 8 3s8-1.3 8-3v-5",
  user: "M12 8m-4 0a4 4 0 1 0 8 0a4 4 0 1 0-8 0 M5 21v-1a7 7 0 0 1 14 0v1",
  check: "M5 12l5 5L20 7",
  plus: "M12 5v14 M5 12h14",
  minus: "M5 12h14",
  x: "M6 6l12 12 M18 6L6 18",
  chevL: "M15 6l-6 6 6 6",
  chevR: "M9 6l6 6-6 6",
  chevD: "M6 9l6 6 6-6",
  chevU: "M6 15l6-6 6 6",
  back: "M19 12H5 M11 6l-6 6 6 6",
  gear: "M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0-6 0 M12 2v3 M12 19v3 M4.9 4.9l2.1 2.1 M17 17l2.1 2.1 M2 12h3 M19 12h3 M4.9 19.1L7 17 M17 7l2.1-2.1",
  share: "M18 5m-3 0a3 3 0 1 0 6 0a3 3 0 1 0-6 0 M6 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0-6 0 M18 19m-3 0a3 3 0 1 0 6 0a3 3 0 1 0-6 0 M8.6 13.5l6.8 4 M15.4 6.5l-6.8 4",
  mic: "M9 5a3 3 0 0 1 6 0v6a3 3 0 0 1-6 0z M5 11a7 7 0 0 0 14 0 M12 18v3",
  stop: "M7 7h10v10H7z",
  cal: "M4 6h16v14H4z M4 10h16 M8 3v4 M16 3v4",
  list: "M8 6h12 M8 12h12 M8 18h12 M4 6h.01 M4 12h.01 M4 18h.01",
  grid: "M4 4h7v7H4z M13 4h7v7h-7z M4 13h7v7H4z M13 13h7v7h-7z",
  flag: "M5 21V4 M5 4h12l-2 4 2 4H5",
  lock: "M6 11h12v10H6z M8 11V7a4 4 0 0 1 8 0v4",
  download: "M12 4v12 M7 11l5 5 5-5 M5 20h14",
  upload: "M12 20V8 M7 13l5-5 5 5 M5 4h14",
  trash: "M4 7h16 M9 7V4h6v3 M6 7l1 13h10l1-13",
  bell: "M6 16V11a6 6 0 0 1 12 0v5l2 2H4z M10 20a2 2 0 0 0 4 0",
  doc: "M6 3h9l4 4v14H6z M14 3v5h5 M9 13h6 M9 17h6",
  pen: "M4 20h4L19 9l-4-4L4 16z M14 6l4 4",
  globe: "M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0-18 0 M3 12h18 M12 3c3 3 3 15 0 18 M12 3c-3 3-3 15 0 18",
  sun: "M12 12m-4 0a4 4 0 1 0 8 0a4 4 0 1 0-8 0 M12 2v2 M12 20v2 M4.9 4.9l1.4 1.4 M17.7 17.7l1.4 1.4 M2 12h2 M20 12h2 M4.9 19.1l1.4-1.4 M17.7 6.3l1.4-1.4",
  // привычки
  drop: "M12 3s6 7 6 11a6 6 0 0 1-12 0c0-4 6-11 6-11z",
  cup: "M6 4h12l-1.5 16h-9z M6 8h12",
  book: "M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z M4 19V5",
  lang: "M4 5h8 M8 3v2 M5 11c2 0 5-3 5-6 M6 7c1 2 3 4 5 4 M13 20l4-9 4 9 M14.5 17h5",
  pill: "M10 4.5a5 5 0 0 1 7 7l-5.5 5.5a5 5 0 0 1-7-7z M8.5 8.5l7 7",
  brain: "M9 4a3 3 0 0 0-3 3 3 3 0 0 0-2 5 3 3 0 0 0 2 5 3 3 0 0 0 3 3V4z M15 4a3 3 0 0 1 3 3 3 3 0 0 1 2 5 3 3 0 0 1-2 5 3 3 0 0 1-3 3V4z",
  heart: "M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z",
  run: "M14 4m-2 0a2 2 0 1 0 4 0a2 2 0 1 0-4 0 M6 20l4-5 3 2 2-5 M9 10l3-2 3 3 3 1 M10 15l-2-3",
  moon: "M20 14A8 8 0 0 1 10 4a8 8 0 1 0 10 10z",
  sunrise: "M3 18h18 M5 14a7 7 0 0 1 14 0 M12 3v4 M4.5 7.5l2 2 M19.5 7.5l-2 2",
  rocket: "M5 19l3-1-2-2z M14 4c3 0 6 3 6 6l-7 7-6-6z M15 9m-1.5 0a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0-3 0",
  music: "M9 18V5l11-2v13 M9 18m-3 0a3 3 0 1 0 6 0a3 3 0 1 0-6 0 M20 16m-3 0a3 3 0 1 0 6 0a3 3 0 1 0-6 0",
  laptop: "M5 5h14v10H5z M3 19h18",
  phone: "M8 3h8v18H8z M11 18h2",
  lotus: "M12 20c-4 0-8-2-9-5 3 0 6 1 9 5z M12 20c4 0 8-2 9-5-3 0-6 1-9 5z M12 20c-2-3-3-7 0-12 3 5 2 9 0 12z",
  // финансы
  cart: "M3 4h2l2 11h11l2-8H6 M9 20m-1 0a1 1 0 1 0 2 0a1 1 0 1 0-2 0 M17 20m-1 0a1 1 0 1 0 2 0a1 1 0 1 0-2 0",
  coffee: "M4 9h12v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z M16 11h2a2 2 0 0 1 0 4h-2 M8 3v3 M12 3v3",
  car: "M5 16V11l2-5h10l2 5v5 M3 16h18v3H3z M5 11h14",
  gas: "M4 20V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v15 M3 20h12 M4 10h10 M14 9h2a2 2 0 0 1 2 2v5a1.5 1.5 0 0 0 3 0V8l-3-3",
  shirt: "M8 3l-5 4 3 3 2-1v12h8V9l2 1 3-3-5-4c-1 2-2 3-4 3s-3-1-4-3z",
  film: "M4 4h16v16H4z M8 4v16 M16 4v16 M4 9h4 M16 9h4 M4 15h4 M16 15h4",
  tool: "M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2.4-.6-.6-2.4z",
  briefcase: "M3 8h18v12H3z M8 8V5h8v3 M3 13h18",
  dots: "M5 12h.01 M12 12h.01 M19 12h.01",
  wallet: "M4 7h16v12H4z M4 7l12-3v3 M16 13h2",
};

export const HABIT_ICONS = ["star", "drop", "cup", "run", "barbell", "book", "lang", "brain", "pill", "heart", "moon", "sunrise", "lotus", "music", "laptop", "phone", "pen", "target", "coins", "leaf"];

const EMOJI_ICON = {
  "⭐": "star", "💧": "drop", "🏃": "run", "📚": "book", "🧘": "lotus", "💪": "barbell", "🎯": "target", "🥗": "leaf",
  "😴": "moon", "🎵": "music", "💊": "pill", "🧠": "brain", "📝": "pen", "🎮": "target", "🌍": "globe", "💻": "laptop",
};

export const EXP_CATS = ["food", "cafe", "transport", "auto", "home", "comm", "health", "clothes", "fun", "work", "edu", "other"];
export const INC_CATS = ["salary", "side", "gift", "other_in"];
export const CAT_ICON = {
  food: "cart", cafe: "coffee", transport: "car", auto: "gas", home: "home", comm: "phone", health: "pill",
  clothes: "shirt", fun: "film", work: "tool", edu: "book", other: "dots",
  salary: "briefcase", side: "laptop", gift: "gift", other_in: "wallet", goal: "trophy",
};
export const CAT_COLOR = {
  food: "#39FF14", cafe: "#FFB800", transport: "#4FC3F7", auto: "#FF8A65", home: "#BA68C8", comm: "#4DD0E1",
  health: "#F06292", clothes: "#AED581", fun: "#FFD54F", work: "#90A4AE", edu: "#7986CB", other: "#8FA398",
};

const CAT_WORDS = {
  food: ["продукт", "магазин", "супермаркет", "magnum", "small", "галмарт", "анвар", "хлеб", "молок", "мясо", "овощ", "фрукт", "азық", "дүкен", "grocer", "market"],
  cafe: ["кофе", "кафе", "обед", "ужин", "завтрак", "ресторан", "еда", "пицц", "бургер", "доставк", "шаурм", "чай", "coffee", "lunch", "food", "cafe", "тамақ"],
  transport: ["такси", "яндекс", "автобус", "метро", "проезд", "транспорт", "taxi", "bus", "onay", "поезд", "билет"],
  auto: ["бензин", "газ", "заправк", "мойк", "сто", "шиномонтаж", "парковк", "штраф", "авто", "машин", "fuel"],
  home: ["аренд", "квартир", "коммун", "жку", "свет", "вода за", "отоплен", "ремонт", "мебел", "rent", "үй"],
  comm: ["связь", "интернет", "телефон", "мобильн", "beeline", "kcell", "activ", "tele2", "altel"],
  health: ["аптек", "лекарств", "врач", "клиник", "анализ", "стоматолог", "витамин", "pharmacy", "дәрі"],
  clothes: ["одежд", "обувь", "кроссов", "куртк", "clothes", "киім"],
  fun: ["кино", "развлеч", "игр", "подписк", "netflix", "spotify", "концерт", "театр", "кальян", "боулинг"],
  work: ["инструмент", "работ", "офис", "канцеляр", "хостинг", "домен", "сервер", "vercel", "реклам"],
  edu: ["курс", "обучен", "книг", "учеб", "школ", "репетитор", "оқу"],
  salary: ["зарплат", "аванс", "оклад", "жалақы", "salary"],
  side: ["фриланс", "подработ", "проект", "заказ", "freelance"],
  gift: ["подарок", "сыйлық", "gift"],
};

export function guessCategory(note, type) {
  if (type === "deposit") return "goal";
  const low = String(note || "").toLowerCase();
  const pool = type === "income" ? INC_CATS : EXP_CATS;
  for (const c of pool) {
    const words = CAT_WORDS[c];
    if (words && words.some((w) => low.includes(w))) return c;
  }
  return type === "income" ? "other_in" : "other";
}

const SPHERE_WORDS = {
  body: ["спорт", "зарядк", "бег", "трен", "зал", "отжим", "присед", "йог", "растяж", "шаг", "плав", "душ", "турник", "пресс", "gym", "run", "sport", "workout", "жаттығу"],
  health: ["вод", "сон", "спать", "витамин", "магни", "аргинин", "таблет", "лекар", "здоров", "питан", "сахар", "кури", "алкогол", "water", "sleep", "vitamin", "су ", "ұйқы"],
  mind: ["книг", "чит", "англ", "язык", "учеб", "курс", "медит", "дневник", "журнал", "read", "book", "english", "study", "learn", "кітап", "оқу"],
  work: ["работ", "проект", "код", "задач", "фокус", "телефон", "почт", "план", "work", "code", "focus", "жұмыс"],
  finance: ["деньг", "финанс", "расход", "бюджет", "копил", "откладыв", "инвест", "money", "budget", "save", "ақша"],
};
const CAT_TO_SPHERE = ["health", "body", "mind", "work", "mind", "finance", "mind"];

export function guessSphere(name, cat) {
  const low = " " + String(name || "").toLowerCase() + " ";
  for (const s of ["body", "health", "mind", "work", "finance"]) {
    if (SPHERE_WORDS[s].some((w) => low.includes(w))) return s;
  }
  const c = Number(cat);
  return CAT_TO_SPHERE[c >= 0 && c < CAT_TO_SPHERE.length ? c : 0];
}

// ─── НОРМАЛИЗАЦИЯ (добавляет новые поля, старые не удаляет) ──────────────────
const asArray = (v) => (Array.isArray(v) ? v : []);
const isObj = (v) => v && typeof v === "object" && !Array.isArray(v);

export function normHabit(h) {
  if (!isObj(h)) return null;
  const out = { ...h };
  out.id = h.id ?? uid();
  out.name = String(h.name ?? "Привычка").slice(0, 120);
  out.checks = isObj(h.checks) ? h.checks : {};
  out.type = h.type === "count" ? "count" : "done";
  out.target = out.type === "count" ? Math.max(1, Math.round(Number(h.target) || 1)) : 1;
  out.unit = typeof h.unit === "string" ? h.unit : "";
  out.counts = isObj(h.counts) ? h.counts : {};
  const f = Number(h.freq);
  out.freq = f >= 1 && f <= 6 ? Math.round(f) : 7; // 7 = каждый день
  out.sphere = SPHERES.includes(h.sphere) ? h.sphere : guessSphere(out.name, h.cat);
  out.iconKey = IC[h.iconKey] ? h.iconKey : (EMOJI_ICON[h.icon] || "star");
  if (!isKey(h.createdAt)) {
    const keys = Object.keys(out.checks).filter(isKey).sort();
    let created = typeof h.id === "number" && h.id > 1e12 ? dkey(new Date(Math.floor(h.id))) : today();
    if (keys[0] && keys[0] < created) created = keys[0];
    out.createdAt = created;
  }
  return out;
}

const PRIO_TO_Q = { high: "now", medium: "plan", low: "later" };
export const Q_TO_PRIO = { now: "high", plan: "medium", deleg: "medium", later: "low" };
export const QUADS = ["now", "plan", "deleg", "later"];

export function normTask(t) {
  if (!isObj(t)) return null;
  const out = { ...t };
  out.id = t.id ?? uid();
  out.title = String(t.title ?? "").slice(0, 300);
  out.done = !!t.done;
  out.deadline = isKey(t.deadline) ? t.deadline : "";
  out.quadrant = QUADS.includes(t.quadrant) ? t.quadrant : (PRIO_TO_Q[t.priority] || "plan");
  out.priority = t.priority || Q_TO_PRIO[out.quadrant];
  return out;
}

export function normTxn(x) {
  if (!isObj(x)) return null;
  const amount = Math.abs(Number(x.amount));
  if (!isFinite(amount)) return null;
  const out = { ...x };
  out.id = x.id ?? uid();
  out.type = ["income", "expense", "deposit"].includes(x.type) ? x.type : "expense";
  out.amount = amount;
  out.note = typeof x.note === "string" ? x.note : "";
  out.date = isKey(x.date) ? x.date : today();
  const pool = out.type === "income" ? INC_CATS : out.type === "deposit" ? ["goal"] : EXP_CATS;
  out.category = pool.includes(x.category) ? x.category : guessCategory(out.note, out.type);
  return out;
}

export function normGoal(g) {
  if (!isObj(g)) return null;
  const target = Math.abs(Number(g.target));
  if (!target) return null;
  return { ...g, id: g.id ?? uid(), title: String(g.title || "Цель").slice(0, 80), target, createdAt: isKey(g.createdAt) ? g.createdAt : today() };
}

const OLD_THEME = { darkGamer: "neon", darkPurple: "aurora", goldPremium: "kz", iosBlue: "light" };
export const THEME_IDS = ["neon", "light", "kz", "aurora", "sand", "lime"];

export function normUser(u) {
  if (!isObj(u)) return null;
  const theme = THEME_IDS.includes(u.theme) ? u.theme : (OLD_THEME[u.theme] || "neon");
  return { ...u, name: String(u.name || ""), lang: ["ru", "kk", "en"].includes(u.lang) ? u.lang : "ru", theme };
}

// ─── ЗАГРУЗКА С МИГРАЦИЕЙ ────────────────────────────────────────────────────
export function loadAll() {
  const schema = Number(readRaw(KEYS.schema) || 0);
  if (schema < SCHEMA_VERSION && readRaw(KEYS.backup) == null) {
    const snap = { at: new Date().toISOString(), fromSchema: schema, user: readRaw(KEYS.user), habits: readRaw(KEYS.habits), tasks: readRaw(KEYS.tasks), txns: readRaw(KEYS.txns) };
    if (snap.user || snap.habits || snap.tasks || snap.txns) {
      try { localStorage.setItem(KEYS.backup, JSON.stringify(snap)); } catch (e) {}
    }
  }
  const user = normUser(readJSON(KEYS.user, null));
  const habits = asArray(readJSON(KEYS.habits, [])).map(normHabit).filter(Boolean);
  const tasks = asArray(readJSON(KEYS.tasks, [])).map(normTask).filter(Boolean);
  const txns = asArray(readJSON(KEYS.txns, [])).map(normTxn).filter(Boolean);
  const goal = normGoal(readJSON(KEYS.goal, null));
  const settings = { aza: true, sysTheme: false, ...(isObj(readJSON(KEYS.settings, null)) ? readJSON(KEYS.settings, null) : {}) };
  const terms = readJSON(KEYS.terms, null);
  const notif = readRaw(KEYS.notif) === "true";

  if (schema < SCHEMA_VERSION) {
    const ok = writeJSON(KEYS.habits, habits) && writeJSON(KEYS.tasks, tasks) && writeJSON(KEYS.txns, txns) && (!user || writeJSON(KEYS.user, user));
    if (ok) try { localStorage.setItem(KEYS.schema, String(SCHEMA_VERSION)); } catch (e) {}
  }
  return { user, habits, tasks, txns, goal, settings, terms, notif, migratedFrom: schema };
}

export function buildBackup(state) {
  return {
    app: "NextLVL", version: APP_VERSION, schema: SCHEMA_VERSION, exportedAt: new Date().toISOString(),
    data: { user: state.user, habits: state.habits, tasks: state.tasks, txns: state.txns, goal: state.goal, settings: state.settings },
  };
}

export function parseBackup(text) {
  const obj = JSON.parse(text);
  const d = obj && obj.data ? obj.data : obj;
  if (!isObj(d) || (!Array.isArray(d.habits) && !Array.isArray(d.tasks) && !Array.isArray(d.txns))) throw new Error("bad");
  return {
    user: normUser(d.user),
    habits: asArray(d.habits).map(normHabit).filter(Boolean),
    tasks: asArray(d.tasks).map(normTask).filter(Boolean),
    txns: asArray(d.txns).map(normTxn).filter(Boolean),
    goal: normGoal(d.goal),
    settings: isObj(d.settings) ? d.settings : null,
  };
}

export function snapshotCurrent(key) {
  const snap = { at: new Date().toISOString(), user: readRaw(KEYS.user), habits: readRaw(KEYS.habits), tasks: readRaw(KEYS.tasks), txns: readRaw(KEYS.txns), goal: readRaw(KEYS.goal) };
  try { localStorage.setItem(key, JSON.stringify(snap)); return true; } catch (e) { return false; }
}

export function wipeAll() {
  try {
    const ks = [];
    for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && k.startsWith("nl-")) ks.push(k); }
    ks.forEach((k) => localStorage.removeItem(k));
  } catch (e) {}
}

// ─── ЛОГИКА ПРИВЫЧЕК ─────────────────────────────────────────────────────────
export const isDoneOn = (h, k) => !!(h.checks && h.checks[k]);
export const countOn = (h, k) => Number(h.counts && h.counts[k]) || (h.type === "count" ? 0 : (isDoneOn(h, k) ? 1 : 0));

export function weekDoneCount(h, k = today()) {
  const ws = weekStart(k);
  let n = 0;
  for (let i = 0; i < 7; i++) if (isDoneOn(h, addDays(ws, i))) n++;
  return n;
}

// Серия: для ежедневных — дни подряд (сегодня ещё можно успеть, поэтому серия не рвётся до конца дня);
// для «N раз в неделю» — недели подряд, где норма выполнена.
export function streakOf(h) {
  const t = today();
  if (h.freq >= 7) {
    let k = isDoneOn(h, t) ? t : addDays(t, -1);
    let s = 0, guard = 0;
    while (isDoneOn(h, k) && guard < 3650) { s++; k = addDays(k, -1); guard++; }
    return s;
  }
  let ws = weekStart(t);
  let s = weekDoneCount(h, ws) >= h.freq ? 1 : 0;
  ws = addDays(ws, -7);
  let guard = 0;
  while (weekDoneCount(h, ws) >= h.freq && guard < 520) { s++; ws = addDays(ws, -7); guard++; }
  return s;
}

export function bestStreakOf(h) {
  const keys = Object.keys(h.checks || {}).filter((k) => isKey(k) && h.checks[k]).sort();
  let best = 0, cur = 0, prev = null;
  for (const k of keys) {
    cur = prev && addDays(prev, 1) === k ? cur + 1 : 1;
    if (cur > best) best = cur;
    prev = k;
  }
  return best;
}

export function dueToday(h) {
  if (h.freq >= 7) return true;
  return isDoneOn(h, today()) || weekDoneCount(h) < h.freq;
}

// Процент выполнения привычки за период [from, to]
export function habitPct(h, from, to) {
  const start = h.createdAt && h.createdAt > from ? h.createdAt : from;
  const end = to < today() ? to : today();
  if (start > end) return null;
  const days = daysBetween(start, end) + 1;
  let done = 0;
  rangeDays(start, end).forEach((k) => { if (isDoneOn(h, k)) done++; });
  const due = h.freq >= 7 ? days : Math.max(1, Math.round((days / 7) * h.freq));
  return Math.min(100, Math.round((done / due) * 100));
}

export function habitsPct(habits, from, to) {
  const vals = habits.map((h) => habitPct(h, from, to)).filter((v) => v != null);
  return vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
}

// ─── УРОВНИ И БЕЙДЖИ ─────────────────────────────────────────────────────────
export const LEVELS = [
  { level: 1, xp: 0, icon: "plant" }, { level: 2, xp: 500, icon: "leaf" }, { level: 3, xp: 1000, icon: "bolt" },
  { level: 4, xp: 2000, icon: "flame" }, { level: 5, xp: 3500, icon: "barbell" }, { level: 6, xp: 5500, icon: "trophy" },
  { level: 7, xp: 8000, icon: "crown" }, { level: 8, xp: 12000, icon: "gem" }, { level: 9, xp: 17000, icon: "star" },
  { level: 10, xp: 25000, icon: "shield" },
];

export function calcXP(habits, tasks, txns) {
  // как в прежней версии: считаются все ключи отметок (чтобы XP пользователей не изменился после обновления)
  return habits.reduce((s, h) => s + Object.keys(h.checks || {}).length * 10, 0)
    + tasks.filter((t) => t.done).length * 20 + txns.length * 5;
}

export function levelInfo(xp) {
  const cur = LEVELS.slice().reverse().find((l) => xp >= l.xp) || LEVELS[0];
  const next = LEVELS.find((l) => l.xp > xp) || null;
  const pct = next ? Math.round(((xp - cur.xp) / (next.xp - cur.xp)) * 100) : 100;
  return { cur, next, pct };
}

export function goalSaved(goal, txns) {
  if (!goal) return 0;
  return txns.filter((x) => x.type === "deposit" && x.goalId === goal.id).reduce((s, x) => s + x.amount, 0);
}

export const BADGES = [
  { id: "first_habit", icon: "plant", prog: (c) => [Math.min(c.habits.length, 1), 1] },
  { id: "habits5", icon: "list", prog: (c) => [Math.min(c.habits.length, 5), 5] },
  { id: "week_streak", icon: "flame", prog: (c) => [Math.min(c.maxStreak, 7), 7], unit: "days" },
  { id: "month_streak", icon: "crown", prog: (c) => [Math.min(c.maxStreak, 30), 30], unit: "days" },
  { id: "xp100", icon: "bolt", prog: (c) => [Math.min(c.xp, 100), 100], unit: "xp" },
  { id: "xp1000", icon: "gem", prog: (c) => [Math.min(c.xp, 1000), 1000], unit: "xp" },
  { id: "tasks10", icon: "check", prog: (c) => [Math.min(c.doneTasks, 10), 10], unit: "tasks" },
  { id: "tasks50", icon: "target", prog: (c) => [Math.min(c.doneTasks, 50), 50], unit: "tasks" },
  { id: "spheres5", icon: "star", prog: (c) => [c.spheresUsed, 5] },
  { id: "fin30", icon: "coins", prog: (c) => [Math.min(c.finDays, 30), 30], unit: "days" },
  { id: "piggy", icon: "gift", prog: (c) => [c.goal ? Math.min(50, Math.floor((c.saved / c.goal.target) * 100)) : 0, 50], unit: "pct" },
  { id: "goal_done", icon: "trophy", prog: (c) => [c.goal ? Math.min(100, Math.floor((c.saved / c.goal.target) * 100)) : 0, 100], unit: "pct" },
];

// ─── ПЕРЕВОДЫ ────────────────────────────────────────────────────────────────
export const MONTHS = {
  ru: ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"],
  kk: ["Қаңтар", "Ақпан", "Наурыз", "Сәуір", "Мамыр", "Маусым", "Шілде", "Тамыз", "Қыркүйек", "Қазан", "Қараша", "Желтоқсан"],
  en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
};
export const MONTHS_GEN = {
  ru: ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"],
  kk: ["қаңтар", "ақпан", "наурыз", "сәуір", "мамыр", "маусым", "шілде", "тамыз", "қыркүйек", "қазан", "қараша", "желтоқсан"],
  en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
};
export const WD_SHORT = { ru: ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"], kk: ["Дс", "Сс", "Ср", "Бс", "Жм", "Сб", "Жс"], en: ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"] };
export const WD_FULL = {
  ru: ["Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота", "Воскресенье"],
  kk: ["Дүйсенбі", "Сейсенбі", "Сәрсенбі", "Бейсенбі", "Жұма", "Сенбі", "Жексенбі"],
  en: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
};
export const wdIndex = (k) => (parseKey(k).getDay() + 6) % 7;
export const dayLabel = (k, lang) => { const [, m, d] = k.split("-").map(Number); return lang === "en" ? MONTHS_GEN.en[m - 1] + " " + d : d + " " + MONTHS_GEN[lang][m - 1]; };

export const L = {
  ru: {
    notifOn: "Уведомления включены — отправили проверочное", notifOnNoTest: "Подписка сохранена, но проверочное уведомление не дошло. Проверьте разрешения телефона",
    notifTestSent: "Проверочное уведомление отправлено", notifTest: "Проверить уведомления", notifTestSub: "придёт тестовое уведомление",
    notifUnsupported: "Это устройство или браузер не поддерживает уведомления. На iPhone сначала добавьте NextLVL на экран «Домой»",
    notifDenied: "Уведомления запрещены. Разрешите их: Настройки телефона → Приложения → NextLVL (или Chrome) → Уведомления",
    notifServer: "Сервер уведомлений ещё не настроен", notifNet: "Нет связи с сервером, попробуйте позже",
    slogan: "NEXT LEVEL EVERY DAY", chooseLang: "Выбери язык / Тілді таңда / Choose language",
    azaHello: "Привет! Я Аза — твой AI-советник NextLVL.", askName: "Как тебя зовут?", namePh: "Введи своё имя", start: "Начать", next: "Далее",
    nav_home: "Главная", nav_skills: "Навыки", nav_fin: "Финансы", nav_tasks: "Задачи", nav_profile: "Профиль",
    lvl: "Ур.", days_n: (n) => n + " " + plural(n, ["день", "дня", "дней"]), badges_n: (n) => n + " " + plural(n, ["бейдж", "бейджа", "бейджей"]), tasks_n: (n) => n + " " + plural(n, ["задача", "задачи", "задач"]),
    quests: "Квесты дня", questsEmpty: "Добавь первую привычку — она станет квестом дня", addHabitCta: "Добавить привычку",
    doneOf: (a, b, xp) => a + " из " + b + " · +" + xp + " XP", done_xp: "выполнено · +10 XP",
    nextReward: "СЛЕДУЮЩАЯ НАГРАДА", allBadges: "Все бейджи получены", left: "ещё", monthExp: "Расходы за месяц",
    azaTipDefault: "Отметь хотя бы одну привычку сегодня — серия держится на маленьких шагах.",
    skills: "Навыки", skillsSum: (a, b, xp) => a + " из " + b + " сегодня · +" + xp + " XP", balance: "Баланс характеристик", weak: "Слабая сфера",
    week: "Неделя", month: "Месяц", day: "День", period: "Период", quarter: "Квартал", year: "Год",
    sph_body: "Тело", sph_mind: "Разум", sph_work: "Работа", sph_health: "Здоровье", sph_finance: "Финансы",
    streak: "серия", streakW: "серия нед.", daily: "каждый день", perWeek: (n) => n + " раз в неделю", presets: "ГОТОВЫЕ НАБОРЫ", habits_n: (n) => n + " " + plural(n, ["привычка", "привычки", "привычек"]),
    pre_morning: "Утренняя рутина", pre_sleep: "Здоровый сон", pre_prod: "Продуктивность", addAll: "Добавить все", already: "уже есть",
    azaSuggest: (s, h) => "Aza: сфера «" + s + "» пустая — добавить привычку «" + h + "»?",
    newHabit: "Новая привычка", editHabit: "Привычка", habitName: "Название", sphere: "Сфера", type: "Тип",
    typeDone: "Выполнено / не выполнено", typeCount: "Количество", target: "Цель в день", unit: "Единица", unitPh: "стаканов",
    freq: "Как часто", icon: "Иконка", last7: "Последние 7 дней", save: "Сохранить", cancel: "Отмена", del: "Удалить", delConfirm: "Удалить? Это действие нельзя отменить.",
    noHabitsSph: "В этой сфере пока нет привычек",
    finance: "Финансы", add: "Добавить", quick5: "ЗАПИСЬ ЗА 5 СЕКУНД", quickPh: "кофе 1200, такси 2000", date: "Дата", todayW: "Сегодня", yesterdayW: "Вчера", tomorrowW: "Завтра",
    income: "Доход", expense: "Расход", deposit: "В цель", bal: "Баланс", quickHint: "+ в начале — доход: «+зарплата 300000»",
    goalQuest: "КВЕСТ-ЦЕЛЬ", saved: "накоплено", toGoal: "+ В цель", setGoal: "Поставить цель", goalTitle: "На что копим", goalTarget: "Сумма цели, ₸",
    goalEmpty: "Поставь цель — накопления станут дорогой с наградами", goalStart: "старт", goalEnd: "цель", piggyHint: (n) => "Бейдж «Копилка» при 50% — ещё " + n + " ₸", goalDone: "Цель достигнута!",
    noTxns: "Нет записей за этот период", txn: "Запись", amount: "Сумма, ₸", category: "Категория", note: "Описание", notePh: "необязательно",
    cat_food: "Продукты", cat_cafe: "Кафе и еда", cat_transport: "Транспорт", cat_auto: "Авто", cat_home: "Дом и ЖКУ", cat_comm: "Связь", cat_health: "Здоровье", cat_clothes: "Одежда", cat_fun: "Развлечения", cat_work: "Работа", cat_edu: "Обучение", cat_other: "Другое",
    cat_salary: "Зарплата", cat_side: "Подработка", cat_gift: "Подарок", cat_other_in: "Другой доход", cat_goal: "Накопление",
    tasks: "Задачи", tasksSum: (a, d) => a + " активных · " + d + " готово", taskPh: "Что нужно сделать?", deadlines: "Сроки", matrix: "Матрица",
    q_now: "Сейчас", q_plan: "План", q_deleg: "Делегировать", q_later: "Потом",
    qt_now: "СДЕЛАТЬ СЕЙЧАС", qt_plan: "ЗАПЛАНИРОВАТЬ", qt_deleg: "ДЕЛЕГИРОВАТЬ", qt_later: "ПОТОМ",
    qs_now: "срочно · важно", qs_plan: "важно · не срочно", qs_deleg: "срочно · не важно", qs_later: "не срочно · не важно",
    sec_over: "ПРОСРОЧЕНО", sec_today: "СЕГОДНЯ", sec_tomorrow: "ЗАВТРА", sec_later: "ПОЗЖЕ / БЕЗ СРОКА",
    noDeadline: "без срока", ago: (n) => n + " " + plural(n, ["день", "дня", "дней"]) + " назад", doneN: "Выполнено", noTasks: "Нет активных задач — добавь первую",
    newTask: "Новая задача", task: "Задача", deadline: "Срок", quadrant: "Важность и срочность",
    azaMatrix: (n, o) => "Aza: в «Сейчас» " + n + " " + plural(n, ["задача", "задачи", "задач"]) + (o ? ", просрочено " + o + " — начни с них." : " — начни с них."), azaMatrixEmpty: "Aza: срочного нет — самое время для задач из «Запланировать».",
    voice: "Голосом", recording: "Говорите… нажмите ещё раз", transcribing: "Распознаю…", micErr: "Нет доступа к микрофону", voiceErr: "Не удалось распознать речь",
    profile: "Профиль", results: "ИТОГИ", habitsW: "привычек", tasksW: "задач", savedW: "сбережено", firstMonth: "первый месяц в NextLVL",
    better: (n) => "на " + n + " XP больше, чем в прошлом месяце", worse: (n) => "на " + n + " XP меньше, чем в прошлом месяце", same: "как в прошлом месяце",
    records: "РЕКОРДЫ", longest: "Самая длинная серия", bestDay: "Лучший день", strong: "Сильная сфера", none: "—",
    export: "Экспорт", badges: "Бейджи", settings: "Настройки", theme: "ТЕМА", sysTheme: "Как в системе", language: "ЯЗЫК", notifs: "УВЕДОМЛЕНИЯ",
    reminders: "Напоминания", azaTips: "Советы Aza", data: "ДАННЫЕ", excel: "Экспорт в Excel", excelSub: "неделя / месяц / квартал / год / период",
    name: "Имя", backup: "Резервная копия", backupSub: "скачать все данные файлом", restore: "Восстановить из копии", restoreSub: "загрузить файл .json",
    reset: "Сбросить все данные", docs: "ДОКУМЕНТЫ", terms: "Пользовательское соглашение", privacy: "Политика конфиденциальности",
    th_neon: "Неон", th_light: "Светлая", th_kz: "Небо и золото", th_aurora: "Аврора", th_sand: "Песок и лес", th_lime: "Синий + лайм",
    exportTitle: "Отчёт в Excel", download: "Скачать Excel", building: "Формирую отчёт…", from: "С", to: "По", exportErr: "Не удалось сформировать отчёт",
    restoreOk: "Данные восстановлены", restoreBad: "Файл не похож на резервную копию NextLVL", restoreAsk: (h, t, x) => "Заменить текущие данные копией? В копии: " + h + " привычек, " + t + " задач, " + x + " записей. Текущие данные будут сохранены во внутреннюю копию.",
    resetAsk1: "Удалить ВСЕ данные NextLVL на этом устройстве? Совет: сначала скачайте резервную копию.", resetAsk2: "Точно удалить? Восстановить без резервной копии будет невозможно.",
    saveErr: "Не удалось сохранить данные: память устройства заполнена. Скачайте резервную копию.",
    termsTitle: "Пользовательское соглашение", termsUpd: "Мы обновили NextLVL", termsSafe: "Ваши данные на месте", termsData: (h, t, x) => h + " привычек · " + t + " задач · " + x + " фин. записей",
    termsText: "Чтобы продолжить, ознакомьтесь и примите Пользовательское соглашение и Политику конфиденциальности. Ваши данные хранятся только на этом устройстве.",
    termsAgree: "Я прочитал(а) и принимаю условия", accept: "Принять и продолжить", read: "Читать",
    aza: "Aza AI", azaOnline: "онлайн", chatPh: "Спроси Азу…", azaErr: "Aza сейчас недоступна, попробуйте позже",
    shareText: (m, xp, h, t, s) => "Мои итоги за " + m + " в NextLVL: " + xp + ", привычки " + h + ", задачи " + t + ", сбережено " + s + ". next-lvl.kz",
    copied: "Скопировано в буфер обмена", earned: "получен", notifTimes: "07:00 · 10:00 · 13:00 · 17:00 · 21:00 (Астана)",
    b_first_habit: "Первая привычка", b_habits5: "5 привычек", b_week_streak: "7 дней подряд", b_month_streak: "30 дней подряд", b_xp100: "100 XP", b_xp1000: "1000 XP",
    b_tasks10: "10 задач", b_tasks50: "50 задач", b_spheres5: "Все 5 сфер", b_fin30: "Учёт 30 дней", b_piggy: "Копилка", b_goal_done: "Цель достигнута",
    lv: ["Новичок", "Стартер", "Практик", "Боец", "Мастер", "Чемпион", "Легенда", "Элита", "Непобедимый", "NextLVL Pro"],
    u_days: (n) => n + " " + plural(n, ["день", "дня", "дней"]), u_xp: (n) => n + " XP", u_tasks: (n) => n + " " + plural(n, ["задача", "задачи", "задач"]), u_pct: (n) => n + "%",
  },
  kk: {
    notifOn: "Хабарландырулар қосылды — тексеру хабары жіберілді", notifOnNoTest: "Жазылым сақталды, бірақ тексеру хабары жетпеді. Телефон рұқсаттарын тексеріңіз",
    notifTestSent: "Тексеру хабары жіберілді", notifTest: "Хабарландыруды тексеру", notifTestSub: "тест хабары келеді",
    notifUnsupported: "Бұл құрылғы немесе браузер хабарландыруларды қолдамайды. iPhone-да алдымен NextLVL-ді «Басты экранға» қосыңыз",
    notifDenied: "Хабарландыруларға тыйым салынған. Рұқсат беріңіз: Телефон баптаулары → Қолданбалар → NextLVL (немесе Chrome) → Хабарландырулар",
    notifServer: "Хабарландыру сервері әлі бапталмаған", notifNet: "Сервермен байланыс жоқ, кейінірек көріңіз",
    slogan: "NEXT LEVEL EVERY DAY", chooseLang: "Выбери язык / Тілді таңда / Choose language",
    azaHello: "Сәлем! Мен Аза — NextLVL AI-кеңесшіңмін.", askName: "Атың кім?", namePh: "Атыңды жаз", start: "Бастау", next: "Әрі қарай",
    nav_home: "Басты", nav_skills: "Дағдылар", nav_fin: "Қаржы", nav_tasks: "Тапсырма", nav_profile: "Профиль",
    lvl: "Дең.", days_n: (n) => n + " күн", badges_n: (n) => n + " белгі", tasks_n: (n) => n + " тапсырма",
    quests: "Күн квесттері", questsEmpty: "Алғашқы әдетіңді қос — ол күн квесті болады", addHabitCta: "Әдет қосу",
    doneOf: (a, b, xp) => a + " / " + b + " · +" + xp + " XP", done_xp: "орындалды · +10 XP",
    nextReward: "КЕЛЕСІ МАРАПАТ", allBadges: "Барлық белгілер алынды", left: "тағы", monthExp: "Айлық шығын",
    azaTipDefault: "Бүгін кем дегенде бір әдетті белгіле — серия кішкентай қадамдардан тұрады.",
    skills: "Дағдылар", skillsSum: (a, b, xp) => "Бүгін " + a + " / " + b + " · +" + xp + " XP", balance: "Сипаттамалар балансы", weak: "Әлсіз сала",
    week: "Апта", month: "Ай", day: "Күн", period: "Кезең", quarter: "Тоқсан", year: "Жыл",
    sph_body: "Дене", sph_mind: "Ақыл", sph_work: "Жұмыс", sph_health: "Денсаулық", sph_finance: "Қаржы",
    streak: "серия", streakW: "апта серия", daily: "күн сайын", perWeek: (n) => "аптасына " + n + " рет", presets: "ДАЙЫН ЖИЫНТЫҚТАР", habits_n: (n) => n + " әдет",
    pre_morning: "Таңғы режим", pre_sleep: "Сау ұйқы", pre_prod: "Өнімділік", addAll: "Барлығын қосу", already: "бар",
    azaSuggest: (s, h) => "Aza: «" + s + "» саласы бос — «" + h + "» әдетін қосайық па?",
    newHabit: "Жаңа әдет", editHabit: "Әдет", habitName: "Атауы", sphere: "Сала", type: "Түрі",
    typeDone: "Орындалды / орындалмады", typeCount: "Саны", target: "Күндік мақсат", unit: "Өлшем", unitPh: "стақан",
    freq: "Қаншалықты жиі", icon: "Белгіше", last7: "Соңғы 7 күн", save: "Сақтау", cancel: "Болдырмау", del: "Жою", delConfirm: "Жою керек пе? Бұл әрекетті қайтару мүмкін емес.",
    noHabitsSph: "Бұл салада әзірге әдет жоқ",
    finance: "Қаржы", add: "Қосу", quick5: "5 СЕКУНДТА ЖАЗУ", quickPh: "кофе 1200, такси 2000", date: "Күні", todayW: "Бүгін", yesterdayW: "Кеше", tomorrowW: "Ертең",
    income: "Кіріс", expense: "Шығыс", deposit: "Мақсатқа", bal: "Баланс", quickHint: "Басында + болса — кіріс: «+жалақы 300000»",
    goalQuest: "КВЕСТ-МАҚСАТ", saved: "жиналды", toGoal: "+ Мақсатқа", setGoal: "Мақсат қою", goalTitle: "Не үшін жинаймыз", goalTarget: "Мақсат сомасы, ₸",
    goalEmpty: "Мақсат қой — жинақ марапаттары бар жолға айналады", goalStart: "старт", goalEnd: "мақсат", piggyHint: (n) => "«Қорапша» белгісі 50%-да — тағы " + n + " ₸", goalDone: "Мақсатқа жеттің!",
    noTxns: "Бұл кезеңде жазба жоқ", txn: "Жазба", amount: "Сома, ₸", category: "Санат", note: "Сипаттама", notePh: "міндетті емес",
    cat_food: "Азық-түлік", cat_cafe: "Кафе және тамақ", cat_transport: "Көлік", cat_auto: "Авто", cat_home: "Үй және ТКШ", cat_comm: "Байланыс", cat_health: "Денсаулық", cat_clothes: "Киім", cat_fun: "Ойын-сауық", cat_work: "Жұмыс", cat_edu: "Оқу", cat_other: "Басқа",
    cat_salary: "Жалақы", cat_side: "Қосымша табыс", cat_gift: "Сыйлық", cat_other_in: "Басқа кіріс", cat_goal: "Жинақ",
    tasks: "Тапсырмалар", tasksSum: (a, d) => a + " белсенді · " + d + " дайын", taskPh: "Не істеу керек?", deadlines: "Мерзімдер", matrix: "Матрица",
    q_now: "Қазір", q_plan: "Жоспар", q_deleg: "Тапсыру", q_later: "Кейін",
    qt_now: "ҚАЗІР ІСТЕУ", qt_plan: "ЖОСПАРЛАУ", qt_deleg: "ТАПСЫРУ", qt_later: "КЕЙІН",
    qs_now: "шұғыл · маңызды", qs_plan: "маңызды · шұғыл емес", qs_deleg: "шұғыл · маңызды емес", qs_later: "шұғыл емес · маңызды емес",
    sec_over: "МЕРЗІМІ ӨТКЕН", sec_today: "БҮГІН", sec_tomorrow: "ЕРТЕҢ", sec_later: "КЕЙІН / МЕРЗІМСІЗ",
    noDeadline: "мерзімсіз", ago: (n) => n + " күн бұрын", doneN: "Орындалды", noTasks: "Белсенді тапсырма жоқ — біріншісін қос",
    newTask: "Жаңа тапсырма", task: "Тапсырма", deadline: "Мерзім", quadrant: "Маңыздылығы мен шұғылдығы",
    azaMatrix: (n, o) => "Aza: «Қазір» бөлімінде " + n + " тапсырма" + (o ? ", " + o + " мерзімі өткен — солардан баста." : " — солардан баста."), azaMatrixEmpty: "Aza: шұғыл ештеңе жоқ — «Жоспарлау» тапсырмаларына уақыт.",
    voice: "Дауыспен", recording: "Сөйлеңіз… қайта басыңыз", transcribing: "Танып жатырмын…", micErr: "Микрофонға рұқсат жоқ", voiceErr: "Сөзді тану мүмкін болмады",
    profile: "Профиль", results: "ҚОРЫТЫНДЫ", habitsW: "әдеттер", tasksW: "тапсырма", savedW: "жинақ", firstMonth: "NextLVL-дегі алғашқы ай",
    better: (n) => "өткен айдан " + n + " XP артық", worse: (n) => "өткен айдан " + n + " XP кем", same: "өткен аймен бірдей",
    records: "РЕКОРДТАР", longest: "Ең ұзын серия", bestDay: "Ең жақсы күн", strong: "Мықты сала", none: "—",
    export: "Экспорт", badges: "Белгілер", settings: "Баптаулар", theme: "ТАҚЫРЫП", sysTheme: "Жүйедегідей", language: "ТІЛ", notifs: "ХАБАРЛАНДЫРУЛАР",
    reminders: "Еске салғыштар", azaTips: "Aza кеңестері", data: "ДЕРЕКТЕР", excel: "Excel-ге экспорт", excelSub: "апта / ай / тоқсан / жыл / кезең",
    name: "Аты", backup: "Сақтық көшірме", backupSub: "барлық деректерді файлмен жүктеу", restore: "Көшірмеден қалпына келтіру", restoreSub: ".json файлын жүктеу",
    reset: "Барлық деректерді өшіру", docs: "ҚҰЖАТТАР", terms: "Пайдаланушы келісімі", privacy: "Құпиялылық саясаты",
    th_neon: "Неон", th_light: "Ашық", th_kz: "Аспан мен алтын", th_aurora: "Аврора", th_sand: "Құм мен орман", th_lime: "Көк + лайм",
    exportTitle: "Excel есеп", download: "Excel жүктеу", building: "Есеп дайындалуда…", from: "Бастап", to: "Дейін", exportErr: "Есепті құру мүмкін болмады",
    restoreOk: "Деректер қалпына келтірілді", restoreBad: "Файл NextLVL сақтық көшірмесіне ұқсамайды", restoreAsk: (h, t, x) => "Ағымдағы деректерді көшірмемен ауыстырайық па? Көшірмеде: " + h + " әдет, " + t + " тапсырма, " + x + " жазба. Ағымдағы деректер ішкі көшірмеде сақталады.",
    resetAsk1: "Осы құрылғыдағы NextLVL-дің БАРЛЫҚ деректерін өшіру керек пе? Алдымен сақтық көшірме жүктеп алыңыз.", resetAsk2: "Нақты өшіру керек пе? Көшірмесіз қалпына келтіру мүмкін болмайды.",
    saveErr: "Деректерді сақтау мүмкін болмады: құрылғы жады толы. Сақтық көшірмені жүктеп алыңыз.",
    termsTitle: "Пайдаланушы келісімі", termsUpd: "NextLVL жаңартылды", termsSafe: "Деректеріңіз орнында", termsData: (h, t, x) => h + " әдет · " + t + " тапсырма · " + x + " қаржы жазбасы",
    termsText: "Жалғастыру үшін Пайдаланушы келісімі мен Құпиялылық саясатын оқып, қабылдаңыз. Деректеріңіз тек осы құрылғыда сақталады.",
    termsAgree: "Шарттарды оқыдым және қабылдаймын", accept: "Қабылдау және жалғастыру", read: "Оқу",
    aza: "Aza AI", azaOnline: "онлайн", chatPh: "Азадан сұра…", azaErr: "Aza қазір қолжетімсіз, кейінірек көріңіз",
    shareText: (m, xp, h, t, s) => "NextLVL-дегі " + m + " қорытындым: " + xp + ", әдеттер " + h + ", тапсырмалар " + t + ", жинақ " + s + ". next-lvl.kz",
    copied: "Көшірілді", earned: "алынды", notifTimes: "07:00 · 10:00 · 13:00 · 17:00 · 21:00",
    b_first_habit: "Алғашқы әдет", b_habits5: "5 әдет", b_week_streak: "7 күн қатарынан", b_month_streak: "30 күн қатарынан", b_xp100: "100 XP", b_xp1000: "1000 XP",
    b_tasks10: "10 тапсырма", b_tasks50: "50 тапсырма", b_spheres5: "Барлық 5 сала", b_fin30: "30 күн есеп", b_piggy: "Қорапша", b_goal_done: "Мақсатқа жетті",
    lv: ["Жаңадан бастаушы", "Стартер", "Практик", "Жауынгер", "Шебер", "Чемпион", "Аңыз", "Элита", "Жеңілмейтін", "NextLVL Pro"],
    u_days: (n) => n + " күн", u_xp: (n) => n + " XP", u_tasks: (n) => n + " тапсырма", u_pct: (n) => n + "%",
  },
  en: {
    notifOn: "Notifications on — test notification sent", notifOnNoTest: "Subscription saved, but the test notification didn't arrive. Check phone permissions",
    notifTestSent: "Test notification sent", notifTest: "Test notifications", notifTestSub: "you'll get a test notification",
    notifUnsupported: "This device or browser doesn't support notifications. On iPhone, add NextLVL to the Home Screen first",
    notifDenied: "Notifications are blocked. Allow them in phone Settings → Apps → NextLVL (or Chrome) → Notifications",
    notifServer: "Notification server isn't set up yet", notifNet: "Can't reach the server, try later",
    slogan: "NEXT LEVEL EVERY DAY", chooseLang: "Выбери язык / Тілді таңда / Choose language",
    azaHello: "Hi! I'm Aza — your NextLVL AI advisor.", askName: "What's your name?", namePh: "Enter your name", start: "Start", next: "Next",
    nav_home: "Home", nav_skills: "Skills", nav_fin: "Finance", nav_tasks: "Tasks", nav_profile: "Profile",
    lvl: "Lv.", days_n: (n) => n + (n === 1 ? " day" : " days"), badges_n: (n) => n + (n === 1 ? " badge" : " badges"), tasks_n: (n) => n + (n === 1 ? " task" : " tasks"),
    quests: "Daily quests", questsEmpty: "Add your first habit — it becomes a daily quest", addHabitCta: "Add habit",
    doneOf: (a, b, xp) => a + " of " + b + " · +" + xp + " XP", done_xp: "done · +10 XP",
    nextReward: "NEXT REWARD", allBadges: "All badges earned", left: "left", monthExp: "Spent this month",
    azaTipDefault: "Check off at least one habit today — streaks are built from small steps.",
    skills: "Skills", skillsSum: (a, b, xp) => a + " of " + b + " today · +" + xp + " XP", balance: "Stats balance", weak: "Weak area",
    week: "Week", month: "Month", day: "Day", period: "Range", quarter: "Quarter", year: "Year",
    sph_body: "Body", sph_mind: "Mind", sph_work: "Work", sph_health: "Health", sph_finance: "Finance",
    streak: "streak", streakW: "wk streak", daily: "every day", perWeek: (n) => n + "× a week", presets: "READY-MADE SETS", habits_n: (n) => n + (n === 1 ? " habit" : " habits"),
    pre_morning: "Morning routine", pre_sleep: "Healthy sleep", pre_prod: "Productivity", addAll: "Add all", already: "already added",
    azaSuggest: (s, h) => "Aza: “" + s + "” is empty — add the habit “" + h + "”?",
    newHabit: "New habit", editHabit: "Habit", habitName: "Name", sphere: "Area", type: "Type",
    typeDone: "Done / not done", typeCount: "Amount", target: "Daily target", unit: "Unit", unitPh: "glasses",
    freq: "How often", icon: "Icon", last7: "Last 7 days", save: "Save", cancel: "Cancel", del: "Delete", delConfirm: "Delete? This can't be undone.",
    noHabitsSph: "No habits in this area yet",
    finance: "Finance", add: "Add", quick5: "LOG IN 5 SECONDS", quickPh: "coffee 1200, taxi 2000", date: "Date", todayW: "Today", yesterdayW: "Yesterday", tomorrowW: "Tomorrow",
    income: "Income", expense: "Expense", deposit: "To goal", bal: "Balance", quickHint: "Start with + for income: “+salary 300000”",
    goalQuest: "GOAL QUEST", saved: "saved", toGoal: "+ To goal", setGoal: "Set a goal", goalTitle: "Saving for", goalTarget: "Goal amount, ₸",
    goalEmpty: "Set a goal — your savings become a road with rewards", goalStart: "start", goalEnd: "goal", piggyHint: (n) => "“Piggy bank” badge at 50% — " + n + " ₸ to go", goalDone: "Goal reached!",
    noTxns: "No records for this period", txn: "Record", amount: "Amount, ₸", category: "Category", note: "Note", notePh: "optional",
    cat_food: "Groceries", cat_cafe: "Cafes and food", cat_transport: "Transport", cat_auto: "Car", cat_home: "Home and utilities", cat_comm: "Phone and internet", cat_health: "Health", cat_clothes: "Clothes", cat_fun: "Entertainment", cat_work: "Work", cat_edu: "Learning", cat_other: "Other",
    cat_salary: "Salary", cat_side: "Side income", cat_gift: "Gift", cat_other_in: "Other income", cat_goal: "Savings",
    tasks: "Tasks", tasksSum: (a, d) => a + " active · " + d + " done", taskPh: "What needs doing?", deadlines: "Deadlines", matrix: "Matrix",
    q_now: "Now", q_plan: "Plan", q_deleg: "Delegate", q_later: "Later",
    qt_now: "DO NOW", qt_plan: "SCHEDULE", qt_deleg: "DELEGATE", qt_later: "LATER",
    qs_now: "urgent · important", qs_plan: "important · not urgent", qs_deleg: "urgent · not important", qs_later: "not urgent · not important",
    sec_over: "OVERDUE", sec_today: "TODAY", sec_tomorrow: "TOMORROW", sec_later: "LATER / NO DATE",
    noDeadline: "no date", ago: (n) => n + (n === 1 ? " day ago" : " days ago"), doneN: "Done", noTasks: "No active tasks — add your first",
    newTask: "New task", task: "Task", deadline: "Due", quadrant: "Importance and urgency",
    azaMatrix: (n, o) => "Aza: " + n + " in “Now”" + (o ? ", " + o + " overdue — start there." : " — start there."), azaMatrixEmpty: "Aza: nothing urgent — good time for “Schedule” tasks.",
    voice: "Voice", recording: "Speak… tap again", transcribing: "Recognizing…", micErr: "No microphone access", voiceErr: "Couldn't recognize speech",
    profile: "Profile", results: "SUMMARY", habitsW: "habits", tasksW: "tasks", savedW: "saved", firstMonth: "first month in NextLVL",
    better: (n) => n + " XP more than last month", worse: (n) => n + " XP less than last month", same: "same as last month",
    records: "RECORDS", longest: "Longest streak", bestDay: "Best day", strong: "Strongest area", none: "—",
    export: "Export", badges: "Badges", settings: "Settings", theme: "THEME", sysTheme: "Match system", language: "LANGUAGE", notifs: "NOTIFICATIONS",
    reminders: "Reminders", azaTips: "Aza tips", data: "DATA", excel: "Export to Excel", excelSub: "week / month / quarter / year / range",
    name: "Name", backup: "Backup", backupSub: "download all data as a file", restore: "Restore from backup", restoreSub: "upload a .json file",
    reset: "Delete all data", docs: "DOCUMENTS", terms: "Terms of use", privacy: "Privacy policy",
    th_neon: "Neon", th_light: "Light", th_kz: "Sky and gold", th_aurora: "Aurora", th_sand: "Sand and forest", th_lime: "Blue + lime",
    exportTitle: "Excel report", download: "Download Excel", building: "Building report…", from: "From", to: "To", exportErr: "Couldn't build the report",
    restoreOk: "Data restored", restoreBad: "This file isn't a NextLVL backup", restoreAsk: (h, t, x) => "Replace current data with the backup? It has " + h + " habits, " + t + " tasks, " + x + " records. Current data will be kept in an internal copy.",
    resetAsk1: "Delete ALL NextLVL data on this device? Tip: download a backup first.", resetAsk2: "Delete for sure? Without a backup this can't be restored.",
    saveErr: "Couldn't save: device storage is full. Download a backup.",
    termsTitle: "Terms of use", termsUpd: "NextLVL has been updated", termsSafe: "Your data is safe", termsData: (h, t, x) => h + " habits · " + t + " tasks · " + x + " finance records",
    termsText: "To continue, please read and accept the Terms of use and Privacy policy. Your data is stored only on this device.",
    termsAgree: "I have read and accept the terms", accept: "Accept and continue", read: "Read",
    aza: "Aza AI", azaOnline: "online", chatPh: "Ask Aza…", azaErr: "Aza is unavailable right now, try later",
    shareText: (m, xp, h, t, s) => "My " + m + " in NextLVL: " + xp + ", habits " + h + ", tasks " + t + ", saved " + s + ". next-lvl.kz",
    copied: "Copied to clipboard", earned: "earned", notifTimes: "07:00 · 10:00 · 13:00 · 17:00 · 21:00",
    b_first_habit: "First habit", b_habits5: "5 habits", b_week_streak: "7 days in a row", b_month_streak: "30 days in a row", b_xp100: "100 XP", b_xp1000: "1000 XP",
    b_tasks10: "10 tasks", b_tasks50: "50 tasks", b_spheres5: "All 5 areas", b_fin30: "30 days of tracking", b_piggy: "Piggy bank", b_goal_done: "Goal reached",
    lv: ["Rookie", "Starter", "Practitioner", "Fighter", "Master", "Champion", "Legend", "Elite", "Unstoppable", "NextLVL Pro"],
    u_days: (n) => n + (n === 1 ? " day" : " days"), u_xp: (n) => n + " XP", u_tasks: (n) => n + (n === 1 ? " task" : " tasks"), u_pct: (n) => n + "%",
  },
};

export function plural(n, forms) {
  const a = Math.abs(n) % 100, b = a % 10;
  if (a > 10 && a < 20) return forms[2];
  if (b > 1 && b < 5) return forms[1];
  if (b === 1) return forms[0];
  return forms[2];
}

// Готовые наборы привычек
export const PRESETS = {
  morning: [
    { name: { ru: "Стакан воды после сна", kk: "Ұйқыдан кейін бір стақан су", en: "Glass of water after waking" }, sphere: "health", iconKey: "drop" },
    { name: { ru: "Зарядка 10 минут", kk: "10 минут жаттығу", en: "10-minute workout" }, sphere: "body", iconKey: "run" },
    { name: { ru: "Холодный душ", kk: "Суық душ", en: "Cold shower" }, sphere: "body", iconKey: "drop" },
    { name: { ru: "План на день", kk: "Күн жоспары", en: "Plan the day" }, sphere: "work", iconKey: "pen" },
  ],
  sleep: [
    { name: { ru: "Без телефона за час до сна", kk: "Ұйқыдан бір сағат бұрын телефонсыз", en: "No phone an hour before bed" }, sphere: "health", iconKey: "phone" },
    { name: { ru: "Отбой до 23:00", kk: "23:00-ге дейін ұйықтау", en: "Lights out by 23:00" }, sphere: "health", iconKey: "moon" },
    { name: { ru: "Чтение перед сном", kk: "Ұйқы алдында кітап оқу", en: "Reading before bed" }, sphere: "mind", iconKey: "book" },
  ],
  prod: [
    { name: { ru: "1 час глубокой работы", kk: "1 сағат терең жұмыс", en: "1 hour of deep work" }, sphere: "work", iconKey: "laptop" },
    { name: { ru: "Разобрать почту", kk: "Поштаны реттеу", en: "Clear the inbox" }, sphere: "work", iconKey: "doc" },
    { name: { ru: "Английский 20 минут", kk: "Ағылшын тілі 20 минут", en: "English for 20 minutes" }, sphere: "mind", iconKey: "lang" },
    { name: { ru: "Записать расходы", kk: "Шығындарды жазу", en: "Log expenses" }, sphere: "finance", iconKey: "coins" },
    { name: { ru: "Итоги дня", kk: "Күн қорытындысы", en: "Daily review" }, sphere: "mind", iconKey: "pen" },
  ],
};

// Подсказка Aza для пустой сферы
export const SPHERE_SUGGEST = {
  body: { ru: "Зарядка 10 минут", kk: "10 минут жаттығу", en: "10-minute workout", iconKey: "run" },
  mind: { ru: "Чтение 15 минут", kk: "15 минут кітап оқу", en: "Read for 15 minutes", iconKey: "book" },
  work: { ru: "1 час без телефона", kk: "1 сағат телефонсыз", en: "1 hour without phone", iconKey: "phone" },
  health: { ru: "Вода 8 стаканов", kk: "8 стақан су", en: "8 glasses of water", iconKey: "cup", type: "count", target: 8 },
  finance: { ru: "Записать расходы", kk: "Шығындарды жазу", en: "Log expenses", iconKey: "coins" },
};

// ─── ПЕРИОДЫ ─────────────────────────────────────────────────────────────────
export function reportRange(kind, offset = 0, customFrom, customTo) {
  const t = today();
  if (kind === "week") { const s = addDays(weekStart(t), offset * 7); return { from: s, to: addDays(s, 6) }; }
  if (kind === "month") { const mk = shiftMonthKey(monthKey(t), offset); return { from: monthStart(mk), to: monthEnd(mk) }; }
  if (kind === "quarter") {
    const d = parseKey(t); let q = Math.floor(d.getMonth() / 3) + offset; let y = d.getFullYear();
    while (q < 0) { q += 4; y--; } while (q > 3) { q -= 4; y++; }
    const mk1 = y + "-" + String(q * 3 + 1).padStart(2, "0");
    return { from: monthStart(mk1), to: monthEnd(shiftMonthKey(mk1, 2)) };
  }
  if (kind === "year") { const y = parseKey(t).getFullYear() + offset; return { from: y + "-01-01", to: y + "-12-31" }; }
  const f = customFrom || addDays(t, -30), to = customTo || t;
  return f <= to ? { from: f, to } : { from: to, to: f };
}

