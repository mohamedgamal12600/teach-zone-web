// Usage: cd scripts && npm i firebase-admin && node seed.mjs path/to/serviceAccountKey.json
// NEVER commit or share the service account key.
import { readFileSync } from 'node:fs';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { D } from '../js/data.js';

initializeApp({ credential: cert(JSON.parse(readFileSync(process.argv[2], 'utf8'))) });
const db = getFirestore();
const batch = db.batch();
for (const [id, brand, name, category, price] of D) {
  batch.set(db.collection('products').doc(String(id)), { brand, name, category, price });
}
await batch.commit();
console.log('Seeded', D.length, 'products');
