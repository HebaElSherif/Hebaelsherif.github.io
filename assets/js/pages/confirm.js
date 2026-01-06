
import { auth, db } from "../firebase.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import { $, showToast, formatMoneyEGP, timeLabel } from "../utils.js";
import { t, getLang } from "../i18n.js";

function buildICS({date, startMin, durationMin, title, description}){
  // Create an ICS file (local timezone). Good enough for personal calendars.
  const pad2 = (n)=>String(n).padStart(2,"0");
  const [y,m,d] = date.split("-").map(Number);
  const start = new Date(y, m-1, d, Math.floor(startMin/60), startMin%60, 0);
  const end = new Date(start.getTime() + durationMin*60*1000);
  const fmt = (dt)=> `${dt.getFullYear()}${pad2(dt.getMonth()+1)}${pad2(dt.getDate())}T${pad2(dt.getHours())}${pad2(dt.getMinutes())}00`;
  const uid = `${Date.now()}@hebaelsherifacademy`;
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//HebaElSherif//Booking//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${fmt(new Date())}`,
    `DTSTART:${fmt(start)}`,
    `DTEND:${fmt(end)}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${description.replace(/\n/g,"\\n")}`,
    "END:VEVENT",
    "END:VCALENDAR"
  ].join("\r\n");
}

export function initConfirm(){
  const lang = getLang();
  const bookingId = new URLSearchParams(location.search).get("bookingId");
  const box = $("#box");
  const btnICS = $("#btnICS");
  const btnWA = $("#btnWA");

  if (!bookingId){
    box.innerHTML = `<div class="muted">${lang==="ar" ? "لا يوجد رقم حجز." : "No booking id."}</div>`;
    return;
  }

  (async ()=>{
    try{
      const ref = doc(db, "bookings", bookingId);
      const snap = await getDoc(ref);
      if (!snap.exists()){
        box.innerHTML = `<div class="muted">${lang==="ar" ? "لم يتم العثور على الحجز." : "Booking not found."}</div>`;
        return;
      }
      const b = snap.data();
      // Only owner can see
      const user = auth.currentUser;
      if (!user || user.uid !== b.uid){
        showToast(lang==="ar" ? "غير مصرح" : "Unauthorized");
        window.location.href = "/login.html?next=" + encodeURIComponent(location.pathname + location.search);
        return;
      }

      const time = timeLabel(b.startMin, lang);
      const price = formatMoneyEGP(b.finalPrice, lang);
      box.innerHTML = `
        <div class="row">
          <div class="card soft">
            <div class="small muted">${lang==="ar" ? "اليوم" : "Day"}: <b>${b.date}</b></div>
            <div class="small muted">${lang==="ar" ? "الوقت" : "Time"}: <b>${time}</b></div>
            <div class="small muted">${lang==="ar" ? "المدة" : "Duration"}: <b>${b.durationMin} ${lang==="ar" ? "دقيقة" : "min"}</b></div>
            <div class="small muted">${lang==="ar" ? "الإجمالي" : "Total"}: <b>${price}</b></div>
            <div class="hr"></div>
            <div class="small muted">${lang==="ar" ? "الحالة" : "Status"}: <b>${b.status}</b></div>
          </div>
        </div>
      `;

      // ICS download
      btnICS.onclick = ()=>{
        const text = buildICS({
          date: b.date,
          startMin: b.startMin,
          durationMin: b.durationMin,
          title: lang==="ar" ? "جلسة كوتشينج - Heba ElSherif" : "Coaching session - Heba ElSherif",
          description: lang==="ar"
            ? `تم استلام طلب الحجز.\nرقم الحجز: ${bookingId}\nيرجى التواصل لتأكيد الموعد.`
            : `Booking request received.\nBooking ID: ${bookingId}\nPlease contact to confirm.`
        });
        const blob = new Blob([text], {type:"text/calendar;charset=utf-8"});
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `booking-${bookingId}.ics`;
        a.click();
        URL.revokeObjectURL(a.href);
      };

      // WhatsApp deep link (no phone number set → opens with text only)
      btnWA.onclick = ()=>{
        const msg = lang==="ar"
          ? `مرحباً Heba،\nأريد تأكيد/تعديل الحجز رقم ${bookingId}.\nاليوم: ${b.date}\nالوقت: ${time}\nالمدة: ${b.durationMin} دقيقة.`
          : `Hi Heba,\nI'd like to confirm/reschedule booking ${bookingId}.\nDay: ${b.date}\nTime: ${time}\nDuration: ${b.durationMin} min.`;
        const url = "https://wa.me/?text=" + encodeURIComponent(msg);
        window.open(url, "_blank");
      };

    }catch(e){
      box.innerHTML = `<div class="muted">${e.message}</div>`;
    }
  })();
}
