
import { $all } from "./utils.js";

const dict = {
  ar: {
    siteName: "Heba ElSherif | هبة الشريف",
    bookNow: "احجزي جلسة",
    login: "تسجيل الدخول",
    logout: "خروج",
    myAccount: "حسابي",
    admin: "الإدارة",
    contact: "تواصل",
    homeHeroTitle: "تطوير مهاراتك… بخطة واضحة ونتائج ملموسة",
    homeHeroText: "منصة عربية لجلسات كوتشينج 1:1 عبر مكالمة هاتفية — مع كورسات وكتب (قريبًا). احجزي الموعد الأنسب وسيتم حفظ طلبك تلقائيًا.",
    badges: ["جلسات 1:1", "خطة عمل", "متابعة", "محتوى عربي احترافي"],
    kpi1: "متاحة من 6 ص إلى 9 م",
    kpi2: "Slots كل 30 دقيقة",
    kpi3: "الجمعة إجازة",
    servicesTitle: "الخدمات",
    service1Title: "جلسة 60 دقيقة",
    service1Text: "مناسبة للتشخيص وتحديد خطة واضحة.",
    service2Title: "جلسة 90 دقيقة",
    service2Text: "مناسبة للتطبيق العملي والمتابعة.",
    discountTitle: "كود الخصم",
    discountText: "اكتبي الكود <b>Heba</b> للحصول على السعر المخفّض.",
    faqTitle: "أسئلة شائعة",
    q1: "إزاي بحجز؟",
    a1: "ادخلي صفحة الحجز، اختاري اليوم والوقت والمدة، وسجّلي دخول قبل إرسال الطلب.",
    q2: "هل في حجز يوم الجمعة؟",
    a2: "لا، الجمعة إجازة — اختاري يوم آخر.",
    q3: "هل الإلغاء متاح؟",
    a3: "مسموح بعد التواصل معي — من داخل حسابك تقدري تطلبي إلغاء/تأجيل عبر واتساب.",
    ready: "جاهزة تبدأ؟",
    footer: "© 2026 Heba ElSherif Academy — جميع الحقوق محفوظة",
    privacy: "الخصوصية",
    terms: "الشروط",
    refund: "الاسترجاع",
    // Auth
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    signIn: "دخول",
    signUp: "إنشاء حساب",
    or: "أو",
    continueGoogle: "متابعة عبر Google",
    forgot: "نسيت كلمة المرور؟",
    // Booking
    bookingTitle: "حجز جلسة",
    step1: "1) اختاري المدة",
    step2: "2) اختاري اليوم",
    step3: "3) اختاري الوقت",
    duration60: "60 دقيقة",
    duration90: "90 دقيقة",
    day: "اليوم",
    time: "الوقت",
    apply: "تطبيق",
    coupon: "كود خصم (اختياري)",
    summary: "ملخص الحجز",
    submit: "إرسال طلب الحجز",
    mustLogin: "لازم تسجلي دخول قبل الحجز.",
    // Confirm
    confirmTitle: "تم استلام طلب الحجز",
    confirmText: "هنتواصل لتأكيد الموعد. تقدري تضيفي الموعد للكاليندر أو تبعتي رسالة واتساب جاهزة.",
    addCalendar: "إضافة للكاليندر",
    whatsapp: "فتح واتساب",
    // Profile
    profileTitle: "حسابي",
    name: "الاسم",
    phone: "رقم الموبايل (اختياري)",
    save: "حفظ",
    myBookings: "حجوزاتي",
    cancelReq: "طلب إلغاء/تأجيل عبر واتساب",
    // Admin
    adminTitle: "لوحة الإدارة",
    adminHint: "هذه الصفحة مخصصة للإدارة. عدّلي قائمة الإيميلات المسموح لها من ملف app.js.",
  },
  en: {
    siteName: "Heba ElSherif | هبة الشريف",
    bookNow: "Book a session",
    login: "Login",
    logout: "Logout",
    myAccount: "My account",
    admin: "Admin",
    contact: "Contact",
    homeHeroTitle: "Grow your skills… with a clear plan and tangible results",
    homeHeroText: "1:1 coaching sessions via phone call — with courses and ebooks coming soon. Pick the best slot and we’ll save your request instantly.",
    badges: ["1:1 Sessions", "Action plan", "Follow-up", "Professional Arabic content"],
    kpi1: "Available 6am–9pm",
    kpi2: "30-min slots",
    kpi3: "Friday off",
    servicesTitle: "Services",
    service1Title: "60-minute session",
    service1Text: "Great for diagnosis & a clear roadmap.",
    service2Title: "90-minute session",
    service2Text: "Best for hands-on work & follow-up.",
    discountTitle: "Discount code",
    discountText: "Use code <b>Heba</b> to get the reduced price.",
    faqTitle: "FAQ",
    q1: "How do I book?",
    a1: "Go to Booking, pick duration/day/time, and log in before submitting.",
    q2: "Can I book Fridays?",
    a2: "No. Fridays are off — please choose another day.",
    q3: "Can I cancel?",
    a3: "Yes, after contacting me — request cancel/reschedule from your account via WhatsApp.",
    ready: "Ready to start?",
    footer: "© 2026 Heba ElSherif Academy — All rights reserved",
    privacy: "Privacy",
    terms: "Terms",
    refund: "Refund",
    // Auth
    email: "Email",
    password: "Password",
    signIn: "Sign in",
    signUp: "Create account",
    or: "or",
    continueGoogle: "Continue with Google",
    forgot: "Forgot password?",
    // Booking
    bookingTitle: "Book a session",
    step1: "1) Choose duration",
    step2: "2) Pick a day",
    step3: "3) Pick a time",
    duration60: "60 min",
    duration90: "90 min",
    day: "Day",
    time: "Time",
    apply: "Apply",
    coupon: "Discount code (optional)",
    summary: "Booking summary",
    submit: "Submit booking request",
    mustLogin: "You must be logged in to book.",
    // Confirm
    confirmTitle: "Booking request received",
    confirmText: "We’ll contact you to confirm. You can add it to your calendar or send a prefilled WhatsApp message.",
    addCalendar: "Add to calendar",
    whatsapp: "Open WhatsApp",
    // Profile
    profileTitle: "My account",
    name: "Name",
    phone: "Mobile (optional)",
    save: "Save",
    myBookings: "My bookings",
    cancelReq: "Request cancel/reschedule via WhatsApp",
    // Admin
    adminTitle: "Admin dashboard",
    adminHint: "This page is for admins. Edit allowed emails in app.js.",
    coursesTitle: "Courses",
    booksTitle: "Books",
    comingSoonLong: "This page is being prepared — content will be added soon.",
    progressTitle: "Course progress",
    progressHint: "Set your progress per course (demo now — will be automatic once courses are live).",
  }};

export function getLang(){
  return localStorage.getItem("lang") || "ar";
}

export function setLang(lang){
  localStorage.setItem("lang", lang);
  applyLang(lang);
}

export function t(key){
  const lang = getLang();
  return (dict[lang] && dict[lang][key]) || (dict.ar[key] ?? key);
}

export function applyLang(lang){
  // Direction + font
  document.documentElement.classList.toggle("rtl", lang === "ar");
  document.documentElement.classList.toggle("ltr", lang === "en");
  document.documentElement.setAttribute("lang", lang);

  // Replace all [data-i18n] nodes
  $all("[data-i18n]").forEach(el=>{
    const k = el.getAttribute("data-i18n");
    const val = t(k);
    if (typeof val === "string") el.innerHTML = val;
  });

  // badges
  const badges = dict[lang].badges || dict.ar.badges;
  const wrap = document.getElementById("badges");
  if (wrap){
    wrap.innerHTML = badges.map(b=>`<span class="badge">${b}</span>`).join("");
  }

  // Update active chips
  $all("[data-lang]").forEach(btn=>{
    btn.classList.toggle("active", btn.getAttribute("data-lang") === lang);
  });

  // Title
  document.title = dict[lang].siteName;
}

export function initLang(){
  applyLang(getLang());
}
