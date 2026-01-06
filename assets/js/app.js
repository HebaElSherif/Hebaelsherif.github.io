
import { auth, db } from "./firebase.js";
import {
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import {
  doc, getDoc
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

import { initLang, setLang, getLang, t } from "./i18n.js";
import { $, showToast, ensureNoSelectAntiCopy } from "./utils.js";

// ====== App settings ======
// TODO: put your admin emails here (lowercase)
export const APP_ADMIN_EMAILS = ["medoogomaa21@gmail.com"];


// Lightweight anti-copy (optional; you can disable by setting to false)
const ANTI_COPY = true;

function renderNavbar(user){
  const navUser = document.getElementById("navUser");
  const navAuth = document.getElementById("navAuth");
  const navAdmin = document.getElementById("navAdmin");
  if (!navUser || !navAuth) return;

  if (user){
    navUser.style.display = "inline-flex";
    navUser.textContent = user.displayName || user.email || "User";
    navAuth.textContent = t("logout");
    navAuth.onclick = async () => {
      await signOut(auth);
      showToast(getLang()==="ar" ? "تم تسجيل الخروج" : "Signed out");
      window.location.href = "/login.html";
    };
  } else {
    navUser.style.display = "none";
    navAuth.textContent = t("login");
    navAuth.onclick = () => window.location.href = "/login.html";
  }

  const email = (user?.email || "").toLowerCase();
  const isAdmin = APP_ADMIN_EMAILS.includes(email);
  if (navAdmin) navAdmin.style.display = isAdmin ? "inline-flex" : "none";
}

async function hydrateUserProfile(user){
  // optional: load profile doc for future features
  try{
    if (!user) return;
    const ref = doc(db, "users", user.uid);
    const snap = await getDoc(ref);
    if (snap.exists()){
      const data = snap.data();
      // could be used to personalize later
      if (!user.displayName && data?.name){
        // don't set auth profile here (requires updateProfile)
      }
    }
  }catch{}
}

function initLangToggles(){
  const ar = document.getElementById("langAr");
  const en = document.getElementById("langEn");
  if (ar) ar.onclick = ()=>{ setLang("ar"); };
  if (en) en.onclick = ()=>{ setLang("en"); };
}

document.addEventListener("DOMContentLoaded", ()=>{
  initLang();
  initLangToggles();

  if (ANTI_COPY) ensureNoSelectAntiCopy();

  onAuthStateChanged(auth, async (user)=>{
    renderNavbar(user);
    await hydrateUserProfile(user);

    // guard pages
    const needAuth = document.body.getAttribute("data-require-auth") === "true";
    if (needAuth && !user){
      showToast(t("mustLogin"));
      setTimeout(()=> window.location.href="/login.html?next=" + encodeURIComponent(location.pathname), 600);
      return;
    }

    // page modules
    const page = document.body.getAttribute("data-page");
    if (page === "login") (await import("./pages/login.js")).initLogin();
    if (page === "booking") (await import("./pages/booking.js")).initBooking();
    if (page === "confirm") (await import("./pages/confirm.js")).initConfirm();
    if (page === "profile") (await import("./pages/profile.js")).initProfile();
    if (page === "admin") (await import("./pages/admin.js")).initAdmin();
    if (page === "contact") (await import("./pages/contact.js")).initContact();
    if (page === "courses") (await import("./pages/courses.js")).initCourses();
    if (page === "books") (await import("./pages/books.js")).initBooks();
  });
});
