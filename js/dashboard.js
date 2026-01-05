import { auth, db } from "./firebase.js";
import { CONFIG } from "./config.js";
import { onAuthStateChanged, updateProfile } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import {
  doc, getDoc, setDoc, setDoc as setDoc2, updateDoc,
  collection, query, where, orderBy, getDocs,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const els = {
  loginGate: document.getElementById("loginGate"),
  dash: document.getElementById("dash"),
  email: document.getElementById("uEmail"),
  name: document.getElementById("uName"),
  photo: document.getElementById("uPhoto"),
  displayName: document.getElementById("displayName"),
  photoUrl: document.getElementById("photoUrl"),
  saveBtn: document.getElementById("saveProfile"),
  msg: document.getElementById("msg"),
  bookings: document.getElementById("bookings"),
  courses: document.getElementById("coursesProgress")
};

function setMsg(t, ok=false){
  els.msg.textContent = t;
  els.msg.className = ok ? "msg ok" : "msg";
}
function safeText(x){ return (x||"").toString().replace(/[<>]/g,""); }

async function loadJson(path){
  const res = await fetch(path, { cache: "no-store" });
  if (!res.ok) throw new Error("Cannot load " + path);
  return res.json();
}

async function ensureUserDoc(user){
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()){
    await setDoc(ref, {
      email: user.email || "",
      displayName: user.displayName || "",
      photoURL: user.photoURL || "",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  }
  return ref;
}

async function loadBookings(uid){
  const qy = query(
    collection(db, "bookings"),
    where("uid","==", uid),
    orderBy("createdAt","desc")
  );
  const snap = await getDocs(qy);
  if (snap.empty){
    els.bookings.innerHTML = `<div class="card"><p class="muted">لا توجد حجوزات حتى الآن.</p></div>`;
    return;
  }
  els.bookings.innerHTML = [...snap.docs].map(d=>{
    const b = d.data();
    const dur = b.durationMinutes === 90 ? "ساعة ونصف" : "ساعة";
    const status = (b.status||"pending").toString();
    return `
      <div class="card">
        <h3>جلسة ${dur}</h3>
        <p class="muted">التاريخ: <strong>${safeText(b.date)}</strong> • الوقت: <strong>${safeText(b.time)}</strong></p>
        <div class="row" style="justify-content:space-between;align-items:center">
          <span class="tag">${safeText(status)}</span>
          <strong>${safeText(b.finalPrice)} جنيه</strong>
        </div>
      </div>
    `;
  }).join("");
}

async function loadCourseProgress(uid){
  // كورسات من catalog.json + تقدم من Firestore progressCourses (وثائق ثابتة uid_courseId)
  let catalog = { items: [] };
  try{ catalog = await loadJson("data/catalog.json"); }catch{}

  const courses = (catalog.items||[]).filter(x=>x.type==="course");
  if (!courses.length){
    els.courses.innerHTML = `<div class="card"><p class="muted">لا توجد كورسات.</p></div>`;
    return;
  }

  // load user's progress docs
  const qy = query(collection(db, "progressCourses"), where("uid","==", uid));
  const snap = await getDocs(qy);
  const map = new Map();
  snap.docs.forEach(d=>map.set(d.data().courseId, d.data()));

  els.courses.innerHTML = courses.map(c=>{
    const p = map.get(c.id) || { percent: 0 };
    const pct = Math.max(0, Math.min(100, Number(p.percent||0)));
    const soon = c.comingSoon ? `<span class="tag soon">قريباً</span>` : ``;

    return `
      <div class="card" data-course="${safeText(c.id)}">
        <div class="row" style="justify-content:space-between;align-items:center">
          <h3 style="margin:0">${safeText(c.title)}</h3>
          ${soon}
        </div>
        <p class="muted">${safeText(c.description||"")}</p>

        <div class="row" style="justify-content:space-between;align-items:center">
          <span class="muted" style="font-weight:900">${pct}%</span>
          <div style="flex:1;height:10px;border-radius:999px;background:rgba(0,0,0,.06);overflow:hidden">
            <div style="height:100%;width:${pct}%;background:rgba(154,208,236,.95)"></div>
          </div>
        </div>

        <div class="row" style="margin-top:12px">
          <button class="btn small" data-set="0">0%</button>
          <button class="btn small" data-set="25">25%</button>
          <button class="btn small" data-set="50">50%</button>
          <button class="btn small" data-set="75">75%</button>
          <button class="btn small dark" data-set="100">100%</button>
        </div>
      </div>
    `;
  }).join("");
}

async function setCourseProgress(uid, courseId, percent){
  const key = `${uid}_${courseId}`;
  await setDoc2(doc(db,"progressCourses", key), {
    uid,
    courseId,
    percent: Number(percent),
    updatedAt: serverTimestamp()
  }, { merge: true });
}

onAuthStateChanged(auth, async (user) => {
  if (!user){
    els.loginGate.style.display = "block";
    els.dash.style.display = "none";
    return;
  }
  els.loginGate.style.display = "none";
  els.dash.style.display = "block";

  // UI basic
  els.email.textContent = user.email || "";
  els.name.textContent = user.displayName || "مستخدم";
  els.photo.src = user.photoURL || "https://ui-avatars.com/api/?name=" + encodeURIComponent(user.email || "User") + "&background=9AD0EC&color=0B0B0F";

  const ref = await ensureUserDoc(user);
  const snap = await getDoc(ref);
  const data = snap.data() || {};

  els.displayName.value = data.displayName || user.displayName || "";
  els.photoUrl.value = data.photoURL || user.photoURL || "";

  await loadBookings(user.uid);
  await loadCourseProgress(user.uid);
});

els.saveBtn?.addEventListener("click", async () => {
  const user = auth.currentUser;
  if (!user) return;

  const dn = (els.displayName.value || "").trim();
  const pu = (els.photoUrl.value || "").trim();

  setMsg("جاري حفظ البيانات...");
  try{
    await updateProfile(user, { displayName: dn || null, photoURL: pu || null });

    const ref = doc(db, "users", user.uid);
    await updateDoc(ref, {
      displayName: dn,
      photoURL: pu,
      updatedAt: serverTimestamp()
    });

    els.name.textContent = dn || "مستخدم";
    if (pu) els.photo.src = pu;
    setMsg("تم الحفظ ✅", true);
  }catch(e){
    console.error(e);
    setMsg("حصل خطأ أثناء الحفظ. تأكد من Firestore Rules.");
  }
});

// Delegation for progress buttons
document.addEventListener("click", async (e)=>{
  const btn = e.target.closest("button[data-set]");
  if (!btn) return;
  const wrap = btn.closest("[data-course]");
  if (!wrap) return;

  const user = auth.currentUser;
  if (!user) return;

  const courseId = wrap.getAttribute("data-course");
  const pct = btn.getAttribute("data-set");

  setMsg("جاري تحديث التقدم...");
  try{
    await setCourseProgress(user.uid, courseId, pct);
    await loadCourseProgress(user.uid);
    setMsg("تم ✅", true);
  }catch(err){
    console.error(err);
    setMsg("تعذر تحديث التقدم. راجع Rules.");
  }
});
