import { auth, db } from "./firebase.js";
import { CONFIG } from "./config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import {
  collection, query, orderBy, getDocs,
  doc, updateDoc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const gate = document.getElementById("gate");
const adminUI = document.getElementById("adminUI");
const list = document.getElementById("list");
const msg = document.getElementById("msg");

const statusFilter = document.getElementById("statusFilter");
const dateFilter = document.getElementById("dateFilter");
const qInput = document.getElementById("q");

function setMsg(t, ok=false){
  msg.textContent = t;
  msg.className = ok ? "msg ok" : "msg";
}
function isAdmin(email){
  const e = (email||"").toLowerCase();
  return (CONFIG.adminEmails||[]).map(x=>String(x).toLowerCase()).includes(e);
}
function safe(x){ return (x||"").toString().replace(/[<>]/g,""); }

let all = [];

async function loadAll(){
  setMsg("جاري تحميل الحجوزات...");
  const qy = query(collection(db, "bookings"), orderBy("createdAt","desc"));
  const snap = await getDocs(qy);
  all = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  setMsg(`تم تحميل ${all.length} حجز.`, true);
  render();
}

function render(){
  const sf = (statusFilter.value||"").toLowerCase();
  const df = (dateFilter.value||"").trim();
  const qq = (qInput.value||"").trim().toLowerCase();

  const filtered = all.filter(b=>{
    const st = (b.status||"pending").toLowerCase();
    const okS = !sf || st === sf;
    const okD = !df || b.date === df;
    const blob = `${b.name||""} ${b.phone||""} ${b.email||""}`.toLowerCase();
    const okQ = !qq || blob.includes(qq);
    return okS && okD && okQ;
  });

  if (!filtered.length){
    list.innerHTML = `<div class="card"><p class="muted">لا توجد نتائج.</p></div>`;
    return;
  }

  list.innerHTML = filtered.map(b=>{
    const dur = b.durationMinutes === 90 ? "90 دقيقة" : "60 دقيقة";
    const st = (b.status||"pending").toLowerCase();
    return `
      <div class="card">
        <h3>${safe(b.name)} <span class="tag">${safe(st)}</span></h3>
        <p class="muted">📅 ${safe(b.date)} • ⏰ ${safe(b.time)} • ⏳ ${dur}</p>
        <p class="muted">📞 ${safe(b.phone)} • ✉️ ${safe(b.email)}</p>
        <div class="row" style="justify-content:space-between;align-items:center">
          <strong>${safe(b.finalPrice)} جنيه</strong>
          <div class="row">
            <button class="btn small" data-act="confirm" data-id="${b.id}">تأكيد</button>
            <button class="btn small dark" data-act="cancel" data-id="${b.id}">إلغاء</button>
          </div>
        </div>
      </div>
    `;
  }).join("");
}

list.addEventListener("click", async (e)=>{
  const btn = e.target.closest("button[data-act]");
  if (!btn) return;
  const id = btn.getAttribute("data-id");
  const act = btn.getAttribute("data-act");

  const user = auth.currentUser;
  if (!user || !isAdmin(user.email)) return setMsg("ليس لديك صلاحية.", false);

  const newStatus = act === "confirm" ? "confirmed" : "cancelled";
  setMsg("جاري التحديث...");
  try{
    await updateDoc(doc(db,"bookings", id), { status: newStatus, updatedAt: serverTimestamp() });
    const idx = all.findIndex(x=>x.id===id);
    if (idx>=0) all[idx].status = newStatus;
    setMsg("تم ✅", true);
    render();
  }catch(err){
    console.error(err);
    setMsg("تعذر التحديث. راجع Firestore Rules.");
  }
});

statusFilter.addEventListener("change", render);
dateFilter.addEventListener("change", render);
qInput.addEventListener("input", render);

onAuthStateChanged(auth, async (user)=>{
  if (!user){
    gate.innerHTML = `<p class="muted">لازم تسجل دخول أولاً.</p>
      <a class="btn primary" href="login.html" onclick="localStorage.setItem('heba_redirect_after_login','admin.html')">تسجيل الدخول</a>`;
    adminUI.style.display = "none";
    return;
  }
  if (!isAdmin(user.email)){
    gate.innerHTML = `<p class="muted">هذا الحساب ليس أدمن.</p>`;
    adminUI.style.display = "none";
    return;
  }
  gate.style.display = "none";
  adminUI.style.display = "block";
  await loadAll();
});
