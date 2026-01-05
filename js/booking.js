import { auth, db } from "./firebase.js";
import { CONFIG } from "./config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { collection, addDoc, serverTimestamp, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const form = document.getElementById("bookingForm");
const msg = document.getElementById("msg");
const dateEl = document.getElementById("date");
const timeEl = document.getElementById("time");
const durationEl = document.getElementById("duration");
const couponEl = document.getElementById("coupon");
const priceEl = document.getElementById("price");
const loginHint = document.getElementById("loginHint");

let currentUser = null;

function setMsg(text, ok=false){
  msg.textContent = text;
  msg.className = ok ? "msg ok" : "msg";
}
function isFriday(dateStr){
  const d = new Date(dateStr + "T00:00:00");
  return d.getDay() === 5;
}
function isPast(dateStr, timeStr){
  const dt = new Date(`${dateStr}T${timeStr}:00`);
  return dt.getTime() < Date.now() - (60*1000);
}
function calcPrice(){
  const minutes = Number(durationEl.value);
  const code = (couponEl.value||"").trim().toUpperCase();

  const base = CONFIG.basePrices[minutes] ?? 0;
  let finalP = base;

  const c = CONFIG.coupons[code];
  if (c && c.minutes === minutes) finalP = c.finalPrice;

  priceEl.textContent = String(finalP);
  return { base, finalP, code };
}
function fillTimes(){
  const start = CONFIG.timeSlots.startHour*60;
  const end = CONFIG.timeSlots.endHour*60;
  const step = CONFIG.timeSlots.stepMinutes;

  const slots = [];
  for (let m=start; m<=end; m+=step){
    const hh = String(Math.floor(m/60)).padStart(2,"0");
    const mm = String(m%60).padStart(2,"0");
    slots.push(`${hh}:${mm}`);
  }
  timeEl.innerHTML = slots.map(s=>`<option value="${s}">${s}</option>`).join("");
}
function setMinDateToday(){
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth()+1).padStart(2,"0");
  const dd = String(today.getDate()).padStart(2,"0");
  dateEl.min = `${yyyy}-${mm}-${dd}`;
}

fillTimes();
setMinDateToday();
calcPrice();

durationEl.addEventListener("change", calcPrice);
couponEl.addEventListener("input", calcPrice);

dateEl.addEventListener("change", () => {
  const date = dateEl.value;
  if (date && isFriday(date)) {
    setMsg("يوم الجمعة إجازة — اختار يوم آخر.");
    dateEl.value = "";
  } else {
    setMsg("");
  }
});

onAuthStateChanged(auth, (user) => {
  currentUser = user || null;
  loginHint.style.display = currentUser ? "none" : "block";
});

async function slotTaken(date, time){
  // نجيب كل الحجوزات لنفس اليوم/الوقت ونفلتر status محلياً
  const qy = query(
    collection(db, "bookings"),
    where("date", "==", date),
    where("time", "==", time)
  );
  const snap = await getDocs(qy);
  if (snap.empty) return false;

  const active = snap.docs.some(d => {
    const s = (d.data()?.status || "pending").toString().toLowerCase();
    return s !== "cancelled";
  });
  return active;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = (document.getElementById("name").value||"").trim();
  const phone = (document.getElementById("phone").value||"").trim();
  const email = (document.getElementById("email").value||"").trim().toLowerCase();
  const date = (dateEl.value||"").trim();
  const time = (timeEl.value||"").trim();
  const duration = Number(durationEl.value);
  const note = (document.getElementById("note").value||"").trim();

  if (!name || !phone || !email) return setMsg("من فضلك اكتب الاسم + الموبايل + الإيميل.");
  if (!date) return setMsg("اختار تاريخ.");
  if (isFriday(date)) return setMsg("يوم الجمعة إجازة — اختار يوم آخر.");
  if (!time) return setMsg("اختار وقت.");
  if (isPast(date, time)) return setMsg("الوقت/التاريخ في الماضي. اختار وقت مناسب.");

  const { base, finalP, code } = calcPrice();

  if (!currentUser) {
    localStorage.setItem("heba_redirect_after_login", "booking.html");
    return setMsg("لازم تسجّل دخول الأول، ثم ارجع واعمل الحجز.");
  }

  setMsg("جاري تأكيد التوفر...");
  try {
    const taken = await slotTaken(date, time);
    if (taken) return setMsg("الموعد ده محجوز بالفعل. اختار وقت آخر.");

    setMsg("جاري إرسال طلب الحجز...");
    await addDoc(collection(db, "bookings"), {
      name, phone, email, date, time,
      durationMinutes: duration,
      basePrice: base,
      finalPrice: finalP,
      coupon: code || "",
      note,
      status: "pending",
      uid: currentUser.uid,
      createdAt: serverTimestamp()
    });

    setMsg("تم إرسال طلب الحجز ✅ هنتواصل معاك لتأكيد الموعد.", true);
    form.reset();
    fillTimes();
    setMinDateToday();
    couponEl.value = "";
    calcPrice();
  } catch (err) {
    console.error(err);
    setMsg("حصل خطأ أثناء الحجز. جرّب تاني.");
  }
});
