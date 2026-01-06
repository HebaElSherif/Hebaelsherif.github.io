خطواتك بعد استلام النسخة النهائية:

1) assets/js/app.js
   - ضع إيميل الأدمن في APP_ADMIN_EMAILS (lowercase)
   مثال:
   export const APP_ADMIN_EMAILS = ["you@example.com"];

2) Firebase Console -> Firestore -> Rules
   - انسخ محتوى ملف firebase.rules كما هو
   - غيّر YOUR_ADMIN_EMAIL_HERE إلى نفس إيميل الأدمن (lowercase)
   - Publish

3) Upload:
   - ارفع كل الملفات كما هي بنفس الهيكل
   - تأكد أن booking.html و profile.html و admin.html شغّالين

4) SEO:
   - robots.txt موجود
   - sitemap.xml محدث (أعد إرساله في Search Console)
