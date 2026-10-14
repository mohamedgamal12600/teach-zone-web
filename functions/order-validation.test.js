'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { normalizeCheckoutInput, OrderInputError } = require('./order-validation');

const valid = () => ({
  items: [{ id: '1', quantity: 2, price: 1, name: 'tampered name' }],
  total: 2,
  delivery: {
    name: 'Test Customer',
    phone: '+20 100 123 4567',
    address: '12 Main Street, District',
    city: 'Cairo',
    notes: '',
  },
});

test('normalizes checkout fields and ignores all client-supplied prices/totals', () => {
  const result = normalizeCheckoutInput(valid());
  assert.deepEqual(result.items, [{ id: '1', quantity: 2 }]);
  assert.equal('total' in result, false);
  assert.equal('price' in result.items[0], false);
  assert.equal(result.delivery.city, 'Cairo');
});

test('rejects an invalid product id', () => {
  const input = valid(); input.items[0].id = '../orders';
  assert.throws(() => normalizeCheckoutInput(input), OrderInputError);
});

test('rejects invalid or excessive quantity', () => {
  const input = valid(); input.items[0].quantity = 11;
  assert.throws(() => normalizeCheckoutInput(input), OrderInputError);
});

test('rejects duplicate product lines', () => {
  const input = valid(); input.items.push({ id: '1', quantity: 1 });
  assert.throws(() => normalizeCheckoutInput(input), OrderInputError);
});

test('rejects invalid delivery fields', () => {
  const input = valid(); input.delivery.address = 'short';
  assert.throws(() => normalizeCheckoutInput(input), OrderInputError);
});
