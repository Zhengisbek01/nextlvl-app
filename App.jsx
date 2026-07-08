// NEXTLVL v1.0
import React, { useState, useEffect, useRef } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import ExcelJS from "exceljs";

// ─── SHIELD LOGO ─────────────────────────────────────────────────────────────
const SHIELD_URL = "data:image/png;base64,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";

// ─── LOCALSTORAGE ─────────────────────────────────────────────────────────────
const ls = {
  get: (k) => { try { const v=localStorage.getItem(k); return v?JSON.parse(v):null; } catch(e){return null;} },
  set: (k,v) => { try { localStorage.setItem(k,JSON.stringify(v)); } catch(e){} },
};

// ─── TRANSLATIONS ─────────────────────────────────────────────────────────────
const T = {
  ru: {
    appSlogan:"Level up your life",
    selectLang:"Выбери язык",
    hello:"Привет! Я Аза — твой AI-советник NextLVL.",
    askName:"Как тебя зовут?",
    namePlaceholder:"Введи своё имя...",
    start:"Начать →",
    home:"Главная", habits:"Привычки", finance:"Финансы", tasks:"Задачи", profile:"Профиль",
    levelUp:"LEVEL UP",
    heroTitle:"Твоя прокачка начинается сегодня",
    heroDesc:"Выполняй миссии, отмечай привычки и получай XP.",
    xpProgress:"XP прогресс",
    todayMissions:"Сегодняшние миссии",
    allMissions:"Все →",
    habitsToday:"привычки сегодня",
    expenses:"расходы месяца",
    totalXP:"общий XP",
    greeting:(name)=>`Привет, ${name}! 👋`,
    motivationLoading:"Аза думает...",
    addHabit:"+ Добавить привычку",
    habitName:"Название привычки",
    category:"Категория",
    save:"Сохранить",
    cancel:"Отмена",
    streak:"дн. серия",
    addTask:"+ Добавить задачу",
    taskTitle:"Название задачи",
    priority:"Приоритет",
    deadline:"Дедлайн",
    high:"Высокий", medium:"Средний", low:"Низкий",
    done:"Выполнено",
    active:"Активных",
    overdue:"Просрочено",
    addTxn:"+ Добавить",
    income:"Доход", expense:"Расход", deposit:"Депозит",
    amount:"Сумма ₸",
    balance:"Баланс",
    monthly:"За месяц",
    theme:"Тема",
    language:"Язык",
    exportPDF:"📄 Экспорт PDF",
    level:"LEVEL",
    badges:"Бейджи",
    yourLevel:"Твой уровень",
    chatPlaceholder:"Спроси Азу...",
    azaOnline:"● онлайн",
    azaTitle:"Aza AI",
    azaSubtitle:"знает все твои данные",
    themes:{darkGamer:"Dark Gamer",darkPurple:"Dark Purple",goldPremium:"Gold Premium",iosBlue:"iOS Blue"},
    langs:{ru:"Русский",kk:"Қазақша",en:"English"},
    allTasks:"Все задачи",
    completed:"Выполнено",
    noHabits:"Нет привычек. Добавь первую!",
    noTasks:"Нет задач. Добавь первую!",
    noTxns:"Нет транзакций.",
    categories:["Здоровье","Спорт","Учёба","Работа","Привычки","Финансы","Другое"],
    hi:(n)=>`Привет, ${n}!`,
  },
  kk: {
    appSlogan:"Өміріңді жоғары деңгейге шығар",
    selectLang:"Тілді таңда",
    hello:"Сәлем! Мен Аза — NextLVL AI-кеңесшің.",
    askName:"Атың кім?",
    namePlaceholder:"Атыңды жаз...",
    start:"Бастау →",
    home:"Басты", habits:"Әдеттер", finance:"Қаржы", tasks:"Тапсырмалар", profile:"Профиль",
    levelUp:"ДЕҢГЕЙ АР",
    heroTitle:"Прокачкаң бүгін басталады",
    heroDesc:"Миссияларды орында, әдеттерді белгіле және XP жина.",
    xpProgress:"XP прогресс",
    todayMissions:"Бүгінгі миссиялар",
    allMissions:"Барлығы →",
    habitsToday:"бүгін әдеттер",
    expenses:"ай шығыны",
    totalXP:"жалпы XP",
    greeting:(name)=>`Сәлем, ${name}! 👋`,
    motivationLoading:"Аза ойлап жатыр...",
    addHabit:"+ Әдет қосу",
    habitName:"Әдет атауы",
    category:"Санат",
    save:"Сақтау",
    cancel:"Болдырмау",
    streak:"күн қатар",
    addTask:"+ Тапсырма қосу",
    taskTitle:"Тапсырма атауы",
    priority:"Басымдық",
    deadline:"Мерзім",
    high:"Жоғары", medium:"Орташа", low:"Төмен",
    done:"Орындалды",
    active:"Белсенді",
    overdue:"Мерзімі өтті",
    addTxn:"+ Қосу",
    income:"Кіріс", expense:"Шығыс", deposit:"Депозит",
    amount:"Сома ₸",
    balance:"Баланс",
    monthly:"Ай бойынша",
    theme:"Тақырып",
    language:"Тіл",
    exportPDF:"📄 PDF экспорт",
    level:"ДЕҢГЕЙ",
    badges:"Белгілер",
    yourLevel:"Сенің деңгейің",
    chatPlaceholder:"Азадан сұра...",
    azaOnline:"● онлайн",
    azaTitle:"Aza AI",
    azaSubtitle:"барлық деректеріңді біледі",
    themes:{darkGamer:"Dark Gamer",darkPurple:"Dark Purple",goldPremium:"Gold Premium",iosBlue:"iOS Blue"},
    langs:{ru:"Русский",kk:"Қазақша",en:"English"},
    allTasks:"Барлық тапсырмалар",
    completed:"Орындалды",
    noHabits:"Әдет жоқ. Бірінші қос!",
    noTasks:"Тапсырма жоқ. Бірінші қос!",
    noTxns:"Транзакция жоқ.",
    categories:["Денсаулық","Спорт","Оқу","Жұмыс","Әдеттер","Қаржы","Басқа"],
    hi:(n)=>`Сәлем, ${n}!`,
  },
  en: {
    appSlogan:"Level up your life",
    selectLang:"Choose language",
    hello:"Hi! I'm Aza — your NextLVL AI advisor.",
    askName:"What's your name?",
    namePlaceholder:"Enter your name...",
    start:"Start →",
    home:"Home", habits:"Habits", finance:"Finance", tasks:"Tasks", profile:"Profile",
    levelUp:"LEVEL UP",
    heroTitle:"Your upgrade starts today",
    heroDesc:"Complete missions, track habits and earn XP.",
    xpProgress:"XP progress",
    todayMissions:"Today's missions",
    allMissions:"All →",
    habitsToday:"habits today",
    expenses:"month expenses",
    totalXP:"total XP",
    greeting:(name)=>`Hey, ${name}! 👋`,
    motivationLoading:"Aza is thinking...",
    addHabit:"+ Add habit",
    habitName:"Habit name",
    category:"Category",
    save:"Save",
    cancel:"Cancel",
    streak:"day streak",
    addTask:"+ Add task",
    taskTitle:"Task title",
    priority:"Priority",
    deadline:"Deadline",
    high:"High", medium:"Medium", low:"Low",
    done:"Done",
    active:"Active",
    overdue:"Overdue",
    addTxn:"+ Add",
    income:"Income", expense:"Expense", deposit:"Deposit",
    amount:"Amount ₸",
    balance:"Balance",
    monthly:"Monthly",
    theme:"Theme",
    language:"Language",
    exportPDF:"📄 Export PDF",
    level:"LEVEL",
    badges:"Badges",
    yourLevel:"Your level",
    chatPlaceholder:"Ask Aza...",
    azaOnline:"● online",
    azaTitle:"Aza AI",
    azaSubtitle:"knows all your data",
    themes:{darkGamer:"Dark Gamer",darkPurple:"Dark Purple",goldPremium:"Gold Premium",iosBlue:"iOS Blue"},
    langs:{ru:"Русский",kk:"Қазақша",en:"English"},
    allTasks:"All tasks",
    completed:"Completed",
    noHabits:"No habits yet. Add your first!",
    noTasks:"No tasks yet. Add your first!",
    noTxns:"No transactions yet.",
    categories:["Health","Sport","Study","Work","Habits","Finance","Other"],
    hi:(n)=>`Hey, ${n}!`,
  }
};

// ─── THEMES ──────────────────────────────────────────────────────────────────
const THEMES = {
  darkGamer: {
    bg:"#0A0F0A", bg2:"#0D1A0D", bg3:"#111D11",
    accent:"#39FF14", accent2:"#AAFF44", gold:"#FFB800",
    text:"#FFFFFF", text2:"rgba(255,255,255,0.5)", text3:"rgba(255,255,255,0.25)",
    card:"rgba(57,255,20,0.06)", cardBorder:"rgba(57,255,20,0.12)",
    heroGrad:"linear-gradient(135deg,#0D1F0D,#0A1A0A)",
    heroBorder:"rgba(57,255,20,0.2)",
    nav:"#0D1A0D", navBorder:"rgba(57,255,20,0.1)",
    ring:"#39FF14", ringBg:"rgba(57,255,20,0.1)",
    xpFill:"linear-gradient(90deg,#39FF14,#AAFF44)",
    badgeBg:"rgba(255,184,0,0.08)", badgeBorder:"rgba(255,184,0,0.5)", badgeText:"#FFB800",
    logoGlow:"rgba(57,255,20,0.4)", logoBg:"#0A0F0A",
  },
  darkPurple: {
    bg:"#0D0D1A", bg2:"#13103D", bg3:"#1A1040",
    accent:"#A78BFF", accent2:"#C4B0FF", gold:"#FFB800",
    text:"#FFFFFF", text2:"rgba(255,255,255,0.5)", text3:"rgba(255,255,255,0.25)",
    card:"rgba(167,139,255,0.06)", cardBorder:"rgba(167,139,255,0.15)",
    heroGrad:"linear-gradient(135deg,#13103D,#1A1040)",
    heroBorder:"rgba(167,139,255,0.2)",
    nav:"#0D0D1A", navBorder:"rgba(167,139,255,0.1)",
    ring:"#A78BFF", ringBg:"rgba(167,139,255,0.1)",
    xpFill:"linear-gradient(90deg,#A78BFF,#FFB800)",
    badgeBg:"rgba(167,139,255,0.1)", badgeBorder:"rgba(167,139,255,0.4)", badgeText:"#A78BFF",
    logoGlow:"rgba(167,139,255,0.4)", logoBg:"#0D0D1A",
  },
  goldPremium: {
    bg:"#0A0800", bg2:"#150F00", bg3:"#1C1400",
    accent:"#FFB800", accent2:"#FF8C00", gold:"#FFB800",
    text:"#FFFFFF", text2:"rgba(255,255,255,0.5)", text3:"rgba(255,255,255,0.25)",
    card:"rgba(255,184,0,0.06)", cardBorder:"rgba(255,184,0,0.15)",
    heroGrad:"linear-gradient(135deg,#150F00,#1C1400)",
    heroBorder:"rgba(255,184,0,0.2)",
    nav:"#0A0800", navBorder:"rgba(255,184,0,0.12)",
    ring:"#FFB800", ringBg:"rgba(255,184,0,0.1)",
    xpFill:"linear-gradient(90deg,#FFB800,#FF6B00)",
    badgeBg:"rgba(255,184,0,0.1)", badgeBorder:"rgba(255,184,0,0.5)", badgeText:"#FFB800",
    logoGlow:"rgba(255,184,0,0.4)", logoBg:"#0A0800",
  },
  iosBlue: {
    bg:"#F2F2F7", bg2:"#FFFFFF", bg3:"#F2F2F7",
    accent:"#007AFF", accent2:"#0055CC", gold:"#FF9500",
    text:"#000000", text2:"rgba(0,0,0,0.45)", text3:"rgba(0,0,0,0.2)",
    card:"rgba(0,0,0,0.04)", cardBorder:"rgba(0,0,0,0.08)",
    heroGrad:"linear-gradient(135deg,#007AFF,#0055CC)",
    heroBorder:"transparent",
    nav:"#FFFFFF", navBorder:"rgba(0,0,0,0.1)",
    ring:"#FFFFFF", ringBg:"rgba(255,255,255,0.2)",
    xpFill:"rgba(255,255,255,0.9)",
    badgeBg:"rgba(0,122,255,0.08)", badgeBorder:"#007AFF", badgeText:"#007AFF",
    logoGlow:"rgba(0,122,255,0.25)", logoBg:"#F2F2F7",
  }
};

// ─── LEVELS ───────────────────────────────────────────────────────────────────
const LEVELS = [
  {level:1,name:"Новичок",xpNeeded:0,icon:"🌱"},
  {level:2,name:"Стартер",xpNeeded:500,icon:"🌿"},
  {level:3,name:"Практик",xpNeeded:1000,icon:"⚡"},
  {level:4,name:"Боец",xpNeeded:2000,icon:"🔥"},
  {level:5,name:"Мастер",xpNeeded:3500,icon:"💪"},
  {level:6,name:"Чемпион",xpNeeded:5500,icon:"🏆"},
  {level:7,name:"Легенда",xpNeeded:8000,icon:"👑"},
  {level:8,name:"Элита",xpNeeded:12000,icon:"💎"},
  {level:9,name:"Непобедимый",xpNeeded:17000,icon:"🌟"},
  {level:10,name:"NextLVL Pro",xpNeeded:25000,icon:"✦"},
];

const BADGES = [
  {id:"first_habit",icon:"🌱",name:"Первая привычка",check:(h,t,x)=>h.length>0},
  {id:"week_streak",icon:"🔥",name:"7 дней подряд",check:(h)=>h.some(hab=>getStreak(hab)>=7)},
  {id:"xp100",icon:"⚡",name:"100 XP",check:(h,t,x)=>x>=100},
  {id:"xp1000",icon:"💎",name:"1000 XP",check:(h,t,x)=>x>=1000},
  {id:"tasks10",icon:"✅",name:"10 задач",check:(h,t)=>t.filter(tk=>tk.done).length>=10},
  {id:"habits5",icon:"🏆",name:"5 привычек",check:(h)=>h.length>=5},
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const getToday = ()=>new Date().toISOString().slice(0,10);
const getMonthKey = (d)=>d?d.slice(0,7):getToday().slice(0,7);
const getCurrentMonth = ()=>getToday().slice(0,7);
const fmtNum = (n)=>new Intl.NumberFormat("ru-RU").format(Math.abs(Math.round(n)));

function getStreak(habit){
  let streak=0, d=new Date();
  while(true){
    const key=d.toISOString().slice(0,10);
    if(habit.checks[key]){streak++;d.setDate(d.getDate()-1);}
    else break;
  }
  return streak;
}

function isOverdue(task){
  if(task.done||!task.deadline) return false;
  return task.deadline < getToday();
}

// ─── REPORT: CANVAS CHARTS (rendered to PNG, then embedded into the xlsx) ─────
const REPORT = {
  bg:"#0A0F0A", bg2:"#0D1A0D", bg3:"#111D11",
  green:"#39FF14", greenLight:"#4AFF6A", red:"#FF6B6B", redDark:"#FF4D4D",
  gold:"#FFB800", white:"#FFFFFF", grey:"#CCCCCC", font:"Times New Roman"
};

function drawDonutChart(data, size=360){
  const canvas=document.createElement("canvas");
  canvas.width=size; canvas.height=size;
  const ctx=canvas.getContext("2d");
  ctx.fillStyle=REPORT.bg2; ctx.fillRect(0,0,size,size);
  const total=data.reduce((s,d)=>s+d.value,0)||1;
  const cx=size/2, cy=size/2, rOuter=size*0.38, rInner=size*0.22;
  let start=-Math.PI/2;
  data.forEach(d=>{
    const angle=(d.value/total)*Math.PI*2;
    ctx.beginPath();
    ctx.moveTo(cx,cy);
    ctx.arc(cx,cy,rOuter,start,start+angle);
    ctx.closePath();
    ctx.fillStyle=d.color;
    ctx.fill();
    start+=angle;
  });
  ctx.beginPath(); ctx.arc(cx,cy,rInner,0,Math.PI*2); ctx.fillStyle=REPORT.bg2; ctx.fill();
  ctx.font="bold "+Math.round(size*0.055)+"px "+REPORT.font;
  ctx.fillStyle=REPORT.white; ctx.textAlign="center"; ctx.textBaseline="middle";
  ctx.fillText("Баланс",cx,cy-size*0.03);
  ctx.font="bold "+Math.round(size*0.065)+"px "+REPORT.font;
  ctx.fillStyle=REPORT.green;
  const balance=data.find(d=>d.label==="Доход")?.value-data.find(d=>d.label==="Расход")?.value;
  ctx.fillText(fmtNum(balance||0)+" ₸",cx,cy+size*0.05);
  // legend
  let ly=size*0.86;
  const lx0=size*0.12;
  data.forEach((d,i)=>{
    const lx=lx0+i*(size*0.42);
    ctx.fillStyle=d.color; ctx.fillRect(lx,ly-8,14,14);
    ctx.fillStyle=REPORT.grey; ctx.font=Math.round(size*0.035)+"px "+REPORT.font; ctx.textAlign="left";
    ctx.fillText(d.label+": "+fmtNum(d.value)+" ₸",lx+20,ly);
  });
  return canvas.toDataURL("image/png");
}

function drawBarChart(data, size={w:420,h:280}, title=""){
  const {w,h}=size;
  const canvas=document.createElement("canvas");
  canvas.width=w; canvas.height=h;
  const ctx=canvas.getContext("2d");
  ctx.fillStyle=REPORT.bg2; ctx.fillRect(0,0,w,h);
  if(title){
    ctx.font="bold 16px "+REPORT.font; ctx.fillStyle=REPORT.green; ctx.textAlign="left";
    ctx.fillText(title,16,24);
  }
  const padTop=title?42:20, padBottom=36, padLeft=16, padRight=16;
  const chartH=h-padTop-padBottom;
  const max=Math.max(...data.map(d=>d.value),1);
  const barW=(w-padLeft-padRight)/data.length;
  data.forEach((d,i)=>{
    const barH=(d.value/max)*chartH;
    const x=padLeft+i*barW+barW*0.18;
    const bw=barW*0.64;
    const y=padTop+(chartH-barH);
    ctx.fillStyle=d.color;
    ctx.fillRect(x,y,bw,barH);
    ctx.font="bold 12px "+REPORT.font; ctx.fillStyle=REPORT.white; ctx.textAlign="center";
    ctx.fillText(String(d.value),x+bw/2,y-6<padTop-4?y+14:y-6);
    ctx.font="10px "+REPORT.font; ctx.fillStyle=REPORT.grey;
    ctx.fillText(d.label.length>10?d.label.slice(0,9)+"…":d.label, x+bw/2, h-padBottom+14);
  });
  return canvas.toDataURL("image/png");
}

async function dataURLToArrayBuffer(dataURL){
  const res=await fetch(dataURL);
  return await res.arrayBuffer();
}

function periodRange(period,customFrom,customTo){
  const now=new Date(); const toDate=now.toISOString().slice(0,10);
  let fromDate;
  if(period==="week"){const d=new Date();d.setDate(d.getDate()-7);fromDate=d.toISOString().slice(0,10);}
  else if(period==="month"){const d=new Date();d.setMonth(d.getMonth()-1);fromDate=d.toISOString().slice(0,10);}
  else if(period==="quarter"){const d=new Date();d.setMonth(d.getMonth()-3);fromDate=d.toISOString().slice(0,10);}
  else if(period==="year"){const d=new Date();d.setFullYear(d.getFullYear()-1);fromDate=d.toISOString().slice(0,10);}
  else{fromDate=customFrom||"2020-01-01";}
  const toFinal=period==="custom"?(customTo||toDate):toDate;
  const label={week:"Неделя",month:"Месяц",quarter:"Квартал",year:"Год",custom:fromDate+" — "+toFinal}[period];
  return {fromDate,toFinal,label};
}

// ─── EXCEL REPORT BUILDER ──────────────────────────────────────────────────────
async function buildExcelReport({habits,tasks,txns,period,customFrom,customTo,userName}){
  const {fromDate,toFinal,label}=periodRange(period,customFrom,customTo);
  const filtTxns=txns.filter(tx=>tx.date>=fromDate&&tx.date<=toFinal);
  const inc=filtTxns.filter(tx=>tx.type==="income").reduce((s,tx)=>s+tx.amount,0);
  const exp=filtTxns.filter(tx=>tx.type==="expense").reduce((s,tx)=>s+tx.amount,0);
  const doneHabitsToday=habits.filter(h=>h.checks[getToday()]).length;
  const doneTasks=tasks.filter(tk=>tk.done).length;

  const wb=new ExcelJS.Workbook();
  wb.creator="NextLVL"; wb.created=new Date();

  const FONT=REPORT.font;
  const fill=(hex)=>({type:"pattern",pattern:"solid",fgColor:{argb:"FF"+hex.replace("#","")}});
  const rowBg=(ws,rowNum,hex)=>{ ws.getRow(rowNum).eachCell({includeEmpty:true},c=>{c.fill=fill(hex);}); };
  const setFont=(cell,opts={})=>{cell.font={name:FONT,size:opts.size||11,bold:!!opts.bold,color:{argb:"FF"+(opts.color||"CCCCCC").replace("#","")}};};

  // ── СВОДКА ──
  const wsS=wb.addWorksheet("📊 Сводка");
  wsS.columns=[{width:26},{width:20},{width:10}];
  wsS.mergeCells("A1:C1");
  wsS.getCell("A1").value="🛡 NextLVL — Аналитика";
  setFont(wsS.getCell("A1"),{size:18,bold:true,color:"39FF14"});
  rowBg(wsS,1,"0A0F0A");
  wsS.mergeCells("A2:C2");
  wsS.getCell("A2").value="Период: "+label+" ("+fromDate+" — "+toFinal+")"+(userName?" · "+userName:"");
  setFont(wsS.getCell("A2"),{size:10,color:"888888"});
  rowBg(wsS,2,"0D1A0D");

  const summaryRows=[
    ["ФИНАНСЫ","",""],
    ["Общий доход",fmtNum(inc)+" ₸",""],
    ["Общие расходы",fmtNum(exp)+" ₸",""],
    ["Баланс",fmtNum(inc-exp)+" ₸",""],
    ["",""],
    ["ПРИВЫЧКИ","",""],
    ["Выполнено сегодня",doneHabitsToday+"/"+habits.length,""],
    ["",""],
    ["ЗАДАЧИ","",""],
    ["Выполнено",doneTasks+"/"+tasks.length,""],
  ];
  let r=4;
  summaryRows.forEach(([a,b])=>{
    const isHeader=["ФИНАНСЫ","ПРИВЫЧКИ","ЗАДАЧИ"].includes(a);
    const row=wsS.getRow(r);
    row.getCell(1).value=a; row.getCell(2).value=b;
    if(isHeader){
      setFont(row.getCell(1),{bold:true,color:"39FF14"});
      rowBg(wsS,r,"111D11");
    } else if(a){
      setFont(row.getCell(1),{color:"CCCCCC"});
      const isBalance=a==="Баланс"||a==="Общий доход";
      setFont(row.getCell(2),{bold:true,color:a==="Общие расходы"?"FF6B6B":(isBalance?"4AFF6A":"CCCCCC")});
      rowBg(wsS,r,"0D1A0D");
    }
    r++;
  });

  // charts as images
  try{
    const donutURL=drawDonutChart([
      {label:"Доход",value:inc,color:REPORT.green},
      {label:"Расход",value:exp,color:REPORT.red},
    ]);
    const donutBuf=await dataURLToArrayBuffer(donutURL);
    const donutId=wb.addImage({buffer:donutBuf,extension:"png"});
    wsS.addImage(donutId,{tl:{col:3.3,row:3},ext:{width:260,height:260}});

    const habitBarURL=drawBarChart(
      habits.slice(0,6).map(h=>({label:h.name,value:getStreak(h),color:REPORT.green})),
      {w:340,h:240}, "Серии привычек (дней)"
    );
    if(habits.length){
      const barBuf=await dataURLToArrayBuffer(habitBarURL);
      const barId=wb.addImage({buffer:barBuf,extension:"png"});
      wsS.addImage(barId,{tl:{col:3.3,row:17},ext:{width:280,height:198}});
    }
  }catch(e){ /* charts are best-effort */ }

  // ── ФИНАНСЫ ──
  const wsF=wb.addWorksheet("💰 Финансы");
  wsF.columns=[{width:14},{width:12},{width:14},{width:26}];
  wsF.mergeCells("A1:D1");
  wsF.getCell("A1").value="ФИНАНСЫ — "+label;
  setFont(wsF.getCell("A1"),{size:14,bold:true,color:"39FF14"});
  rowBg(wsF,1,"0A0F0A");
  ["Дата","Тип","Сумма ₸","Описание"].forEach((h,i)=>{
    const c=wsF.getRow(3).getCell(i+1); c.value=h;
    setFont(c,{bold:true,color:i===1?"FF6B6B":(i===0?"4AFF6A":"39FF14")});
  });
  rowBg(wsF,3,"0D1A0D");
  filtTxns.forEach((tx,i)=>{
    const rr=4+i; const row=wsF.getRow(rr);
    row.getCell(1).value=tx.date;
    row.getCell(2).value=tx.type;
    row.getCell(3).value=tx.amount;
    row.getCell(4).value=tx.note||"";
    const c=tx.type==="income"?"4AFF6A":"FF6B6B";
    setFont(row.getCell(1),{color:"CCCCCC"});
    setFont(row.getCell(2),{color:c});
    setFont(row.getCell(3),{bold:true,color:c});
    setFont(row.getCell(4),{color:"CCCCCC"});
    rowBg(wsF,rr,i%2===0?"0D1A0D":"111D11");
  });

  // ── ПРИВЫЧКИ ──
  const wsH=wb.addWorksheet("✅ Привычки");
  wsH.columns=[{width:24},{width:14},{width:12}];
  wsH.mergeCells("A1:C1");
  wsH.getCell("A1").value="ПРИВЫЧКИ";
  setFont(wsH.getCell("A1"),{size:14,bold:true,color:"39FF14"});
  rowBg(wsH,1,"0A0F0A");
  ["Привычка","Серия (дни)","Неделя %"].forEach((h,i)=>{
    const c=wsH.getRow(3).getCell(i+1); c.value=h;
    setFont(c,{bold:true,color:"39FF14"});
  });
  rowBg(wsH,3,"0D1A0D");
  habits.forEach((h,i)=>{
    const rr=4+i; const row=wsH.getRow(rr);
    const keys=Object.keys(h.checks).filter(d=>d>=fromDate&&d<=toFinal);
    const weekDone=[...Array(7)].filter((_,di)=>{const d=new Date();d.setDate(d.getDate()-6+di);return h.checks[d.toISOString().slice(0,10)];}).length;
    const pct=Math.round(weekDone/7*100);
    row.getCell(1).value=h.name;
    row.getCell(2).value=getStreak(h);
    row.getCell(3).value=pct+"%";
    setFont(row.getCell(1),{color:"FFFFFF"});
    setFont(row.getCell(2),{color:"FFB800"});
    setFont(row.getCell(3),{color:pct>=70?"4AFF6A":(pct>=40?"FFB800":"FF6B6B")});
    rowBg(wsH,rr,i%2===0?"0D1A0D":"111D11");
  });

  // ── ЗАДАЧИ ──
  const wsT=wb.addWorksheet("📋 Задачи");
  wsT.columns=[{width:32},{width:14},{width:14}];
  wsT.mergeCells("A1:C1");
  wsT.getCell("A1").value="ЗАДАЧИ";
  setFont(wsT.getCell("A1"),{size:14,bold:true,color:"FFB800"});
  rowBg(wsT,1,"0A0F0A");
  ["Задача","Приоритет","Статус"].forEach((h,i)=>{
    const c=wsT.getRow(3).getCell(i+1); c.value=h;
    setFont(c,{bold:true,color:"FFB800"});
  });
  rowBg(wsT,3,"0D1A0D");
  const prioColor={high:"FF4D4D",medium:"FFB800",low:"4AFF6A"};
  const prioLabel={high:"Высокий",medium:"Средний",low:"Низкий"};
  tasks.forEach((tk,i)=>{
    const rr=4+i; const row=wsT.getRow(rr);
    row.getCell(1).value=tk.title;
    row.getCell(2).value=prioLabel[tk.priority]||tk.priority;
    row.getCell(3).value=tk.done?"Выполнено":(isOverdue(tk)?"Просрочена":"Активна");
    setFont(row.getCell(1),{color:"FFFFFF"});
    setFont(row.getCell(2),{color:prioColor[tk.priority]||"CCCCCC"});
    setFont(row.getCell(3),{color:tk.done?"4AFF6A":(isOverdue(tk)?"FF4D4D":"CCCCCC")});
    rowBg(wsT,rr,i%2===0?"0D1A0D":"111D11");
  });

  [wsS,wsF,wsH,wsT].forEach(ws=>{
    ws.eachRow(row=>row.eachCell({includeEmpty:false},c=>{ if(!c.font) setFont(c); }));
  });

  const buf=await wb.xlsx.writeBuffer();
  const blob=new Blob([buf],{type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});
  const url=URL.createObjectURL(blob);
  const a=document.createElement("a");
  a.href=url; a.download="nextlvl-"+label.replace(/\s/g,"_")+"-"+toFinal+".xlsx"; a.click();
  URL.revokeObjectURL(url);
}

// ─── SPLASH SCREEN ────────────────────────────────────────────────────────────
function SplashScreen({onDone}){
  const [fade,setFade]=useState(false);
  useEffect(()=>{
    const t1=setTimeout(()=>setFade(true),1800);
    const t2=setTimeout(()=>onDone(),2400);
    return()=>{clearTimeout(t1);clearTimeout(t2);};
  },[]);
  return(
    <div style={{
      position:"fixed",inset:0,background:"#0A0F0A",
      display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
      zIndex:9999,transition:"opacity 0.6s",opacity:fade?0:1,
    }}>
      <div style={{position:"relative",marginBottom:24}}>
        <div style={{
          position:"absolute",inset:-20,
          background:"radial-gradient(circle,rgba(57,255,20,0.15),transparent)",
          borderRadius:"50%",animation:"pulse 2s infinite",
        }}/>
        <img src={SHIELD_URL} style={{width:100,height:112,objectFit:"contain",filter:"drop-shadow(0 0 24px rgba(57,255,20,0.6))"}}/>
      </div>
      <div style={{fontFamily:"system-ui,sans-serif",fontSize:36,fontWeight:900,color:"#fff",letterSpacing:"-0.02em",marginBottom:8}}>NextLVL</div>
      <div style={{fontSize:14,color:"rgba(57,255,20,0.8)",letterSpacing:"0.05em"}}>Level up your life</div>
      <style>{`@keyframes pulse{0%,100%{transform:scale(1);opacity:0.6}50%{transform:scale(1.1);opacity:1}}`}</style>
    </div>
  );
}

// ─── LANG SELECT ──────────────────────────────────────────────────────────────
function LangSelect({onSelect}){
  const langs=[{code:"ru",label:"Русский",flag:"🇷🇺"},{code:"kk",label:"Қазақша",flag:"🇰🇿"},{code:"en",label:"English",flag:"🇬🇧"}];
  return(
    <div style={{position:"fixed",inset:0,background:"#0A0F0A",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:"system-ui,sans-serif",padding:32}}>
      <img src={SHIELD_URL} style={{width:64,height:72,objectFit:"contain",marginBottom:20,filter:"drop-shadow(0 0 16px rgba(57,255,20,0.5))"}}/>
      <div style={{fontSize:28,fontWeight:900,color:"#fff",marginBottom:6}}>NextLVL</div>
      <div style={{fontSize:12,color:"rgba(57,255,20,0.7)",letterSpacing:"0.1em",marginBottom:40}}>NEXT LEVEL EVERY DAY</div>
      <div style={{fontSize:14,color:"rgba(255,255,255,0.5)",marginBottom:24,letterSpacing:"0.05em"}}>Выбери язык / Тілді таңда / Choose language</div>
      {langs.map(l=>(
        <button key={l.code} onClick={()=>onSelect(l.code)} style={{
          width:"100%",maxWidth:280,padding:"16px",marginBottom:12,
          background:"rgba(57,255,20,0.06)",border:"1.5px solid rgba(57,255,20,0.2)",
          borderRadius:16,cursor:"pointer",display:"flex",alignItems:"center",gap:14,
          color:"#fff",fontSize:16,fontWeight:700,fontFamily:"inherit",
          transition:"all 0.15s",
        }}>
          <span style={{fontSize:24}}>{l.flag}</span>{l.label}
        </button>
      ))}
    </div>
  );
}

// ─── ONBOARDING ───────────────────────────────────────────────────────────────
function Onboarding({lang,onDone}){
  const t=T[lang];
  const [name,setName]=useState("");
  const [step,setStep]=useState(0); // 0=intro 1=name

  if(step===0) return(
    <div style={{position:"fixed",inset:0,background:"#0A0F0A",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:"system-ui,sans-serif",padding:28}}>
      <div style={{position:"relative",marginBottom:24}}>
        <div style={{position:"absolute",inset:-16,background:"radial-gradient(circle,rgba(57,255,20,0.1),transparent)",borderRadius:"50%"}}/>
        <img src={SHIELD_URL} style={{width:80,height:90,objectFit:"contain",filter:"drop-shadow(0 0 16px rgba(57,255,20,0.5))"}}/>
      </div>
      <div style={{background:"rgba(57,255,20,0.06)",border:"1.5px solid rgba(57,255,20,0.2)",borderRadius:20,padding:"20px 22px",maxWidth:320,marginBottom:32,textAlign:"center"}}>
        <div style={{fontSize:9,color:"rgba(57,255,20,0.7)",letterSpacing:"0.15em",marginBottom:8}}>● AZA AI</div>
        <div style={{fontSize:15,color:"#fff",lineHeight:1.6}}>{t.hello}</div>
      </div>
      <button onClick={()=>setStep(1)} style={{
        padding:"14px 48px",background:"linear-gradient(135deg,#39FF14,#AAFF44)",
        border:"none",borderRadius:14,cursor:"pointer",fontSize:15,fontWeight:800,color:"#0A0F0A",fontFamily:"inherit",
      }}>→</button>
    </div>
  );

  return(
    <div style={{position:"fixed",inset:0,background:"#0A0F0A",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:"system-ui,sans-serif",padding:28}}>
      <div style={{background:"rgba(57,255,20,0.06)",border:"1.5px solid rgba(57,255,20,0.2)",borderRadius:20,padding:"20px 22px",maxWidth:320,marginBottom:28,textAlign:"center"}}>
        <div style={{fontSize:9,color:"rgba(57,255,20,0.7)",letterSpacing:"0.15em",marginBottom:8}}>● AZA AI</div>
        <div style={{fontSize:15,color:"#fff",lineHeight:1.6}}>{t.askName}</div>
      </div>
      <input value={name} onChange={e=>setName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&name.trim()&&onDone(name.trim())}
        placeholder={t.namePlaceholder} autoFocus
        style={{width:"100%",maxWidth:280,padding:"14px 18px",background:"rgba(255,255,255,0.07)",border:"1.5px solid rgba(57,255,20,0.3)",borderRadius:14,color:"#fff",fontSize:16,fontFamily:"inherit",outline:"none",textAlign:"center",marginBottom:14,boxSizing:"border-box"}}
      />
      <button onClick={()=>name.trim()&&onDone(name.trim())} disabled={!name.trim()} style={{
        width:"100%",maxWidth:280,padding:"14px",
        background:name.trim()?"linear-gradient(135deg,#39FF14,#AAFF44)":"rgba(255,255,255,0.08)",
        border:"none",borderRadius:14,cursor:name.trim()?"pointer":"default",
        fontSize:15,fontWeight:800,color:name.trim()?"#0A0F0A":"#666",fontFamily:"inherit",
      }}>{t.start}</button>
    </div>
  );
}

// ─── CIRCULAR RING ────────────────────────────────────────────────────────────
function Ring({pct,value,label,th}){
  const r=38,circ=2*Math.PI*r;
  const fill=circ-(pct/100)*circ;
  const isLight=th.bg.startsWith("#F");
  return(
    <div style={{position:"relative",width:90,height:90,flexShrink:0}}>
      <svg width="90" height="90" viewBox="0 0 90 90" style={{transform:"rotate(-90deg)"}}>
        <circle cx="45" cy="45" r={r} fill="none" stroke={th.ringBg} strokeWidth="6"/>
        <circle cx="45" cy="45" r={r} fill="none" stroke={isLight?"rgba(255,255,255,0.85)":th.ring} strokeWidth="6"
          strokeDasharray={circ} strokeDashoffset={fill} strokeLinecap="round"/>
      </svg>
      <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
        <div style={{fontSize:26,fontWeight:900,color:isLight?"#fff":th.ring,lineHeight:1}}>{value}</div>
        <div style={{fontSize:7.5,color:isLight?"rgba(255,255,255,0.6)":th.text2,letterSpacing:"0.1em",marginTop:2}}>{label}</div>
      </div>
    </div>
  );
}

// ─── AZA AI CHAT ──────────────────────────────────────────────────────────────
function AzaChat({open,onClose,th,t,userName,habits,tasks,txns,totalXP,curLvl}){
  const [msgs,setMsgs]=useState([{role:"assistant",text:t.hello+" "+t.greeting(userName)}]);
  const [input,setInput]=useState("");
  const [loading,setLoading]=useState(false);
  const endRef=useRef(null);

  useEffect(()=>{if(endRef.current)endRef.current.scrollIntoView({behavior:"smooth"});},[msgs]);

  async function send(){
    if(!input.trim()||loading) return;
    const msg=input.trim(); setInput(""); setLoading(true);
    setMsgs(p=>[...p,{role:"user",text:msg}]);
    const todayH=habits.filter(h=>h.checks[getToday()]).length;
    const actT=tasks.filter(t=>!t.done).length;
    const mExp=txns.filter(t=>getMonthKey(t.date)===getCurrentMonth()&&t.type==="expense").reduce((s,t)=>s+t.amount,0);
    const sys="You are Aza, AI advisor in NextLVL app. User: "+(userName||"friend")+". Habits today: "+todayH+"/"+habits.length+". Tasks: "+actT+". Expenses: "+mExp+". Level "+curLvl.level+". Reply in "+({ru:"Russian",kk:"Kazakh",en:"English"}[t===T.ru?"ru":t===T.kk?"kk":"en"]||"Russian")+". 2-3 sentences, motivating, 1 emoji.";
    try{
      const r=await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({system:sys,message:msg})});
      const d=await r.json();
      setMsgs(p=>[...p,{role:"assistant",text:d.text||d.error||"..."}]);
    }catch(e){setMsgs(p=>[...p,{role:"assistant",text:"Ошибка: "+e.message}]);}
    setLoading(false);
  }

  if(!open) return null;
  return(
    <div style={{position:"fixed",bottom:70,left:10,right:10,maxWidth:480,margin:"0 auto",
      background:th.bg2,border:"1px solid "+th.cardBorder,borderRadius:20,
      zIndex:500,display:"flex",flexDirection:"column",height:420,overflow:"hidden",
      boxShadow:"0 8px 40px rgba(0,0,0,0.5)"}}>
      {/* Header */}
      <div style={{padding:"12px 14px",borderBottom:"1px solid "+th.cardBorder,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:36,height:36,borderRadius:"50%",background:th.card,border:"1.5px solid "+th.accent,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>🤖</div>
          <div>
            <div style={{fontSize:13,fontWeight:700,color:th.text}}>{t.azaTitle}</div>
            <div style={{fontSize:10,color:th.accent}}>{t.azaOnline}</div>
          </div>
        </div>
        <button onClick={onClose} style={{background:"none",border:"none",color:th.text2,fontSize:20,cursor:"pointer"}}>✕</button>
      </div>
      {/* Messages */}
      <div style={{flex:1,overflowY:"auto",padding:"12px 14px",display:"flex",flexDirection:"column",gap:10}}>
        {msgs.map((m,i)=>(
          <div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start"}}>
            <div style={{maxWidth:"82%",padding:"10px 13px",borderRadius:m.role==="user"?"16px 16px 4px 16px":"16px 16px 16px 4px",
              background:m.role==="user"?"linear-gradient(135deg,"+th.accent+","+th.accent2+")":th.card,
              border:m.role==="assistant"?"1px solid "+th.cardBorder:"none",
              fontSize:13,color:m.role==="user"?(th.bg==="F2F2F7"||th.bg.startsWith("#F")?"#fff":th.bg):th.text,lineHeight:1.55}}>
              {m.text}
            </div>
          </div>
        ))}
        {loading&&<div style={{padding:"10px 14px",borderRadius:"16px 16px 16px 4px",background:th.card,width:60}}>
          <div style={{display:"flex",gap:4}}>{[0,1,2].map(i=><div key={i} style={{width:6,height:6,borderRadius:"50%",background:th.accent,opacity:0.7}}/>)}</div>
        </div>}
        <div ref={endRef}/>
      </div>
      {/* Input */}
      <div style={{padding:"10px 12px",borderTop:"1px solid "+th.cardBorder,display:"flex",gap:8}}>
        <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()}
          placeholder={t.chatPlaceholder}
          style={{flex:1,background:th.card,border:"1px solid "+th.cardBorder,borderRadius:12,padding:"9px 13px",color:th.text,fontFamily:"inherit",fontSize:13,outline:"none"}}/>
        <button onClick={send} disabled={!input.trim()||loading}
          style={{width:38,height:38,borderRadius:"50%",background:input.trim()?th.accent:"rgba(128,128,128,0.2)",border:"none",cursor:"pointer",fontSize:16,color:th.bg}}>➤</button>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function NextLVL(){
  // State
  const [splash,setSplash]=useState(true);
  const [step,setStep]=useState("lang"); // lang|onboard|app
  const [lang,setLang]=useState("ru");
  const [userName,setUserName]=useState("");
  const [themeName,setThemeName]=useState("darkGamer");
  const [tab,setTab]=useState("home");
  const [habits,setHabits]=useState([]);
  const [tasks,setTasks]=useState([]);
  const [txns,setTxns]=useState([]);
  const [azaOpen,setAzaOpen]=useState(false);
  const [motivation,setMotivation]=useState("");
  const [notifEnabled,setNotifEnabled]=useState(false);
  const [motLoading,setMotLoading]=useState(false);

  // Habit form
  const [showHabitForm,setShowHabitForm]=useState(false);
  const [habitName,setHabitName]=useState("");
  const [habitCat,setHabitCat]=useState(0);
  const [habitIcon,setHabitIcon]=useState("⭐");

  // Task form
  const [showTaskForm,setShowTaskForm]=useState(false);
  const [taskTitle,setTaskTitle]=useState("");
  const [taskPrio,setTaskPrio]=useState("medium");
  const [taskDeadline,setTaskDeadline]=useState("");

  // Txn form
  const [showTxnForm,setShowTxnForm]=useState(false);
  const [txnType,setTxnType]=useState("income");
  const [txnAmount,setTxnAmount]=useState("");
  const [txnNote,setTxnNote]=useState("");
  const [quickInput,setQuickInput]=useState("");
  const [quickParsed,setQuickParsed]=useState([]);

  const [exportPeriod,setExportPeriod]=useState("month");
  const [dateFrom,setDateFrom]=useState("");
  const [dateTo,setDateTo]=useState("");
  const [exporting,setExporting]=useState(false);

  const [recording,setRecording]=useState(false);
  const [transcribing,setTranscribing]=useState(false);
  const mediaRecorderRef=useRef(null);
  const audioChunksRef=useRef([]);

  const t=T[lang]||T.ru;
  const th=THEMES[themeName]||THEMES.darkGamer;

  // ── 5x DAILY NOTIFICATIONS ──────────────────────────────────────────────
  const NOTIFY_TIMES = [
    {h:7,  m:0,  type:"morning"},
    {h:10, m:0,  type:"habits"},
    {h:13, m:0,  type:"midday"},
    {h:17, m:0,  type:"tasks"},
    {h:21, m:0,  type:"evening"},
  ];

  const NOTIFY_MSGS = {
    ru: {
      morning: (n)=>[`Доброе утро, ${n}! Новый день — новый уровень 🌅`, `${n}, начни день с плана. Загляни в NextLVL ☀️`],
      habits:  (n)=>[`Не забудь отметить привычки сегодня, ${n} 💪`, `Серия привычек не должна прерываться, ${n} 🔥`],
      midday:  (n)=>[`Как продвигается день, ${n}? Проверь задачи 📋`, `Самое время сверить финансы за сегодня, ${n} 💰`],
      tasks:   (n)=>[`Вечер близко — успей закрыть важные задачи, ${n} ✅`, `${n}, глянь список задач — что ещё активно?`],
      evening: (n)=>[`Подведи итоги дня в NextLVL, ${n} 🌙`, `${n}, отметь привычки перед сном, если ещё не успел ✨`],
    },
    kk: {
      morning: (n)=>[`Қайырлы таң, ${n}! Жаңа күн — жаңа деңгей 🌅`, `${n}, күнді жоспардан баста. NextLVL-ге қара ☀️`],
      habits:  (n)=>[`Бүгінгі әдеттеріңді белгілеуді ұмытпа, ${n} 💪`, `Әдет сериясын үзбе, ${n} 🔥`],
      midday:  (n)=>[`Күн қалай өтіп жатыр, ${n}? Тапсырмаларды тексер 📋`, `Қаржыны тексеретін кез келді, ${n} 💰`],
      tasks:   (n)=>[`Кеш жақындап қалды — маңызды тапсырмаларды бітір, ${n} ✅`, `${n}, тапсырмалар тізіміне қара — не белсенді?`],
      evening: (n)=>[`Күн қорытындысын NextLVL-де шығар, ${n} 🌙`, `${n}, ұйықтар алдында әдеттерді белгіле ✨`],
    },
    en: {
      morning: (n)=>[`Good morning, ${n}! New day, new level 🌅`, `${n}, start the day with a plan. Check NextLVL ☀️`],
      habits:  (n)=>[`Don't forget to check off your habits today, ${n} 💪`, `Keep your streak alive, ${n} 🔥`],
      midday:  (n)=>[`How's the day going, ${n}? Check your tasks 📋`, `Good time to review your finances, ${n} 💰`],
      tasks:   (n)=>[`Evening's close — wrap up important tasks, ${n} ✅`, `${n}, take a look at what's still active`],
      evening: (n)=>[`Wrap up the day in NextLVL, ${n} 🌙`, `${n}, check off habits before bed if you haven't yet ✨`],
    }
  };

  function scheduleAllNotifications(name, language) {
    if(typeof Notification === "undefined" || Notification.permission !== "granted") return;
    // Clear existing timers
    const timers = JSON.parse(localStorage.getItem("nl-notif-timers")||"[]");
    timers.forEach(id => clearTimeout(id));
    const newTimers = [];
    NOTIFY_TIMES.forEach(({h, m, type}) => {
      const now = new Date();
      const next = new Date();
      next.setHours(h, m, 0, 0);
      if(next <= now) next.setDate(next.getDate() + 1);
      const ms = next - now;
      const tid = setTimeout(() => {
        const msgs = NOTIFY_MSGS[language]?.[type] || NOTIFY_MSGS.ru[type];
        const msg = msgs[Math.floor(Math.random() * msgs.length)](name);
        new Notification("NextLVL", {body: msg, icon: "/favicon.ico"});
        // Reschedule for next day
        scheduleAllNotifications(name, language);
      }, ms);
      newTimers.push(tid);
    });
  }

  async function enableNotifications() {
    if(typeof Notification === "undefined") return false;
    if(Notification.permission === "granted") return true;
    const perm = await Notification.requestPermission();
    return perm === "granted";
  }

  // Load from localStorage
  useEffect(()=>{
    const notifOn = localStorage.getItem("nl-notif") === "true";
    setNotifEnabled(notifOn);
    const u=ls.get("nl-user");
    if(u){setUserName(u.name||"");setLang(u.lang||"ru");setThemeName(u.theme||"darkGamer");setStep("app");}
    setHabits(ls.get("nl-habits")||[]);
    setTasks(ls.get("nl-tasks")||[]);
    setTxns(ls.get("nl-txns")||[]);
  },[]);

  // Save
  useEffect(()=>{ls.set("nl-habits",habits);},[habits]);
  useEffect(()=>{ls.set("nl-tasks",tasks);},[tasks]);
  useEffect(()=>{ls.set("nl-txns",txns);},[txns]);
  useEffect(()=>{
    if(userName && notifEnabled) scheduleAllNotifications(userName, lang);
  },[userName, lang, notifEnabled]);

  useEffect(()=>{if(userName)ls.set("nl-user",{name:userName,lang,theme:themeName});},[userName,lang,themeName]);

  // XP
  const totalXP=habits.reduce((s,h)=>s+Object.keys(h.checks||{}).length*10,0)
    +tasks.filter(t=>t.done).length*20
    +txns.length*5;
  const curLvl=LEVELS.slice().reverse().find(l=>totalXP>=l.xpNeeded)||LEVELS[0];
  const nxtLvl=LEVELS.find(l=>l.xpNeeded>totalXP)||LEVELS[LEVELS.length-1];
  const xpPct=nxtLvl.xpNeeded===curLvl.xpNeeded?100:Math.round((totalXP-curLvl.xpNeeded)/(nxtLvl.xpNeeded-curLvl.xpNeeded)*100);
  const earnedBadges=BADGES.filter(b=>b.check(habits,tasks,totalXP));

  // Motivation on tab=home
  useEffect(()=>{
    if(step==="app"&&tab==="home"&&userName&&!motivation){fetchMotivation();}
  },[step,tab,userName]);

  async function fetchMotivation(){
    setMotLoading(true);
    const todayH=habits.filter(h=>h.checks[getToday()]).length;
    const sys="You are Aza. Give a short personalized morning motivation (1-2 sentences, 1 emoji) to "+userName+" in "+({ru:"Russian",kk:"Kazakh",en:"English"}[lang]||"Russian")+". They have "+todayH+"/"+habits.length+" habits done today, level "+curLvl.level+".";
    try{
      const r=await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({system:sys,message:"Give motivation"})});
      const d=await r.json();
      setMotivation(d.text||"");
    }catch(e){setMotivation("");}
    setMotLoading(false);
  }

  // Handlers
  function completeOnboard(name){
    setUserName(name);
    ls.set("nl-user",{name,lang,theme:themeName});
    setStep("app");
  }

  function toggleHabit(id){
    const today=getToday();
    setHabits(prev=>prev.map(h=>h.id===id?{...h,checks:{...h.checks,[today]:!h.checks[today]}}:h));
  }

  function addHabit(){
    if(!habitName.trim()) return;
    const icons=["⭐","💧","🏃","📚","🧘","💪","🎯","🥗","😴","🎵","💊","🧠"];
    const h={id:Date.now(),name:habitName.trim(),cat:habitCat,icon:habitIcon||icons[Math.floor(Math.random()*icons.length)],checks:{}};
    setHabits(p=>[...p,h]);
    setHabitName(""); setHabitCat(0); setHabitIcon("⭐"); setShowHabitForm(false);
  }

  function deleteHabit(id){setHabits(p=>p.filter(h=>h.id!==id));}

  function toggleTask(id){setTasks(p=>p.map(t=>t.id===id?{...t,done:!t.done}:t));}

  function addTask(){
    if(!taskTitle.trim()) return;
    const tk={id:Date.now(),title:taskTitle.trim(),priority:taskPrio,deadline:taskDeadline,done:false};
    setTasks(p=>[...p,tk]);
    setTaskTitle(""); setTaskPrio("medium"); setTaskDeadline(""); setShowTaskForm(false);
  }

  function deleteTask(id){setTasks(p=>p.filter(t=>t.id!==id));}

  // ── VOICE TASK INPUT ─────────────────────────────────────────────────────
  async function startVoiceTask(){
    try{
      const stream=await navigator.mediaDevices.getUserMedia({audio:true});
      const mr=new MediaRecorder(stream);
      audioChunksRef.current=[];
      mr.ondataavailable=(e)=>{ if(e.data.size>0) audioChunksRef.current.push(e.data); };
      mr.onstop=async()=>{
        stream.getTracks().forEach(tr=>tr.stop());
        const blob=new Blob(audioChunksRef.current,{type:mr.mimeType||"audio/webm"});
        await transcribeAndFillTask(blob);
      };
      mediaRecorderRef.current=mr;
      mr.start();
      setRecording(true);
    }catch(e){
      alert("Нет доступа к микрофону: "+e.message);
    }
  }

  function stopVoiceTask(){
    if(mediaRecorderRef.current&&mediaRecorderRef.current.state!=="inactive"){
      mediaRecorderRef.current.stop();
    }
    setRecording(false);
  }

  async function transcribeAndFillTask(blob){
    setTranscribing(true);
    try{
      const buf=await blob.arrayBuffer();
      const bytes=new Uint8Array(buf);
      let binary="";
      for(let i=0;i<bytes.length;i++) binary+=String.fromCharCode(bytes[i]);
      const base64=btoa(binary);
      const langCode=lang==="kk"?"kk":(lang==="en"?"en":"ru");
      const r=await fetch("/api/transcribe",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({audio:base64,mimeType:blob.type,language:langCode})
      });
      const data=await r.json();
      if(data.error) throw new Error(data.error);
      const text=(data.text||"").trim();
      if(!text){ alert("Не удалось распознать речь, попробуйте ещё раз"); return; }
      const lower=text.toLowerCase();
      let prio="medium";
      if(/срочно|важно|asap|urgent|шұғыл|маңызды/.test(lower)) prio="high";
      else if(/не срочно|потом|когда-нибудь|later/.test(lower)) prio="low";
      setTaskTitle(text.charAt(0).toUpperCase()+text.slice(1));
      setTaskPrio(prio);
      setShowTaskForm(true);
    }catch(e){
      alert("Ошибка распознавания: "+e.message);
    }finally{
      setTranscribing(false);
    }
  }

  function addTxn(){
    if(!txnAmount||isNaN(Number(txnAmount))) return;
    const tx={id:Date.now(),type:txnType,amount:Number(txnAmount),note:txnNote,date:getToday()};
    setTxns(p=>[tx,...p]);
    setTxnAmount(""); setTxnNote(""); setShowTxnForm(false);
  }

  // Quick expense parser: "кофе 1200, такси 2000"
  const QUICK_MAP = {
    "кофе":"☕","coffee":"☕",
    "такси":"🚕","taxi":"🚕","яндекс":"🚕",
    "обед":"🍔","lunch":"🍔","еда":"🍔","food":"🍔","ресторан":"🍔",
    "магазин":"🛒","супермаркет":"🛒","market":"🛒","продукты":"🛒",
    "аптека":"💊","pharmacy":"💊","лекарства":"💊",
    "связь":"📱","интернет":"📱","телефон":"📱",
    "транспорт":"🚌","автобус":"🚌","метро":"🚌",
    "бензин":"⛽","газ":"⛽",
    "кино":"🎬","развлечения":"🎬",
    "спорт":"💪","gym":"💪","зал":"💪",
    "одежда":"👕","clothes":"👕",
    "доход":"💰","зарплата":"💰","salary":"💰",
  };
  function getIcon(name){
    const low=name.toLowerCase();
    for(const [k,v] of Object.entries(QUICK_MAP)){if(low.includes(k)) return v;}
    return "💸";
  }
  function parseQuick(text){
    if(!text.trim()){setQuickParsed([]);return;}
    // Split by comma or semicolon
    const parts=text.split(/[,;]+/);
    const result=[];
    parts.forEach(part=>{
      part=part.trim();
      if(!part) return;
      // Extract number from end or anywhere
      const match=part.match(/([^\d]*?)(\d[\d\s]*)/);
      if(match){
        const name=match[1].trim()||"Расход";
        const amount=parseInt(match[2].replace(/\s/g,""));
        if(amount>0) result.push({name,amount,icon:getIcon(name)});
      }
    });
    setQuickParsed(result);
  }
  function saveQuick(){
    if(!quickParsed.length) return;
    const newTxns=quickParsed.map(p=>({id:Date.now()+Math.random(),type:"expense",amount:p.amount,note:p.icon+" "+p.name,date:getToday()}));
    setTxns(prev=>[...newTxns,...prev]);
    setQuickInput(""); setQuickParsed([]);
  }

  // ── HOME TAB ──
  const todayHabits=habits.filter(h=>h.checks[getToday()]);
  const mExp=txns.filter(t=>getMonthKey(t.date)===getCurrentMonth()&&t.type==="expense").reduce((s,t)=>s+t.amount,0);
  const mInc=txns.filter(t=>getMonthKey(t.date)===getCurrentMonth()&&t.type==="income").reduce((s,t)=>s+t.amount,0);
  const isLight=th.bg.startsWith("#F");

  // ── RENDER ──
  if(splash) return <SplashScreen onDone={()=>setSplash(false)}/>;
  if(step==="lang") return <LangSelect onSelect={(l)=>{setLang(l);setStep("onboard");}}/>;
  if(step==="onboard") return <Onboarding lang={lang} onDone={completeOnboard}/>;

  const navItems=[
    {id:"home",label:t.home,icon:"🏠"},
    {id:"habits",label:t.habits,icon:"✓"},
    {id:"finance",label:t.finance,icon:"💰"},
    {id:"tasks",label:t.tasks,icon:"📋"},
    {id:"profile",label:t.profile,icon:"👤"},
  ];

  const iconOptions=["⭐","💧","🏃","📚","🧘","💪","🎯","🥗","😴","🎵","💊","🧠","📝","🎮","🌍","💻"];

  return(
    <div style={{minHeight:"100vh",background:th.bg,color:th.text,fontFamily:"-apple-system,system-ui,sans-serif",maxWidth:500,margin:"0 auto",paddingBottom:70,position:"relative"}}>

      {/* ── HEADER ── */}
      <div style={{padding:"14px 16px 10px",display:"flex",alignItems:"center",justifyContent:"space-between",background:th.bg,position:"sticky",top:0,zIndex:100,borderBottom:"1px solid "+th.cardBorder}}>
        <div style={{display:"flex",alignItems:"center",gap:9}}>
          <div style={{width:34,height:38,background:th.logoBg,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",border:"1px solid rgba(128,128,128,0.2)"}}>
            <img src={SHIELD_URL} style={{width:28,height:31,objectFit:"contain",filter:"drop-shadow(0 0 6px "+th.logoGlow+")"}}/>
          </div>
          <div>
            <div style={{fontSize:16,fontWeight:900,color:th.text,letterSpacing:"-0.01em"}}>NextLVL</div>
            <div style={{fontSize:7,color:th.accent,letterSpacing:"0.12em",opacity:0.7}}>NEXT LEVEL EVERY DAY</div>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{background:th.badgeBg,border:"1.5px solid "+th.badgeBorder,borderRadius:20,padding:"4px 12px",display:"flex",alignItems:"center",gap:4}}>
            <span style={{color:th.badgeText,fontSize:12,fontWeight:800}}>LV.{curLvl.level}</span>
            <span style={{color:th.gold,fontSize:10}}>✦</span>
          </div>
        </div>
      </div>

      {/* ── HOME ── */}
      {tab==="home"&&(
        <div style={{padding:"0 0 16px"}}>
          {/* Greeting */}
          <div style={{padding:"12px 16px 0",fontSize:14,color:th.text2}}>{t.greeting(userName)}</div>

          {/* Motivation */}
          {(motivation||motLoading)&&(
            <div style={{margin:"8px 14px 0",background:th.card,border:"1px solid "+th.cardBorder,borderRadius:14,padding:"10px 14px"}}>
              <div style={{fontSize:9,color:th.accent,letterSpacing:"0.1em",marginBottom:4}}>● AZA AI</div>
              <div style={{fontSize:12,color:th.text,lineHeight:1.6}}>{motLoading?t.motivationLoading:motivation}</div>
            </div>
          )}

          {/* Hero card */}
          <div style={{margin:"10px 14px 0",background:th.heroGrad,border:"1px solid "+th.heroBorder,borderRadius:20,padding:"16px"}}>
            <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:8}}>
              <div style={{flex:1}}>
                <div style={{fontSize:8,fontWeight:700,letterSpacing:"0.18em",color:isLight?"rgba(255,255,255,0.7)":th.accent,marginBottom:5}}>{t.levelUp}</div>
                <div style={{fontSize:18,fontWeight:800,color:isLight?"#fff":th.text,lineHeight:1.25,marginBottom:5}}>{t.heroTitle}</div>
                <div style={{fontSize:9,color:isLight?"rgba(255,255,255,0.55)":th.text2,lineHeight:1.5}}>{t.heroDesc}</div>
              </div>
              <Ring pct={xpPct} value={curLvl.level} label={t.level} th={th}/>
            </div>
            <div style={{marginTop:12}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:5,fontSize:8}}>
                <span style={{color:isLight?"rgba(255,255,255,0.55)":th.text2}}>{t.xpProgress}</span>
                <span style={{color:isLight?"#fff":th.accent,fontWeight:700}}>{totalXP} / {nxtLvl.xpNeeded} XP</span>
              </div>
              <div style={{height:5,background:isLight?"rgba(255,255,255,0.2)":th.ringBg,borderRadius:3}}>
                <div style={{height:"100%",width:xpPct+"%",background:isLight?"rgba(255,255,255,0.9)":th.xpFill,borderRadius:3,boxShadow:isLight?"none":"0 0 6px "+th.ring}}/>
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div style={{display:"flex",gap:8,margin:"10px 14px 0"}}>
            {[
              {icon:"✓",val:todayHabits.length+"/"+habits.length,label:t.habitsToday,color:th.accent},
              {icon:"₸",val:fmtNum(mExp)+" ₸",label:t.expenses,color:th.text},
              {icon:"★",val:totalXP,label:t.totalXP,color:th.gold},
            ].map((s,i)=>(
              <div key={i} style={{flex:1,background:th.card,border:"1px solid "+th.cardBorder,borderRadius:14,padding:"9px 8px"}}>
                <div style={{width:26,height:26,borderRadius:8,background:"rgba(128,128,128,0.1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,marginBottom:4}}>{s.icon}</div>
                <div style={{fontSize:14,fontWeight:900,color:s.color}}>{s.val}</div>
                <div style={{fontSize:6.5,color:th.text3,marginTop:2}}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Today missions */}
          <div style={{margin:"14px 14px 0"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <span style={{fontSize:13,fontWeight:700,color:th.text}}>{t.todayMissions}</span>
              <span style={{fontSize:8,color:th.accent,cursor:"pointer"}} onClick={()=>setTab("habits")}>{t.allMissions}</span>
            </div>
            {habits.length===0&&<div style={{fontSize:12,color:th.text2,textAlign:"center",padding:"20px 0"}}>{t.noHabits}</div>}
            {habits.slice(0,4).map(h=>(
              <div key={h.id} onClick={()=>toggleHabit(h.id)} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",background:th.card,border:"1px solid "+th.cardBorder,borderRadius:14,marginBottom:7,cursor:"pointer"}}>
                <div style={{width:32,height:32,borderRadius:10,background:"rgba(128,128,128,0.1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>{h.icon}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:11,fontWeight:600,color:th.text}}>{h.name}</div>
                  <div style={{fontSize:8,color:th.accent,marginTop:1}}>+10 XP</div>
                </div>
                <div style={{width:20,height:20,borderRadius:"50%",border:"1.5px solid "+(h.checks[getToday()]?th.accent:th.text3),background:h.checks[getToday()]?th.accent:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:11,color:th.bg,transition:"all 0.2s"}}>
                  {h.checks[getToday()]?"✓":""}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── HABITS ── */}
      {tab==="habits"&&(
        <div style={{padding:"14px 14px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <div style={{fontSize:22,fontWeight:800,color:th.text}}>{t.habits}</div>
            <button onClick={()=>setShowHabitForm(true)} style={{background:th.accent,border:"none",borderRadius:10,padding:"6px 12px",color:th.bg,fontSize:11,fontWeight:700,cursor:"pointer"}}>{t.addHabit}</button>
          </div>
          {habits.length===0&&<div style={{textAlign:"center",padding:"40px 0",color:th.text2,fontSize:13}}>{t.noHabits}</div>}
          {habits.map(h=>{
            const streak=getStreak(h);
            const now=new Date();
            const dow=now.getDay();
            const mondayOffset = dow===0?-6:1-dow;
            const monday=new Date(now); monday.setDate(now.getDate()+mondayOffset); monday.setHours(0,0,0,0);
            const todayStr=getToday();
            const dayLabels=["Пн","Вт","Ср","Чт","Пт","Сб","Вс"];
            const weekDays=[...Array(7)].map((_,i)=>{
              const d=new Date(monday); d.setDate(monday.getDate()+i); return d;
            });
            return(
              <div key={h.id} style={{background:th.card,border:"1px solid "+th.cardBorder,borderRadius:18,padding:"14px 16px",marginBottom:12}}>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
                  <div style={{width:40,height:40,borderRadius:12,background:"rgba(128,128,128,0.1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{h.icon}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:14,fontWeight:800,color:th.text,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{h.name}</div>
                  </div>
                  {streak>0&&(
                    <div style={{padding:"4px 10px",borderRadius:20,background:"rgba(255,184,0,0.12)",border:"1px solid rgba(255,184,0,0.4)",display:"flex",alignItems:"center",gap:4,flexShrink:0}}>
                      <span style={{fontSize:12}}>🔥</span>
                      <span style={{fontSize:12,fontWeight:800,color:th.gold}}>{streak}</span>
                    </div>
                  )}
                  <button onClick={(e)=>{e.stopPropagation();deleteHabit(h.id);}} style={{background:"none",border:"none",color:th.text3,fontSize:15,cursor:"pointer",padding:"0 0 0 2px",flexShrink:0}}>✕</button>
                </div>
                <div style={{display:"flex",gap:6}}>
                  {weekDays.map((d,i)=>{
                    const key=d.toISOString().slice(0,10);
                    const done=!!h.checks[key];
                    const isToday=key===todayStr;
                    const isFuture=key>todayStr;
                    return(
                      <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                        <div onClick={isToday?()=>toggleHabit(h.id):undefined} style={{
                          width:"100%",aspectRatio:"1",borderRadius:8,
                          display:"flex",alignItems:"center",justifyContent:"center",
                          cursor:isToday?"pointer":"default",
                          background:done?th.accent:(isFuture?"rgba(128,128,128,0.05)":"rgba(128,128,128,0.12)"),
                          border:isToday&&!done?"2px solid "+th.accent:"none",
                          color:done?th.bg:th.text3,
                          fontSize:13,fontWeight:800,
                          transition:"all 0.2s",boxSizing:"border-box"
                        }}>
                          {done?"✓":(isToday?"+":"")}
                        </div>
                        <span style={{fontSize:8,color:isToday?th.accent:th.text3,fontWeight:isToday?800:400}}>{dayLabels[i]}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
          {/* Habit form modal */}
          {showHabitForm&&(
            <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",zIndex:600,display:"flex",alignItems:"flex-end"}}>
              <div style={{width:"100%",maxWidth:500,margin:"0 auto",background:th.bg2,borderRadius:"20px 20px 0 0",padding:"20px 18px 32px"}}>
                <div style={{fontSize:16,fontWeight:800,color:th.text,marginBottom:16}}>{t.addHabit}</div>
                <input value={habitName} onChange={e=>setHabitName(e.target.value)} placeholder={t.habitName}
                  style={{width:"100%",padding:"12px 14px",background:th.card,border:"1px solid "+th.cardBorder,borderRadius:12,color:th.text,fontSize:14,fontFamily:"inherit",outline:"none",boxSizing:"border-box",marginBottom:10}}/>
                <div style={{marginBottom:10}}>
                  <div style={{fontSize:10,color:th.text2,marginBottom:6}}>Иконка</div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                    {iconOptions.map(ic=>(
                      <div key={ic} onClick={()=>setHabitIcon(ic)} style={{width:36,height:36,borderRadius:9,background:habitIcon===ic?th.accent:"rgba(128,128,128,0.1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,cursor:"pointer",border:"1px solid "+(habitIcon===ic?th.accent:th.cardBorder)}}>{ic}</div>
                    ))}
                  </div>
                </div>
                <div style={{display:"flex",gap:10,marginTop:14}}>
                  <button onClick={()=>setShowHabitForm(false)} style={{flex:1,padding:"12px",background:th.card,border:"1px solid "+th.cardBorder,borderRadius:12,color:th.text,fontSize:14,cursor:"pointer",fontFamily:"inherit"}}>{t.cancel}</button>
                  <button onClick={addHabit} style={{flex:2,padding:"12px",background:th.accent,border:"none",borderRadius:12,color:th.bg,fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>{t.save}</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TASKS ── */}
      {tab==="tasks"&&(
        <div style={{padding:"14px 14px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <div style={{fontSize:22,fontWeight:800,color:th.text}}>{t.tasks}</div>
            <div style={{display:"flex",gap:8}}>
              <button onClick={recording?stopVoiceTask:startVoiceTask} disabled={transcribing} style={{
                background:recording?"#FF4D4D":th.card,
                border:"1px solid "+(recording?"#FF4D4D":th.cardBorder),
                borderRadius:10,padding:"6px 12px",
                color:recording?"#fff":th.text,fontSize:13,cursor:transcribing?"default":"pointer",
                opacity:transcribing?0.6:1,transition:"all 0.15s",
                display:"flex",alignItems:"center",gap:5
              }}>
                {transcribing?"⏳":(recording?"⏹ Стоп":"🎤 Голосом")}
              </button>
              <button onClick={()=>setShowTaskForm(true)} style={{background:th.accent,border:"none",borderRadius:10,padding:"6px 12px",color:th.bg,fontSize:11,fontWeight:700,cursor:"pointer"}}>{t.addTask}</button>
            </div>
          </div>
          {/* Stats */}
          <div style={{display:"flex",gap:8,marginBottom:14}}>
            {[
              {label:t.active,val:tasks.filter(t=>!t.done).length,c:th.accent},
              {label:t.done,val:tasks.filter(t=>t.done).length,c:th.gold},
              {label:t.overdue,val:tasks.filter(t=>isOverdue(t)).length,c:"#FF4D4D"},
            ].map((s,i)=>(
              <div key={i} style={{flex:1,background:th.card,border:"1px solid "+th.cardBorder,borderRadius:12,padding:"8px",textAlign:"center"}}>
                <div style={{fontSize:18,fontWeight:900,color:s.c}}>{s.val}</div>
                <div style={{fontSize:7,color:th.text3}}>{s.label}</div>
              </div>
            ))}
          </div>
          {/* Analytics widget */}
          {tasks.length>0&&(()=>{
            const done=tasks.filter(t=>t.done).length;
            const total=tasks.length;
            const active=tasks.filter(t=>!t.done&&!isOverdue(t)).length;
            const over=tasks.filter(t=>isOverdue(t)).length;
            const pct=total?Math.round(done/total*100):0;
            const r=26,circ=2*Math.PI*r;
            const offset=circ-(pct/100)*circ;
            const byPrio=["high","medium","low"].map(p=>({
              p,
              total:tasks.filter(t=>t.priority===p).length,
              done:tasks.filter(t=>t.priority===p&&t.done).length,
              color:p==="high"?"#FF4D4D":p==="medium"?th.gold:th.accent,
              label:t[p]
            })).filter(x=>x.total>0);
            return(
              <div style={{background:th.card,border:"1px solid "+th.cardBorder,borderRadius:18,padding:14,marginBottom:14}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                  <span style={{fontSize:12,fontWeight:700,color:th.text}}>📋 Аналитика задач</span>
                  <span style={{fontSize:8,color:th.accent,letterSpacing:"0.1em"}}>ВСЕГО</span>
                </div>
                {/* Progress circle + stats */}
                <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:12,padding:10,background:"rgba(128,128,128,0.05)",borderRadius:12}}>
                  <div style={{position:"relative",width:64,height:64,flexShrink:0}}>
                    <svg width="64" height="64" viewBox="0 0 64 64" style={{transform:"rotate(-90deg)"}}>
                      <circle cx="32" cy="32" r={r} fill="none" stroke={th.ringBg} strokeWidth="5"/>
                      <circle cx="32" cy="32" r={r} fill="none" stroke={th.accent} strokeWidth="5"
                        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"/>
                    </svg>
                    <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
                      <span style={{fontSize:14,fontWeight:900,color:th.accent}}>{pct}%</span>
                    </div>
                  </div>
                  <div>
                    <div style={{fontSize:20,fontWeight:900,color:th.text}}>{done} <span style={{fontSize:11,color:th.text2,fontWeight:400}}>из {total}</span></div>
                    <div style={{fontSize:9,color:th.text2,marginTop:1}}>выполнено задач</div>
                    <div style={{display:"flex",gap:8,marginTop:5}}>
                      <span style={{fontSize:8,color:"#4AFF6A"}}>✓ {done}</span>
                      {over>0&&<span style={{fontSize:8,color:"#FF6B6B"}}>✕ {over} просроч.</span>}
                      <span style={{fontSize:8,color:th.text3}}>○ {active} акт.</span>
                    </div>
                  </div>
                </div>
                {/* By priority */}
                {byPrio.length>0&&<>
                  <div style={{fontSize:8,fontWeight:700,color:th.text3,letterSpacing:"0.12em",marginBottom:7}}>ПО ПРИОРИТЕТУ</div>
                  {byPrio.map(({p,total:tot,done:dn,color,label})=>(
                    <div key={p} style={{marginBottom:7}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                        <div style={{display:"flex",alignItems:"center",gap:5}}>
                          <div style={{width:7,height:7,borderRadius:"50%",background:color}}/>
                          <span style={{fontSize:10,fontWeight:600,color:th.text}}>{label}</span>
                        </div>
                        <span style={{fontSize:10,color:th.text2}}>{dn} из {tot}</span>
                      </div>
                      <div style={{height:4,background:color+"22",borderRadius:2}}>
                        <div style={{width:(tot?dn/tot*100:0)+"%",height:"100%",background:color,borderRadius:2,transition:"width 0.4s"}}/>
                      </div>
                    </div>
                  ))}
                </>}
              </div>
            );
          })()}

          {tasks.length===0&&<div style={{textAlign:"center",padding:"40px 0",color:th.text2,fontSize:13}}>{t.noTasks}</div>}
          {tasks.map(tk=>{
            const prioColor={high:"#FF4D4D",medium:th.gold,low:th.accent}[tk.priority]||th.accent;
            return(
              <div key={tk.id} style={{background:th.card,border:"1px solid "+th.cardBorder,borderRadius:14,padding:"12px 14px",marginBottom:8,display:"flex",alignItems:"center",gap:10,opacity:tk.done?0.5:1}}>
                <div onClick={()=>toggleTask(tk.id)} style={{width:22,height:22,borderRadius:"50%",border:"2px solid "+(tk.done?th.accent:th.cardBorder),background:tk.done?th.accent:"transparent",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0,fontSize:11,color:th.bg}}>{tk.done?"✓":""}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:12,fontWeight:600,color:th.text,textDecoration:tk.done?"line-through":"none"}}>{tk.title}</div>
                  <div style={{display:"flex",gap:8,marginTop:2,alignItems:"center"}}>
                    <span style={{fontSize:8,color:prioColor,fontWeight:700}}>● {t[tk.priority]}</span>
                    {tk.deadline&&<span style={{fontSize:8,color:isOverdue(tk)?"#FF4D4D":th.text3}}>{tk.deadline}</span>}
                  </div>
                </div>
                <button onClick={()=>deleteTask(tk.id)} style={{background:"none",border:"none",color:th.text3,fontSize:16,cursor:"pointer"}}>✕</button>
              </div>
            );
          })}
          {showTaskForm&&(
            <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",zIndex:600,display:"flex",alignItems:"flex-end"}}>
              <div style={{width:"100%",maxWidth:500,margin:"0 auto",background:th.bg2,borderRadius:"20px 20px 0 0",padding:"20px 18px 32px"}}>
                <div style={{fontSize:16,fontWeight:800,color:th.text,marginBottom:16}}>{t.addTask}</div>
                <div style={{display:"flex",gap:8,marginBottom:10}}>
                  <input value={taskTitle} onChange={e=>setTaskTitle(e.target.value)} placeholder={t.taskTitle}
                    style={{flex:1,padding:"12px 14px",background:th.card,border:"1px solid "+th.cardBorder,borderRadius:12,color:th.text,fontSize:14,fontFamily:"inherit",outline:"none",boxSizing:"border-box"}}/>
                  <button onClick={recording?stopVoiceTask:startVoiceTask} disabled={transcribing} style={{
                    width:46,flexShrink:0,borderRadius:12,
                    background:recording?"#FF4D4D":th.card,
                    border:"1px solid "+(recording?"#FF4D4D":th.cardBorder),
                    color:recording?"#fff":th.text,fontSize:16,cursor:transcribing?"default":"pointer",
                    opacity:transcribing?0.6:1
                  }}>{transcribing?"⏳":(recording?"⏹":"🎤")}</button>
                </div>
                <div style={{display:"flex",gap:8,marginBottom:10}}>
                  {["high","medium","low"].map(p=>(
                    <div key={p} onClick={()=>setTaskPrio(p)} style={{flex:1,padding:"8px",textAlign:"center",borderRadius:10,cursor:"pointer",fontSize:11,fontWeight:700,
                      background:taskPrio===p?th.accent:th.card,color:taskPrio===p?th.bg:th.text2,border:"1px solid "+th.cardBorder}}>{t[p]}</div>
                  ))}
                </div>
                <input type="date" value={taskDeadline} onChange={e=>setTaskDeadline(e.target.value)}
                  style={{width:"100%",padding:"12px 14px",background:th.card,border:"1px solid "+th.cardBorder,borderRadius:12,color:th.text,fontSize:14,fontFamily:"inherit",outline:"none",boxSizing:"border-box",marginBottom:14}}/>
                <div style={{display:"flex",gap:10}}>
                  <button onClick={()=>setShowTaskForm(false)} style={{flex:1,padding:"12px",background:th.card,border:"1px solid "+th.cardBorder,borderRadius:12,color:th.text,fontSize:14,cursor:"pointer",fontFamily:"inherit"}}>{t.cancel}</button>
                  <button onClick={addTask} style={{flex:2,padding:"12px",background:th.accent,border:"none",borderRadius:12,color:th.bg,fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>{t.save}</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── FINANCE ── */}
      {tab==="finance"&&(
        <div style={{padding:"14px 14px"}}>
          {/* Quick input */}
          <div style={{background:th.card,border:"1px solid "+th.cardBorder,borderRadius:18,padding:"14px",marginBottom:12}}>
            <div style={{fontSize:8,fontWeight:700,color:th.accent,letterSpacing:"0.15em",marginBottom:4}}>⚡ ЗАПИСЬ ЗА 5 СЕКУНД</div>
            <div style={{fontSize:13,fontWeight:700,color:th.text,marginBottom:10}}>Быстрый ввод расходов</div>
            <div style={{display:"flex",gap:8,marginBottom:quickParsed.length?10:0}}>
              <input
                value={quickInput}
                onChange={e=>{setQuickInput(e.target.value);parseQuick(e.target.value);}}
                onKeyDown={e=>e.key==="Enter"&&saveQuick()}
                placeholder="кофе 1200, такси 2000"
                style={{flex:1,padding:"11px 13px",background:th.bg,border:"1px solid "+th.cardBorder,borderRadius:12,color:th.text,fontSize:13,fontFamily:"inherit",outline:"none"}}
              />
              <button onClick={saveQuick} disabled={!quickParsed.length} style={{
                padding:"11px 16px",borderRadius:12,border:"none",cursor:quickParsed.length?"pointer":"default",
                background:quickParsed.length?th.gold:"rgba(128,128,128,0.15)",
                color:quickParsed.length?"#000":th.text3,fontWeight:800,fontSize:13,fontFamily:"inherit",whiteSpace:"nowrap",
                transition:"all 0.2s"
              }}>Сохранить</button>
            </div>
            {quickParsed.length>0&&(
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7}}>
                {quickParsed.map((p,i)=>(
                  <div key={i} style={{background:th.bg,border:"1px solid "+th.cardBorder,borderRadius:12,padding:"10px 12px"}}>
                    <div style={{fontSize:14,marginBottom:3}}>{p.icon} <span style={{fontSize:12,fontWeight:600,color:th.text}}>{p.name.charAt(0).toUpperCase()+p.name.slice(1)}</span></div>
                    <div style={{fontSize:13,fontWeight:800,color:"#FF6B6B"}}>−{new Intl.NumberFormat("ru-RU").format(p.amount)} ₸</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <div style={{fontSize:22,fontWeight:800,color:th.text}}>{t.finance}</div>
            <button onClick={()=>setShowTxnForm(true)} style={{background:th.accent,border:"none",borderRadius:10,padding:"6px 12px",color:th.bg,fontSize:11,fontWeight:700,cursor:"pointer"}}>{t.addTxn}</button>
          </div>
          {/* Balance */}
          <div style={{background:th.heroGrad,border:"1px solid "+th.heroBorder,borderRadius:18,padding:"16px",marginBottom:12}}>
            <div style={{fontSize:9,color:isLight?"rgba(255,255,255,0.6)":th.text2,letterSpacing:"0.1em",marginBottom:4}}>{t.balance}</div>
            <div style={{fontSize:28,fontWeight:900,color:isLight?"#fff":th.accent}}>
              {mInc-mExp>=0?"+":"-"}{fmtNum(Math.abs(mInc-mExp))} ₸
            </div>
            <div style={{display:"flex",gap:16,marginTop:8,fontSize:10}}>
              <span style={{color:isLight?"rgba(255,255,255,0.7)":"#4AFF6A"}}>↑ {fmtNum(mInc)} ₸</span>
              <span style={{color:isLight?"rgba(255,255,255,0.7)":"#FF6B6B"}}>↓ {fmtNum(mExp)} ₸</span>
            </div>
          </div>
          {/* Chart */}
          {txns.length>0&&(
            <div style={{background:th.card,border:"1px solid "+th.cardBorder,borderRadius:16,padding:"12px",marginBottom:12}}>
              <ResponsiveContainer width="100%" height={120}>
                <PieChart>
                  <Pie data={[{name:t.income,value:mInc||0.01},{name:t.expense,value:mExp||0.01}]} cx="50%" cy="50%" outerRadius={50} dataKey="value">
                    <Cell fill={th.accent}/><Cell fill="#FF6B6B"/>
                  </Pie>
                  <Tooltip formatter={(v)=>fmtNum(v)+" ₸"}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
          {/* Txn list */}
          {txns.length===0&&<div style={{textAlign:"center",padding:"30px 0",color:th.text2,fontSize:13}}>{t.noTxns}</div>}
          {txns.slice(0,20).map(tx=>(
            <div key={tx.id} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",background:th.card,border:"1px solid "+th.cardBorder,borderRadius:12,marginBottom:7}}>
              <div style={{width:32,height:32,borderRadius:10,background:tx.type==="income"?"rgba(74,255,106,0.15)":tx.type==="expense"?"rgba(255,107,107,0.15)":"rgba(0,180,255,0.15)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>
                {tx.type==="income"?"💰":tx.type==="expense"?"💸":"🏦"}
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:11,fontWeight:600,color:th.text}}>{tx.note||t[tx.type]}</div>
                <div style={{fontSize:9,color:th.text3}}>{tx.date}</div>
              </div>
              <div style={{fontSize:13,fontWeight:800,color:tx.type==="income"?"#4AFF6A":tx.type==="expense"?"#FF6B6B":"#00B4FF"}}>
                {tx.type==="income"?"+":"-"}{fmtNum(tx.amount)} ₸
              </div>
            </div>
          ))}
          {showTxnForm&&(
            <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",zIndex:600,display:"flex",alignItems:"flex-end"}}>
              <div style={{width:"100%",maxWidth:500,margin:"0 auto",background:th.bg2,borderRadius:"20px 20px 0 0",padding:"20px 18px 32px"}}>
                <div style={{fontSize:16,fontWeight:800,color:th.text,marginBottom:16}}>+ {t.addTxn.replace("+ ","")}</div>
                <div style={{display:"flex",gap:8,marginBottom:12}}>
                  {["income","expense","deposit"].map(tp=>(
                    <div key={tp} onClick={()=>setTxnType(tp)} style={{flex:1,padding:"8px",textAlign:"center",borderRadius:10,cursor:"pointer",fontSize:10,fontWeight:700,
                      background:txnType===tp?th.accent:th.card,color:txnType===tp?th.bg:th.text2,border:"1px solid "+th.cardBorder}}>{t[tp]}</div>
                  ))}
                </div>
                <input value={txnAmount} onChange={e=>setTxnAmount(e.target.value)} placeholder={t.amount} type="number"
                  style={{width:"100%",padding:"12px 14px",background:th.card,border:"1px solid "+th.cardBorder,borderRadius:12,color:th.text,fontSize:14,fontFamily:"inherit",outline:"none",boxSizing:"border-box",marginBottom:10}}/>
                <input value={txnNote} onChange={e=>setTxnNote(e.target.value)} placeholder="Описание (необязательно)"
                  style={{width:"100%",padding:"12px 14px",background:th.card,border:"1px solid "+th.cardBorder,borderRadius:12,color:th.text,fontSize:14,fontFamily:"inherit",outline:"none",boxSizing:"border-box",marginBottom:14}}/>
                <div style={{display:"flex",gap:10}}>
                  <button onClick={()=>setShowTxnForm(false)} style={{flex:1,padding:"12px",background:th.card,border:"1px solid "+th.cardBorder,borderRadius:12,color:th.text,fontSize:14,cursor:"pointer",fontFamily:"inherit"}}>{t.cancel}</button>
                  <button onClick={addTxn} style={{flex:2,padding:"12px",background:th.accent,border:"none",borderRadius:12,color:th.bg,fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>{t.save}</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── PROFILE ── */}
      {tab==="profile"&&(
        <div style={{padding:"14px 14px"}}>
          {/* User card */}
          <div style={{background:th.heroGrad,border:"1px solid "+th.heroBorder,borderRadius:20,padding:"20px 16px",marginBottom:16,display:"flex",alignItems:"center",gap:14}}>
            <div style={{width:60,height:60,borderRadius:20,background:th.accent+"22",border:"2px solid "+th.accent,display:"flex",alignItems:"center",justifyContent:"center",fontSize:28}}>
              {curLvl.icon}
            </div>
            <div>
              <div style={{fontSize:20,fontWeight:900,color:isLight?"#fff":th.text}}>{userName}</div>
              <div style={{fontSize:11,color:isLight?"rgba(255,255,255,0.65)":th.accent}}>LV.{curLvl.level} — {curLvl.name}</div>
              <div style={{fontSize:10,color:isLight?"rgba(255,255,255,0.5)":th.text2,marginTop:2}}>{totalXP} XP</div>
            </div>
          </div>

          {/* Badges */}
          <div style={{background:th.card,border:"1px solid "+th.cardBorder,borderRadius:16,padding:"14px",marginBottom:12}}>
            <div style={{fontSize:12,fontWeight:700,color:th.text,marginBottom:10}}>{t.badges}</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
              {BADGES.map(b=>{
                const earned=b.check(habits,tasks,totalXP);
                return(
                  <div key={b.id} style={{padding:"6px 10px",borderRadius:10,background:earned?th.accent+"22":"rgba(128,128,128,0.08)",border:"1px solid "+(earned?th.accent:"rgba(128,128,128,0.15)"),display:"flex",alignItems:"center",gap:5,opacity:earned?1:0.4}}>
                    <span style={{fontSize:14}}>{b.icon}</span>
                    <span style={{fontSize:9,color:earned?th.accent:th.text3,fontWeight:600}}>{b.name}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Theme select */}
          <div style={{background:th.card,border:"1px solid "+th.cardBorder,borderRadius:16,padding:"14px",marginBottom:12}}>
            <div style={{fontSize:12,fontWeight:700,color:th.text,marginBottom:10}}>{t.theme}</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              {Object.entries(THEMES).map(([key,thm])=>(
                <div key={key} onClick={()=>setThemeName(key)} style={{
                  padding:"10px",borderRadius:12,cursor:"pointer",
                  background:thm.bg,border:"2px solid "+(themeName===key?thm.accent:"transparent"),
                  display:"flex",alignItems:"center",gap:8,
                }}>
                  <div style={{width:20,height:20,borderRadius:6,background:thm.accent}}/>
                  <span style={{fontSize:10,fontWeight:700,color:thm.text}}>{t.themes[key]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Language select */}
          <div style={{background:th.card,border:"1px solid "+th.cardBorder,borderRadius:16,padding:"14px",marginBottom:12}}>
            <div style={{fontSize:12,fontWeight:700,color:th.text,marginBottom:10}}>{t.language}</div>
            <div style={{display:"flex",gap:8}}>
              {["ru","kk","en"].map(l=>(
                <div key={l} onClick={()=>setLang(l)} style={{
                  flex:1,padding:"8px",textAlign:"center",borderRadius:10,cursor:"pointer",
                  background:lang===l?th.accent:th.card,color:lang===l?th.bg:th.text2,
                  border:"1px solid "+th.cardBorder,fontSize:11,fontWeight:700,
                }}>{t.langs[l]}</div>
              ))}
            </div>
          </div>

          {/* Notifications */}
          <div style={{background:th.card,border:"1px solid "+th.cardBorder,borderRadius:16,padding:"14px",marginBottom:12}}>
            <div style={{fontSize:12,fontWeight:700,color:th.text,marginBottom:6}}>🔔 Уведомления (5 раз в день)</div>
            <div style={{fontSize:10,color:th.text2,marginBottom:10}}>07:00 · 10:00 · 13:00 · 17:00 · 21:00</div>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <span style={{fontSize:11,color:notifEnabled?th.accent:th.text3}}>{notifEnabled?"● Включено":"○ Выключено"}</span>
              <div onClick={async()=>{
                if(!notifEnabled){
                  const ok = await enableNotifications();
                  if(ok){
                    setNotifEnabled(true);
                    localStorage.setItem("nl-notif","true");
                    scheduleAllNotifications(userName,lang);
                  }
                } else {
                  setNotifEnabled(false);
                  localStorage.setItem("nl-notif","false");
                }
              }} style={{
                width:44,height:24,borderRadius:12,
                background:notifEnabled?th.accent:"rgba(128,128,128,0.2)",
                position:"relative",cursor:"pointer",transition:"background 0.2s"
              }}>
                <div style={{position:"absolute",top:2,left:notifEnabled?22:2,width:20,height:20,borderRadius:"50%",background:"#fff",transition:"left 0.2s",boxShadow:"0 1px 4px rgba(0,0,0,0.3)"}}/>
              </div>
            </div>
          </div>

          {/* Excel Export with period selector */}
          <div style={{background:th.card,border:"1px solid "+th.cardBorder,borderRadius:16,padding:14,marginBottom:12}}>
            <div style={{fontSize:12,fontWeight:700,color:th.text,marginBottom:10}}>📊 Экспорт аналитики (Excel)</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:10}}>
              {[{k:"week",l:"Неделя"},{k:"month",l:"Месяц"},{k:"quarter",l:"Квартал"},{k:"year",l:"Год"}].map(({k,l})=>(
                <div key={k} onClick={()=>setExportPeriod(k)} style={{
                  padding:"8px",textAlign:"center",borderRadius:10,cursor:"pointer",
                  background:exportPeriod===k?th.accent:th.card,
                  color:exportPeriod===k?th.bg:th.text2,
                  border:"1px solid "+(exportPeriod===k?th.accent:th.cardBorder),
                  fontSize:11,fontWeight:exportPeriod===k?800:400,transition:"all 0.15s"
                }}>{l}</div>
              ))}
            </div>
            <div onClick={()=>setExportPeriod("custom")} style={{
              padding:"8px",textAlign:"center",borderRadius:10,cursor:"pointer",
              background:exportPeriod==="custom"?th.accent:th.card,
              color:exportPeriod==="custom"?th.bg:th.text2,
              border:"1px solid "+(exportPeriod==="custom"?th.accent:th.cardBorder),
              fontSize:11,fontWeight:exportPeriod==="custom"?800:400,marginBottom:8,transition:"all 0.15s"
            }}>📅 Произвольный диапазон</div>
            {exportPeriod==="custom"&&(
              <div style={{display:"flex",gap:8,marginBottom:8}}>
                <input type="date" value={dateFrom} onChange={e=>setDateFrom(e.target.value)}
                  style={{flex:1,padding:"7px 10px",background:th.bg,border:"1px solid "+th.cardBorder,borderRadius:10,color:th.text,fontSize:11,fontFamily:"inherit",outline:"none"}}/>
                <input type="date" value={dateTo} onChange={e=>setDateTo(e.target.value)}
                  style={{flex:1,padding:"7px 10px",background:th.bg,border:"1px solid "+th.cardBorder,borderRadius:10,color:th.text,fontSize:11,fontFamily:"inherit",outline:"none"}}/>
              </div>
            )}
            <button disabled={exporting} onClick={async()=>{
              setExporting(true);
              try{
                await buildExcelReport({habits,tasks,txns,period:exportPeriod,customFrom:dateFrom,customTo:dateTo,userName});
              }catch(e){
                alert("Не удалось сформировать отчёт: "+e.message);
              }finally{
                setExporting(false);
              }
            }} style={{width:"100%",padding:"12px",background:th.accent,border:"none",borderRadius:12,color:th.bg,fontSize:13,fontWeight:800,cursor:exporting?"default":"pointer",fontFamily:"inherit",opacity:exporting?0.6:1}}>
              {exporting?"⏳ Формирую отчёт…":"⬇️ Скачать Excel"}
            </button>
          </div>

          {/* Reset */}
          <button onClick={()=>{if(window.confirm("Сбросить все данные?")){localStorage.clear();window.location.reload();}}} style={{width:"100%",padding:"12px",background:"rgba(255,70,70,0.1)",border:"1px solid rgba(255,70,70,0.3)",borderRadius:14,color:"#FF4646",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
            🗑 Сбросить данные
          </button>
        </div>
      )}

      {/* ── AZA BUTTON ── */}
      <button onClick={()=>setAzaOpen(o=>!o)} style={{
        position:"fixed",bottom:82,right:16,
        border:"none",background:"none",cursor:"pointer",zIndex:200,
        padding:0,transition:"transform 0.2s",
        transform:azaOpen?"rotate(45deg)":"rotate(0deg)"
      }}>
        {azaOpen
          ? <div style={{width:54,height:54,borderRadius:"50%",background:th.bg,border:"2px solid rgba(255,255,255,0.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,color:th.text,boxShadow:"0 4px 20px rgba(0,0,0,0.4)"}}>✕</div>
          : <div style={{position:"relative"}}>
              <div style={{position:"absolute",inset:-4,borderRadius:"50%",background:"radial-gradient(circle,"+th.accent+"33,transparent)",filter:"blur(6px)"}}/>
              <div style={{width:54,height:54,borderRadius:"50%",background:th.bg,border:"2.5px solid "+th.accent,boxShadow:"0 0 18px "+th.logoGlow+",0 4px 20px rgba(0,0,0,0.4)",display:"flex",alignItems:"center",justifyContent:"center",position:"relative"}}>
                <img src={SHIELD_URL} style={{width:30,height:33,objectFit:"contain",filter:"drop-shadow(0 0 5px "+th.accent+")"}}/>
              </div>
              <div style={{position:"absolute",bottom:1,right:1,width:13,height:13,borderRadius:"50%",background:"#39FF14",border:"2px solid "+th.bg,boxShadow:"0 0 8px rgba(57,255,20,0.9)"}}/>
            </div>
        }
      </button>

      {/* ── AZA CHAT ── */}
      <AzaChat open={azaOpen} onClose={()=>setAzaOpen(false)} th={th} t={t} userName={userName} habits={habits} tasks={tasks} txns={txns} totalXP={totalXP} curLvl={curLvl}/>

      {/* ── NAV ── */}
      <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:500,background:th.nav,borderTop:"1px solid "+th.navBorder,display:"flex",padding:"8px 0 12px",zIndex:100}}>
        {navItems.map(n=>(
          <button key={n.id} onClick={()=>setTab(n.id)} style={{flex:1,background:"none",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:3,padding:0,fontFamily:"inherit"}}>
            <span style={{fontSize:17,filter:tab===n.id?"drop-shadow(0 0 4px "+th.accent+")":"none",transition:"all 0.2s"}}>{n.icon}</span>
            <span style={{fontSize:7,color:tab===n.id?th.accent:th.text3,fontWeight:tab===n.id?700:400,transition:"color 0.2s"}}>{n.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
