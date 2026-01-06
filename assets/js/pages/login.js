
import { auth, db } from "../firebase.js";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import { $, showToast } from "../utils.js";
import { t, getLang } from "../i18n.js";

export function initLogin(){
  const email = $("#email");
  const pass = $("#password");
  const name = $("#name");
  const btnIn = $("#btnSignIn");
  const btnUp = $("#btnSignUp");
  const btnGoogle = $("#btnGoogle");
  const btnForgot = $("#btnForgot");

  const next = new URLSearchParams(location.search).get("next") || "/booking.html";

  async function ensureUserDoc(user, extra={}){
    const ref = doc(db, "users", user.uid);
    await setDoc(ref, {
      uid: user.uid,
      email: user.email || null,
      name: extra.name || user.displayName || null,
      phone: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }, { merge: true });
  }

  btnIn.onclick = async ()=>{
    try{
      const u = await signInWithEmailAndPassword(auth, email.value.trim(), pass.value);
      await ensureUserDoc(u.user);
      showToast(getLang()==="ar" ? "تم تسجيل الدخول" : "Signed in");
      window.location.href = next;
    }catch(e){
      showToast(e.message);
    }
  };

  btnUp.onclick = async ()=>{
    try{
      const u = await createUserWithEmailAndPassword(auth, email.value.trim(), pass.value);
      const display = name.value.trim();
      if (display) await updateProfile(u.user, { displayName: display });
      await ensureUserDoc(u.user, { name: display || null });
      showToast(getLang()==="ar" ? "تم إنشاء الحساب" : "Account created");
      window.location.href = next;
    }catch(e){
      showToast(e.message);
    }
  };

  btnGoogle.onclick = async ()=>{
    try{
      const prov = new GoogleAuthProvider();
      const u = await signInWithPopup(auth, prov);
      await ensureUserDoc(u.user);
      showToast(getLang()==="ar" ? "تم تسجيل الدخول" : "Signed in");
      window.location.href = next;
    }catch(e){
      showToast(e.message);
    }
  };

  btnForgot.onclick = async ()=>{
    const em = email.value.trim();
    if (!em) return showToast(getLang()==="ar" ? "اكتبي الإيميل أولاً" : "Enter your email first");
    try{
      await sendPasswordResetEmail(auth, em);
      showToast(getLang()==="ar" ? "تم إرسال رابط الاستعادة" : "Reset email sent");
    }catch(e){
      showToast(e.message);
    }
  };
}
