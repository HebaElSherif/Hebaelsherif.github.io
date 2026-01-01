import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile as firebaseUpdateProfile,
  updatePassword as firebaseUpdatePassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";

// Firebase Config
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

// ---------- حماية المحتوى ----------
document.addEventListener('contextmenu', e=>e.preventDefault());
document.addEventListener('copy', e=>e.preventDefault());
document.addEventListener('cut', e=>e.preventDefault());
document.addEventListener('keydown', e=>{ if(e.ctrlKey&&['c','x','s','u','p'].includes(e.key.toLowerCase())) e.preventDefault(); });

// REGISTER
window.register = function() {
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  if(!name || !email || !password){ alert("أدخل كل البيانات"); return; }

  createUserWithEmailAndPassword(auth,email,password)
    .then(userCred=>{
        firebaseUpdateProfile(userCred.user,{displayName: name})
        alert("تم إنشاء الحساب بنجاح!");
        window.location.href="dashboard.html";
    })
    .catch(err=>{ alert(err.message); });
};

// LOGIN
window.login = function() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  if(!email || !password){ alert("أدخل الإيميل وكلمة المرور"); return; }

  signInWithEmailAndPassword(auth,email,password)
    .then(()=>{ window.location.href = "dashboard.html"; })
    .catch(()=>{ alert("خطأ في الإيميل أو كلمة المرور"); });
};

// LOGOUT
window.logout = function(){ signOut(auth).then(()=> window.location.href="login.html"); };

// UPDATE PROFILE
window.updateProfile = function(){
    const newName = document.getElementById("update-name").value;
    const newPass = document.getElementById("update-password").value;

    const user = auth.currentUser;
    if(!user) return;

    if(newName) firebaseUpdateProfile(user,{displayName:newName}).then(()=>alert("تم تحديث الاسم"));
    if(newPass) firebaseUpdatePassword(user,newPass).then(()=>alert("تم تحديث كلمة المرور"));
};

// Auth State
onAuthStateChanged(auth,user=>{
    if(!user && (window.location.pathname.includes("dashboard") || window.location.pathname.includes("profile") || window.location.pathname.includes("cart"))){
        window.location.href = "login.html";
    }

    // Profile Page
    if(user && document.getElementById("user-name")){
        document.getElementById("user-name").innerText = user.displayName || "المستخدم";
        document.getElementById("user-email").innerText = user.email;

        let purchased = JSON.parse(localStorage.getItem("purchasedCourses"))||[];
        const container = document.getElementById("purchased-courses");
        if(container){
            container.innerHTML="";
            purchased.forEach(course=>{
                const div=document.createElement("div");
                div.className="purchased-course-card";
                div.innerHTML=`<h4>${course.name}</h4><p>السعر: ${course.price} جنيه</p><label><input type="checkbox" class="progress-box"> متابع</label>`;
                container.appendChild(div);
            });
        }
    }

    // Cart Page
    if(document.getElementById("cart-items")){
        let cart = JSON.parse(localStorage.getItem("cart"))||[];
        const container = document.getElementById("cart-items");
        container.innerHTML="";
        let total=0;
        cart.forEach((item,i)=>{
            total+=item.price;
            const div = document.createElement("div");
            div.className="cart-item";
            div.innerHTML=`<h4>${item.name}</h4><p>السعر: ${item.price} جنيه</p><button onclick="removeFromCart(${i})">حذف</button>`;
            container.appendChild(div);
        });
        document.getElementById("total-price").innerText=`الإجمالي: ${total} جنيه`;
    }
});

// CART FUNCTIONS
window.addToCart=function(name,price){
    let cart = JSON.parse(localStorage.getItem("cart"))||[];
    cart.push({name,price});
    localStorage.setItem("cart",JSON.stringify(cart));
    alert(`${name} تم إضافته إلى السلة!`);
};

window.removeFromCart=function(index){
    let cart = JSON.parse(localStorage.getItem("cart"))||[];
    cart.splice(index,1);
    localStorage.setItem("cart",JSON.stringify(cart));
    location.reload();
};

// Checkout (simulated)
window.checkout=function(){
    let cart = JSON.parse(localStorage.getItem("cart"))||[];
    if(cart.length===0){ alert("السلة فارغة"); return; }

    let purchased = JSON.parse(localStorage.getItem("purchasedCourses"))||[];
    purchased = purchased.concat(cart);
    localStorage.setItem("purchasedCourses",JSON.stringify(purchased));
    localStorage.setItem("cart",JSON.stringify([]));
    alert("تم الدفع بنجاح! الكورسات أضيفت لحسابك");
    window.location.href="profile.html";
};
