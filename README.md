# TeachZone Web Store

Firebase-backed electronics storefront for TechZone. The canonical web application lives in [`techzone-real/`](techzone-real/); the repository-root `index.html` forwards to it for static previews. Firebase Hosting serves `techzone-real/` directly.

- **Live site:** [teach-zone-adec7.web.app](https://teach-zone-adec7.web.app/)
- **Firebase project:** `teach-zone-adec7` (shared with the Flutter app)
- **Catalog:** 35 Firestore products with numbered images `techzone-real/assets/images/1.png`–`35.png`
- **Currency / payment:** EGP / cash on delivery (COD) only
- **Detailed setup, seed, deploy, and security notes:** [`techzone-real/README.txt`](techzone-real/README.txt)

> **Current limitation:** Hosting and Firestore rules are deployed, but the `createOrder` Cloud Function is not. Firebase required the Blaze billing plan to enable/deploy Functions during the last deployment attempt. The checkout form can be displayed, but placing an order is not available until the function is deployed and tested.

## What the site provides

- Live product catalog from Firestore, category browsing, product details, search/filtering, and brand links.
- Cart drawer and browser-local cart state.
- Saved/favorite products.
- Firebase email/password login, registration, password reset, and profile editing.
- Account page that reads the signed-in user's orders.
- Cash-on-delivery checkout UI; trusted order creation is designed to occur only through a callable Cloud Function.

Hash routes include `#/`, `#/product/{id}`, `#/login`, `#/register`, `#/reset`, `#/checkout`, and `#/account`. Checkout/account routes require a signed-in Firebase user.

## Architecture and key files

| File/path | Purpose |
|---|---|
| `index.html` | Repository-root forwarding entry for local/static hosting |
| `firebase.json` | Firebase Hosting, Firestore Rules, and Functions deployment configuration |
| `.firebaserc` | Default Firebase project alias (`teach-zone-adec7`) |
| `techzone-real/index.html` | Store document and app entry point |
| `techzone-real/css/` | Responsive storefront styles |
| `techzone-real/js/app.js` | Hash routes, catalog, auth, cart, profile, checkout, and order UI |
| `techzone-real/js/firebase.js` | Firebase browser SDK and Functions initialization |
| `techzone-real/js/firebase-config.js` | Public browser Firebase configuration; contains no Admin credential |
| `techzone-real/js/brands.js` | Curated brand links |
| `techzone-real/js/data.js` | Seed-only 35-product mirror; the storefront does not use it as a fallback catalog |
| `techzone-real/assets/images/` | Product images mapped by Firestore document IDs 1–35 |
| `techzone-real/firestore.rules` | Firestore access policy for products, user profiles, and top-level orders |
| `functions/index.js` | Callable `createOrder` Cloud Function |
| `functions/order-validation.js` | Validation of checkout fields, product IDs, and quantities |
| `functions/order-validation.test.js` | Unit tests for input validation and client-price rejection |
| `functions/seed.mjs` | Guarded Admin seed tool (dry-run unless `--apply` is supplied) |

The web app uses the modular Firebase browser SDK from Google’s hosted SDK modules. Cloud Functions use Node.js 22, Firebase Functions v2 HTTPS callable APIs, and Firebase Admin.

## Firestore data model

### Products

The storefront reads `products/{id}`. The live catalog has 35 documents, IDs `1`–`35`, originating from the Flutter app catalog. At minimum, the site validates `name`, `brand`, `category`, and a positive numeric `price`; the document ID selects the corresponding numbered image. Product reads are public; client writes are denied by the current rules.

`techzone-real/js/data.js` is only a seed input mirror. It is not an offline/demo fallback for the storefront. Review prices, categories, availability, and image rights before any seed write.

### Profiles

The browser creates/updates `users/{uid}` with `name`, `email`, `phone`, and `createdAt`. Rules restrict access to the signed-in owner and validate the allowed field set.

### Orders

The intended web order is created by the authenticated `createOrder` function at top-level `orders/{id}`. It reads authoritative prices from Firestore, calculates the item total on the server, stores delivery details and COD payment type, and begins with `pending` status. Users can read their own orders; the rules allow a pending order to be changed to `cancelled`, but deny client-side order creation and deletion.

## Local setup and tests

Prerequisites: Node.js 22 for Functions, Python 3 for the simple static preview, and Firebase CLI for Firebase operations.

```bash
# From the repository root
npm ci --prefix functions
npm test --prefix functions
python -m http.server 8000
```

Open [http://localhost:8000/](http://localhost:8000/). The root page forwards to `/techzone-real/`. The checked-in web configuration targets the shared project; do not submit test accounts or orders to production while validating the UI.

To run only the server-side validation tests:

```bash
npm test --prefix functions
```

The seed command is dry-run by default:

```bash
node functions/seed.mjs C:\secure\path\serviceAccountKey.json
```

Only after reviewing the output and confirming the data, `--apply` performs merge writes for IDs 1–35. It updates brand, name, category, price, and `updatedAt`; it does not delete other fields. Keep the service-account key outside the repository and never commit it.

## Firebase configuration and deployment

- The browser config in `techzone-real/js/firebase-config.js` targets `teach-zone-adec7`. Firebase web config/API keys are client-side identifiers, not Admin secrets; restrict the key to required APIs and authorized domains.
- Enable Email/Password in Firebase Authentication and authorize the domain used for local testing (for example `localhost`) and the production domain.
- Firestore Hosting/rules were deployed previously. Review the *whole shared project's* rules before publishing changes: the Flutter app also uses this Firebase project and has a different profile/order contract.
- The `createOrder` function has not been deployed. Deployment may require Blaze and APIs enabled for Cloud Functions. Do not advertise a working checkout until the function is deployed and end-to-end tested.

After reviewing the project target, rules, function source, region, and billing requirements, deploy explicitly:

```bash
firebase deploy --only hosting,firestore:rules,functions --project teach-zone-adec7
```

No deploy is triggered by a Git push. See [`techzone-real/README.txt`](techzone-real/README.txt) for the operational seed/deploy procedure.

## Security and production limitations

- Never put a service-account private key in the website directory, browser code, or Git.
- Keep direct order writes disabled; the server function must own price calculation and order creation.
- COD only. No card-payment processor, delivery-fee calculation, inventory reservation, order notifications, or admin dashboard is included.
- Verify prices, product availability, and image usage rights before taking commercial orders.
- The current website rules and Flutter app are not yet fully interoperable; see the cross-project summary for the precise profile and order schema mismatch.

## Verification snapshot

Local preview check on 2026-10-14:

- Root URL returned HTTP 200 and forwarded to the canonical store.
- Firestore catalog rendered 35 distinct product images across six categories.
- Product detail and a local cart add/remove round trip worked; the test item was removed and no order was submitted.
- Login, registration, and password-reset forms rendered; no credentials were entered and no account/email was submitted.
- Browser console reported zero errors during the inspected flow.
- JavaScript syntax checks passed; Functions tests passed 5/5; guarded seed dry-run reported 35 records.

## Related project

The Flutter app is in [mohamedgamal12600/teach-zone](https://github.com/mohamedgamal12600/teach-zone/tree/fix/final-audit). It provides the 35-product source catalog but currently writes profiles/orders using a different Firestore schema; align both clients with the server-side order contract before calling the ecosystem production-ready.

## Duplicate-file audit (2026-10-14)

The SHA-256 scan excluded generated build/dependency caches and treated byte-identical files as duplicates:

- The canonical hosted site (`techzone-real/`) has one exact duplicate product-image pair: `assets/images/1.png` and `assets/images/2.png` (340,390 bytes each). These correspond to PlayStation 5 and PlayStation 5 Digital Edition; confirm whether sharing the same artwork is intentional before changing it.
- 35 numbered website product-image files are copied from the Flutter catalog into this repository so Hosting is self-contained (33 distinct image byte patterns because the PS5 pair is identical). These cross-project copies are expected.
- `techzone-brand/` is a separate, tracked Flutter branding scaffold (179 tracked files), not the website served by Firebase Hosting; `firebase.json` serves only `techzone-real/`, and no tracked site source refers to `techzone-brand/`. The scan found 17 exact-duplicate groups inside that scaffold and 27 content hashes shared with the main Flutter app. It is a cleanup candidate, but it was retained and no files were deleted in this audit.
- Repeated icon/splash and platform-template files in the scaffold occupy different Android/iOS/macOS resource slots; do not remove those files based on hash equality alone.


### Cleanup result

The earlier audit identified `techzone-brand/` as a tracked, unreferenced Flutter scaffold. Per the cleanup request, its 179 tracked files and ignored generated contents were removed from this website worktree and staged for Git; the website itself continues to be served from `techzone-real/`. No product-image copies in the live site were removed.
