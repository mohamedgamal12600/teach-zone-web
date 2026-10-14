TechZone website (real Firebase: auth, live products, cart, orders, profile)

1. Firebase console (your project):
   - Project settings > Your apps > Add app > Web. Copy the config into js/firebase-config.js
   - Authentication > Sign-in method > enable Email/Password
   - Authentication > Settings > Authorized domains: keep localhost, add your hosting domain
   - Firestore Database > Create database
   - Firestore > Rules: paste firestore.rules and Publish
2. Load the 35 products into Firestore (one time, from your computer):
   - Project settings > Service accounts > Generate new private key (keep this file private, never commit it)
   - cd scripts ; npm i firebase-admin ; node seed.mjs path\to\serviceAccountKey.json
3. Put your product photos in assets/images/ named 1.png ... 35.png
4. Run:  python -m http.server 8000   then open http://localhost:8000
5. Test only with your own test accounts. Orders are cash on delivery (status pending).

Known limits: order prices and totals are sent by the browser, so check them before fulfilling an order.
To make them trusted, create orders from a Cloud Function that reads prices from the products collection.
Card payments need a payment provider (for example Paymob or Stripe) and a server.
Design credit: Electronics E-Commerce App UI by Heba Zatar (free, personal use).
