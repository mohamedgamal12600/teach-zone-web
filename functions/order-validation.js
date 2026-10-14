'use strict';

class OrderInputError extends Error {
  constructor(message) {
    super(message);
    this.name = 'OrderInputError';
  }
}

const text = (value, label, { min = 1, max = 240, optional = false } = {}) => {
  if (optional && (value === undefined || value === null || value === '')) return '';
  if (typeof value !== 'string') throw new OrderInputError(`${label} must be text.`);
  const normalized = value.trim();
  if (normalized.length < min || normalized.length > max) {
    throw new OrderInputError(`${label} must be ${min}–${max} characters.`);
  }
  return normalized;
};

function normalizeCheckoutInput(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new OrderInputError('Invalid order details.');
  }
  if (!Array.isArray(input.items) || input.items.length < 1 || input.items.length > 35) {
    throw new OrderInputError('An order must contain between 1 and 35 products.');
  }

  const seen = new Set();
  const items = input.items.map((item) => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      throw new OrderInputError('Invalid product in order.');
    }
    const id = String(item.id ?? '');
    const quantity = item.quantity;
    if (!/^[1-9]\d?$/.test(id) || Number(id) > 35) {
      throw new OrderInputError('A product in the order is invalid.');
    }
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10) {
      throw new OrderInputError('Each product quantity must be between 1 and 10.');
    }
    if (seen.has(id)) throw new OrderInputError('Each product may appear only once in the order.');
    seen.add(id);
    // Deliberately ignore every client-supplied price, total, name, or brand.
    return { id, quantity };
  });

  const deliveryInput = input.delivery;
  if (!deliveryInput || typeof deliveryInput !== 'object' || Array.isArray(deliveryInput)) {
    throw new OrderInputError('Delivery details are required.');
  }
  const name = text(deliveryInput.name, 'Name', { min: 2, max: 80 });
  const phone = text(deliveryInput.phone, 'Phone', { min: 7, max: 30 });
  const phoneDigits = phone.replace(/\D/g, '');
  if (phoneDigits.length < 7 || phoneDigits.length > 15) {
    throw new OrderInputError('Enter a valid phone number.');
  }
  const address = text(deliveryInput.address, 'Address', { min: 8, max: 240 });
  const city = text(deliveryInput.city, 'City', { min: 2, max: 80 });
  const notes = text(deliveryInput.notes ?? '', 'Notes', { min: 0, max: 500, optional: true });

  return {
    items,
    delivery: { name, phone, address, city, notes },
  };
}

module.exports = { normalizeCheckoutInput, OrderInputError };
