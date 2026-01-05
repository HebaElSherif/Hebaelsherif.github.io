import { auth } from "./firebase.js";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

const form = document.getElementById("loginForm");
const emailEl = document.getElementById("email");
const passEl = document.getElementById("password");
const msg = document.getElementById("msg");
const signupBtn = document.getElementById("signupBtn");

function setMsg(text, ok = false) {
  msg.textContent = text;
  msg.className = ok ? "msg ok" : "msg";
}
function getEmail() { return (emailEl.value || "").trim().toLowerCase(); }
function getPassword() { return (passEl.value || "").trim(); }
function validateEmail(email) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }

function friendlyError(err) {
  const code = err?.code || "";
  if (code === "auth/invalid-email") return "البريد الإلكتروني غير صحيح. مثال: name@gmail.com";
  if (code === "auth/missing-password") return "اكتب كلمة المرور.";
  if (code === "auth/weak-password") return "كلمة المرور ضعيفة (لازم 6 أحرف على الأقل).";
  if (code === "auth/email-already-in-use") return "الإيميل ده مسجل بالفعل. جرّب تسجيل الدخول.";
  if (code === "auth/invalid-credential") return "بيانات الدخول غير صحيحة.";
  return err?.message || "حصل خطأ غير متوقع.";
}

function goNext() {
  const redirect = localStorage.getItem("heba_redirect_after_login") || "index.html";
  localStorage.removeItem("heba_redirect_after_login");
  window.location.href = redirect;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = getEmail();
  const password = getPassword();

  if (!validateEmail(email)) return setMsg("اكتب بريد إلكتروني صحيح (مثال: name@gmail.com)");
  if (password.length < 6) return setMsg("كلمة المرور لازم تكون 6 أحرف على الأقل.");

  setMsg("جاري تسجيل الدخول...");
  try {
    await signInWithEmailAndPassword(auth, email, password);
    setMsg("تم تسجيل الدخول ✅", true);
    goNext();
  } catch (err) {
    setMsg(friendlyError(err));
  }
});

signupBtn.addEventListener("click", async () => {
  const email = getEmail();
  const password = getPassword();

  if (!validateEmail(email)) return setMsg("اكتب بريد إلكتروني صحيح (مثال: name@gmail.com)");
  if (password.length < 6) return setMsg("كلمة المرور لازم تكون 6 أحرف على الأقل.");

  setMsg("جاري إنشاء الحساب...");
  try {
    await createUserWithEmailAndPassword(auth, email, password);
    setMsg("تم إنشاء الحساب ✅", true);
    goNext();
  } catch (err) {
    setMsg(friendlyError(err));
  }
});
