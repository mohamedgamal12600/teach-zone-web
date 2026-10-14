// Run from the repository root:
// node functions/seed.mjs <service-account-json-outside-repo> --apply
// The service-account key is private. Never place it in this repository or commit it.
import { readFileSync } from 'node:fs';
import { D } from '../techzone-real/js/data.js';

const keyPath = process.argv[2];
const apply = process.argv.includes('--apply');
if (!apply) {
  console.log(`Dry run: ${D.length} product records would be seeded. Review techzone-real/js/data.js, then add --apply to write.`);
  process.exit(0);
}
if (!keyPath) {
  console.error('Usage: node functions/seed.mjs <service-account-json> --apply');
  process.exit(2);
}

const serviceAccount = JSON.parse(readFileSync(keyPath, 'utf8'));
const { initializeApp, cert } = await import('firebase-admin/app');
const { FieldValue, getFirestore } = await import('firebase-admin/firestore');
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();
const batch = db.batch();
for (const [id, brand, name, category, price] of D) {
  batch.set(db.collection('products').doc(String(id)), {
    brand,
    name,
    category,
    price,
    updatedAt: FieldValue.serverTimestamp(),
  }, { merge: true });
}
await batch.commit();
console.log('Seeded', D.length, 'reviewed product records.');
