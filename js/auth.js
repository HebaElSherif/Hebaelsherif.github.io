import { auth } from "./firebase.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

const form = document.getElementById("loginForm");
const emailEl = document.getElementById("email");
const passEl = document.getElementById("password");
const msg = document.getElementById("msg");
const signupBtn = document.getElementById("signupBtn");

function setMsg(text, ok=false){
  msg.textContent = text;
  msg.className = ok ? "msg ok" : "msg";
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  setMsg("جاري تسجيل الدخول...");
  try{
    await signInWithEmailAndPassword(auth, emailEl.value.trim(), passEl.value);
    setMsg("تم تسجيل الدخول ✅", true);
    window.location.href = "dashboard.html";
  }catch(err){
    setMsg(err.message);
  }
});

signupBtn.addEventListener("click", async () => {
  setMsg("جاري إنشاء الحساب...");
  try{
    await createUserWithEmailAndPassword(auth, emailEl.value.trim(), passEl.value);
    setMsg("تم إنشاء الحساب ✅", true);
    window.location.href = "dashboard.html";
  }catch(err){
    setMsg(err.message);
  }
});
