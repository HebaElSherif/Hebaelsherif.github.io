
import { $, showToast } from "../utils.js";
import { getLang } from "../i18n.js";

export function initContact(){
  const lang = getLang();
  const btn = $("#btnSend");
  const name = $("#cname");
  const email = $("#cemail");
  const msg = $("#cmsg");
  const btnWA = $("#btnWA2");

  btn.onclick = ()=>{
    // No paid service. We'll open mail client.
    const subject = lang==="ar" ? "رسالة من الموقع" : "Message from website";
    const body = `${lang==="ar" ? "الاسم" : "Name"}: ${name.value}\n${lang==="ar" ? "الإيميل" : "Email"}: ${email.value}\n\n${msg.value}`;
    window.location.href = `mailto:${encodeURIComponent("hebaelsherifacademy@gmail.com")}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    showToast(lang==="ar" ? "تم فتح تطبيق البريد" : "Opened mail client");
  };

  btnWA2.onclick = ()=>{
    const text = lang==="ar"
      ? `مرحباً Heba،\nالاسم: ${name.value}\nالإيميل: ${email.value}\nالرسالة: ${msg.value}`
      : `Hi Heba,\nName: ${name.value}\nEmail: ${email.value}\nMessage: ${msg.value}`;
    window.open("https://wa.me/?text=" + encodeURIComponent(text), "_blank");
  };
}
