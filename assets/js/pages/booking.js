
import { auth, db } from "../firebase.js";
import {
  collection, doc, getDocs, query, where, writeBatch, runTransaction, serverTimestamp, addDoc
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import { $, $all, showToast, toISODate, parseISODate, weekdayName, timeLabel, formatMoneyEGP } from "../utils.js";
import { t, getLang } from "../i18n.js";

const WORK_START_MIN = 6*60;   // 6:00
const WORK_END_MIN   = 21*60;  // 21:00
const STEP_MIN = 30;
const DAYS_AHEAD = 30; // show next 30 days
const FRIDAY = 5; // JS: 0 Sun..5 Fri..6 Sat

function pricesFor(durationMin, coupon){
  const code = (coupon||"").trim().toUpperCase();
  // Supported codes:
  // HEBA1000 -> 60min = 1000
  // HEBA1500 -> 90min = 1500
  // legacy: HEBA -> both discounts (optional)
  const legacy = code === "HEBA";
  if (durationMin === 60) return (code === "HEBA1000" || legacy) ? 1000 : 1200;
  if (durationMin === 90) return (code === "HEBA1500" || legacy) ? 1500 : 1800;
  return 0;
}

function slotIdsFor(dateISO, startMin, durationMin){
  const count = durationMin === 90 ? 3 : 2; // 30-min slots
  const ids = [];
  for (let i=0;i<count;i++){
    const m = startMin + i*STEP_MIN;
    const hh = String(Math.floor(m/60)).padStart(2,"0");
    const mm = String(m%60).padStart(2,"0");
    ids.push(`${dateISO}T${hh}:${mm}`);
  }
  return ids;
}

async function fetchReservedForDay(dateISO){
  // read slots that are reserved for this date
  const slotsRef = collection(db, "slots");
  const qy = query(slotsRef, where("date", "==", dateISO), where("status", "==", "reserved"));
  const snap = await getDocs(qy);
  const set = new Set();
  snap.forEach(d=> set.add(d.id));
  return set;
}

function buildDayOptions(lang){
  const days = [];
  const today = new Date();
  for (let i=0;i<DAYS_AHEAD;i++){
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i);
    if (d.getDay() === FRIDAY) continue;
    const iso = toISODate(d);
    days.push({ iso, label: `${weekdayName(d, lang)} • ${iso}`});
  }
  return days;
}

export function initBooking(){
  const lang = getLang();
  const dur60 = $("#dur60");
  const dur90 = $("#dur90");
  const daySel = $("#day");
  const slotWrap = $("#slots");
  const coupon = $("#coupon");
  const priceEl = $("#price");
  const priceOldEl = $("#priceOld");
  const summaryEl = $("#summary");
  const btnSubmit = $("#btnSubmit");

  let durationMin = 60;
  let selected = null; // { dateISO, startMin, label }
  let reservedSet = new Set();

  function updatePrice(){
    const base = durationMin === 60 ? 1200 : 1800;
    const final = pricesFor(durationMin, coupon.value);
    const showOld = final !== base;
    priceEl.textContent = formatMoneyEGP(final, lang);
    priceOldEl.textContent = showOld ? formatMoneyEGP(base, lang) : "";
    priceOldEl.style.display = showOld ? "inline" : "none";
  }

  function updateSummary(){
    if (!selected){
      summaryEl.innerHTML = `<span class="muted">${lang==="ar" ? "اختاري يوم ووقت." : "Pick a day and time."}</span>`;
      btnSubmit.disabled = true;
      return;
    }
    const final = pricesFor(durationMin, coupon.value);
    summaryEl.innerHTML = `
      <div class="small muted">${t("day")}: <b>${selected.dateISO}</b></div>
      <div class="small muted">${t("time")}: <b>${selected.label}</b></div>
      <div class="small muted">${lang==="ar" ? "المدة" : "Duration"}: <b>${durationMin} ${lang==="ar" ? "دقيقة" : "min"}</b></div>
      <div class="small muted">${lang==="ar" ? "الإجمالي" : "Total"}: <b>${formatMoneyEGP(final, lang)}</b></div>
    `;
    btnSubmit.disabled = false;
  }

  function renderSlots(){
    slotWrap.innerHTML = "";
    selected = null;
    const dayISO = daySel.value;
    if (!dayISO) return;

    for (let m = WORK_START_MIN; m <= WORK_END_MIN - STEP_MIN; m += STEP_MIN){
      // last start must fit duration
      const lastStart = WORK_END_MIN - durationMin;
      if (m > lastStart) break;

      const ids = slotIdsFor(dayISO, m, durationMin);
      const blocked = ids.some(id => reservedSet.has(id));
      const btn = document.createElement("div");
      btn.className = "slot";
      btn.textContent = timeLabel(m, lang);
      btn.setAttribute("role","button");
      btn.setAttribute("tabindex","0");
      btn.setAttribute("aria-disabled", blocked ? "true" : "false");
      if (blocked) btn.title = lang==="ar" ? "غير متاح" : "Unavailable";

      btn.onclick = ()=>{
        if (blocked) return;
        $all(".slot", slotWrap).forEach(x=>x.classList.remove("selected"));
        btn.classList.add("selected");
        selected = { dateISO: dayISO, startMin: m, label: timeLabel(m, lang) };
        updateSummary();
      };

      slotWrap.appendChild(btn);
    }
    updateSummary();
  }

  async function loadDay(){
    const dayISO = daySel.value;
    if (!dayISO) return;
    slotWrap.innerHTML = `<div class="muted">${lang==="ar" ? "جاري تحميل المواعيد..." : "Loading slots..."}</div>`;
    reservedSet = await fetchReservedForDay(dayISO);
    renderSlots();
  }

  // init durations
  dur60.onclick = ()=>{ durationMin = 60; dur60.classList.add("active"); dur90.classList.remove("active"); updatePrice(); loadDay(); };
  dur90.onclick = ()=>{ durationMin = 90; dur90.classList.add("active"); dur60.classList.remove("active"); updatePrice(); loadDay(); };

  // day options
  const days = buildDayOptions(lang);
  daySel.innerHTML = `<option value="">${lang==="ar" ? "اختاري اليوم" : "Choose a day"}</option>` + days.map(d=>`<option value="${d.iso}">${d.label}</option>`).join("");
  daySel.onchange = loadDay;

  coupon.oninput = ()=>{ updatePrice(); updateSummary(); };

  updatePrice();
  updateSummary();

  btnSubmit.onclick = async ()=>{
    const user = auth.currentUser;
    if (!user) return showToast(t("mustLogin"));
    if (!selected) return showToast(lang==="ar" ? "اختاري موعد." : "Pick a slot.");

    const final = pricesFor(durationMin, coupon.value);
    const base = durationMin === 60 ? 1200 : 1800;
    const usedCoupon = (coupon.value||"").trim();
    const dayISO = selected.dateISO;
    const ids = slotIdsFor(dayISO, selected.startMin, durationMin);

    try{
      // Transaction to reserve slots atomically
      const bookingRef = await runTransaction(db, async (tx)=>{
        // Check each slot doc
        for (const id of ids){
          const sref = doc(db, "slots", id);
          const sdoc = await tx.get(sref);
          if (sdoc.exists() && sdoc.data().status === "reserved"){
            throw new Error(lang==="ar" ? "الموعد اتاخد بالفعل، اختاري وقت تاني." : "That time was taken. Please choose another slot.");
          }
        }

        // Create booking (auto id)
        const bref = doc(collection(db, "bookings"));
        tx.set(bref, {
          uid: user.uid,
          email: user.email || null,
          name: user.displayName || null,
          date: dayISO,
          startMin: selected.startMin,
          durationMin,
          slotIds: ids,
          basePrice: base,
          finalPrice: final,
          coupon: usedCoupon || null,
          status: "pending", // pending -> confirmed -> completed
          channel: "phone_call",
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        // Reserve slots
        for (const id of ids){
          const sref = doc(db, "slots", id);
          tx.set(sref, {
            id,
            date: dayISO,
            startMin: null, // not needed
            status: "reserved",
            bookingId: bref.id,
            reservedBy: user.uid,
            reservedAt: serverTimestamp()
          }, { merge: true });
        }

        return bref;
      });

      // redirect to confirm
      const params = new URLSearchParams({
        bookingId: bookingRef.id
      });
      window.location.href = "/confirm.html?" + params.toString();

    }catch(e){
      showToast(e.message || String(e));
      // refresh day in case of conflict
      await loadDay();
    }
  };
}
