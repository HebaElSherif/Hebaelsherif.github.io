# Heba ElSherif Academy (Static + Firebase)

## What’s inside
- Static website (HTML/CSS/JS) designed for GitHub Pages.
- Firebase Authentication (Email/Password + optional Google)
- Firestore bookings with 30-minute slots (6:00–21:00) and Friday off
- Prevents double-booking using Firestore transaction
- Customer dashboard (profile + bookings)
- Admin page gate (email allowlist)
- Calendar invite (.ics) + WhatsApp quick message
- Basic SEO + privacy/terms/refund pages

## Setup steps
1) Firebase Console:
   - Enable Auth providers (Email/Password + optional Google)
   - Add authorized domains:
     - hebaelsherifacademy.com
     - www.hebaelsherifacademy.com
     - hebaelsherif.github.io
2) Firestore:
   - Create database in Production mode
   - Add security rules from `firebase.rules` (Firestore Rules)
3) Admin:
   - Edit `assets/js/app.js` → APP_ADMIN_EMAILS and put your email.

## Deploy on GitHub Pages
- Put all files at repo root (as-is) and push.
- In GitHub → Settings → Pages → Deploy from branch (main / root)
- Ensure your custom domain points to GitHub Pages.

## Notes
- Payment is deferred now. Later you can add Firebase Functions for Paymob/Fawry + safe pricing.
