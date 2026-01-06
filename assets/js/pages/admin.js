import { auth, db } from "../firebase.js";
import { APP_ADMIN_EMAILS } from "../app.js";
import {
  collection, query, orderBy, getDocs,
  doc, updateDoc, serverTimestamp, writeBatch
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import { $, showToast, timeLabel, formatMoneyEGP } from "../utils.js";
import { getLang, t } from "../i18n.js";

function isAdmin(user){
  const email = (user?.email || "").toLowerCase();
  return APP_ADMIN_EMAILS.map(x=>String(x).toLowerCase()).includes(email);
}

export async function initAdmin(){
  const lang = getLang();
  const box = $("#adminBox");
  const user = auth.currentUser;

  if (!user){
    showToast(t("mustLogin"));
    window.location.href = "/login.html?next=/admin.html";
    return;
  }
  if (!isAdmin(user)){
    showToast(lang==="ar" ? "هذا الحساب ليس أدمن." : "Not an admin account.");
    window.location.href = "/";
    return;
  }

  box.innerHTML = `
    <div class="card soft">
      <div class="section-title">${t("adminTitle")}</div>
      <div class="row" style="gap:10px;flex-wrap:wrap;align-items:center">
        <select class="input" id="statusFilter" style="min-width:160px">
          <option value="">${lang==="ar" ? "كل الحالات" : "All statuses"}</option>
          <option value="pending">pending</option>
          <option value="confirmed">confirmed</option>
          <option value="completed">completed</option>
          <option value="cancelled">cancelled</option>
        </select>
        <input class="input" id="dateFilter" type="date" style="min-width:160px"/>
        <input class="input" id="q" placeholder="${lang==="ar" ? "بحث بالاسم/الإيميل" : "Search name/email"}" style="flex:1;min-width:220px"/>
      </div>
      <div class="hr"></div>
      <div id="list" class="row"></div>
    </div>
  `;

  const list = $("#list");
  const statusFilter = $("#statusFilter");
  const dateFilter = $("#dateFilter");
  const qInput = $("#q");

  let all = [];

  async function loadAll(){
    list.innerHTML = `<div class="muted">${lang==="ar" ? "جاري تحميل الحجوزات..." : "Loading..."}</div>`;
    const qy = query(collection(db, "bookings"), orderBy("createdAt","desc"));
    const snap = await getDocs(qy);
    all = snap.docs.map(d => ({ id: d.id, ...d.data() }));
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
      const blob = `${b.name||""} ${b.email||""}`.toLowerCase();
      const okQ = !qq || blob.includes(qq);
      return okS && okD && okQ;
    });

    if (!filtered.length){
      list.innerHTML = `<div class="muted">${lang==="ar" ? "لا توجد نتائج." : "No results."}</div>`;
      return;
    }

    list.innerHTML = filtered.map(b=>{
      const time = timeLabel(b.startMin, lang);
      const price = formatMoneyEGP(b.finalPrice, lang);
      return `
        <div class="card" style="min-width:260px">
          <b>${b.name || "—"} <span class="pill small">${b.status}</span></b>
          <div class="muted small">📅 <b>${b.date}</b></div>
          <div class="muted small">⏰ <b>${time}</b> • ⏳ <b>${b.durationMin}min</b></div>
          <div class="muted small">✉️ ${b.email || "—"}</div>
          <div class="hr"></div>
          <div style="display:flex;justify-content:space-between;gap:10px;align-items:center;flex-wrap:wrap">
            <b>${price}</b>
            <div style="display:flex;gap:8px;flex-wrap:wrap">
              <button class="pill ghost small" data-act="confirm" data-id="${b.id}">${lang==="ar" ? "تأكيد" : "Confirm"}</button>
              <button class="pill ghost small" data-act="complete" data-id="${b.id}">${lang==="ar" ? "إكمال" : "Complete"}</button>
              <button class="pill primary small" data-act="cancel" data-id="${b.id}">${lang==="ar" ? "إلغاء" : "Cancel"}</button>
            </div>
          </div>
        </div>
      `;
    }).join("");
  }

  async function updateStatus(bookingId, newStatus){
    const b = all.find(x=>x.id===bookingId);
    if (!b) return;

    // If cancelling: free slots by updating slot docs to status=free
    const batch = writeBatch(db);
    batch.update(doc(db,"bookings", bookingId), { status: newStatus, updatedAt: serverTimestamp() });

    if (newStatus === "cancelled" && Array.isArray(b.slotIds)){
      for (const sid of b.slotIds){
        batch.update(doc(db,"slots", sid), { status: "free", updatedAt: serverTimestamp() });
      }
    }
    await batch.commit();
    b.status = newStatus;
    showToast(lang==="ar" ? "تم ✅" : "Done ✅");
    render();
  }

  list.addEventListener("click", async (e)=>{
    const btn = e.target.closest("button[data-act]");
    if (!btn) return;
    const id = btn.getAttribute("data-id");
    const act = btn.getAttribute("data-act");
    try{
      if (act==="confirm") await updateStatus(id, "confirmed");
      if (act==="complete") await updateStatus(id, "completed");
      if (act==="cancel") await updateStatus(id, "cancelled");
    }catch(err){
      console.error(err);
      showToast(lang==="ar" ? "تعذر التحديث. راجع Rules." : "Update failed. Check Rules.");
    }
  });

  statusFilter.addEventListener("change", render);
  dateFilter.addEventListener("change", render);
  qInput.addEventListener("input", render);

  await loadAll();
}
