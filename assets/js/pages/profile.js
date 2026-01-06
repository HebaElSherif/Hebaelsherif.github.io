import { auth, db } from "../firebase.js";
import { APP_ADMIN_EMAILS } from "../app.js";
import {
  doc, getDoc, setDoc, serverTimestamp,
  collection, query, where, orderBy, limit, getDocs,
  setDoc as setDoc2
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import { $, showToast, timeLabel, formatMoneyEGP } from "../utils.js";
import { getLang, t } from "../i18n.js";

export async function initProfile() {
  const lang = getLang();

  const elEmail = $("#profileEmail");
  const inputName = $("#name");
  const inputPhoto = $("#photoUrl");
  const btnSave = $("#save");
  const btnLogout = $("#logout");
  const bookingsWrap = $("#bookings");

  const user = auth.currentUser;

  if (!user) {
    showToast(t("mustLogin"));
    window.location.href = "/login.html?next=/profile.html";
    return;
  }

  // ✅ Admin button only (inside profile)
  const adminBtn = document.getElementById("adminOnlyBtn");
  const isAdmin = APP_ADMIN_EMAILS
    .map(e => String(e).toLowerCase())
    .includes((user.email || "").toLowerCase());
  if (adminBtn) adminBtn.style.display = isAdmin ? "" : "none";

  elEmail.textContent = user.email || "—";

  async function loadProfile() {
    const ref = doc(db, "users", user.uid);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const d = snap.data();
      inputName.value = d.name || "";
      inputPhoto.value = d.photoUrl || "";
    } else {
      inputName.value = user.displayName || "";
      inputPhoto.value = user.photoURL || "";
    }
  }

  async function saveProfile() {
    const name = (inputName.value || "").trim();
    const photoUrl = (inputPhoto.value || "").trim();

    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email: user.email || "",
      name,
      photoUrl,
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp()
    }, { merge: true });

    showToast(lang === "ar" ? "تم الحفظ ✅" : "Saved ✅");
  }

  async function loadBookings() {
    bookingsWrap.innerHTML = `<div class="muted">${lang === "ar" ? "جاري التحميل..." : "Loading..."}</div>`;

    const qy = query(
      collection(db, "bookings"),
      where("uid", "==", user.uid),
      orderBy("createdAt", "desc"),
      limit(20)
    );

    const snap = await getDocs(qy);
    if (snap.empty) {
      bookingsWrap.innerHTML = `<div class="muted">${lang === "ar" ? "لا توجد حجوزات بعد." : "No bookings yet."}</div>`;
      return;
    }

    const rows = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    bookingsWrap.innerHTML = rows.map(b => {
      const time = timeLabel(b.startMin, lang);
      const price = formatMoneyEGP(b.finalPrice, lang);
      const status = b.status || "pending";

      return `
        <div class="card" style="margin-bottom:10px">
          <div style="display:flex;justify-content:space-between;gap:10px;align-items:center;flex-wrap:wrap">
            <b>${b.date} • ${time}</b>
            <span class="pill small">${status}</span>
          </div>
          <div class="muted small">${lang === "ar" ? "المدة" : "Duration"}: <b>${b.durationMin}min</b></div>
          <div class="muted small">${lang === "ar" ? "السعر" : "Price"}: <b>${price}</b></div>
        </div>
      `;
    }).join("");
  }

  // -------- Progress (Courses) --------
  async function loadCatalog() {
    try {
      const res = await fetch("/assets/data/catalog.json", { cache: "no-store" });
      if (!res.ok) return { items: [] };
      return res.json();
    } catch {
      return { items: [] };
    }
  }

  function progressCard(course, percent) {
    const pct = Math.max(0, Math.min(100, Number(percent || 0)));
    return `
      <div class="card" style="min-width:240px" data-course="${course.id}">
        <b>${course.title}</b>
        <div class="muted small">${course.description || ""}</div>
        <div class="hr"></div>

        <div style="display:flex;justify-content:space-between;gap:10px;align-items:center">
          <span class="pill small">${pct}%</span>
          <div style="flex:1;height:10px;border-radius:999px;background:rgba(0,0,0,.08);overflow:hidden">
            <div style="height:100%;width:${pct}%;background:var(--primary)"></div>
          </div>
        </div>

        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px">
          <button class="pill ghost small" type="button" data-set="0">0%</button>
          <button class="pill ghost small" type="button" data-set="25">25%</button>
          <button class="pill ghost small" type="button" data-set="50">50%</button>
          <button class="pill ghost small" type="button" data-set="75">75%</button>
          <button class="pill primary small" type="button" data-set="100">100%</button>
        </div>
      </div>
    `;
  }

  async function loadCourseProgress() {
    const wrap = document.getElementById("courseProgress");
    if (!wrap) return;

    wrap.innerHTML = `<div class="muted">${lang === "ar" ? "جاري تحميل التقدم..." : "Loading progress..."}</div>`;

    const cat = await loadCatalog();
    const courses = (cat.items || []).filter(x => x.type === "course");

    if (!courses.length) {
      wrap.innerHTML = `<div class="muted">${lang === "ar" ? "لا توجد كورسات." : "No courses."}</div>`;
      return;
    }

    const pq = query(collection(db, "progressCourses"), where("uid", "==", user.uid));
    const ps = await getDocs(pq);

    const map = new Map();
    ps.forEach(d => map.set(d.data().courseId, d.data().percent || 0));

    wrap.innerHTML = courses.map(c => progressCard(c, map.get(c.id) || 0)).join("");
  }

  async function setCourseProgress(courseId, percent) {
    const key = `${user.uid}_${courseId}`;
    await setDoc2(doc(db, "progressCourses", key), {
      uid: user.uid,
      courseId,
      percent: Number(percent),
      updatedAt: serverTimestamp()
    }, { merge: true });
  }

  // Click handler for progress buttons
  document.addEventListener("click", async (e) => {
    const btn = e.target.closest("button[data-set]");
    if (!btn) return;

    const card = btn.closest("[data-course]");
    if (!card) return;

    try {
      await setCourseProgress(card.getAttribute("data-course"), btn.getAttribute("data-set"));
      showToast(lang === "ar" ? "تم تحديث التقدم ✅" : "Progress updated ✅");
      await loadCourseProgress();
    } catch (err) {
      console.error(err);
      showToast(lang === "ar" ? "تعذر تحديث التقدم." : "Could not update progress.");
    }
  });

  // Handlers
  btnSave.onclick = async () => {
    try {
      await saveProfile();
    } catch (err) {
      console.error(err);
      showToast(lang === "ar" ? "حصل خطأ في الحفظ." : "Save failed.");
    }
  };

  btnLogout.onclick = async () => {
    try {
      await auth.signOut();
      // remove admin button just in case
      document.getElementById("adminOnlyBtn")?.style && (document.getElementById("adminOnlyBtn").style.display = "none");
      window.location.href = "/";
    } catch (err) {
      console.error(err);
      showToast(lang === "ar" ? "تعذر تسجيل الخروج." : "Logout failed.");
    }
  };

  // Load
  try {
    await loadProfile();
    await loadBookings();
    await loadCourseProgress();
  } catch (err) {
    console.error(err);
    showToast(lang === "ar" ? "تعذر تحميل البيانات (تحقق من Firestore Rules)." : "Failed to load (check Firestore Rules).");
  }
}
