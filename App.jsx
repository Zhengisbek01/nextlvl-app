// NEXTLVL v3.0 — редизайн
// Данные пользователей сохраняются: ключи хранилища прежние, старые записи
// дополняются новыми полями (см. nl-data.js → loadAll / normHabit / normTask / normTxn).
import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  APP_VERSION, TERMS_VERSION, KEYS, IC, L, MONTHS, WD_SHORT, WD_FULL, SPHERES, HABIT_ICONS, EXP_CATS, INC_CATS, CAT_ICON,
  QUADS, Q_TO_PRIO, PRESETS, SPHERE_SUGGEST, BADGES, LEVELS, THEME_IDS,
  today, nowTime, addDays, parseKey, daysBetween, monthKey, shiftMonthKey, monthStart, monthEnd, weekStart, rangeDays, wdIndex, dayLabel,
  fmtNum, fmtShort, fmtDM, uid, isKey,
  loadAll, writeJSON, readRaw, buildBackup, parseBackup, snapshotCurrent, wipeAll, normHabit, normTask, normTxn, normGoal, normUser,
  reportRange, guessCategory, isDoneOn, countOn, weekDoneCount, streakOf, bestStreakOf, dueToday, habitPct, habitsPct, calcXP, levelInfo, goalSaved,
} from "./nl-data.js";

// ─── ТЕМЫ ─────────────────────────────────────────────────────────────────────
const THEMES = {
  neon: { bg: "#0A0F0A", card: "#111D11", inset: "#0A0F0A", border: "#1E3A22", line: "#1A2A1D", text: "#F0FFF7", sub: "#B5C7BD", muted: "#8FA398", dim: "#5C6E63", track: "#2C3E31",
    accent: "#39FF14", soft: "rgba(57,255,20,0.13)", on: "#0A0F0A", gold: "#FFB800", goldSoft: "rgba(255,184,0,0.15)", goldBg: "#17140C", goldLine: "#3A2E10",
    red: "#FF6B6B", redBg: "#1F1212", redLine: "#3A1818", blue: "#7FD3FF", hero: "linear-gradient(135deg,#123B18,#0D1A0D)", light: false, dot: "#39FF14" },
  light: { bg: "#F6F8F7", card: "#FFFFFF", inset: "#EEF3F0", border: "#D9E3DD", line: "#E6ECE9", text: "#0F1A15", sub: "#3D4B44", muted: "#5F7068", dim: "#9AA8A1", track: "#CBD5D0",
    accent: "#0E9F6E", soft: "rgba(16,185,129,0.12)", on: "#FFFFFF", gold: "#B45309", goldSoft: "rgba(217,119,6,0.12)", goldBg: "#FFF7E8", goldLine: "#F3D9A4",
    red: "#DC2626", redBg: "#FEF1F1", redLine: "#F7CACA", blue: "#0369A1", hero: "linear-gradient(135deg,#D1FAE5,#FFFFFF)", light: true, dot: "#10B981" },
  kz: { bg: "#06141B", card: "#0C2230", inset: "#06141B", border: "#16384A", line: "#12303F", text: "#EAF7FA", sub: "#B9D3DC", muted: "#8AA9B5", dim: "#5D7E8A", track: "#1E4456",
    accent: "#00AFCA", soft: "rgba(0,175,202,0.15)", on: "#04121A", gold: "#FEC50C", goldSoft: "rgba(254,197,12,0.15)", goldBg: "#18190C", goldLine: "#4A3E10",
    red: "#FF7A7A", redBg: "#2A1418", redLine: "#4A2228", blue: "#7FD3FF", hero: "linear-gradient(135deg,#0E3A4A,#091B26)", light: false, dot: "linear-gradient(90deg,#00AFCA 50%,#FEC50C 50%)" },
  aurora: { bg: "#0A0D12", card: "#121820", inset: "#0A0D12", border: "#1F2A36", line: "#1A2330", text: "#F1F5F9", sub: "#C2CCD8", muted: "#8B98A8", dim: "#5B6676", track: "#2A3542",
    accent: "#4ADE80", soft: "rgba(74,222,128,0.13)", on: "#0A0D12", gold: "#FBBF24", goldSoft: "rgba(251,191,36,0.15)", goldBg: "#18160E", goldLine: "#40361A",
    red: "#F87171", redBg: "#231416", redLine: "#45242A", blue: "#22D3EE", hero: "linear-gradient(135deg,#0F2A2E,#15203A)", light: false, dot: "linear-gradient(135deg,#22D3EE,#4ADE80)" },
  sand: { bg: "#F4EFE6", card: "#FFFBF4", inset: "#EFE8DC", border: "#DDD3C2", line: "#E6DDCF", text: "#1E2A22", sub: "#3E4A40", muted: "#6B6A5C", dim: "#A39C8C", track: "#CFC6B5",
    accent: "#1F4D3A", soft: "rgba(31,77,58,0.10)", on: "#F4EFE6", gold: "#A16207", goldSoft: "rgba(161,98,7,0.12)", goldBg: "#FBF1DD", goldLine: "#E8D3A8",
    red: "#B42318", redBg: "#FBEDEA", redLine: "#F0C8C2", blue: "#2563EB", hero: "linear-gradient(135deg,#E3EBDF,#FFFBF4)", light: true, dot: "#1F4D3A" },
  lime: { bg: "#0F1729", card: "#17213A", inset: "#0F1729", border: "#26324F", line: "#1F2A44", text: "#EEF2FA", sub: "#C3CCE0", muted: "#8D99B5", dim: "#5D6886", track: "#2E3A5A",
    accent: "#C6F432", soft: "rgba(198,244,50,0.13)", on: "#0F1729", gold: "#FFB800", goldSoft: "rgba(255,184,0,0.15)", goldBg: "#1C1D1A", goldLine: "#463A16",
    red: "#FF6B6B", redBg: "#2A1822", redLine: "#47243A", blue: "#7FD3FF", hero: "linear-gradient(135deg,#1E2C52,#131C32)", light: false, dot: "#C6F432" },
};
const Q_COLOR = (th) => ({ now: th.red, plan: th.accent, deleg: th.gold, later: th.muted });

// ─── БАЗОВЫЕ UI-КОМПОНЕНТЫ ────────────────────────────────────────────────────
function Icon({ d, size = 18, sw = 2, color = "currentColor", style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0, display: "block", ...style }}>
      <path d={d} />
    </svg>
  );
}
const btnReset = { border: "none", background: "none", padding: 0, margin: 0, cursor: "pointer", fontFamily: "inherit", color: "inherit" };

function Check({ on, onClick, th, label, size = 26, danger }) {
  return (
    <button type="button" onClick={onClick} aria-label={label} aria-pressed={on} style={{ ...btnReset, width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <span style={{ width: size, height: size, boxSizing: "border-box", borderRadius: "50%", border: "2px solid " + (on ? th.accent : danger ? th.red : th.track), background: on ? th.accent : "transparent", color: th.on, display: "flex", alignItems: "center", justifyContent: "center", transition: "all .15s" }}>
        {on && <Icon d={IC.check} size={size * 0.54} sw={3} />}
      </span>
    </button>
  );
}

function Switch({ on, onClick, th, label }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={on} aria-label={label} style={{ ...btnReset, width: 56, height: 44, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <span style={{ position: "relative", width: 38, height: 22, borderRadius: 11, background: on ? th.accent : th.track, transition: "background .2s" }}>
        <span style={{ position: "absolute", top: 3, left: on ? 19 : 3, width: 16, height: 16, borderRadius: "50%", background: on ? th.on : th.muted, transition: "left .2s" }} />
      </span>
    </button>
  );
}

function Chip({ children, color, th, bg }) {
  return <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 6, background: bg || th.inset, color: color || th.muted, whiteSpace: "nowrap" }}>{children}</span>;
}

function IconBox({ d, th, size = 36, color, bg, radius = 11, icon = 18 }) {
  return <div style={{ width: size, height: size, borderRadius: radius, background: bg || th.soft, color: color || th.accent, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icon d={d} size={icon} /></div>;
}

function Segmented({ items, value, onChange, th, cols }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(" + (cols || items.length) + ", minmax(0,1fr))", gap: 4, background: th.inset, borderRadius: 11, padding: 3 }}>
      {items.map(([k, label, icon]) => (
        <button key={k} type="button" onClick={() => onChange(k)} style={{ ...btnReset, minHeight: 38, borderRadius: 8, background: value === k ? th.accent : "transparent", color: value === k ? th.on : th.muted, fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
          {icon && <Icon d={icon} size={15} />}{label}
        </button>
      ))}
    </div>
  );
}

function SectionLabel({ children, right, th, style }) {
  return <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11, letterSpacing: "0.08em", color: th.muted, marginTop: 6, ...style }}><span>{children}</span>{right}</div>;
}

function Sheet({ open, onClose, title, th, children }) {
  useEffect(() => {
    if (!open) return;
    const k = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 700, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div onClick={(e) => e.stopPropagation()} role="dialog" aria-label={title} style={{ width: "100%", maxWidth: 500, maxHeight: "88vh", overflowY: "auto", background: th.card, borderRadius: "22px 22px 0 0", padding: "8px 16px calc(20px + env(safe-area-inset-bottom))", boxSizing: "border-box", color: th.text }}>
        <div style={{ width: 40, height: 4, borderRadius: 2, background: th.track, margin: "4px auto 10px" }} />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div style={{ fontSize: 17, fontWeight: 800 }}>{title}</div>
          <button type="button" onClick={onClose} aria-label="Закрыть" style={{ ...btnReset, width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", color: th.muted }}><Icon d={IC.x} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

const Field = ({ label, children, th }) => (
  <label style={{ display: "block", marginBottom: 12 }}>
    <div style={{ fontSize: 11, color: th.muted, marginBottom: 6, letterSpacing: "0.04em" }}>{label}</div>
    {children}
  </label>
);
const inputStyle = (th) => ({ width: "100%", boxSizing: "border-box", height: 46, padding: "0 14px", background: th.inset, border: "1px solid " + th.border, borderRadius: 12, color: th.text, fontSize: 15, fontFamily: "inherit", outline: "none" });
const primaryBtn = (th, extra) => ({ ...btnReset, minHeight: 48, borderRadius: 13, background: th.accent, color: th.on, fontSize: 14, fontWeight: 800, padding: "0 16px", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, ...extra });
const ghostBtn = (th, extra) => ({ ...btnReset, minHeight: 48, borderRadius: 13, background: th.inset, color: th.text, fontSize: 14, fontWeight: 600, padding: "0 16px", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, ...extra });

// ─── ГОЛОСОВОЙ ВВОД ───────────────────────────────────────────────────────────
function useVoice(lang, onText, onError) {
  const [state, setState] = useState("idle"); // idle | rec | busy
  const recRef = useRef(null);
  const chunks = useRef([]);
  async function start() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunks.current = [];
      mr.ondataavailable = (e) => { if (e.data.size > 0) chunks.current.push(e.data); };
      mr.onstop = async () => {
        stream.getTracks().forEach((tr) => tr.stop());
        setState("busy");
        try {
          const blob = new Blob(chunks.current, { type: mr.mimeType || "audio/webm" });
          const bytes = new Uint8Array(await blob.arrayBuffer());
          let bin = ""; const step = 0x8000;
          for (let i = 0; i < bytes.length; i += step) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + step));
          const r = await fetch("/api/transcribe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ audio: btoa(bin), mimeType: blob.type, language: lang }) });
          const data = await r.json();
          const text = (data.text || "").trim();
          if (!r.ok || data.error || !text) throw new Error(data.error || "empty");
          onText(text);
        } catch (e) { onError && onError("voice"); }
        setState("idle");
      };
      recRef.current = mr; mr.start(); setState("rec");
    } catch (e) { onError && onError("mic"); setState("idle"); }
  }
  function stop() { if (recRef.current && recRef.current.state !== "inactive") recRef.current.stop(); }
  return { state, toggle: () => (state === "rec" ? stop() : state === "idle" ? start() : null) };
}

function MicBtn({ voice, th, t, size = 40 }) {
  const rec = voice.state === "rec", busy = voice.state === "busy";
  return (
    <button type="button" onClick={voice.toggle} aria-label={rec ? t("recording") : busy ? t("transcribing") : t("voice")} title={rec ? t("recording") : t("voice")}
      style={{ ...btnReset, width: size, height: size, borderRadius: 10, background: rec ? th.red : th.inset, color: rec ? "#fff" : th.sub, display: "flex", alignItems: "center", justifyContent: "center", opacity: busy ? 0.6 : 1, flexShrink: 0 }}>
      {busy ? <span className="nl-spin" style={{ width: 16, height: 16, border: "2px solid " + th.muted, borderTopColor: "transparent", borderRadius: "50%" }} /> : <Icon d={rec ? IC.stop : IC.mic} size={18} />}
    </button>
  );
}

// ─── УВЕДОМЛЕНИЯ (локальные, пока приложение открыто) ─────────────────────────
const NOTIFY_TIMES = [{ h: 7, type: "morning" }, { h: 10, type: "habits" }, { h: 13, type: "midday" }, { h: 17, type: "tasks" }, { h: 21, type: "evening" }];
const NOTIFY_MSGS = {
  ru: { morning: (n) => [`Доброе утро, ${n}! Новый день — новый уровень`, `${n}, начни день с плана. Загляни в NextLVL`], habits: (n) => [`Не забудь отметить привычки, ${n}`, `Серия не должна прерываться, ${n}`], midday: (n) => [`Как идёт день, ${n}? Проверь задачи`, `Самое время записать расходы, ${n}`], tasks: (n) => [`Вечер близко — закрой важные задачи, ${n}`, `${n}, что ещё в «Сделать сейчас»?`], evening: (n) => [`Подведи итоги дня в NextLVL, ${n}`, `${n}, отметь привычки перед сном`] },
  kk: { morning: (n) => [`Қайырлы таң, ${n}! Жаңа күн — жаңа деңгей`, `${n}, күнді жоспардан баста`], habits: (n) => [`Әдеттеріңді белгілеуді ұмытпа, ${n}`, `Серияны үзбе, ${n}`], midday: (n) => [`Күн қалай өтіп жатыр, ${n}? Тапсырмаларды тексер`, `Шығындарды жазатын уақыт, ${n}`], tasks: (n) => [`Кеш жақын — маңызды тапсырмаларды бітір, ${n}`, `${n}, «Қазір істеу» бөлімінде не қалды?`], evening: (n) => [`Күн қорытындысын шығар, ${n}`, `${n}, ұйықтар алдында әдеттерді белгіле`] },
  en: { morning: (n) => [`Good morning, ${n}! New day, new level`, `${n}, start the day with a plan`], habits: (n) => [`Don't forget your habits, ${n}`, `Keep your streak alive, ${n}`], midday: (n) => [`How's the day, ${n}? Check your tasks`, `Good time to log expenses, ${n}`], tasks: (n) => [`Evening's close — wrap up key tasks, ${n}`, `${n}, what's left in “Do now”?`], evening: (n) => [`Wrap up the day in NextLVL, ${n}`, `${n}, check off habits before bed`] },
};
let notifTimers = [];
function scheduleNotifications(name, lang) {
  notifTimers.forEach(clearTimeout); notifTimers = [];
  if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
  NOTIFY_TIMES.forEach(({ h, type }) => {
    const now = new Date(), next = new Date(); next.setHours(h, 0, 0, 0);
    if (next <= now) next.setDate(next.getDate() + 1);
    notifTimers.push(setTimeout(() => {
      const list = (NOTIFY_MSGS[lang] || NOTIFY_MSGS.ru)[type](name);
      try { new Notification("NextLVL", { body: list[Math.floor(Math.random() * list.length)], icon: "/icons/icon-192.png" }); } catch (e) {}
      scheduleNotifications(name, lang);
    }, next - now));
  });
}

// ─── ЗАГРУЗКА ─────────────────────────────────────────────────────────────────
let BOOT = null;
const boot = () => (BOOT || (BOOT = loadAll()));

// ═════════════════════════════════════════════════════════════════════════════
export default function NextLVL() {
  const b = boot();
  const [splash, setSplash] = useState(true);
  const [user, setUser] = useState(b.user);
  const [habits, setHabits] = useState(b.habits);
  const [tasks, setTasks] = useState(b.tasks);
  const [txns, setTxns] = useState(b.txns);
  const [goal, setGoal] = useState(b.goal);
  const [settings, setSettings] = useState(b.settings);
  const [terms, setTerms] = useState(b.terms);
  const [notif, setNotif] = useState(b.notif);
  const [onboardLang, setOnboardLang] = useState(null);
  const [tab, setTab] = useState("home");
  const [sheet, setSheet] = useState(null); // {type, data}
  const [toast, setToast] = useState("");
  const [azaOpen, setAzaOpen] = useState(false);
  const [sysLight, setSysLight] = useState(() => typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches);

  const lang = (user && user.lang) || onboardLang || "ru";
  const dict = L[lang] || L.ru;
  const t = (k, ...a) => { const v = dict[k] ?? L.ru[k]; return typeof v === "function" ? v(...a) : v ?? k; };
  const themeId = settings.sysTheme ? (sysLight ? "light" : "neon") : (user && user.theme) || "neon";
  const th = THEMES[themeId] || THEMES.neon;

  // ── сохранение (данные уже загружены синхронно — пустые списки не запишутся поверх) ──
  const failRef = useRef(false);
  const persist = (k, v) => { const ok = writeJSON(k, v); if (!ok && !failRef.current) { failRef.current = true; setToast(t("saveErr")); } if (ok) failRef.current = false; };
  useEffect(() => { persist(KEYS.habits, habits); }, [habits]);
  useEffect(() => { persist(KEYS.tasks, tasks); }, [tasks]);
  useEffect(() => { persist(KEYS.txns, txns); }, [txns]);
  useEffect(() => { if (goal) persist(KEYS.goal, goal); else { try { localStorage.removeItem(KEYS.goal); } catch (e) {} } }, [goal]);
  useEffect(() => { persist(KEYS.settings, settings); }, [settings]);
  useEffect(() => { if (user) persist(KEYS.user, user); }, [user]);
  useEffect(() => { if (terms) persist(KEYS.terms, terms); }, [terms]);
  useEffect(() => { if (user && user.name && notif) scheduleNotifications(user.name, lang); }, [user && user.name, lang, notif]);
  useEffect(() => { if (!toast) return; const id = setTimeout(() => setToast(""), 2800); return () => clearTimeout(id); }, [toast]);
  useEffect(() => { const id = setTimeout(() => setSplash(false), 1400); return () => clearTimeout(id); }, []);
  useEffect(() => {
    if (!window.matchMedia) return;
    const mq = window.matchMedia("(prefers-color-scheme: light)");
    const fn = (e) => setSysLight(e.matches);
    mq.addEventListener ? mq.addEventListener("change", fn) : mq.addListener(fn);
    return () => (mq.removeEventListener ? mq.removeEventListener("change", fn) : mq.removeListener(fn));
  }, []);
  useEffect(() => {
    document.body.style.background = th.bg;
    const m = document.querySelector('meta[name="theme-color"]'); if (m) m.setAttribute("content", th.bg);
  }, [th.bg]);

  // ── производные значения ──
  const xp = calcXP(habits, tasks, txns);
  const lvl = levelInfo(xp);
  const saved = goalSaved(goal, txns);
  const maxStreak = habits.reduce((m, h) => Math.max(m, bestStreakOf(h), streakOf(h)), 0);
  const badgeCtx = { habits, xp, maxStreak, doneTasks: tasks.filter((x) => x.done).length, spheresUsed: new Set(habits.map((h) => h.sphere)).size, finDays: new Set(txns.map((x) => x.date)).size, goal, saved };
  const badges = BADGES.map((bd) => { const [cur, max] = bd.prog(badgeCtx); return { ...bd, cur, max, earned: cur >= max }; });

  // ── действия: привычки ──
  const setHabit = (id, fn) => setHabits((p) => p.map((h) => (h.id === id ? fn(h) : h)));
  function toggleHabit(id, k = today()) {
    setHabit(id, (h) => {
      const checks = { ...h.checks }, counts = { ...h.counts };
      if (isDoneOn(h, k)) { delete checks[k]; if (h.type === "count") delete counts[k]; }
      else { checks[k] = true; if (h.type === "count") counts[k] = h.target; }
      return { ...h, checks, counts };
    });
  }
  function bumpHabit(id, delta, k = today()) {
    setHabit(id, (h) => {
      const n = Math.max(0, Math.min(h.target * 5, countOn(h, k) + delta));
      const checks = { ...h.checks }, counts = { ...h.counts };
      if (n) counts[k] = n; else delete counts[k];
      if (n >= h.target) checks[k] = true; else delete checks[k];
      return { ...h, checks, counts };
    });
  }
  const saveHabit = (h) => setHabits((p) => (p.some((x) => x.id === h.id) ? p.map((x) => (x.id === h.id ? normHabit(h) : x)) : [...p, normHabit({ ...h, createdAt: today() })]));
  const deleteHabit = (id) => setHabits((p) => p.filter((h) => h.id !== id));
  const addHabits = (list) => setHabits((p) => {
    const names = new Set(p.map((h) => h.name.toLowerCase()));
    const add = list.filter((h) => !names.has(h.name.toLowerCase())).map((h, i) => normHabit({ ...h, id: Date.now() + i, createdAt: today(), checks: {} }));
    return [...p, ...add];
  });

  // ── действия: задачи ──
  const saveTask = (tk) => setTasks((p) => {
    const n = normTask({ ...tk, priority: Q_TO_PRIO[tk.quadrant] || tk.priority });
    return p.some((x) => x.id === tk.id) ? p.map((x) => (x.id === tk.id ? n : x)) : [...p, n];
  });
  const toggleTask = (id) => setTasks((p) => p.map((x) => (x.id === id ? { ...x, done: !x.done, doneAt: !x.done ? today() : undefined } : x)));
  const deleteTask = (id) => setTasks((p) => p.filter((x) => x.id !== id));

  // ── действия: финансы ──
  const addTxns = (list) => setTxns((p) => [...list.map(normTxn).filter(Boolean), ...p]);
  const saveTxn = (x) => setTxns((p) => (p.some((y) => y.id === x.id) ? p.map((y) => (y.id === x.id ? normTxn(x) : y)) : [normTxn(x), ...p]));
  const deleteTxn = (id) => setTxns((p) => p.filter((x) => x.id !== id));

  const open = (type, data) => setSheet({ type, data });
  const close = () => setSheet(null);

  const app = { th, t, lang, user, setUser, habits, tasks, txns, goal, setGoal, settings, setSettings, notif, setNotif, xp, lvl, saved, badges, maxStreak,
    toggleHabit, bumpHabit, saveHabit, deleteHabit, addHabits, saveTask, toggleTask, deleteTask, addTxns, saveTxn, deleteTxn,
    open, close, setTab, setToast, setHabits, setTasks, setTxns, setTerms };

  // ── экраны до входа ──
  const css = (
    <style>{`
      *{-webkit-tap-highlight-color:transparent}
      body{margin:0;font-family:Manrope,system-ui,-apple-system,sans-serif}
      input,select,textarea,button{font-family:inherit}
      input::placeholder{color:${th.muted};opacity:.8}
      input[type=date]{color-scheme:${th.light ? "light" : "dark"}}
      .nl-scroll::-webkit-scrollbar{display:none}
      .nl-spin{animation:nlspin .8s linear infinite;display:inline-block}
      @keyframes nlspin{to{transform:rotate(360deg)}}
      @keyframes nlpulse{0%,100%{transform:scale(1);opacity:.6}50%{transform:scale(1.1);opacity:1}}
      button:focus-visible,input:focus-visible{outline:2px solid ${th.accent};outline-offset:2px}
    `}</style>
  );
  if (splash) return <>{css}<Splash /></>;
  if (!user || !user.name) {
    if (!onboardLang) return <>{css}<LangSelect onSelect={setOnboardLang} /></>;
    return <>{css}<Onboarding t={t} th={THEMES.neon} onDone={(name) => { setTerms({ version: TERMS_VERSION, acceptedAt: new Date().toISOString() }); setUser(normUser({ name, lang: onboardLang, theme: "neon" })); }} /></>;
  }
  if (!terms || terms.version !== TERMS_VERSION) {
    return <>{css}<TermsGate t={t} th={th} existing counts={[habits.length, tasks.length, txns.length]} onAccept={() => setTerms({ version: TERMS_VERSION, acceptedAt: new Date().toISOString() })} /></>;
  }

  const nav = [["home", IC.home, t("nav_home")], ["skills", IC.flame, t("nav_skills")], ["finance", IC.coins, t("nav_fin")], ["tasks", IC.target, t("nav_tasks")], ["profile", IC.user, t("nav_profile")]];

  return (
    <div style={{ minHeight: "100vh", background: th.bg, color: th.text, fontFamily: "Manrope,system-ui,-apple-system,sans-serif", maxWidth: 500, margin: "0 auto", position: "relative" }}>
      {css}
      <main style={{ padding: "18px 16px 170px", display: "flex", flexDirection: "column", gap: 12 }}>
        {tab === "home" && <Home app={app} />}
        {tab === "skills" && <Skills app={app} />}
        {tab === "finance" && <Finance app={app} />}
        {tab === "tasks" && <Tasks app={app} />}
        {tab === "profile" && <Profile app={app} />}
      </main>

      {/* Aza */}
      <button type="button" onClick={() => setAzaOpen((o) => !o)} aria-label={t("aza")} style={{ ...btnReset, position: "fixed", bottom: "calc(92px + env(safe-area-inset-bottom))", right: "max(16px, calc(50vw - 234px))", zIndex: 300 }}>
        <span style={{ width: 52, height: 52, borderRadius: "50%", background: th.card, border: "2px solid " + th.accent, display: "flex", alignItems: "center", justifyContent: "center", color: th.accent, boxShadow: "0 6px 20px rgba(0,0,0,.35)", position: "relative" }}>
          <Icon d={azaOpen ? IC.x : IC.sparkles} size={22} />
          {!azaOpen && <span style={{ position: "absolute", bottom: 1, right: 1, width: 11, height: 11, borderRadius: "50%", background: th.accent, border: "2px solid " + th.card }} />}
        </span>
      </button>
      {azaOpen && <AzaChat app={app} onClose={() => setAzaOpen(false)} />}

      {/* навигация */}
      <nav style={{ position: "fixed", left: "50%", transform: "translateX(-50%)", bottom: "calc(8px + env(safe-area-inset-bottom))", width: "calc(100% - 24px)", maxWidth: 476, display: "flex", background: th.card, border: "1px solid " + th.line, borderRadius: 20, padding: "6px 4px", zIndex: 250, boxShadow: "0 8px 24px rgba(0,0,0,.25)", boxSizing: "border-box" }}>
        {nav.map(([id, d, label]) => {
          const on = tab === id;
          return (
            <button key={id} type="button" onClick={() => { setTab(id); window.scrollTo(0, 0); }} aria-current={on ? "page" : undefined}
              style={{ ...btnReset, flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, fontSize: 10, color: on ? th.accent : th.muted, fontWeight: on ? 700 : 500, padding: "4px 0" }}>
              <span style={{ width: 42, height: 30, borderRadius: 11, background: on ? th.soft : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon d={d} size={19} /></span>
              {label}
            </button>
          );
        })}
      </nav>

      <Sheets app={app} sheet={sheet} />
      {toast && <div role="status" style={{ position: "fixed", left: "50%", transform: "translateX(-50%)", bottom: "calc(160px + env(safe-area-inset-bottom))", background: th.text, color: th.bg, padding: "10px 16px", borderRadius: 12, fontSize: 13, fontWeight: 600, zIndex: 900, maxWidth: "85vw", textAlign: "center" }}>{toast}</div>}
    </div>
  );
}

// ─── ВХОД ─────────────────────────────────────────────────────────────────────
function Logo({ size = 64 }) {
  return <div style={{ width: size, height: size, borderRadius: size * 0.28, background: "#111D11", border: "1.5px solid #1E3A22", color: "#39FF14", display: "flex", alignItems: "center", justifyContent: "center", filter: "drop-shadow(0 0 18px rgba(57,255,20,.35))" }}><Icon d={IC.shield} size={size * 0.55} /></div>;
}
function Splash() {
  return (
    <div style={{ position: "fixed", inset: 0, background: "#0A0F0A", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "#F0FFF7" }}>
      <div style={{ animation: "nlpulse 2s infinite" }}><Logo size={88} /></div>
      <div style={{ fontSize: 34, fontWeight: 800 }}>NextLVL</div>
      <div style={{ fontSize: 12, color: "#39FF14", letterSpacing: "0.14em" }}>NEXT LEVEL EVERY DAY</div>
    </div>
  );
}
function LangSelect({ onSelect }) {
  return (
    <div style={{ minHeight: "100vh", background: "#0A0F0A", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 28, gap: 12, color: "#F0FFF7", boxSizing: "border-box" }}>
      <Logo />
      <div style={{ fontSize: 28, fontWeight: 800, marginTop: 6 }}>NextLVL</div>
      <div style={{ fontSize: 12, color: "#8FA398", marginBottom: 18, textAlign: "center" }}>{L.ru.chooseLang}</div>
      {[["ru", "Русский"], ["kk", "Қазақша"], ["en", "English"]].map(([k, l]) => (
        <button key={k} type="button" onClick={() => onSelect(k)} style={{ ...btnReset, width: "100%", maxWidth: 300, minHeight: 54, borderRadius: 16, background: "#111D11", border: "1px solid #1E3A22", color: "#F0FFF7", fontSize: 16, fontWeight: 700 }}>{l}</button>
      ))}
    </div>
  );
}
function Onboarding({ t, th, onDone }) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const wrap = { minHeight: "100vh", background: th.bg, color: th.text, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 28, gap: 16, boxSizing: "border-box" };
  const bubble = (txt) => <div style={{ background: th.card, border: "1px solid " + th.border, borderRadius: 20, padding: "18px 20px", maxWidth: 320, textAlign: "center" }}><div style={{ fontSize: 10, color: th.accent, letterSpacing: "0.15em", marginBottom: 8 }}>● AZA AI</div><div style={{ fontSize: 15, lineHeight: 1.6 }}>{txt}</div></div>;
  if (step === 0) return <div style={wrap}><Logo size={76} />{bubble(t("azaHello"))}<button type="button" onClick={() => setStep(1)} style={primaryBtn(th, { minWidth: 200 })}>{t("next")}</button></div>;
  if (step === 1) return (
    <div style={wrap}>{bubble(t("askName"))}
      <input value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && name.trim() && setStep(2)} placeholder={t("namePh")} autoFocus aria-label={t("name")} style={{ ...inputStyle(th), maxWidth: 300, textAlign: "center" }} />
      <button type="button" disabled={!name.trim()} onClick={() => setStep(2)} style={primaryBtn(th, { width: "100%", maxWidth: 300, opacity: name.trim() ? 1 : 0.4 })}>{t("next")}</button>
    </div>
  );
  return <TermsGate t={t} th={th} onAccept={() => onDone(name.trim())} />;
}
function TermsGate({ t, th, onAccept, existing, counts }) {
  const [agree, setAgree] = useState(false);
  return (
    <div style={{ minHeight: "100vh", background: th.bg, color: th.text, display: "flex", flexDirection: "column", justifyContent: "center", padding: 24, gap: 14, maxWidth: 460, margin: "0 auto", boxSizing: "border-box" }}>
      <div style={{ color: th.accent }}><Icon d={IC.doc} size={34} /></div>
      <div style={{ fontSize: 22, fontWeight: 800 }}>{existing ? t("termsUpd") : t("termsTitle")}</div>
      {existing && (
        <div style={{ display: "flex", gap: 10, alignItems: "center", background: th.soft, border: "1px solid " + th.border, borderRadius: 14, padding: 12 }}>
          <div style={{ color: th.accent }}><Icon d={IC.check} size={20} sw={3} /></div>
          <div><div style={{ fontSize: 14, fontWeight: 700 }}>{t("termsSafe")}</div><div style={{ fontSize: 12, color: th.muted }}>{t("termsData", counts[0], counts[1], counts[2])}</div></div>
        </div>
      )}
      <div style={{ fontSize: 14, lineHeight: 1.6, color: th.sub }}>{t("termsText")}</div>
      <div style={{ background: th.card, borderRadius: 16 }}>
        {[["terms", "/terms.html"], ["privacy", "/privacy.html"]].map(([k, href], i) => (
          <a key={k} href={href} target="_blank" rel="noopener" style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px", color: th.text, textDecoration: "none", borderTop: i ? "1px solid " + th.line : "none" }}>
            <span style={{ color: th.accent }}><Icon d={IC.doc} /></span><span style={{ flex: 1, fontSize: 14 }}>{t(k)}</span><span style={{ fontSize: 12, color: th.accent }}>{t("read")}</span>
          </a>
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14 }}>
        <Check on={agree} onClick={() => setAgree((a) => !a)} th={th} label={t("termsAgree")} />
        <span onClick={() => setAgree((a) => !a)} style={{ cursor: "pointer" }}>{t("termsAgree")}</span>
      </div>
      <button type="button" disabled={!agree} onClick={onAccept} style={primaryBtn(th, { opacity: agree ? 1 : 0.4 })}>{t("accept")}</button>
    </div>
  );
}

// ─── ГЛАВНАЯ ──────────────────────────────────────────────────────────────────
function Home({ app }) {
  const { th, t, lang, user, habits, tasks, txns, lvl, xp, badges, settings, maxStreak } = app;
  const tk = today();
  const quests = habits.filter(dueToday);
  const doneCount = quests.filter((h) => isDoneOn(h, tk)).length;
  const curStreak = habits.reduce((m, h) => Math.max(m, streakOf(h)), 0);
  const active = tasks.filter((x) => !x.done).length;
  const earned = badges.filter((b) => b.earned).length;
  const nextB = badges.filter((b) => !b.earned).sort((a, b) => b.cur / b.max - a.cur / a.max)[0];
  const mk = monthKey(tk);
  const monthExp = txns.filter((x) => x.type === "expense" && x.date.startsWith(mk)).reduce((s, x) => s + x.amount, 0);
  const lvName = (lv) => t("lv")[lv - 1];

  const [tip, setTip] = useState("");
  useEffect(() => {
    if (!settings.aza) return;
    const key = "nl-tip-" + tk + "-" + lang;
    const cached = readRaw(key);
    if (cached) { setTip(cached); return; }
    const pending = habits.filter((h) => dueToday(h) && !isDoneOn(h, tk)).map((h) => h.name).slice(0, 3).join(", ");
    const sys = "You are Aza, AI coach in the NextLVL app. Write ONE short practical tip (max 20 words, no emoji) in " + ({ ru: "Russian", kk: "Kazakh", en: "English" }[lang]) + " for " + user.name + ". Pending habits today: " + (pending || "none") + ". Active tasks: " + active + ". Level " + lvl.cur.level + ".";
    fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ system: sys, message: "Tip for today" }) })
      .then((r) => (r.ok ? r.json() : null)).then((d) => { if (d && d.text) { setTip(d.text.trim()); try { localStorage.setItem(key, d.text.trim()); } catch (e) {} } })
      .catch(() => {});
  }, [settings.aza]);

  const unitLeft = (b) => { const n = b.max - b.cur; return b.unit ? t("u_" + b.unit, n) : String(n); };

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 38, height: 38, borderRadius: 11, background: th.card, border: "1px solid " + th.border, color: th.accent, display: "flex", alignItems: "center", justifyContent: "center" }}><Icon d={IC.shield} size={20} /></div>
          <div><div style={{ fontSize: 16, fontWeight: 800 }}>NextLVL</div><div style={{ fontSize: 9, letterSpacing: "0.14em", color: th.accent }}>NEXT LEVEL EVERY DAY</div></div>
        </div>
        <div style={{ fontSize: 12, fontWeight: 700, color: th.gold, border: "1.5px solid " + th.goldLine, borderRadius: 20, padding: "5px 12px" }}>LV.{lvl.cur.level}</div>
      </div>

      <div style={{ background: th.hero, border: "1px solid " + th.border, borderRadius: 20, padding: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 64, height: 64, borderRadius: 18, background: th.inset, border: "2px solid " + th.accent, color: th.accent, display: "flex", alignItems: "center", justifyContent: "center" }}><Icon d={IC[lvl.cur.icon]} size={32} /></div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 16, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user.name}</div>
            <div style={{ fontSize: 12, color: th.gold, marginTop: 2 }}>{t("lvl")} {lvl.cur.level} · {lvName(lvl.cur.level)}{lvl.next ? " → " + lvName(lvl.next.level) : ""}</div>
            <div style={{ height: 7, background: th.inset, borderRadius: 4, marginTop: 8 }}><div style={{ width: lvl.pct + "%", height: "100%", background: th.accent, borderRadius: 4, transition: "width .4s" }} /></div>
            <div style={{ fontSize: 11, color: th.muted, marginTop: 4 }}>{xp} / {lvl.next ? lvl.next.xp : xp} XP</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 6, marginTop: 12, flexWrap: "wrap" }}>
          {[[IC.flame, t("days_n", curStreak), th.gold, null], [IC.medal, t("badges_n", earned), th.accent, () => app.open("badges")], [IC.target, t("tasks_n", active), th.sub, () => app.setTab("tasks")]].map(([d, label, col, fn], i) => (
            <button key={i} type="button" onClick={fn || undefined} style={{ ...btnReset, cursor: fn ? "pointer" : "default", display: "flex", alignItems: "center", gap: 4, background: th.inset, color: col, fontSize: 11, padding: "5px 9px", borderRadius: 9 }}><Icon d={d} size={13} />{label}</button>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 4 }}>
        <div style={{ fontSize: 15, fontWeight: 700 }}>{t("quests")}</div>
        {quests.length > 0 && <div style={{ fontSize: 12, color: th.gold }}>{t("doneOf", doneCount, quests.length, doneCount * 10)}</div>}
      </div>
      {quests.length === 0 && (
        <button type="button" onClick={() => app.open("habit", null)} style={{ ...btnReset, background: th.card, border: "1px dashed " + th.border, borderRadius: 16, padding: 16, color: th.muted, fontSize: 13, display: "flex", alignItems: "center", gap: 10 }}>
          <IconBox d={IC.plus} th={th} /> <span style={{ textAlign: "left" }}>{t("questsEmpty")}</span>
        </button>
      )}
      {quests.slice(0, 6).map((h) => <QuestRow key={h.id} h={h} app={app} />)}
      {quests.length > 6 && <button type="button" onClick={() => app.setTab("skills")} style={{ ...btnReset, fontSize: 12, color: th.accent, alignSelf: "center", padding: 8 }}>+{quests.length - 6} →</button>}

      {nextB ? (
        <button type="button" onClick={() => app.open("badges")} style={{ ...btnReset, display: "flex", alignItems: "center", gap: 12, background: th.goldBg, border: "1px solid " + th.goldLine, borderRadius: 16, padding: "12px 14px", textAlign: "left" }}>
          <div style={{ color: th.gold }}><Icon d={IC.gift} size={22} /></div>
          <div style={{ flex: 1 }}><div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: th.gold }}>{t("nextReward")}</div><div style={{ fontSize: 13, marginTop: 2 }}>{t("b_" + nextB.id)}</div></div>
          <div style={{ fontSize: 12, fontWeight: 700, color: th.gold, whiteSpace: "nowrap" }}>{t("left")} {unitLeft(nextB)}</div>
        </button>
      ) : null}

      <button type="button" onClick={() => app.setTab("finance")} style={{ ...btnReset, display: "flex", alignItems: "center", gap: 12, background: th.card, borderRadius: 16, padding: "10px 12px", textAlign: "left" }}>
        <IconBox d={IC.coins} th={th} />
        <div style={{ flex: 1 }}><div style={{ fontSize: 11, color: th.muted }}>{t("monthExp")}</div><div style={{ fontSize: 15, fontWeight: 800, color: th.red }}>{fmtNum(monthExp)} ₸</div></div>
        <Icon d={IC.chevR} color={th.muted} />
      </button>

      {settings.aza && (
        <div style={{ display: "flex", gap: 10, background: th.card, border: "1px solid " + th.border, borderRadius: 16, padding: "12px 14px" }}>
          <div style={{ color: th.accent }}><Icon d={IC.sparkles} size={18} /></div>
          <div style={{ fontSize: 12, lineHeight: 1.5 }}>Aza: {tip || t("azaTipDefault")}</div>
        </div>
      )}
    </>
  );
}

function QuestRow({ h, app }) {
  const { th, t } = app;
  const tk = today();
  const done = isDoneOn(h, tk);
  const isCount = h.type === "count";
  const n = countOn(h, tk);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, background: th.card, border: "1px solid " + (done ? th.accent : th.line), borderRadius: 16, padding: "6px 4px 6px 12px" }}>
      <IconBox d={IC[h.iconKey]} th={th} size={38} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{h.name}</div>
        <div style={{ fontSize: 11, color: th.muted, marginTop: 2 }}>{isCount ? n + " / " + h.target + (h.unit ? " " + h.unit : "") + " · " : ""}{done ? t("done_xp") : "+10 XP"}</div>
      </div>
      {isCount && !done ? (
        <button type="button" onClick={() => app.bumpHabit(h.id, 1)} aria-label={"+1 " + h.name} style={{ ...btnReset, width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ width: 28, height: 28, borderRadius: 9, background: th.accent, color: th.on, display: "flex", alignItems: "center", justifyContent: "center" }}><Icon d={IC.plus} size={16} sw={2.5} /></span>
        </button>
      ) : <Check on={done} onClick={() => app.toggleHabit(h.id)} th={th} label={h.name} />}
    </div>
  );
}

// ─── НАВЫКИ ───────────────────────────────────────────────────────────────────
function Skills({ app }) {
  const { th, t, lang, habits } = app;
  const tk = today();
  const [radarOpen, setRadarOpen] = useState(false);
  const [radarMode, setRadarMode] = useState("week");
  const [filter, setFilter] = useState(null);
  const due = habits.filter(dueToday);
  const doneToday = due.filter((h) => isDoneOn(h, tk)).length;

  const from = radarMode === "week" ? addDays(tk, -6) : addDays(tk, -29);
  const sphereScore = SPHERES.map((s) => { const hs = habits.filter((h) => h.sphere === s); return { s, n: hs.length, pct: hs.length ? habitsPct(hs, from, tk) : 0 }; });
  const weak = sphereScore.slice().sort((a, b) => a.pct - b.pct || a.n - b.n)[0];
  const emptySphere = sphereScore.find((x) => x.n === 0);

  // радар: 5 осей
  const R = 70;
  const pt = (i, v) => { const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5; return [Math.cos(a) * R * v, Math.sin(a) * R * v]; };
  const ring = (v) => SPHERES.map((_, i) => pt(i, v).map((n) => n.toFixed(1)).join(",")).join(" ");
  const poly = sphereScore.map((x, i) => pt(i, Math.max(0.06, x.pct / 100)).map((n) => n.toFixed(1)).join(",")).join(" ");
  const labelPos = [[150, 13, "middle"], [226, 72, "start"], [200, 176, "middle"], [100, 176, "middle"], [74, 72, "end"]];

  const sphereStats = SPHERES.map((s) => {
    const n = habits.filter((h) => h.sphere === s).reduce((m, h) => m + Object.keys(h.checks).filter((k) => h.checks[k]).length, 0);
    return { s, level: Math.floor(n / 20) + 1, pct: (n % 20) * 5, count: habits.filter((h) => h.sphere === s).length };
  });

  const groups = SPHERES.filter((s) => !filter || s === filter).map((s) => ({ s, list: habits.filter((h) => h.sphere === s) })).filter((g) => g.list.length || filter);
  const sugg = emptySphere ? SPHERE_SUGGEST[emptySphere.s] : null;

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div><div style={{ fontSize: 22, fontWeight: 800 }}>{t("skills")}</div><div style={{ fontSize: 12, color: th.muted }}>{t("skillsSum", doneToday, due.length, doneToday * 10)}</div></div>
        <button type="button" onClick={() => app.open("habit", null)} aria-label={t("newHabit")} style={primaryBtn(th, { width: 44, minHeight: 44, padding: 0, borderRadius: 12 })}><Icon d={IC.plus} size={20} sw={2.5} /></button>
      </div>

      <div style={{ background: th.card, borderRadius: 18, padding: "4px 4px 4px 14px" }}>
        <button type="button" onClick={() => setRadarOpen((o) => !o)} aria-expanded={radarOpen} style={{ ...btnReset, width: "100%", minHeight: 48, display: "flex", alignItems: "center", gap: 10, textAlign: "left", paddingRight: 6 }}>
          <span style={{ flex: 1, minWidth: 0 }}>
            <span style={{ display: "block", fontSize: 14, fontWeight: 700 }}>{t("balance")}</span>
            {habits.length > 0 && <span style={{ display: "block", fontSize: 11, color: th.muted, marginTop: 1 }}>{t("weak")}: <span style={{ color: th.red }}>{t("sph_" + weak.s)} · {weak.pct}%</span></span>}
          </span>
          <Icon d={radarOpen ? IC.chevU : IC.chevD} size={16} color={th.muted} sw={2.5} />
        </button>
        {radarOpen && (
          <div style={{ padding: "4px 10px 10px 0" }}>
            <div style={{ display: "flex", justifyContent: "flex-end" }}><div style={{ width: 170 }}><Segmented items={[["week", t("week")], ["month", t("month")]]} value={radarMode} onChange={setRadarMode} th={th} /></div></div>
            <svg viewBox="0 0 300 186" width="100%" role="img" aria-label={t("balance")} style={{ display: "block", marginTop: 6 }}>
              <g transform="translate(150,96)" fill="none">
                {[1, 0.667, 0.333].map((v) => <polygon key={v} points={ring(v)} stroke={th.border} />)}
                <polygon points={poly} fill={th.soft} stroke={th.accent} strokeWidth="2" />
              </g>
              {sphereScore.map((x, i) => <text key={x.s} x={labelPos[i][0]} y={labelPos[i][1]} textAnchor={labelPos[i][2]} fill={x.s === weak.s && habits.length ? th.red : th.text} fontSize="10" fontFamily="Manrope, sans-serif">{t("sph_" + x.s)} · {x.pct}%</text>)}
            </svg>
            {sugg && (
              <div style={{ display: "flex", gap: 8, alignItems: "center", background: th.inset, borderRadius: 11, padding: "6px 6px 6px 10px", marginTop: 4 }}>
                <div style={{ color: th.accent }}><Icon d={IC.sparkles} size={15} /></div>
                <div style={{ flex: 1, fontSize: 11, lineHeight: 1.45 }}>{t("azaSuggest", t("sph_" + emptySphere.s), sugg[lang])}</div>
                <button type="button" onClick={() => app.addHabits([{ name: sugg[lang], sphere: emptySphere.s, iconKey: sugg.iconKey, type: sugg.type, target: sugg.target, unit: sugg.type === "count" ? t("unitPh") : "" }])} aria-label={t("add")} style={primaryBtn(th, { width: 44, minHeight: 44, padding: 0, borderRadius: 10 })}><Icon d={IC.plus} size={16} sw={2.5} /></button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="nl-scroll" style={{ display: "flex", gap: 8, overflowX: "auto", margin: "0 -16px", padding: "0 16px" }}>
        {sphereStats.map((x) => {
          const on = filter === x.s;
          return (
            <button key={x.s} type="button" onClick={() => setFilter(on ? null : x.s)} aria-pressed={on} style={{ ...btnReset, minWidth: 98, flex: "0 0 auto", background: th.card, border: "1px solid " + (on ? th.accent : th.line), borderRadius: 14, padding: "10px 6px", textAlign: "center" }}>
              <div style={{ width: 34, height: 34, margin: "0 auto 6px", borderRadius: 11, background: th.soft, color: th.accent, display: "flex", alignItems: "center", justifyContent: "center" }}><Icon d={IC[{ body: "barbell", mind: "brain", work: "briefcase", health: "heart", finance: "coins" }[x.s]]} size={18} /></div>
              <div style={{ fontSize: 12, fontWeight: 700 }}>{t("sph_" + x.s)}</div>
              <div style={{ fontSize: 11, color: on ? th.accent : th.muted }}>{t("lvl").toLowerCase()} {x.level} · {x.pct}%</div>
            </button>
          );
        })}
      </div>

      {habits.length === 0 && (
        <button type="button" onClick={() => app.open("habit", null)} style={{ ...btnReset, background: th.card, border: "1px dashed " + th.border, borderRadius: 16, padding: 16, color: th.muted, fontSize: 13, display: "flex", alignItems: "center", gap: 10 }}>
          <IconBox d={IC.plus} th={th} /><span>{t("questsEmpty")}</span>
        </button>
      )}

      {groups.map((g) => (
        <React.Fragment key={g.s}>
          <SectionLabel th={th}>{t("sph_" + g.s).toUpperCase()}</SectionLabel>
          {g.list.length === 0 && <div style={{ fontSize: 12, color: th.muted, padding: "6px 0" }}>{t("noHabitsSph")}</div>}
          {g.list.map((h) => <HabitRow key={h.id} h={h} app={app} />)}
        </React.Fragment>
      ))}

      <SectionLabel th={th} style={{ marginTop: 10 }}>{t("presets")}</SectionLabel>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 8 }}>
        {[["morning", IC.sunrise], ["sleep", IC.moon], ["prod", IC.rocket]].map(([k, d]) => (
          <button key={k} type="button" onClick={() => app.open("preset", k)} style={{ ...btnReset, background: th.card, borderRadius: 14, padding: 10, textAlign: "left" }}>
            <IconBox d={d} th={th} size={32} radius={10} icon={17} />
            <div style={{ fontSize: 12, fontWeight: 700, marginTop: 8, lineHeight: 1.25 }}>{t("pre_" + k)}</div>
            <div style={{ fontSize: 11, color: th.muted }}>{t("habits_n", PRESETS[k].length)}</div>
          </button>
        ))}
      </div>
    </>
  );
}

function HabitRow({ h, app }) {
  const { th, t } = app;
  const tk = today();
  const done = isDoneOn(h, tk);
  const st = streakOf(h);
  const isCount = h.type === "count";
  const n = countOn(h, tk);
  const weekly = h.freq < 7;
  const segs = Math.min(h.target, 12);
  return (
    <div style={{ background: th.card, borderRadius: 16, padding: isCount ? "10px 8px 12px 12px" : "6px 4px 6px 12px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <IconBox d={IC[h.iconKey]} th={th} />
        <button type="button" onClick={() => app.open("habit", h)} style={{ ...btnReset, flex: 1, minWidth: 0, textAlign: "left" }}>
          <div style={{ fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{h.name}</div>
          <div style={{ display: "flex", gap: 5, marginTop: 4, flexWrap: "wrap" }}>
            {isCount && <Chip th={th} color={th.accent}>{n} / {h.target}{h.unit ? " " + h.unit : ""}</Chip>}
            {st > 0 && <Chip th={th} color={th.gold}>{weekly ? t("streakW") : t("streak")} {st}</Chip>}
            <Chip th={th}>{weekly ? t("perWeek", h.freq) : t("daily")}</Chip>
            {weekly && <Chip th={th} color={th.accent}>{weekDoneCount(h)} / {h.freq}</Chip>}
          </div>
        </button>
        {isCount ? (
          <>
            <button type="button" onClick={() => app.bumpHabit(h.id, -1)} aria-label={"−1 " + h.name} style={{ ...btnReset, width: 40, height: 40, borderRadius: 10, background: th.inset, color: th.sub, display: "flex", alignItems: "center", justifyContent: "center" }}><Icon d={IC.minus} size={16} sw={2.5} /></button>
            <button type="button" onClick={() => app.bumpHabit(h.id, 1)} aria-label={"+1 " + h.name} style={{ ...btnReset, width: 40, height: 40, borderRadius: 10, background: th.accent, color: th.on, display: "flex", alignItems: "center", justifyContent: "center" }}><Icon d={IC.plus} size={16} sw={2.5} /></button>
          </>
        ) : <Check on={done} onClick={() => app.toggleHabit(h.id)} th={th} label={h.name} />}
      </div>
      {isCount && (
        segs === h.target ? (
          <div style={{ display: "flex", gap: 3, marginTop: 10 }}>{Array.from({ length: segs }, (_, i) => <span key={i} style={{ flex: 1, height: 6, borderRadius: 3, background: i < n ? th.accent : th.line }} />)}</div>
        ) : <div style={{ height: 6, borderRadius: 3, background: th.line, marginTop: 10 }}><div style={{ width: Math.min(100, (n / h.target) * 100) + "%", height: "100%", borderRadius: 3, background: th.accent }} /></div>
      )}
    </div>
  );
}

// ─── ФИНАНСЫ ──────────────────────────────────────────────────────────────────
function parseQuick(text) {
  const out = [];
  String(text).split(/[,;\n]+/).forEach((part) => {
    let p = part.trim(); if (!p) return;
    let type = "expense";
    if (p.startsWith("+")) { type = "income"; p = p.slice(1).trim(); }
    const m = p.match(/(\d[\d\s]*(?:[.,]\d+)?)\s*(к|k|тыс\.?)?(?![а-яёa-z])/i);
    if (!m) return;
    let amount = parseFloat(m[1].replace(/\s/g, "").replace(",", "."));
    if (m[2]) amount *= 1000;
    amount = Math.round(amount);
    const name = (p.slice(0, m.index) + " " + p.slice(m.index + m[0].length)).replace(/\s+/g, " ").replace(/\s*(₸|тг|тенге)\s*/gi, " ").trim() || (type === "income" ? "Доход" : "Расход");
    if (amount > 0) out.push({ id: uid(), type, amount, name: name.charAt(0).toUpperCase() + name.slice(1), category: guessCategory(name, type) });
  });
  return out;
}

function periodOf(p) {
  if (p.mode === "day") return { from: p.anchor, to: p.anchor };
  if (p.mode === "week") { const s = weekStart(p.anchor); return { from: s, to: addDays(s, 6) }; }
  if (p.mode === "month") { const mk = monthKey(p.anchor); return { from: monthStart(mk), to: monthEnd(mk) }; }
  return { from: p.from <= p.to ? p.from : p.to, to: p.from <= p.to ? p.to : p.from };
}
function shiftPeriod(p, dir) {
  if (p.mode === "day") return { ...p, anchor: addDays(p.anchor, dir) };
  if (p.mode === "week") return { ...p, anchor: addDays(p.anchor, dir * 7) };
  if (p.mode === "month") return { ...p, anchor: monthStart(shiftMonthKey(monthKey(p.anchor), dir)) };
  const len = daysBetween(p.from, p.to) + 1;
  return { ...p, from: addDays(p.from, dir * len), to: addDays(p.to, dir * len) };
}

function Finance({ app }) {
  const { th, t, lang, txns, goal, saved } = app;
  const tk = today();
  const [quick, setQuick] = useState("");
  const [qDate, setQDate] = useState(tk);
  const [per, setPer] = useState({ mode: "month", anchor: tk, from: addDays(tk, -6), to: tk });
  const [openP, setOpenP] = useState(false);
  const [day, setDay] = useState(null);
  const parsed = useMemo(() => parseQuick(quick), [quick]);
  const voice = useVoice(lang, (txt) => setQuick((q) => (q ? q + ", " : "") + txt), (e) => app.setToast(t(e === "mic" ? "micErr" : "voiceErr")));

  const { from, to } = periodOf(per);
  const list = txns.filter((x) => (day ? x.date === day : x.date >= from && x.date <= to));
  const inc = list.filter((x) => x.type === "income").reduce((s, x) => s + x.amount, 0);
  const exp = list.filter((x) => x.type === "expense").reduce((s, x) => s + x.amount, 0);
  const nextDisabled = shiftPeriod(per, 1) && periodOf(shiftPeriod(per, 1)).from > tk;

  const [, mm] = from.split("-").map(Number);
  const label = day ? WD_SHORT[lang][wdIndex(day)] + ", " + dayLabel(day, lang)
    : per.mode === "day" ? WD_SHORT[lang][wdIndex(from)] + ", " + dayLabel(from, lang)
    : per.mode === "week" ? t("week") + " · " + parseKey(from).getDate() + "–" + dayLabel(to, lang)
    : per.mode === "month" ? MONTHS[lang][mm - 1] + " " + from.slice(0, 4)
    : fmtDM(from) + " – " + fmtDM(to);

  const dotFor = (k) => { const l = txns.filter((x) => x.date === k); return l.some((x) => x.type === "income") ? th.accent : l.length ? th.red : "transparent"; };
  const pickerDays = per.mode === "month" ? rangeDays(from, to) : rangeDays(weekStart(per.mode === "range" ? to : per.anchor), addDays(weekStart(per.mode === "range" ? to : per.anchor), 6));
  const lead = per.mode === "month" ? wdIndex(from) : 0;

  function saveQuick() {
    if (!parsed.length) return;
    app.addTxns(parsed.map((p, i) => ({ id: Date.now() + i, type: p.type, amount: p.amount, note: p.name, category: p.category, date: qDate, time: nowTime() })));
    setQuick(""); setQDate(tk);
  }

  // группировка по дням
  const days = [...new Set(list.map((x) => x.date))].sort().reverse();

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontSize: 22, fontWeight: 800 }}>{t("finance")}</div>
        <button type="button" onClick={() => app.open("txn", null)} style={primaryBtn(th, { minHeight: 44, borderRadius: 12, fontSize: 13 })}><Icon d={IC.plus} size={16} sw={2.5} />{t("add")}</button>
      </div>

      <div style={{ background: th.card, border: "1px solid " + th.border, borderRadius: 16, padding: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: th.accent }}><Icon d={IC.bolt} size={12} />{t("quick5")}</div>
        <div style={{ display: "flex", gap: 6, marginTop: 9 }}>
          <label style={{ flex: 1, display: "flex", alignItems: "center", gap: 6, background: th.inset, borderRadius: 12, padding: "0 4px 0 12px", minWidth: 0 }}>
            <input value={quick} onChange={(e) => setQuick(e.target.value)} onKeyDown={(e) => e.key === "Enter" && saveQuick()} placeholder={t("quickPh")} aria-label={t("quick5")} style={{ flex: 1, minWidth: 0, height: 44, border: "none", outline: "none", background: "transparent", color: th.text, fontSize: 13 }} />
            <MicBtn voice={voice} th={th} t={t} size={36} />
          </label>
          <button type="button" onClick={saveQuick} disabled={!parsed.length} style={primaryBtn(th, { minHeight: 44, borderRadius: 12, fontSize: 13, padding: "0 12px", opacity: parsed.length ? 1 : 0.45 })}>{t("save")}</button>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8, fontSize: 11, color: th.muted, flexWrap: "wrap" }}>
          <Icon d={IC.cal} size={13} />{t("date")}:
          {[[tk, t("todayW")], [addDays(tk, -1), t("yesterdayW")]].map(([k, l]) => (
            <button key={k} type="button" onClick={() => setQDate(k)} style={{ ...btnReset, fontSize: 11, fontWeight: 700, color: qDate === k ? th.accent : th.muted, padding: "4px 2px" }}>{l}</button>
          ))}
          <input type="date" value={qDate} max={tk} onChange={(e) => e.target.value && setQDate(e.target.value)} aria-label={t("date")} style={{ background: "transparent", border: "none", color: qDate !== tk && qDate !== addDays(tk, -1) ? th.accent : th.muted, fontSize: 11, fontWeight: 700, padding: 0, width: 110 }} />
        </div>
        {parsed.length > 0 && (
          <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 4 }}>
            {parsed.map((p) => (
              <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 10, background: th.inset, borderRadius: 11, padding: "6px 10px" }}>
                <IconBox d={IC[CAT_ICON[p.category]]} th={th} size={28} radius={8} icon={14} />
                <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 13 }}>{p.name}</div><div style={{ fontSize: 10, color: th.muted }}>{t("cat_" + p.category)}</div></div>
                <div style={{ fontSize: 13, fontWeight: 700, color: p.type === "income" ? th.accent : th.red }}>{p.type === "income" ? "+" : "−"}{fmtNum(p.amount)} ₸</div>
              </div>
            ))}
          </div>
        )}
        {!quick && <div style={{ fontSize: 10, color: th.dim, marginTop: 6 }}>{t("quickHint")}</div>}
      </div>

      <div style={{ background: th.card, border: "1px solid " + (day ? th.accent : th.line), borderRadius: 14, padding: 4 }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <button type="button" onClick={() => { setDay(null); setPer((p) => shiftPeriod(p, -1)); }} aria-label="‹" style={{ ...btnReset, width: 44, height: 44, color: th.accent, display: "flex", alignItems: "center", justifyContent: "center" }}><Icon d={IC.chevL} /></button>
          <button type="button" onClick={() => setOpenP((o) => !o)} aria-expanded={openP} style={{ ...btnReset, flex: 1, minHeight: 44, fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <Icon d={IC.cal} size={15} color={th.accent} />{label}<Icon d={openP ? IC.chevU : IC.chevD} size={14} color={th.muted} />
          </button>
          {day && <button type="button" onClick={() => setDay(null)} aria-label="×" style={{ ...btnReset, width: 44, height: 44, color: th.sub, display: "flex", alignItems: "center", justifyContent: "center" }}><Icon d={IC.x} size={16} /></button>}
          <button type="button" disabled={nextDisabled} onClick={() => { setDay(null); setPer((p) => shiftPeriod(p, 1)); }} aria-label="›" style={{ ...btnReset, width: 44, height: 44, color: nextDisabled ? th.dim : th.accent, opacity: nextDisabled ? 0.4 : 1, display: "flex", alignItems: "center", justifyContent: "center" }}><Icon d={IC.chevR} /></button>
        </div>
        {openP && (
          <div style={{ padding: "4px 6px 8px" }}>
            <Segmented items={[["day", t("day")], ["week", t("week")], ["month", t("month")], ["range", t("period")]]} value={per.mode} onChange={(m) => { setDay(null); setPer((p) => ({ ...p, mode: m, anchor: m === "range" ? p.anchor : tk })); }} th={th} />
            {per.mode === "range" ? (
              <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                <input type="date" value={per.from} max={tk} onChange={(e) => e.target.value && setPer((p) => ({ ...p, from: e.target.value }))} aria-label={t("from")} style={{ ...inputStyle(th), height: 40, fontSize: 13 }} />
                <input type="date" value={per.to} max={tk} onChange={(e) => e.target.value && setPer((p) => ({ ...p, to: e.target.value }))} aria-label={t("to")} style={{ ...inputStyle(th), height: 40, fontSize: 13 }} />
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0,1fr))", gap: 3, marginTop: 10 }}>
                {per.mode === "month" && WD_SHORT[lang].map((w) => <div key={w} style={{ fontSize: 10, color: th.muted, textAlign: "center" }}>{w}</div>)}
                {Array.from({ length: lead }, (_, i) => <span key={"l" + i} />)}
                {pickerDays.map((k) => {
                  const sel = (per.mode === "day" && !day) ? k === per.anchor : day === k;
                  const future = k > tk;
                  return (
                    <button key={k} type="button" disabled={future} onClick={() => { if (per.mode === "day") { setPer((p) => ({ ...p, anchor: k })); setDay(null); } else setDay(k); setOpenP(false); }}
                      aria-label={WD_FULL[lang][wdIndex(k)] + ", " + dayLabel(k, lang)}
                      style={{ ...btnReset, minHeight: per.mode === "month" ? 40 : 56, borderRadius: 11, background: sel ? th.accent : "transparent", color: sel ? th.on : future ? th.dim : th.text, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 1, border: k === tk && !sel ? "1px solid " + th.border : "1px solid transparent" }}>
                      {per.mode !== "month" && <span style={{ fontSize: 10 }}>{WD_SHORT[lang][wdIndex(k)]}</span>}
                      <span style={{ fontSize: per.mode === "month" ? 13 : 15, fontWeight: 700 }}>{parseKey(k).getDate()}</span>
                      <span style={{ width: 4, height: 4, borderRadius: "50%", background: sel ? th.on : dotFor(k) }} />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 6 }}>
        {[[t("income"), fmtNum(inc), th.accent], [t("expense"), fmtNum(exp), th.red], [t("bal"), (inc - exp >= 0 ? "+" : "−") + fmtNum(inc - exp), th.text]].map(([l, v, c]) => (
          <div key={l} style={{ background: th.card, borderRadius: 13, padding: 10, minWidth: 0 }}><div style={{ fontSize: 10, color: th.muted }}>{l}</div><div style={{ fontSize: 15, fontWeight: 800, color: c, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v}</div></div>
        ))}
      </div>

      <GoalCard app={app} />

      {days.length === 0 && <div style={{ textAlign: "center", padding: "24px 0", color: th.muted, fontSize: 13 }}>{t("noTxns")}</div>}
      {days.map((d) => {
        const items = list.filter((x) => x.date === d).sort((a, b) => String(b.time || "").localeCompare(String(a.time || "")));
        const sum = items.reduce((s, x) => s + (x.type === "income" ? x.amount : -x.amount), 0);
        return (
          <div key={d} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <SectionLabel th={th} right={<span style={{ color: sum >= 0 ? th.accent : th.red, letterSpacing: 0 }}>{sum >= 0 ? "+" : "−"}{fmtNum(sum)} ₸</span>}>{(WD_FULL[lang][wdIndex(d)] + " · " + dayLabel(d, lang)).toUpperCase()}</SectionLabel>
            {items.map((x) => <TxnRow key={x.id} x={x} app={app} />)}
          </div>
        );
      })}
    </>
  );
}

const stripEmoji = (s) => { const v = String(s || "").replace(/^\p{Extended_Pictographic}\uFE0F?\s*/u, ""); return v.charAt(0).toUpperCase() + v.slice(1); };
function TxnRow({ x, app }) {
  const { th, t } = app;
  const isGoal = x.type === "deposit";
  const col = isGoal ? th.gold : x.type === "income" ? th.accent : th.red;
  return (
    <button type="button" onClick={() => app.open("txn", x)} style={{ ...btnReset, display: "flex", alignItems: "center", gap: 12, background: isGoal ? th.goldBg : th.card, border: "1px solid " + (isGoal ? th.goldLine : th.card), borderRadius: 14, padding: "10px 12px", textAlign: "left" }}>
      <IconBox d={IC[CAT_ICON[x.category]] || IC.dots} th={th} size={34} radius={10} color={isGoal ? th.gold : th.accent} bg={isGoal ? th.goldSoft : th.soft} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{stripEmoji(x.note) || t("cat_" + x.category)}</div>
        <div style={{ fontSize: 11, color: th.muted }}>{t("cat_" + x.category)}{x.time ? " · " + x.time : ""}</div>
      </div>
      <div style={{ fontSize: 13, fontWeight: 700, color: col, whiteSpace: "nowrap" }}>{x.type === "income" ? "+" : "−"}{fmtNum(x.amount)} ₸</div>
    </button>
  );
}

function GoalCard({ app }) {
  const { th, t, goal, saved } = app;
  if (!goal) return (
    <button type="button" onClick={() => app.open("goal", null)} style={{ ...btnReset, display: "flex", alignItems: "center", gap: 12, background: th.goldBg, border: "1px dashed " + th.goldLine, borderRadius: 16, padding: 14, textAlign: "left" }}>
      <IconBox d={IC.trophy} th={th} color={th.gold} bg={th.goldSoft} />
      <div style={{ flex: 1 }}><div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: th.gold }}>{t("goalQuest")}</div><div style={{ fontSize: 13, marginTop: 2 }}>{t("goalEmpty")}</div></div>
      <Icon d={IC.plus} color={th.gold} />
    </button>
  );
  const pct = Math.min(100, Math.round((saved / goal.target) * 100));
  const nodes = [[IC.flag, t("goalStart"), 0], [IC.medal, "25%", 25], [IC.gift, "50%", 50], [IC.lock, "75%", 75], [IC.trophy, t("goalEnd"), 100]];
  const nextNode = nodes.find((n) => n[2] > pct);
  const piggyLeft = Math.max(0, Math.ceil(goal.target / 2 - saved));
  return (
    <div style={{ background: th.card, borderRadius: 16, padding: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14, gap: 10 }}>
        <button type="button" onClick={() => app.open("goal", goal)} style={{ ...btnReset, textAlign: "left", minWidth: 0 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: th.gold }}>{t("goalQuest")}</div>
          <div style={{ fontSize: 15, fontWeight: 700, marginTop: 2 }}>{goal.title} · {fmtNum(goal.target)} ₸</div>
        </button>
        <div style={{ textAlign: "right", flexShrink: 0 }}><div style={{ fontSize: 15, fontWeight: 800, color: th.gold }}>{fmtNum(saved)} ₸</div><div style={{ fontSize: 11, color: th.muted }}>{t("saved")} {pct}%</div></div>
      </div>
      <div style={{ position: "relative", height: 52, margin: "0 2px" }}>
        <div style={{ position: "absolute", left: 15, right: 15, top: 14, height: 4, background: th.line, borderRadius: 2 }} />
        <div style={{ position: "absolute", left: 15, width: "calc((100% - 30px) * " + pct / 100 + ")", top: 14, height: 4, background: th.gold, borderRadius: 2, transition: "width .4s" }} />
        {nodes.map(([d, l, at], i) => {
          const on = pct >= at, nx = nextNode && nextNode[2] === at;
          return (
            <div key={i} style={{ position: "absolute", left: "calc((100% - 32px) * " + at / 100 + ")", top: 0, width: 32, textAlign: "center" }}>
              <div style={{ width: 32, height: 32, boxSizing: "border-box", borderRadius: "50%", background: on ? th.gold : th.card, border: "2px solid " + (on || nx ? th.gold : th.track), color: on ? th.on : nx ? th.gold : th.dim, display: "flex", alignItems: "center", justifyContent: "center" }}><Icon d={d} size={15} /></div>
              <div style={{ fontSize: 10, color: on ? th.gold : th.muted, marginTop: 3, whiteSpace: "nowrap" }}>{l}</div>
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginTop: 12 }}>
        <div style={{ fontSize: 11, color: th.muted, lineHeight: 1.4 }}>{pct >= 100 ? t("goalDone") : piggyLeft > 0 ? t("piggyHint", fmtNum(piggyLeft)) : ""}</div>
        <button type="button" onClick={() => app.open("txn", { type: "deposit", goalId: goal.id, _new: true })} style={{ ...btnReset, minHeight: 44, borderRadius: 11, background: th.gold, color: th.light ? "#fff" : "#0A0F0A", fontSize: 12, fontWeight: 700, padding: "0 12px", whiteSpace: "nowrap" }}>{t("toGoal")}</button>
      </div>
    </div>
  );
}

// ─── ЗАДАЧИ ───────────────────────────────────────────────────────────────────
function parseTaskText(txt) {
  let title = txt.trim(); const low = title.toLowerCase();
  let quadrant = "plan", deadline = "";
  if (/срочн|шұғыл|urgent|asap/.test(low)) quadrant = /не\s*важн|маңызды емес/.test(low) ? "deleg" : "now";
  else if (/делегир|поручить|тапсыр/.test(low)) quadrant = "deleg";
  else if (/потом|когда-нибудь|later|кейін/.test(low)) quadrant = "later";
  if (/послезавтра|бүрсігүні/.test(low)) deadline = addDays(today(), 2);
  else if (/завтра|ертең|tomorrow/.test(low)) deadline = addDays(today(), 1);
  else if (/сегодня|бүгін|today/.test(low)) deadline = today();
  title = title.replace(/\b(послезавтра|завтра|сегодня|бүрсігүні|ертең|бүгін|tomorrow|today)\b/gi, "").replace(/\s+/g, " ").trim();
  return { title: title.charAt(0).toUpperCase() + title.slice(1), quadrant, deadline };
}

function Tasks({ app }) {
  const { th, t, lang, tasks } = app;
  const tk = today(), tm = addDays(tk, 1);
  const [view, setView] = useState("list");
  const [quick, setQuick] = useState("");
  const [showDone, setShowDone] = useState(false);
  const voice = useVoice(lang, (txt) => setQuick(txt), (e) => app.setToast(t(e === "mic" ? "micErr" : "voiceErr")));
  const QC = Q_COLOR(th);
  const active = tasks.filter((x) => !x.done);
  const done = tasks.filter((x) => x.done);
  const over = active.filter((x) => x.deadline && x.deadline < tk);

  function addQuick() {
    if (!quick.trim()) return;
    const p = parseTaskText(quick);
    if (!p.title) return;
    app.saveTask({ id: uid(), title: p.title, quadrant: p.quadrant, deadline: p.deadline, done: false, createdAt: tk });
    setQuick("");
  }

  const dueText = (x) => {
    if (!x.deadline) return t("noDeadline");
    if (x.deadline < tk) return t("ago", daysBetween(x.deadline, tk));
    if (x.deadline === tk) return t("todayW").toLowerCase();
    if (x.deadline === tm) return t("tomorrowW").toLowerCase();
    return dayLabel(x.deadline, lang);
  };

  const Item = ({ x, compact }) => {
    const isOver = !x.done && x.deadline && x.deadline < tk;
    if (compact) return (
      <div style={{ display: "flex", alignItems: "flex-start", gap: 2, marginBottom: 2 }}>
        <button type="button" onClick={() => app.toggleTask(x.id)} aria-label={x.title} style={{ ...btnReset, width: 30, height: 30, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ width: 16, height: 16, boxSizing: "border-box", borderRadius: "50%", border: "2px solid " + (x.done ? th.accent : isOver ? th.red : th.track), background: x.done ? th.accent : "transparent" }} />
        </button>
        <button type="button" onClick={() => app.open("task", x)} style={{ ...btnReset, minWidth: 0, paddingTop: 6, textAlign: "left" }}>
          <div style={{ fontSize: 11, lineHeight: 1.3, textDecoration: x.done ? "line-through" : "none", color: x.done ? th.muted : th.text, wordBreak: "break-word" }}>{x.title}</div>
          <div style={{ fontSize: 10, color: isOver ? th.red : th.muted }}>{dueText(x)}</div>
        </button>
      </div>
    );
    return (
      <div style={{ position: "relative", overflow: "hidden", display: "flex", alignItems: "center", gap: 6, background: th.card, borderRadius: 14, padding: "4px 12px 4px 4px" }}>
        <span style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, background: QC[x.quadrant] }} />
        <Check on={x.done} onClick={() => app.toggleTask(x.id)} th={th} label={x.title} size={24} danger={isOver} />
        <button type="button" onClick={() => app.open("task", x)} style={{ ...btnReset, flex: 1, minWidth: 0, textAlign: "left", padding: "4px 0" }}>
          <div style={{ fontSize: 13, textDecoration: x.done ? "line-through" : "none", color: x.done ? th.muted : th.text }}>{x.title}</div>
          <div style={{ display: "flex", gap: 5, marginTop: 4 }}><Chip th={th} color={QC[x.quadrant]}>{t("qs_" + x.quadrant)}</Chip><Chip th={th} color={isOver ? th.red : th.muted}>{dueText(x)}</Chip></div>
        </button>
      </div>
    );
  };

  const order = { now: 0, plan: 1, deleg: 2, later: 3 };
  const byQ = (a, b) => order[a.quadrant] - order[b.quadrant];
  const sections = [
    ["over", t("sec_over"), th.red, active.filter((x) => x.deadline && x.deadline < tk), true],
    ["today", t("sec_today") + " · " + WD_SHORT[lang][wdIndex(tk)] + " " + dayLabel(tk, lang).toUpperCase(), th.accent, active.filter((x) => x.deadline === tk)],
    ["tomorrow", t("sec_tomorrow") + " · " + WD_SHORT[lang][wdIndex(tm)] + " " + dayLabel(tm, lang).toUpperCase(), th.muted, active.filter((x) => x.deadline === tm)],
    ["later", t("sec_later"), th.muted, active.filter((x) => !x.deadline || x.deadline > tm)],
  ].map((s) => [...s.slice(0, 3), s[3].sort((a, b) => byQ(a, b) || String(a.deadline || "9").localeCompare(String(b.deadline || "9"))), s[4]]).filter((s) => s[3].length);

  const nowN = active.filter((x) => x.quadrant === "now").length;
  const nowOver = active.filter((x) => x.quadrant === "now" && x.deadline && x.deadline < tk).length;

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div><div style={{ fontSize: 22, fontWeight: 800 }}>{t("tasks")}</div><div style={{ fontSize: 12, color: th.muted }}>{t("tasksSum", active.length, done.length)}</div></div>
        <button type="button" onClick={() => app.open("task", null)} aria-label={t("newTask")} style={primaryBtn(th, { width: 44, minHeight: 44, padding: 0, borderRadius: 12 })}><Icon d={IC.plus} size={20} sw={2.5} /></button>
      </div>

      <label style={{ display: "flex", alignItems: "center", gap: 6, background: th.card, border: "1px solid " + th.border, borderRadius: 14, padding: "0 4px 0 12px" }}>
        <input value={quick} onChange={(e) => setQuick(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addQuick()} placeholder={t("taskPh")} aria-label={t("newTask")} style={{ flex: 1, minWidth: 0, height: 46, border: "none", outline: "none", background: "transparent", color: th.text, fontSize: 13 }} />
        {quick.trim()
          ? <button type="button" onClick={addQuick} aria-label={t("add")} style={primaryBtn(th, { width: 40, minHeight: 40, padding: 0, borderRadius: 10 })}><Icon d={IC.plus} size={18} sw={2.5} /></button>
          : <MicBtn voice={voice} th={th} t={t} />}
      </label>

      <Segmented items={[["list", t("deadlines"), IC.list], ["matrix", t("matrix"), IC.grid]]} value={view} onChange={setView} th={th} />

      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, fontSize: 11, color: th.sub }}>
        {QUADS.map((q) => <span key={q} style={{ display: "flex", alignItems: "center", gap: 5 }}><span style={{ width: 9, height: 9, borderRadius: 2, background: QC[q] }} />{t("q_" + q)}</span>)}
      </div>

      {view === "list" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {sections.length === 0 && <div style={{ textAlign: "center", padding: "24px 0", color: th.muted, fontSize: 13 }}>{t("noTasks")}</div>}
          {sections.map(([k, label, color, items, box]) => (
            <div key={k} style={{ display: "flex", flexDirection: "column", gap: 6, background: box ? th.redBg : "transparent", border: "1px solid " + (box ? th.redLine : "transparent"), borderRadius: 16, padding: box ? "4px 8px 8px" : 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", color, marginTop: 6 }}><span>{label}</span><span>{items.length}</span></div>
              {items.map((x) => <Item key={x.id} x={x} />)}
            </div>
          ))}
        </div>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8 }}>
            {QUADS.map((q) => {
              const items = active.filter((x) => x.quadrant === q);
              return (
                <div key={q} style={{ background: th.card, border: "1px solid " + (q === "now" ? th.redLine : q === "deleg" ? th.goldLine : th.border), borderRadius: 16, padding: 10, minHeight: 150 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, fontWeight: 700, letterSpacing: "0.04em", color: QC[q] }}><span>{t("qt_" + q)}</span><span>{items.length}</span></div>
                  <div style={{ fontSize: 10, color: th.muted, margin: "2px 0 8px" }}>{t("qs_" + q)}</div>
                  {items.map((x) => <Item key={x.id} x={x} compact />)}
                  <button type="button" onClick={() => app.open("task", { quadrant: q, _new: true })} aria-label={t("newTask")} style={{ ...btnReset, color: th.dim, padding: "4px 6px" }}><Icon d={IC.plus} size={16} /></button>
                </div>
              );
            })}
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "flex-start", background: th.card, border: "1px solid " + th.border, borderRadius: 14, padding: 12 }}>
            <div style={{ color: th.accent }}><Icon d={IC.sparkles} size={16} /></div>
            <div style={{ fontSize: 12, lineHeight: 1.45 }}>{nowN ? t("azaMatrix", nowN, nowOver) : t("azaMatrixEmpty")}</div>
          </div>
        </>
      )}

      {done.length > 0 && (
        <>
          <button type="button" onClick={() => setShowDone((s) => !s)} aria-expanded={showDone} style={{ ...btnReset, alignSelf: "center", fontSize: 12, color: th.muted, display: "flex", alignItems: "center", gap: 4, padding: 8 }}>{t("doneN")}: {done.length}<Icon d={showDone ? IC.chevU : IC.chevD} size={14} /></button>
          {showDone && done.slice().sort((a, b) => String(b.doneAt || "").localeCompare(String(a.doneAt || ""))).map((x) => <Item key={x.id} x={x} />)}
        </>
      )}
    </>
  );
}

// ─── ПРОФИЛЬ И НАСТРОЙКИ ──────────────────────────────────────────────────────
function Profile({ app }) {
  const { th, t, lang, user, habits, tasks, txns, lvl, xp, badges } = app;
  const [view, setView] = useState("main");
  const [off, setOff] = useState(0);
  const tk = today();
  const mk = shiftMonthKey(monthKey(tk), off);
  const allDates = [...habits.flatMap((h) => Object.keys(h.checks)), ...txns.map((x) => x.date), ...habits.map((h) => h.createdAt)].filter(isKey).sort();
  const firstMk = allDates[0] ? monthKey(allDates[0]) : monthKey(tk);

  const monthXP = (m) => habits.reduce((s, h) => s + Object.keys(h.checks).filter((k) => h.checks[k] && k.startsWith(m)).length * 10, 0)
    + tasks.filter((x) => x.done && x.doneAt && x.doneAt.startsWith(m)).length * 20 + txns.filter((x) => x.date.startsWith(m)).length * 5;
  const mXP = monthXP(mk), pXP = monthXP(shiftMonthKey(mk, -1));
  const note = mk === firstMk ? t("firstMonth") : mXP > pXP ? t("better", mXP - pXP) : mXP < pXP ? t("worse", pXP - mXP) : t("same");
  const mHab = habitsPct(habits, monthStart(mk), monthEnd(mk));
  const mTasksTotal = tasks.filter((x) => (x.deadline && x.deadline.startsWith(mk)) || (x.doneAt && x.doneAt.startsWith(mk))).length;
  const mTasksDone = tasks.filter((x) => x.done && x.doneAt && x.doneAt.startsWith(mk)).length;
  const mTx = txns.filter((x) => x.date.startsWith(mk));
  const mSaved = mTx.filter((x) => x.type === "income").reduce((s, x) => s + x.amount, 0) - mTx.filter((x) => x.type === "expense").reduce((s, x) => s + x.amount, 0);
  const monthName = MONTHS[lang][Number(mk.slice(5)) - 1];

  // рекорды
  const longest = habits.reduce((m, h) => Math.max(m, bestStreakOf(h)), 0);
  const dayXP = {};
  habits.forEach((h) => Object.keys(h.checks).forEach((k) => { if (h.checks[k]) dayXP[k] = (dayXP[k] || 0) + 10; }));
  tasks.forEach((x) => { if (x.done && x.doneAt) dayXP[x.doneAt] = (dayXP[x.doneAt] || 0) + 20; });
  txns.forEach((x) => { dayXP[x.date] = (dayXP[x.date] || 0) + 5; });
  const best = Object.entries(dayXP).sort((a, b) => b[1] - a[1])[0];
  const sphereN = SPHERES.map((s) => [s, habits.filter((h) => h.sphere === s).reduce((m, h) => m + Object.keys(h.checks).filter((k) => h.checks[k]).length, 0)]).sort((a, b) => b[1] - a[1]);
  const strong = sphereN[0] && sphereN[0][1] > 0 ? t("sph_" + sphereN[0][0]) : t("none");

  async function share() {
    const text = t("shareText", monthName.toLowerCase(), "+" + mXP + " XP", mHab + "%", mTasksDone + " / " + mTasksTotal, fmtShort(mSaved) + " ₸");
    try { if (navigator.share) { await navigator.share({ title: "NextLVL", text }); return; } } catch (e) { return; }
    try { await navigator.clipboard.writeText(text); app.setToast(t("copied")); } catch (e) {}
  }

  if (view === "settings") return <Settings app={app} onBack={() => setView("main")} />;
  const earned = badges.filter((b) => b.earned).length;

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 52, height: 52, borderRadius: 15, background: th.inset, border: "2px solid " + th.accent, color: th.accent, display: "flex", alignItems: "center", justifyContent: "center" }}><Icon d={IC[lvl.cur.icon]} size={26} /></div>
        <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 15, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.name}</div><div style={{ fontSize: 12, color: th.gold }}>{t("lvl")} {lvl.cur.level} · {t("lv")[lvl.cur.level - 1]} · {xp} XP</div></div>
        <button type="button" onClick={() => setView("settings")} aria-label={t("settings")} style={primaryBtn(th, { width: 44, minHeight: 44, padding: 0, borderRadius: 12 })}><Icon d={IC.gear} size={20} /></button>
      </div>

      <div style={{ background: th.hero, border: "1px solid " + th.border, borderRadius: 18, padding: 14 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <button type="button" disabled={mk <= firstMk} onClick={() => setOff((o) => o - 1)} aria-label="‹" style={{ ...btnReset, width: 36, height: 36, color: th.accent, opacity: mk <= firstMk ? 0.3 : 1, display: "flex", alignItems: "center", justifyContent: "center" }}><Icon d={IC.chevL} /></button>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: th.accent }}>{monthName.toUpperCase()} · {t("results")}</span>
            <button type="button" disabled={off >= 0} onClick={() => setOff((o) => o + 1)} aria-label="›" style={{ ...btnReset, width: 36, height: 36, color: th.accent, opacity: off >= 0 ? 0.3 : 1, display: "flex", alignItems: "center", justifyContent: "center" }}><Icon d={IC.chevR} /></button>
          </div>
          <button type="button" onClick={share} aria-label="Share" style={{ ...btnReset, width: 40, height: 40, color: th.accent, display: "flex", alignItems: "center", justifyContent: "center" }}><Icon d={IC.share} /></button>
        </div>
        <div style={{ fontSize: 24, fontWeight: 800, marginTop: 4 }}>+{mXP} XP</div>
        <div style={{ fontSize: 12, color: th.muted }}>{note}</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 6, marginTop: 12 }}>
          {[[IC.flame, mHab + "%", t("habitsW"), th.accent], [IC.check, mTasksDone + " / " + mTasksTotal, t("tasksW"), th.accent], [IC.coins, fmtShort(mSaved), t("savedW"), th.gold]].map(([d, v, l, c], i) => (
            <div key={i} style={{ background: th.inset, borderRadius: 12, padding: "10px 6px", textAlign: "center" }}><div style={{ color: c, display: "flex", justifyContent: "center" }}><Icon d={d} size={18} /></div><div style={{ fontSize: 15, fontWeight: 800, marginTop: 3 }}>{v}</div><div style={{ fontSize: 10, color: th.muted }}>{l}</div></div>
          ))}
        </div>
      </div>

      <SectionLabel th={th} style={{ marginTop: 4 }}>{t("records")}</SectionLabel>
      <div style={{ background: th.card, borderRadius: 16 }}>
        {[[IC.flame, th.gold, t("longest"), t("u_days", longest)], [IC.star, th.accent, t("bestDay"), best ? dayLabel(best[0], lang) + " · " + best[1] + " XP" : t("none")], [IC.barbell, th.accent, t("strong"), strong]].map(([d, c, l, v], i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 14px", borderTop: i ? "1px solid " + th.line : "none" }}><div style={{ color: c }}><Icon d={d} /></div><div style={{ flex: 1, fontSize: 13 }}>{l}</div><div style={{ fontSize: 13, fontWeight: 700 }}>{v}</div></div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8 }}>
        <button type="button" onClick={() => app.open("export")} style={ghostBtn(th, { background: th.card, justifyContent: "flex-start", fontSize: 13 })}><Icon d={IC.download} color={th.accent} />{t("export")}</button>
        <button type="button" onClick={() => app.open("badges")} style={ghostBtn(th, { background: th.card, justifyContent: "flex-start", fontSize: 13 })}><Icon d={IC.medal} color={th.accent} />{t("badges")} {earned} / {badges.length}</button>
      </div>
    </>
  );
}

function Settings({ app, onBack }) {
  const { th, t, lang, user, setUser, settings, setSettings, notif, setNotif } = app;
  const fileRef = useRef(null);
  const Row = ({ icon, color, title, sub, right, onClick, danger }) => (
    <div onClick={onClick} role={onClick ? "button" : undefined} tabIndex={onClick ? 0 : undefined} onKeyDown={(e) => onClick && e.key === "Enter" && onClick()}
      style={{ display: "flex", alignItems: "center", gap: 12, padding: right ? "4px 4px 4px 14px" : "12px 14px", cursor: onClick ? "pointer" : "default" }}>
      <div style={{ color: danger ? th.red : color || th.accent }}><Icon d={icon} /></div>
      <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 13, color: danger ? th.red : th.text }}>{title}</div>{sub && <div style={{ fontSize: 10, color: th.muted }}>{sub}</div>}</div>
      {right}
    </div>
  );
  const Group = ({ children }) => <div style={{ background: th.card, borderRadius: 16 }}>{React.Children.toArray(children).filter(Boolean).map((c, i) => <div key={i} style={{ borderTop: i ? "1px solid " + th.line : "none" }}>{c}</div>)}</div>;

  async function toggleNotif() {
    if (notif) { setNotif(false); try { localStorage.setItem(KEYS.notif, "false"); } catch (e) {} return; }
    if (typeof Notification === "undefined") return;
    const perm = Notification.permission === "granted" ? "granted" : await Notification.requestPermission();
    if (perm === "granted") { setNotif(true); try { localStorage.setItem(KEYS.notif, "true"); } catch (e) {} }
  }
  function downloadBackup() {
    const data = buildBackup({ user, habits: app.habits, tasks: app.tasks, txns: app.txns, goal: app.goal, settings });
    const blob = new Blob([JSON.stringify(data, null, 1)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "NextLVL_backup_" + today() + ".json"; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  }
  function onRestoreFile(e) {
    const f = e.target.files && e.target.files[0]; e.target.value = "";
    if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      let d; try { d = parseBackup(String(r.result)); } catch (err) { app.setToast(t("restoreBad")); return; }
      if (!window.confirm(t("restoreAsk", d.habits.length, d.tasks.length, d.txns.length))) return;
      snapshotCurrent(KEYS.backupAuto);
      app.setHabits(d.habits); app.setTasks(d.tasks); app.setTxns(d.txns); app.setGoal(d.goal);
      if (d.user && d.user.name) setUser({ ...user, ...d.user });
      if (d.settings) setSettings((s) => ({ ...s, ...d.settings }));
      app.setToast(t("restoreOk"));
    };
    r.readAsText(f);
  }
  function reset() {
    if (!window.confirm(t("resetAsk1"))) return;
    if (!window.confirm(t("resetAsk2"))) return;
    wipeAll(); window.location.reload();
  }

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <button type="button" onClick={onBack} aria-label="Назад" style={{ ...btnReset, width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center" }}><Icon d={IC.back} /></button>
        <div style={{ fontSize: 20, fontWeight: 800 }}>{t("settings")}</div>
      </div>

      <SectionLabel th={th}>{t("theme")}</SectionLabel>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 8, opacity: settings.sysTheme ? 0.5 : 1 }}>
        {THEME_IDS.map((id) => {
          const p = THEMES[id], on = !settings.sysTheme && user.theme === id;
          return (
            <button key={id} type="button" onClick={() => { setSettings((s) => ({ ...s, sysTheme: false })); setUser({ ...user, theme: id }); }} aria-pressed={on} aria-label={t("th_" + id)}
              style={{ ...btnReset, minHeight: 64, borderRadius: 14, border: "2px solid " + (on ? th.accent : th.line), background: p.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6 }}>
              <span style={{ width: 18, height: 18, borderRadius: "50%", background: p.dot }} /><span style={{ fontSize: 10, fontWeight: 700, color: p.text }}>{t("th_" + id)}</span>
            </button>
          );
        })}
      </div>
      <Group><Row icon={IC.sun} title={t("sysTheme")} right={<Switch on={settings.sysTheme} onClick={() => setSettings((s) => ({ ...s, sysTheme: !s.sysTheme }))} th={th} label={t("sysTheme")} />} /></Group>

      <SectionLabel th={th}>{t("language")}</SectionLabel>
      <Segmented items={[["ru", "Русский"], ["kk", "Қазақша"], ["en", "English"]]} value={lang} onChange={(l) => setUser({ ...user, lang: l })} th={th} />

      <SectionLabel th={th}>{t("notifs")}</SectionLabel>
      <Group>
        <Row icon={IC.bell} title={t("reminders")} sub={t("notifTimes")} right={<Switch on={notif} onClick={toggleNotif} th={th} label={t("reminders")} />} />
        <Row icon={IC.sparkles} title={t("azaTips")} right={<Switch on={settings.aza} onClick={() => setSettings((s) => ({ ...s, aza: !s.aza }))} th={th} label={t("azaTips")} />} />
      </Group>

      <SectionLabel th={th}>{t("data")}</SectionLabel>
      <Group>
        <Row icon={IC.download} title={t("excel")} sub={t("excelSub")} onClick={() => app.open("export")} />
        <Row icon={IC.pen} title={t("name")} sub={user.name} onClick={() => app.open("name")} />
        <Row icon={IC.shield} title={t("backup")} sub={t("backupSub")} onClick={downloadBackup} />
        <Row icon={IC.upload} title={t("restore")} sub={t("restoreSub")} onClick={() => fileRef.current && fileRef.current.click()} />
        <Row icon={IC.trash} title={t("reset")} danger onClick={reset} />
      </Group>
      <input ref={fileRef} type="file" accept="application/json,.json" onChange={onRestoreFile} style={{ display: "none" }} />

      <SectionLabel th={th}>{t("docs")}</SectionLabel>
      <Group>
        <Row icon={IC.doc} title={t("terms")} onClick={() => window.open("/terms.html", "_blank")} right={<span style={{ paddingRight: 14, color: th.muted }}><Icon d={IC.chevR} size={16} /></span>} />
        <Row icon={IC.lock} title={t("privacy")} onClick={() => window.open("/privacy.html", "_blank")} right={<span style={{ paddingRight: 14, color: th.muted }}><Icon d={IC.chevR} size={16} /></span>} />
      </Group>
      <div style={{ fontSize: 10, color: th.muted, textAlign: "center" }}>NextLVL v{APP_VERSION} · next-lvl.kz</div>
    </>
  );
}

// ─── ВСЕ НИЖНИЕ ПАНЕЛИ ────────────────────────────────────────────────────────
function Sheets({ app, sheet }) {
  const { th, t } = app;
  const type = sheet && sheet.type, data = sheet && sheet.data;
  const close = app.close;
  const titles = { habit: data ? t("editHabit") : t("newHabit"), txn: data && !data._new ? t("txn") : t("add"), task: data && !data._new ? t("task") : t("newTask"), goal: t("goalQuest"), preset: data ? t("pre_" + data) : "", export: t("exportTitle"), badges: t("badges"), name: t("name") };
  return (
    <Sheet open={!!sheet} onClose={close} title={titles[type] || ""} th={th}>
      {type === "habit" && <HabitForm key={data ? data.id : "new"} app={app} h={data} />}
      {type === "txn" && <TxnForm key={data ? data.id || "dep" : "new"} app={app} x={data} />}
      {type === "task" && <TaskForm key={data ? data.id || "q" : "new"} app={app} x={data} />}
      {type === "goal" && <GoalForm app={app} g={data} />}
      {type === "preset" && <PresetView app={app} k={data} />}
      {type === "export" && <ExportForm app={app} />}
      {type === "badges" && <BadgesView app={app} />}
      {type === "name" && <NameForm app={app} />}
    </Sheet>
  );
}

function FormButtons({ app, onSave, onDelete, canSave = true }) {
  const { th, t } = app;
  return (
    <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
      {onDelete && <button type="button" onClick={() => { if (window.confirm(t("delConfirm"))) { onDelete(); app.close(); } }} aria-label={t("del")} style={ghostBtn(th, { width: 52, padding: 0, color: th.red })}><Icon d={IC.trash} /></button>}
      <button type="button" onClick={app.close} style={ghostBtn(th, { flex: 1 })}>{t("cancel")}</button>
      <button type="button" disabled={!canSave} onClick={() => { onSave(); app.close(); }} style={primaryBtn(th, { flex: 2, opacity: canSave ? 1 : 0.4 })}>{t("save")}</button>
    </div>
  );
}

function Pills({ items, value, onChange, th, wrap = true }) {
  return (
    <div style={{ display: "flex", flexWrap: wrap ? "wrap" : "nowrap", gap: 6 }}>
      {items.map(([k, label, icon]) => (
        <button key={k} type="button" onClick={() => onChange(k)} aria-pressed={value === k} style={{ ...btnReset, minHeight: 36, padding: "0 12px", borderRadius: 10, background: value === k ? th.accent : th.inset, color: value === k ? th.on : th.sub, fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
          {icon && <Icon d={icon} size={14} />}{label}
        </button>
      ))}
    </div>
  );
}

function HabitForm({ app, h }) {
  const { th, t } = app;
  const [f, setF] = useState(() => h ? { ...h } : { id: uid(), name: "", sphere: "body", type: "done", target: 8, unit: "", freq: 7, iconKey: "star", checks: {}, counts: {} });
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const tk = today();
  const live = h ? app.habits.find((x) => x.id === h.id) || f : f;
  return (
    <>
      <Field label={t("habitName")} th={th}><input value={f.name} onChange={(e) => set("name", e.target.value)} autoFocus={!h} style={inputStyle(th)} /></Field>
      <Field label={t("sphere")} th={th}><Pills items={SPHERES.map((s) => [s, t("sph_" + s)])} value={f.sphere} onChange={(v) => set("sphere", v)} th={th} /></Field>
      <Field label={t("type")} th={th}><Pills items={[["done", t("typeDone")], ["count", t("typeCount")]]} value={f.type} onChange={(v) => set("type", v)} th={th} /></Field>
      {f.type === "count" && (
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ flex: 1 }}><Field label={t("target")} th={th}><input type="number" inputMode="numeric" min="1" value={f.target} onChange={(e) => set("target", Math.max(1, Number(e.target.value) || 1))} style={inputStyle(th)} /></Field></div>
          <div style={{ flex: 1 }}><Field label={t("unit")} th={th}><input value={f.unit} onChange={(e) => set("unit", e.target.value)} placeholder={t("unitPh")} style={inputStyle(th)} /></Field></div>
        </div>
      )}
      <Field label={t("freq")} th={th}><Pills items={[[7, t("daily")], ...[1, 2, 3, 4, 5, 6].map((n) => [n, t("perWeek", n)])]} value={f.freq} onChange={(v) => set("freq", v)} th={th} /></Field>
      <Field label={t("icon")} th={th}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(40px,1fr))", gap: 6 }}>
          {HABIT_ICONS.map((k) => <button key={k} type="button" onClick={() => set("iconKey", k)} aria-pressed={f.iconKey === k} aria-label={k} style={{ ...btnReset, height: 40, borderRadius: 10, background: f.iconKey === k ? th.accent : th.inset, color: f.iconKey === k ? th.on : th.accent, display: "flex", alignItems: "center", justifyContent: "center" }}><Icon d={IC[k]} size={18} /></button>)}
        </div>
      </Field>
      {h && f.type === "done" && (
        <Field label={t("last7")} th={th}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0,1fr))", gap: 4 }}>
            {rangeDays(addDays(tk, -6), tk).map((k) => {
              const on = isDoneOn(live, k);
              return <button key={k} type="button" onClick={() => app.toggleHabit(h.id, k)} aria-pressed={on} aria-label={dayLabel(k, app.lang)} style={{ ...btnReset, height: 48, borderRadius: 10, background: on ? th.accent : th.inset, color: on ? th.on : th.muted, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontSize: 10 }}><span>{WD_SHORT[app.lang][wdIndex(k)]}</span><span style={{ fontSize: 13, fontWeight: 700 }}>{parseKey(k).getDate()}</span></button>;
            })}
          </div>
        </Field>
      )}
      <FormButtons app={app} canSave={!!f.name.trim()} onSave={() => app.saveHabit({ ...live, ...f, checks: live.checks, counts: live.counts, name: f.name.trim(), target: f.type === "count" ? f.target : 1 })} onDelete={h ? () => app.deleteHabit(h.id) : null} />
    </>
  );
}

function TxnForm({ app, x }) {
  const { th, t, goal } = app;
  const isNew = !x || x._new;
  const [f, setF] = useState(() => isNew ? { id: uid(), type: (x && x.type) || "expense", amount: "", category: x && x.type === "deposit" ? "goal" : "other", note: "", date: today(), time: nowTime(), goalId: x && x.goalId } : { ...x, note: stripEmoji(x.note) });
  const [catTouched, setCatTouched] = useState(!isNew);
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const cats = f.type === "income" ? INC_CATS : f.type === "deposit" ? ["goal"] : EXP_CATS;
  const types = [["expense", t("expense")], ["income", t("income")], ...(goal || f.type === "deposit" ? [["deposit", t("deposit")]] : [])];
  const amount = Number(String(f.amount).replace(/\s/g, "").replace(",", "."));
  return (
    <>
      <Field label={t("type")} th={th}><Segmented items={types} value={f.type} onChange={(v) => setF((p) => ({ ...p, type: v, category: v === "deposit" ? "goal" : v === "income" ? guessCategory(p.note, "income") : guessCategory(p.note, "expense"), goalId: v === "deposit" ? (p.goalId || (goal && goal.id)) : p.goalId }))} th={th} /></Field>
      <Field label={t("amount")} th={th}><input type="text" inputMode="decimal" value={f.amount} onChange={(e) => set("amount", e.target.value.replace(/[^\d\s.,]/g, ""))} autoFocus={isNew} style={{ ...inputStyle(th), fontSize: 20, fontWeight: 800 }} /></Field>
      <Field label={t("note")} th={th}><input value={f.note} onChange={(e) => { const v = e.target.value; setF((p) => ({ ...p, note: v, category: catTouched || p.type === "deposit" ? p.category : guessCategory(v, p.type) })); }} placeholder={t("notePh")} style={inputStyle(th)} /></Field>
      {f.type !== "deposit" && <Field label={t("category")} th={th}><Pills items={cats.map((c) => [c, t("cat_" + c), IC[CAT_ICON[c]]])} value={f.category} onChange={(v) => { setCatTouched(true); set("category", v); }} th={th} /></Field>}
      <Field label={t("date")} th={th}><input type="date" value={f.date} onChange={(e) => e.target.value && set("date", e.target.value)} style={inputStyle(th)} /></Field>
      <FormButtons app={app} canSave={amount > 0} onSave={() => app.saveTxn({ ...f, amount, _new: undefined })} onDelete={!isNew ? () => app.deleteTxn(x.id) : null} />
    </>
  );
}

function TaskForm({ app, x }) {
  const { th, t, lang } = app;
  const isNew = !x || x._new;
  const [f, setF] = useState(() => isNew ? { id: uid(), title: "", quadrant: (x && x.quadrant) || "plan", deadline: "", done: false, createdAt: today() } : { ...x });
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const voice = useVoice(lang, (txt) => { const p = parseTaskText(txt); setF((s) => ({ ...s, title: p.title, quadrant: p.quadrant !== "plan" ? p.quadrant : s.quadrant, deadline: p.deadline || s.deadline })); }, (e) => app.setToast(t(e === "mic" ? "micErr" : "voiceErr")));
  const QC = Q_COLOR(th);
  const tk = today();
  return (
    <>
      <Field label={t("task")} th={th}>
        <div style={{ display: "flex", gap: 8 }}><input value={f.title} onChange={(e) => set("title", e.target.value)} autoFocus={isNew} style={inputStyle(th)} /><MicBtn voice={voice} th={th} t={t} size={46} /></div>
      </Field>
      <Field label={t("quadrant")} th={th}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 6 }}>
          {QUADS.map((q) => (
            <button key={q} type="button" onClick={() => set("quadrant", q)} aria-pressed={f.quadrant === q} style={{ ...btnReset, borderRadius: 12, padding: "10px 12px", textAlign: "left", background: f.quadrant === q ? th.inset : "transparent", border: "1.5px solid " + (f.quadrant === q ? QC[q] : th.line) }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: QC[q] }}>{t("qt_" + q)}</div><div style={{ fontSize: 10, color: th.muted }}>{t("qs_" + q)}</div>
            </button>
          ))}
        </div>
      </Field>
      <Field label={t("deadline")} th={th}>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
          <Pills items={[["", t("noDeadline")], [tk, t("todayW")], [addDays(tk, 1), t("tomorrowW")]]} value={f.deadline} onChange={(v) => set("deadline", v)} th={th} />
        </div>
        <input type="date" value={f.deadline} onChange={(e) => set("deadline", e.target.value)} style={inputStyle(th)} />
      </Field>
      <FormButtons app={app} canSave={!!f.title.trim()} onSave={() => app.saveTask({ ...f, title: f.title.trim(), _new: undefined })} onDelete={!isNew ? () => app.deleteTask(x.id) : null} />
    </>
  );
}

function GoalForm({ app, g }) {
  const { th, t } = app;
  const [title, setTitle] = useState(g ? g.title : "");
  const [target, setTarget] = useState(g ? String(g.target) : "");
  const n = Number(String(target).replace(/\s/g, ""));
  return (
    <>
      <Field label={t("goalTitle")} th={th}><input value={title} onChange={(e) => setTitle(e.target.value)} autoFocus style={inputStyle(th)} /></Field>
      <Field label={t("goalTarget")} th={th}><input inputMode="numeric" value={target} onChange={(e) => setTarget(e.target.value.replace(/[^\d\s]/g, ""))} style={{ ...inputStyle(th), fontSize: 18, fontWeight: 800 }} /></Field>
      <FormButtons app={app} canSave={!!title.trim() && n > 0} onSave={() => app.setGoal(normGoal({ ...(g || { id: uid(), createdAt: today() }), title: title.trim(), target: n }))} onDelete={g ? () => app.setGoal(null) : null} />
    </>
  );
}

function PresetView({ app, k }) {
  const { th, t, lang, habits } = app;
  const list = PRESETS[k] || [];
  const names = new Set(habits.map((h) => h.name.toLowerCase()));
  return (
    <>
      {list.map((p, i) => {
        const has = names.has(p.name[lang].toLowerCase());
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0", borderTop: i ? "1px solid " + th.line : "none" }}>
            <IconBox d={IC[p.iconKey]} th={th} size={34} />
            <div style={{ flex: 1 }}><div style={{ fontSize: 14 }}>{p.name[lang]}</div><div style={{ fontSize: 11, color: th.muted }}>{t("sph_" + p.sphere)}{has ? " · " + t("already") : ""}</div></div>
          </div>
        );
      })}
      <button type="button" onClick={() => { app.addHabits(list.map((p) => ({ name: p.name[lang], sphere: p.sphere, iconKey: p.iconKey }))); app.close(); app.setToast("+" + list.filter((p) => !names.has(p.name[lang].toLowerCase())).length); }} style={primaryBtn(th, { width: "100%", marginTop: 12 })}><Icon d={IC.plus} size={16} sw={2.5} />{t("addAll")}</button>
    </>
  );
}

function ExportForm({ app }) {
  const { th, t, lang } = app;
  const [kind, setKind] = useState("month");
  const [off, setOff] = useState(0);
  const [from, setFrom] = useState(addDays(today(), -30));
  const [to, setTo] = useState(today());
  const [busy, setBusy] = useState(false);
  const r = reportRange(kind, off, from, to);
  async function go() {
    setBusy(true);
    try { const { buildExcelReport } = await import("./nl-report.js"); await buildExcelReport({ habits: app.habits, tasks: app.tasks, txns: app.txns, goal: app.goal, userName: app.user.name, xp: app.xp, from: r.from, to: r.to }); app.close(); }
    catch (e) { app.setToast(t("exportErr") + ": " + e.message); }
    setBusy(false);
  }
  return (
    <>
      <Pills items={[["week", t("week")], ["month", t("month")], ["quarter", t("quarter")], ["year", t("year")], ["custom", t("period")]]} value={kind} onChange={(v) => { setKind(v); setOff(0); }} th={th} />
      {kind === "custom" ? (
        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <Field label={t("from")} th={th}><input type="date" value={from} onChange={(e) => e.target.value && setFrom(e.target.value)} style={inputStyle(th)} /></Field>
          <Field label={t("to")} th={th}><input type="date" value={to} onChange={(e) => e.target.value && setTo(e.target.value)} style={inputStyle(th)} /></Field>
        </div>
      ) : (
        <div style={{ display: "flex", alignItems: "center", background: th.inset, borderRadius: 12, marginTop: 12 }}>
          <button type="button" onClick={() => setOff((o) => o - 1)} aria-label="‹" style={{ ...btnReset, width: 44, height: 44, color: th.accent, display: "flex", alignItems: "center", justifyContent: "center" }}><Icon d={IC.chevL} /></button>
          <div style={{ flex: 1, textAlign: "center", fontSize: 14, fontWeight: 700 }}>{fmtDM(r.from)} – {fmtDM(r.to)}.{r.to.slice(0, 4)}</div>
          <button type="button" disabled={off >= 0} onClick={() => setOff((o) => o + 1)} aria-label="›" style={{ ...btnReset, width: 44, height: 44, color: th.accent, opacity: off >= 0 ? 0.3 : 1, display: "flex", alignItems: "center", justifyContent: "center" }}><Icon d={IC.chevR} /></button>
        </div>
      )}
      <div style={{ fontSize: 11, color: th.muted, margin: "10px 2px 4px", lineHeight: 1.5 }}>Сводка · Финансы · Привычки · Задачи — Times New Roman</div>
      <button type="button" disabled={busy} onClick={go} style={primaryBtn(th, { width: "100%", marginTop: 8, opacity: busy ? 0.6 : 1 })}><Icon d={IC.download} size={18} />{busy ? t("building") : t("download")}</button>
    </>
  );
}

function BadgesView({ app }) {
  const { th, t, badges } = app;
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 8 }}>
      {badges.map((b) => (
        <div key={b.id} style={{ background: th.inset, borderRadius: 14, padding: "12px 6px", textAlign: "center", opacity: b.earned ? 1 : 0.55, border: "1px solid " + (b.earned ? th.gold : "transparent") }}>
          <div style={{ width: 40, height: 40, margin: "0 auto", borderRadius: "50%", background: b.earned ? th.gold : th.card, color: b.earned ? (th.light ? "#fff" : "#0A0F0A") : th.muted, display: "flex", alignItems: "center", justifyContent: "center" }}><Icon d={IC[b.icon]} size={20} /></div>
          <div style={{ fontSize: 11, fontWeight: 700, marginTop: 6, lineHeight: 1.25 }}>{t("b_" + b.id)}</div>
          <div style={{ fontSize: 10, color: b.earned ? th.gold : th.muted, marginTop: 2 }}>{b.earned ? t("earned") : b.cur + " / " + b.max}</div>
        </div>
      ))}
    </div>
  );
}

function NameForm({ app }) {
  const { th, t, user } = app;
  const [name, setName] = useState(user.name);
  return (
    <>
      <Field label={t("name")} th={th}><input value={name} onChange={(e) => setName(e.target.value)} autoFocus style={inputStyle(th)} /></Field>
      <FormButtons app={app} canSave={!!name.trim()} onSave={() => app.setUser({ ...user, name: name.trim() })} />
    </>
  );
}

// ─── AZA ──────────────────────────────────────────────────────────────────────
function AzaChat({ app, onClose }) {
  const { th, t, lang, user, habits, tasks, txns, goal, saved, lvl } = app;
  const [msgs, setMsgs] = useState([{ role: "assistant", text: t("azaHello") }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);
  useEffect(() => { endRef.current && endRef.current.scrollIntoView({ behavior: "smooth" }); }, [msgs, loading]);
  async function send() {
    const msg = input.trim(); if (!msg || loading) return;
    setInput(""); setLoading(true);
    const history = [...msgs, { role: "user", text: msg }];
    setMsgs(history);
    const tk = today(), mk = monthKey(tk);
    const ctx = [
      "User: " + user.name + ", level " + lvl.cur.level + ".",
      "Habits today: " + habits.filter((h) => isDoneOn(h, tk)).length + "/" + habits.filter(dueToday).length + " (" + habits.map((h) => h.name + " [" + h.sphere + ", streak " + streakOf(h) + "]").slice(0, 12).join("; ") + ").",
      "Active tasks: " + tasks.filter((x) => !x.done).length + ", overdue: " + tasks.filter((x) => !x.done && x.deadline && x.deadline < tk).length + ".",
      "This month: income " + txns.filter((x) => x.type === "income" && x.date.startsWith(mk)).reduce((s, x) => s + x.amount, 0) + " KZT, expenses " + txns.filter((x) => x.type === "expense" && x.date.startsWith(mk)).reduce((s, x) => s + x.amount, 0) + " KZT.",
      goal ? "Savings goal: " + goal.title + ", " + saved + " of " + goal.target + " KZT." : "",
    ].join(" ");
    const sys = "You are Aza, a friendly AI coach inside the NextLVL productivity app (habits, tasks, personal finance in KZT, Kazakhstan). " + ctx + " Reply in " + ({ ru: "Russian", kk: "Kazakh", en: "English" }[lang]) + ", 2-4 short sentences, practical and motivating.";
    const convo = history.slice(-6).map((m) => (m.role === "user" ? "User: " : "Aza: ") + m.text).join("\n");
    try {
      const r = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ system: sys, message: convo }) });
      const d = await r.json().catch(() => ({}));
      setMsgs((p) => [...p, { role: "assistant", text: r.ok && d.text ? d.text : t("azaErr") }]);
    } catch (e) { setMsgs((p) => [...p, { role: "assistant", text: t("azaErr") }]); }
    setLoading(false);
  }
  return (
    <div style={{ position: "fixed", bottom: "calc(152px + env(safe-area-inset-bottom))", left: 12, right: 12, maxWidth: 476, margin: "0 auto", background: th.card, border: "1px solid " + th.border, borderRadius: 20, zIndex: 400, display: "flex", flexDirection: "column", height: "min(440px, 60vh)", overflow: "hidden", boxShadow: "0 12px 40px rgba(0,0,0,.45)" }}>
      <div style={{ padding: "10px 12px", borderBottom: "1px solid " + th.line, display: "flex", alignItems: "center", gap: 10 }}>
        <IconBox d={IC.sparkles} th={th} size={34} radius={17} />
        <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 700 }}>{t("aza")}</div><div style={{ fontSize: 10, color: th.accent }}>● {t("azaOnline")}</div></div>
        <button type="button" onClick={onClose} aria-label="Закрыть" style={{ ...btnReset, width: 40, height: 40, color: th.muted, display: "flex", alignItems: "center", justifyContent: "center" }}><Icon d={IC.x} /></button>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "12px", display: "flex", flexDirection: "column", gap: 8 }}>
        {msgs.map((m, i) => (
          <div key={i} style={{ alignSelf: m.role === "user" ? "flex-end" : "flex-start", maxWidth: "84%", padding: "9px 12px", borderRadius: m.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px", background: m.role === "user" ? th.accent : th.inset, color: m.role === "user" ? th.on : th.text, fontSize: 13, lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{m.text}</div>
        ))}
        {loading && <div style={{ alignSelf: "flex-start", padding: "10px 14px", borderRadius: 14, background: th.inset, display: "flex", gap: 4 }}>{[0, 1, 2].map((i) => <span key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: th.accent, opacity: 0.4 + i * 0.2 }} />)}</div>}
        <div ref={endRef} />
      </div>
      <div style={{ padding: 10, borderTop: "1px solid " + th.line, display: "flex", gap: 8 }}>
        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder={t("chatPh")} aria-label={t("chatPh")} style={{ ...inputStyle(th), height: 42, fontSize: 13 }} />
        <button type="button" onClick={send} disabled={!input.trim() || loading} aria-label="Send" style={primaryBtn(th, { width: 42, minHeight: 42, padding: 0, borderRadius: 12, opacity: input.trim() ? 1 : 0.4 })}><Icon d={IC.chevR} size={18} sw={2.5} /></button>
      </div>
    </div>
  );
}
