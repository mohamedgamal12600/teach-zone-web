'use strict';

const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { initializeApp, getApps } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const { normalizeCheckoutInput, OrderInputError } = require('./order-validation');

if (getApps().length === 0) initializeApp();
const db = getFirestore();

exports.createOrder = onCall({ maxInstances: 10 }, async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Please sign in before placing an order.');
  }

  let checkout;
  try {
    checkout = normalizeCheckoutInput(request.data);
  } catch (error) {
    if (error instanceof OrderInputError) {
      throw new HttpsError('invalid-argument', error.message);
    }
    throw error;
  }

  const refs = checkout.items.map((item) => db.collection('products').doc(item.id));
  const snapshots = await db.getAll(...refs);
  const orderItems = snapshots.map((snapshot, index) => {
    if (!snapshot.exists) {
      throw new HttpsError('failed-precondition', 'A product is no longer available. Refresh the catalog.');
    }
    const product = snapshot.data();
    const price = Number(product.price);
    if (!Number.isSafeInteger(price) || price <= 0) {
      throw new HttpsError('failed-precondition', 'A product has an invalid price and cannot be ordered.');
    }
    if (typeof product.name !== 'string' || !product.name.trim()) {
      throw new HttpsError('failed-precondition', 'A product is not ready to order.');
    }
    const requested = checkout.items[index];
    return {
      id: snapshot.id,
      name: product.name.trim().slice(0, 160),
      brand: typeof product.brand === 'string' ? product.brand.trim().slice(0, 80) : '',
      unitPrice: price,
      qty: requested.quantity,
    };
  });

  const total = orderItems.reduce((sum, item) => sum + item.unitPrice * item.qty, 0);
  if (!Number.isSafeInteger(total) || total <= 0) {
    throw new HttpsError('failed-precondition', 'The order total could not be verified.');
  }

  try {
    const orderRef = db.collection('orders').doc();
    await orderRef.set({
      uid: request.auth.uid,
      items: orderItems,
      total,
      delivery: checkout.delivery,
      payment: 'cod',
      status: 'pending',
      createdAt: FieldValue.serverTimestamp(),
    });
    return { orderId: orderRef.id, total };
  } catch (error) {
    throw new HttpsError('internal', 'The order could not be saved. Please try again.');
  }
});
