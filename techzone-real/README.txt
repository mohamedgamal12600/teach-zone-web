TeachZone — Firebase-backed store
==================================

The canonical web app is in this folder. The repository-root index.html forwards here for static hosts; Firebase Hosting serves this folder directly.

Live project and catalog
------------------------
- Public site: https://teach-zone-adec7.web.app/
- Firebase project: teach-zone-adec7. The browser configuration is in js/firebase-config.js; it is client-side Firebase configuration, not an Admin credential.
- The live Firestore `products` collection contains 35 products sourced from the Flutter app's `lib/data/products.dart`. Document IDs 1–35 match the numbered images in assets/images/.
- `js/data.js` is a seed-only mirror for the guarded Admin seed tool; the storefront reads Firestore, not this file. Review its records, prices, categories, availability, and image rights before any seed write.
- Product prices are displayed in EGP. Confirm prices and stock/availability before accepting real orders.

Authentication and orders
-------------------------
- The site uses Firebase Authentication and Firestore for the public catalog and each user's own profile/orders. The published site has restored an authenticated session; the login form is available at `#/login`.
- Firestore rules deny direct client order creation. The callable `createOrder` Cloud Function validates product IDs and quantities, recalculates prices from Firestore, and creates cash-on-delivery orders.
- Important deployment status: Hosting and Firestore rules are deployed, but `createOrder` has not been deployed. Firebase required the Blaze billing plan to enable/deploy Functions during the last deployment attempt. Checkout order creation is therefore not verified or available until Functions are deployed.
- Cash on delivery only. There is no card-payment integration, delivery-fee calculation, inventory reservation, notification service, or admin dashboard. The site does not collect card details.

Local setup
-----------
1. Install the Firebase CLI and sign in with an account authorized for project teach-zone-adec7.
2. Install and test the Functions code:

   npm ci --prefix functions
   npm test --prefix functions

3. For a local preview, run `python -m http.server 8000` from the repository root and open http://localhost:8000/ . The root page forwards to `/techzone-real/`.
4. The Firebase Web config is already set for teach-zone-adec7. Restrict its API key to the required APIs and website domains. Never put a service-account private key in the website folder or commit one.

Catalog seed tool
-----------------
`functions/seed.mjs` performs a dry run by default and reads the seed-only mirror in `js/data.js`:

   node functions/seed.mjs C:\secure\path\serviceAccountKey.json

Only after reviewing the preview and confirming the product data, explicitly write with:

   node functions/seed.mjs C:\secure\path\serviceAccountKey.json --apply

The `--apply` mode uses merge writes to the `products` collection and updates brand, name, category, price, and updatedAt for IDs 1–35. It does not delete other fields. Keep the service-account key outside this repository and protect/delete it after use. Do not run the seed against production without reviewing the payload first.

Deployment
----------
The Firebase project alias is configured in `.firebaserc`; `firebase.json` serves this folder and points to the local Firestore rules and Functions source. Review the live rules and project target before deploying. After enabling the plan/APIs required for Cloud Functions, deploy explicitly:

   firebase deploy --only hosting,firestore:rules,functions --project teach-zone-adec7

No deployment is performed merely by these files or by pushing them to GitHub.

Security
--------
The `.gitignore` excludes local Firebase state, environment files, and service-account credentials. Never commit Admin credentials. The public Firebase Web config is intended for browser use; restrict its API key and rely on Firebase Auth, Firestore Rules, and server-side order validation for protection.
