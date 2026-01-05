ملاحظات سريعة قبل الرفع:

1) افتح js/config.js
   - عدّل whatsappNumber
   - حط adminEmails (إيميل الأدمن الحقيقي بدل YOUR_ADMIN_EMAIL_HERE)
2) Firebase Console:
   - Authentication -> فعّل Email/Password
   - Firestore Database -> فعّل (تم)
   - Firestore Rules -> انسخ قواعد FIRESTORE_RULES.txt بعد تعديل الإيميل
3) ضع favicon.ico في جذر الموقع (جنب index.html)
   (اختياري) ضع favicon-192.png و favicon-512.png في الجذر للـPWA
4) ارفع كل الملفات على الاستضافة كما هي (نفس الهيكل)
5) Search Console:
   - افتح Sitemaps وارفع: sitemap.xml
   - URL Inspection للصفحة الرئيسية و Request Indexing

صفحات خاصة (لن تُفهرس):
- login.html
- dashboard.html
- admin.html
