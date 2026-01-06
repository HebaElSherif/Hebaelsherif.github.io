
export const CAIRO_TZ = "Africa/Cairo";

export function $(sel, root=document){ return root.querySelector(sel); }
export function $all(sel, root=document){ return Array.from(root.querySelectorAll(sel)); }

export function showToast(msg){
  const t = document.getElementById("toast");
  if (!t) return alert(msg);
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(showToast._tm);
  showToast._tm = setTimeout(()=>t.classList.remove("show"), 3600);
}

export function pad2(n){ return String(n).padStart(2,"0"); }

export function formatMoneyEGP(amount, lang){
  const locale = lang === "en" ? "en-EG" : "ar-EG";
  try{
    return new Intl.NumberFormat(locale, { style:"currency", currency:"EGP", maximumFractionDigits:0 }).format(amount);
  }catch{
    return amount + " EGP";
  }
}

export function toISODate(d){
  // d is Date in local, return YYYY-MM-DD
  return `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`;
}

export function parseISODate(yyyy_mm_dd){
  const [y,m,day] = yyyy_mm_dd.split("-").map(Number);
  return new Date(y, m-1, day, 0,0,0,0);
}

export function weekdayName(d, lang){
  const locale = lang === "en" ? "en-EG" : "ar-EG";
  return new Intl.DateTimeFormat(locale, { weekday:"long" }).format(d);
}

export function timeLabel(minutes, lang){
  const h = Math.floor(minutes/60);
  const m = minutes % 60;
  const d = new Date();
  d.setHours(h, m, 0, 0);
  const locale = lang === "en" ? "en-EG" : "ar-EG";
  return new Intl.DateTimeFormat(locale, { hour:"2-digit", minute:"2-digit" }).format(d);
}

export function ensureNoSelectAntiCopy(){
  // Lightweight anti-copy (not perfect; just reduces casual copy).
  document.addEventListener("contextmenu", (e)=> e.preventDefault());
  document.addEventListener("copy", (e)=> {
    // allow copy in inputs only
    const t = e.target;
    const ok = t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA");
    if (!ok) { e.preventDefault(); showToast("النسخ غير متاح هنا"); }
  });
}
