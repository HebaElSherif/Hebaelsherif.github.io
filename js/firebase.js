import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyC8AjUNsXR2zoJUiSgJzZCq-CwAeEkunsA",
  authDomain: "hebaelsherifacademy.firebaseapp.com",
  projectId: "hebaelsherifacademy",
  storageBucket: "hebaelsherifacademy.firebasestorage.app",
  messagingSenderId: "52403562268",
  appId: "1:52403562268:web:de8ea58840f7e7a9d8fcd9"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
