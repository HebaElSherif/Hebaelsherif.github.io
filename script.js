import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyC8AjUNsXR2zoJUiSgJzZCq-CwAeEkunsA",
  authDomain: "hebaelsherifacademy.firebaseapp.com",
  projectId: "hebaelsherifacademy",
  storageBucket: "hebaelsherifacademy.firebasestorage.app",
  messagingSenderId: "52403562268",
  appId: "1:52403562268:web:de8ea58840f7e7a9d8fcd9"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

window.login = function() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  if (!email || !password) {
    alert("أدخل الإيميل وكلمة المرور");
    return;
  }

  signInWithEmailAndPassword(auth, email, password)
    .then(() => {
      window.location.href = "dashboard.html";
    })
    .catch(error => {
      alert("خطأ في الإيميل أو كلمة المرور");
      console.error(error);
    });
};

window.logout = function() {
  signOut(auth).then(() => {
    window.location.href = "login.html";
  });
};

onAuthStateChanged(auth, user => {
  if (!user && window.location.pathname.includes("dashboard")) {
    window.location.href = "login.html";
  }
});

document.addEventListener('contextmenu', e => e.preventDefault());
document.addEventListener('copy', e => e.preventDefault());
document.addEventListener('keydown', function(e) {
  if (e.ctrlKey && (e.key === 'c' || e.key === 'x' || e.key === 'u' || e.key === 's')) {
    e.preventDefault();
  }
});

// سلة المشتريات
let cart = [];

window.addToCart = function(courseName, price) {
    cart.push({ name: courseName, price: price });
    alert(`${courseName} تم إضافته إلى السلة!`);
    console.log(cart);
};
