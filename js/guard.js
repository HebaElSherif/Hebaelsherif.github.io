import { auth } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

document.getElementById("year").textContent = new Date().getFullYear();

const who = document.getElementById("who");
const userChip = document.getElementById("userChip");
const logoutBtn = document.getElementById("logoutBtn");

onAuthStateChanged(auth, (user) => {
  if(!user){
    window.location.href = "login.html";
    return;
  }
  const email = user.email || "User";
  who.textContent = `مسجّل دخول كـ: ${email}`;
  if(userChip){
    userChip.style.display = "inline-flex";
    userChip.textContent = email;
  }
});

logoutBtn?.addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "index.html";
});
