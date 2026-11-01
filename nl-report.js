// ─────────────────────────────────────────────────────────────────────────────
// NextLVL · Excel-отчёт (4 листа: Сводка, Финансы, Привычки, Задачи)
// Тёмный стиль, шрифт Times New Roman, диаграммы рисуются на canvas и
// вставляются картинками. Итоги в листе «Финансы» — живые формулы.
// ─────────────────────────────────────────────────────────────────────────────
import ExcelJS from "exceljs";
import {
  L, today, addDays, rangeDays, daysBetween, parseKey, fmtNum, fmtDM, fmtDMY, isDoneOn, countOn, streakOf, habitPct,
  CAT_COLOR, monthKey, shiftMonthKey, monthStart, monthEnd, MONTHS, goalSaved, levelInfo,
} from "./nl-data.js";

const C = {
  bg: "0A0F0A", bg2: "0D1A0D", bg3: "111D11", line: "1E3A22",
  green: "39FF14", red: "FF6B6B", gold: "FFB800", text: "F0FFF7", muted: "8FA398", empty: "1A2A1D",
};
const FONT = "Times New Roman";
const ru = L.ru;

const fill = (hex) => ({ type: "pattern", pattern: "solid", fgColor: { argb: "FF" + hex } });
const border = { top: { style: "thin", color: { argb: "FF" + C.line } }, left: { style: "thin", color: { argb: "FF" + C.line } }, bottom: { style: "thin", color: { argb: "FF" + C.line } }, right: { style: "thin", color: { argb: "FF" + C.line } } };
const cap = (v) => v.charAt(0).toUpperCase() + v.slice(1);
function font(cell, o = {}) { cell.font = { name: FONT, size: o.size || 11, bold: !!o.bold, italic: !!o.italic, color: { argb: "FF" + (o.color || C.text) } }; }
function paint(ws, r1, r2, c1, c2, hex) {
  for (let r = r1; r <= r2; r++) for (let c = c1; c <= c2; c++) ws.getCell(r, c).fill = fill(hex);
}
function boxed(ws, r1, r2, c1, c2) {
  for (let r = r1; r <= r2; r++) for (let c = c1; c <= c2; c++) ws.getCell(r, c).border = border;
}
function darkSheet(ws, cols, rows) {
  ws.properties.defaultRowHeight = 18;
  ws.views = [{ showGridLines: false }];
  ws.pageSetup = { orientation: "landscape", paperSize: 9, fitToPage: true, fitToWidth: 1, fitToHeight: 0, margins: { left: 0.4, right: 0.4, top: 0.5, bottom: 0.5, header: 0.2, footer: 0.2 } };
  paint(ws, 1, rows, 1, cols, C.bg);
}
function title(ws, text, sub, cols) {
  ws.mergeCells(1, 1, 1, cols);
  const a = ws.getCell(1, 1); a.value = text; font(a, { size: 16, bold: true, color: C.green });
  ws.getRow(1).height = 26;
  ws.mergeCells(2, 1, 2, cols);
  const b = ws.getCell(2, 1); b.value = sub; font(b, { size: 10, color: C.muted });
}
function header(ws, row, labels, color = C.green) {
  labels.forEach((l, i) => {
    const c = ws.getCell(row, i + 1); c.value = l; font(c, { bold: true, color });
    c.fill = fill(C.bg2); c.border = border; c.alignment = { vertical: "middle" };
  });
  ws.getRow(row).height = 20;
}

// ─── ДИАГРАММЫ (canvas → PNG) ────────────────────────────────────────────────
function canvas(w, h) {
  const cv = document.createElement("canvas"); cv.width = w * 2; cv.height = h * 2;
  const ctx = cv.getContext("2d"); ctx.scale(2, 2);
  ctx.fillStyle = "#" + C.bg3; ctx.fillRect(0, 0, w, h);
  return { cv, ctx };
}
function donut(data, w = 380, h = 230) {
  const { cv, ctx } = canvas(w, h);
  ctx.font = "bold 14px " + FONT; ctx.fillStyle = "#" + C.text; ctx.textAlign = "left";
  ctx.fillText("Расходы по категориям", 14, 22);
  const total = data.reduce((s, d) => s + d.value, 0);
  const cx = 95, cy = 128, R = 70, r = 42;
  if (!total) {
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.arc(cx, cy, r, 0, Math.PI * 2, true); ctx.fillStyle = "#" + C.empty; ctx.fill();
  } else {
    let a = -Math.PI / 2;
    data.forEach((d) => {
      const ang = (d.value / total) * Math.PI * 2;
      ctx.beginPath(); ctx.arc(cx, cy, R, a, a + ang); ctx.arc(cx, cy, r, a + ang, a, true); ctx.closePath();
      ctx.fillStyle = d.color; ctx.fill(); a += ang;
    });
  }
  ctx.textAlign = "center"; ctx.fillStyle = "#" + C.muted; ctx.font = "11px " + FONT; ctx.fillText("всего", cx, cy - 4);
  ctx.fillStyle = "#" + C.text; ctx.font = "bold 13px " + FONT; ctx.fillText(fmtNum(total) + " ₸", cx, cy + 13);
  ctx.textAlign = "left";
  data.slice(0, 7).forEach((d, i) => {
    const y = 58 + i * 22;
    ctx.fillStyle = d.color; ctx.fillRect(190, y - 9, 11, 11);
    ctx.fillStyle = "#" + C.text; ctx.font = "12px " + FONT;
    const pct = total ? Math.round((d.value / total) * 100) : 0;
    ctx.fillText(d.label + " " + pct + "%", 208, y);
  });
  if (!data.length) { ctx.fillStyle = "#" + C.muted; ctx.font = "12px " + FONT; ctx.fillText("Нет расходов за период", 190, 120); }
  return cv.toDataURL("image/png");
}
function bars(buckets, w = 440, h = 230) {
  const { cv, ctx } = canvas(w, h);
  ctx.font = "bold 14px " + FONT; ctx.fillStyle = "#" + C.text; ctx.textAlign = "left";
  ctx.fillText("Доход / расход", 14, 22);
  ctx.fillStyle = "#" + C.green; ctx.fillRect(w - 150, 13, 10, 10); ctx.fillStyle = "#" + C.muted; ctx.font = "11px " + FONT; ctx.fillText("доход", w - 136, 22);
  ctx.fillStyle = "#" + C.red; ctx.fillRect(w - 86, 13, 10, 10); ctx.fillStyle = "#" + C.muted; ctx.fillText("расход", w - 72, 22);
  const top = 40, bottom = h - 30, left = 14, right = w - 14;
  const max = Math.max(1, ...buckets.map((b) => Math.max(b.inc, b.exp)));
  const slot = (right - left) / Math.max(1, buckets.length);
  const bw = Math.min(18, slot * 0.32);
  ctx.strokeStyle = "#" + C.line; ctx.beginPath(); ctx.moveTo(left, bottom + 0.5); ctx.lineTo(right, bottom + 0.5); ctx.stroke();
  buckets.forEach((b, i) => {
    const x = left + i * slot + slot / 2;
    const hi = ((bottom - top) * b.inc) / max, he = ((bottom - top) * b.exp) / max;
    ctx.fillStyle = "#" + C.green; ctx.fillRect(x - bw - 1, bottom - hi, bw, hi);
    ctx.fillStyle = "#" + C.red; ctx.fillRect(x + 1, bottom - he, bw, he);
    if (buckets.length <= 16 || i % Math.ceil(buckets.length / 12) === 0) {
      ctx.fillStyle = "#" + C.muted; ctx.font = "10px " + FONT; ctx.textAlign = "center"; ctx.fillText(b.label, x, h - 12);
    }
  });
  return cv.toDataURL("image/png");
}
async function addPng(wb, dataURL) {
  const res = await fetch(dataURL); const buf = await res.arrayBuffer();
  return wb.addImage({ buffer: buf, extension: "png" });
}

function buckets(txns, from, to) {
  const days = daysBetween(from, to) + 1;
  const out = [];
  if (days <= 14) {
    rangeDays(from, to).forEach((k) => out.push({ from: k, to: k, label: fmtDM(k) }));
  } else if (days <= 62) {
    let s = from, i = 1;
    while (s <= to) { const e = addDays(s, 6) < to ? addDays(s, 6) : to; out.push({ from: s, to: e, label: "Нед " + i }); s = addDays(e, 1); i++; }
  } else {
    let mk = monthKey(from);
    while (monthStart(mk) <= to) { out.push({ from: monthStart(mk) < from ? from : monthStart(mk), to: monthEnd(mk) > to ? to : monthEnd(mk), label: MONTHS.ru[Number(mk.slice(5)) - 1].slice(0, 3) }); mk = shiftMonthKey(mk, 1); }
  }
  return out.map((b) => {
    const list = txns.filter((x) => x.date >= b.from && x.date <= b.to);
    return { ...b, inc: list.filter((x) => x.type === "income").reduce((s, x) => s + x.amount, 0), exp: list.filter((x) => x.type === "expense").reduce((s, x) => s + x.amount, 0) };
  });
}

// ─── ОСНОВНАЯ ФУНКЦИЯ ────────────────────────────────────────────────────────
export async function buildExcelReport({ habits, tasks, txns, goal, userName, xp, from, to }) {
  const t = today();
  const periodTxt = fmtDMY(from) + " – " + fmtDMY(to);
  const { cur } = levelInfo(xp || 0);
  const lvlName = ru.lv[cur.level - 1];
  const inRange = (k) => k && k >= from && k <= to;

  const ftx = txns.filter((x) => inRange(x.date)).sort((a, b) => (a.date + (a.time || "")).localeCompare(b.date + (b.time || "")));
  const inc = ftx.filter((x) => x.type === "income").reduce((s, x) => s + x.amount, 0);
  const exp = ftx.filter((x) => x.type === "expense").reduce((s, x) => s + x.amount, 0);
  const dep = ftx.filter((x) => x.type === "deposit").reduce((s, x) => s + x.amount, 0);

  const isOver = (tk) => !tk.done && tk.deadline && tk.deadline < t;
  const ftasks = tasks.filter((tk) => inRange(tk.deadline) || inRange(tk.doneAt) || (!tk.done && (!tk.deadline || tk.deadline < from)));
  const tDone = ftasks.filter((tk) => tk.done).length;
  const tOver = ftasks.filter(isOver).length;
  const tActive = ftasks.length - tDone - tOver;

  const habitsIn = habits.filter((hb) => !hb.createdAt || hb.createdAt <= to);
  const hp = habitsIn.map((h) => ({ h, pct: habitPct(h, from, to) }));
  const hpVals = hp.map((x) => x.pct).filter((v) => v != null);
  const habAvg = hpVals.length ? Math.round(hpVals.reduce((a, b) => a + b, 0) / hpVals.length) : 0;

  const wb = new ExcelJS.Workbook();
  wb.creator = "NextLVL"; wb.created = new Date();

  // ── 1. СВОДКА ──
  const s = wb.addWorksheet("Сводка", { properties: { tabColor: { argb: "FF" + C.green } } });
  s.columns = [{ width: 18 }, { width: 18 }, { width: 18 }, { width: 18 }, { width: 4 }, { width: 18 }, { width: 18 }, { width: 18 }];
  darkSheet(s, 10, 48);
  title(s, "NextLVL — аналитика", (userName || "Пользователь") + " · Ур. " + cur.level + " «" + lvlName + "» · период: " + periodTxt, 8);

  const kpis = [
    ["Доход", fmtNum(inc) + " ₸", C.green], ["Расход", fmtNum(exp) + " ₸", C.red],
    ["Привычки", habAvg + "%", C.gold], ["Задачи", tDone + " / " + ftasks.length, C.text],
  ];
  kpis.forEach(([l, v, col], i) => {
    const c1 = s.getCell(4, i + 1); c1.value = l; font(c1, { size: 10, color: C.muted }); c1.fill = fill(C.bg3);
    const c2 = s.getCell(5, i + 1); c2.value = v; font(c2, { size: 15, bold: true, color: col }); c2.fill = fill(C.bg3);
  });
  boxed(s, 4, 5, 1, 4); s.getRow(5).height = 24;
  const k2 = [["Баланс", (inc - exp >= 0 ? "+" : "−") + fmtNum(inc - exp) + " ₸", inc - exp >= 0 ? C.green : C.red], ["В цель", fmtNum(dep) + " ₸", C.gold], ["Записей", String(ftx.length), C.text]];
  k2.forEach(([l, v, col], i) => {
    const c1 = s.getCell(4, i + 6); c1.value = l; font(c1, { size: 10, color: C.muted }); c1.fill = fill(C.bg3);
    const c2 = s.getCell(5, i + 6); c2.value = v; font(c2, { size: 15, bold: true, color: col }); c2.fill = fill(C.bg3);
  });
  boxed(s, 4, 5, 6, 8);

  // категории
  const catSum = {};
  ftx.filter((x) => x.type === "expense").forEach((x) => { catSum[x.category] = (catSum[x.category] || 0) + x.amount; });
  const cats = Object.entries(catSum).sort((a, b) => b[1] - a[1]).map(([k, v]) => ({ key: k, label: ru["cat_" + k] || k, value: v, color: CAT_COLOR[k] || "#" + C.muted }));
  try {
    const id1 = await addPng(wb, donut(cats));
    s.addImage(id1, { tl: { col: 0, row: 6.4 }, ext: { width: 380, height: 230 } });
    const id2 = await addPng(wb, bars(buckets(txns, from, to)));
    s.addImage(id2, { tl: { col: 4.2, row: 6.4 }, ext: { width: 440, height: 230 } });
  } catch (e) { /* диаграммы — по возможности */ }

  let r = 20;
  // таблица категорий
  s.getCell(r, 1).value = "Категория"; s.getCell(r, 2).value = "Сумма, ₸"; s.getCell(r, 3).value = "Доля";
  [1, 2, 3].forEach((c) => { const cell = s.getCell(r, c); font(cell, { bold: true, color: C.green }); cell.fill = fill(C.bg2); cell.border = border; });
  r++;
  const catStart = r;
  cats.forEach((c) => {
    s.getCell(r, 1).value = c.label; font(s.getCell(r, 1));
    s.getCell(r, 2).value = c.value; s.getCell(r, 2).numFmt = "#,##0"; font(s.getCell(r, 2), { color: C.red });
    s.getCell(r, 3).value = exp ? c.value / exp : 0; s.getCell(r, 3).numFmt = "0%"; font(s.getCell(r, 3), { color: C.muted });
    [1, 2, 3].forEach((cc) => { s.getCell(r, cc).fill = fill(C.bg3); s.getCell(r, cc).border = border; });
    r++;
  });
  if (!cats.length) { s.getCell(r, 1).value = "Нет расходов за период"; font(s.getCell(r, 1), { color: C.muted }); r++; }

  // цель
  r = Math.max(r, catStart + 2) + 1;
  if (goal) {
    const saved = goalSaved(goal, txns);
    const pct = Math.min(1, saved / goal.target);
    s.getCell(r, 1).value = "Цель: " + goal.title; font(s.getCell(r, 1), { bold: true, color: C.gold });
    s.mergeCells(r, 2, r, 5);
    const bar = s.getCell(r, 2);
    const filled = Math.round(pct * 30);
    bar.value = "█".repeat(filled) + "░".repeat(30 - filled); font(bar, { color: C.gold });
    s.getCell(r, 6).value = Math.round(pct * 100) + "% · " + fmtNum(saved) + " / " + fmtNum(goal.target) + " ₸"; font(s.getCell(r, 6), { color: C.gold });
    paint(s, r, r, 1, 8, C.bg3); r++;
  }
  // задачи и привычки — краткие итоги
  r++;
  const lines = [
    ["Задачи", "выполнено " + tDone + " · активно " + tActive + " · просрочено " + tOver, tOver ? C.red : C.text],
    ["Привычки", habitsIn.length + " привычек · средний процент выполнения " + habAvg + "%", C.gold],
  ];
  lines.forEach(([a, b, col]) => {
    s.getCell(r, 1).value = a; font(s.getCell(r, 1), { bold: true, color: C.green });
    s.mergeCells(r, 2, r, 8); s.getCell(r, 2).value = b; font(s.getCell(r, 2), { color: col });
    paint(s, r, r, 1, 8, C.bg3); r++;
  });
  s.getCell(r + 1, 1).value = "Сформировано в NextLVL · next-lvl.kz · " + fmtDMY(t); font(s.getCell(r + 1, 1), { size: 9, italic: true, color: C.muted });

  // ── 2. ФИНАНСЫ ──
  const f = wb.addWorksheet("Финансы", { properties: { tabColor: { argb: "FF" + C.gold } } });
  f.columns = [{ width: 12 }, { width: 12 }, { width: 20 }, { width: 15 }, { width: 36 }];
  const fRows = ftx.length + 12;
  darkSheet(f, 5, fRows);
  title(f, "Финансы", periodTxt, 5);
  header(f, 3, ["Дата", "Тип", "Категория", "Сумма, ₸", "Описание"]);
  const typeName = { income: "Доход", expense: "Расход", deposit: "В цель" };
  ftx.forEach((x, i) => {
    const row = 4 + i;
    const col = x.type === "income" ? C.green : x.type === "deposit" ? C.gold : C.red;
    const vals = [fmtDMY(x.date), typeName[x.type], ru["cat_" + x.category] || x.category, x.type === "income" ? x.amount : -x.amount, cap(String(x.note || "").replace(/^\p{Extended_Pictographic}\uFE0F?\s*/u, ""))];
    vals.forEach((v, ci) => {
      const c = f.getCell(row, ci + 1); c.value = v; c.fill = fill(i % 2 ? C.bg3 : C.bg2); c.border = border;
      font(c, { color: ci === 1 || ci === 3 ? col : ci === 4 ? C.muted : C.text, bold: ci === 3 });
    });
    f.getCell(row, 4).numFmt = '"+"#,##0;"−"#,##0;0';
  });
  const last = Math.max(4, 3 + ftx.length);
  let fr = 4 + ftx.length + 1;
  const rng = (col) => col + "4:" + col + last;
  const totals = [
    ["Итого доход", { formula: "SUMIF(" + rng("B") + ",\"Доход\"," + rng("D") + ")", result: inc }, C.green],
    ["Итого расход", { formula: "-SUMIF(" + rng("B") + ",\"Расход\"," + rng("D") + ")", result: exp }, C.red],
    ["В цель", { formula: "-SUMIF(" + rng("B") + ",\"В цель\"," + rng("D") + ")", result: dep }, C.gold],
    ["Баланс (доход − расход)", { formula: "D" + fr + "-D" + (fr + 1), result: inc - exp }, inc - exp >= 0 ? C.green : C.red],
  ];
  totals.forEach(([l, v, col], i) => {
    const row = fr + i;
    f.mergeCells(row, 1, row, 3);
    const a = f.getCell(row, 1); a.value = l; font(a, { bold: true });
    const b = f.getCell(row, 4); b.value = v; b.numFmt = "#,##0"; font(b, { bold: true, color: col });
    for (let c = 1; c <= 5; c++) { f.getCell(row, c).fill = fill(C.bg2); f.getCell(row, c).border = border; }
  });
  f.views = [{ state: "frozen", ySplit: 3, showGridLines: false }];
  if (ftx.length) f.autoFilter = { from: "A3", to: "E" + last };

  // ── 3. ПРИВЫЧКИ ──
  const h = wb.addWorksheet("Привычки", { properties: { tabColor: { argb: "FF7CFF9E" } } });
  const days = rangeDays(from, to);
  const perDay = days.length <= 31;
  const base = [{ width: 26 }, { width: 13 }, { width: 11 }, { width: 9 }];
  const dayCols = perDay ? days.map(() => ({ width: 3.6 })) : [{ width: 14 }, { width: 14 }];
  h.columns = [...base, ...dayCols, { width: 8 }];
  const hCols = base.length + dayCols.length + 1;
  darkSheet(h, hCols, habitsIn.length + 10);
  title(h, "Привычки", periodTxt + (perDay ? " · ■ выполнено, □ пропущено" : ""), Math.min(hCols, 12));
  const hHead = ["Привычка", "Тип", "Сфера", "Серия"];
  if (perDay) days.forEach((k) => hHead.push(String(parseKey(k).getDate())));
  else hHead.push("Выполнено дней", "Дней в периоде");
  hHead.push("%");
  header(h, 3, hHead);
  if (perDay) {
    const wd = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];
    days.forEach((k, i) => {
      const c = h.getCell(4, base.length + 1 + i); c.value = wd[parseKey(k).getDay()]; font(c, { size: 8, color: C.muted }); c.fill = fill(C.bg2); c.alignment = { horizontal: "center" };
      h.getCell(3, base.length + 1 + i).alignment = { horizontal: "center" };
    });
    for (let c = 1; c <= base.length; c++) h.getCell(4, c).fill = fill(C.bg2);
    h.getCell(4, hCols).fill = fill(C.bg2);
  }
  const hStart = perDay ? 5 : 4;
  hp.forEach(({ h: hb, pct }, i) => {
    const row = hStart + i;
    const st = streakOf(hb);
    const cells = [hb.name, hb.type === "count" ? "Количество" + (hb.target ? " (" + hb.target + (hb.unit ? " " + hb.unit : "") + ")" : "") : "Выполнено", ru["sph_" + hb.sphere], st + (hb.freq >= 7 ? " дн" : " нед")];
    cells.forEach((v, ci) => { const c = h.getCell(row, ci + 1); c.value = v; font(c, { color: ci === 3 ? C.gold : ci === 0 ? C.text : C.muted }); });
    if (perDay) {
      days.forEach((k, di) => {
        const c = h.getCell(row, base.length + 1 + di);
        c.alignment = { horizontal: "center" }; c.border = border;
        if (k > t || (hb.createdAt && k < hb.createdAt)) { c.fill = fill(C.bg); return; }
        const done = isDoneOn(hb, k);
        if (hb.type === "count") { const n = countOn(hb, k); c.value = n || ""; font(c, { size: 8, bold: true, color: done ? C.bg : C.muted }); }
        c.fill = fill(done ? C.green : C.empty);
      });
    } else {
      const s0 = hb.createdAt && hb.createdAt > from ? hb.createdAt : from;
      const e0 = to < t ? to : t;
      const span = s0 <= e0 ? rangeDays(s0, e0) : [];
      const c1 = h.getCell(row, base.length + 1); c1.value = span.filter((k) => isDoneOn(hb, k)).length; font(c1, { color: C.green });
      const c2 = h.getCell(row, base.length + 2); c2.value = span.length; font(c2, { color: C.muted });
    }
    const pc = h.getCell(row, hCols);
    pc.value = pct == null ? "—" : pct / 100; pc.numFmt = "0%";
    font(pc, { bold: true, color: pct == null ? C.muted : pct >= 70 ? C.green : pct >= 40 ? C.gold : C.red });
    const zebra = fill(i % 2 ? C.bg3 : C.bg2);
    for (let c = 1; c <= base.length; c++) { h.getCell(row, c).fill = zebra; h.getCell(row, c).border = border; }
    if (!perDay) for (let c = base.length + 1; c < hCols; c++) { h.getCell(row, c).fill = zebra; h.getCell(row, c).border = border; }
    h.getCell(row, hCols).fill = zebra;
    h.getCell(row, hCols).border = border;
  });
  const hEnd = hStart + habitsIn.length;
  h.mergeCells(hEnd, 1, hEnd, hCols - 1);
  const avgL = h.getCell(hEnd, 1); avgL.value = habitsIn.length ? "Средний процент выполнения" : "Нет привычек"; font(avgL, { bold: true });
  const avgV = h.getCell(hEnd, hCols); avgV.value = habAvg / 100; avgV.numFmt = "0%"; font(avgV, { bold: true, color: C.gold });
  paint(h, hEnd, hEnd, 1, hCols, C.bg2);
  h.views = [{ state: "frozen", xSplit: 1, ySplit: hStart - 1, showGridLines: false }];

  // ── 4. ЗАДАЧИ ──
  const z = wb.addWorksheet("Задачи", { properties: { tabColor: { argb: "FF" + C.red } } });
  z.columns = [{ width: 40 }, { width: 22 }, { width: 12 }, { width: 14 }, { width: 13 }];
  darkSheet(z, 5, ftasks.length + 10);
  title(z, "Задачи", periodTxt, 5);
  header(z, 3, ["Задача", "Квадрант", "Срок", "Статус", "Выполнена"]);
  const qName = { now: "Срочно и важно", plan: "Важно, не срочно", deleg: "Срочно, не важно", later: "Не срочно, не важно" };
  const qCol = { now: C.red, plan: C.green, deleg: C.gold, later: C.muted };
  const order = { now: 0, plan: 1, deleg: 2, later: 3 };
  const sorted = ftasks.slice().sort((a, b) => (a.done - b.done) || (order[a.quadrant] - order[b.quadrant]) || String(a.deadline || "9").localeCompare(String(b.deadline || "9")));
  sorted.forEach((tk, i) => {
    const row = 4 + i;
    const status = tk.done ? "Выполнено" : isOver(tk) ? "Просрочено" : "Активно";
    const vals = [tk.title, qName[tk.quadrant], tk.deadline ? fmtDMY(tk.deadline) : "—", status, tk.doneAt ? fmtDMY(tk.doneAt) : (tk.done ? "✓" : "")];
    vals.forEach((v, ci) => {
      const c = z.getCell(row, ci + 1); c.value = v; c.fill = fill(i % 2 ? C.bg3 : C.bg2); c.border = border;
      font(c, { color: ci === 1 ? qCol[tk.quadrant] : ci === 3 ? (tk.done ? C.green : isOver(tk) ? C.red : C.text) : ci === 0 ? C.text : C.muted });
    });
  });
  const zEnd = 4 + sorted.length;
  z.mergeCells(zEnd, 1, zEnd, 5);
  const zs = z.getCell(zEnd, 1);
  zs.value = sorted.length ? "Выполнено " + tDone + " · Активно " + tActive + " · Просрочено " + tOver + " · Итого " + ftasks.length : "Нет задач за период";
  font(zs, { bold: true }); paint(z, zEnd, zEnd, 1, 5, C.bg2);
  z.views = [{ state: "frozen", ySplit: 3, showGridLines: false }];
  if (sorted.length) z.autoFilter = { from: "A3", to: "E" + (zEnd - 1) };

  const buf = await wb.xlsx.writeBuffer();
  const blob = new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const name = "NextLVL_Report_" + fmtDM(from) + "-" + fmtDMY(to) + ".xlsx";
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
  return name;
}
