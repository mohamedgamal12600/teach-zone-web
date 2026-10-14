import { auth, db, functions, configured } from './firebase.js';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  deleteUser,
} from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js';
import {
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  serverTimestamp,
} from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js';
import { httpsCallable } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-functions.js';
import { brandLinks } from './brands.js';

const $ = (selector) => document.querySelector(selector);
const MAX_PRODUCT_ID = 35;
const MAX_QUANTITY = 10;
const currency = (value) => `EGP ${Number(value).toLocaleString('en-US')}`;
const escapeHTML = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}[char]));

const readLocal = (key, fallback) => {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return value ?? fallback;
  } catch {
    return fallback;
  }
};
const writeLocal = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // The store remains usable if browser storage is disabled or full.
  }
};
const validProductId = (id) => {
  const value = String(id);
  return /^[1-9]\d?$/.test(value) && Number(value) <= MAX_PRODUCT_ID;
};
const cleanCart = (value) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return Object.fromEntries(Object.entries(value)
    .filter(([id, quantity]) => validProductId(id) && Number.isInteger(quantity) && quantity > 0)
    .map(([id, quantity]) => [id, Math.min(quantity, MAX_QUANTITY)]));
};

const icons = {
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  menu: '<path d="M4 9h16M4 15h16"/>',
  bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
  heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21.2l7.8-7.7 1-1.1a5.5 5.5 0 0 0 0-7.8z"/>',
  bag: '<path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0"/>',
  minus: '<path d="M5 12h14"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
};
const icon = (name, filled = false) => `<svg class="ic${filled ? ' f' : ''}" viewBox="0 0 24 24" aria-hidden="true">${icons[name]}</svg>`;

let toastTimer;
function toast(message) {
  let node = $('#toast');
  if (!node) {
    node = document.createElement('div');
    node.id = 'toast';
    node.setAttribute('role', 'status');
    document.body.appendChild(node);
  }
  node.textContent = message;
  node.className = 'show';
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { node.className = ''; }, 2600);
}

const initialFavorites = readLocal('tz.fav', []);
const state = {
  category: 'All',
  search: '',
  sort: 'featured',
  quantity: 1,
  cartOpen: false,
  busy: false,
  ready: false,
  catalogState: 'loading',
  catalogMessage: '',
  user: null,
  profile: null,
  orders: null,
  form: {},
  error: '',
  success: '',
  nextRoute: '',
  favorites: Array.isArray(initialFavorites) ? initialFavorites.filter(validProductId) : [],
  cart: cleanCart(readLocal('tz.cart.guest', {})),
};
let products = [];

const cartKey = () => `tz.cart.${state.user ? state.user.uid : 'guest'}`;
const saveCart = () => writeLocal(cartKey(), state.cart);
const cartCount = () => Object.values(state.cart).reduce((sum, value) => sum + value, 0);
const productById = (id) => products.find((product) => product.id === String(id));
const categories = () => [...new Set(products.map((product) => product.category))].sort((a, b) => a.localeCompare(b));
const cartLines = () => Object.keys(state.cart)
  .filter((id) => validProductId(id) && productById(id))
  .map((id) => ({ product: productById(id), quantity: state.cart[id] }));
const estimateSubtotal = () => cartLines().reduce((sum, line) => sum + line.product.price * line.quantity, 0);

function visibleProducts() {
  const result = products.filter((product) => {
    const inCategory = state.category === 'All'
      || (state.category === 'Saved' ? state.favorites.includes(product.id) : product.category === state.category);
    const search = `${product.name} ${product.brand} ${product.category}`.toLowerCase();
    return inCategory && search.includes(state.search.trim().toLowerCase());
  });
  if (state.sort === 'low') result.sort((a, b) => a.price - b.price);
  if (state.sort === 'high') result.sort((a, b) => b.price - a.price);
  if (state.sort === 'az') result.sort((a, b) => a.name.localeCompare(b.name));
  return result;
}

const productImage = (product) => `assets/images/${product.id}.png`;
const favoriteButton = (product) => {
  const saved = state.favorites.includes(product.id);
  return `<button class="hb${saved ? ' on' : ''}" data-act="favorite" data-id="${escapeHTML(product.id)}" aria-label="${saved ? 'Remove' : 'Save'} ${escapeHTML(product.name)}">${icon('heart', saved)}</button>`;
};
const productCard = (product) => `<article class="pc">${favoriteButton(product)}<a class="pi" href="#/product/${escapeHTML(product.id)}"><img src="${productImage(product)}" alt="${escapeHTML(product.name)}" loading="lazy"></a><div class="pb"><small>${escapeHTML(product.brand)} · ${escapeHTML(product.category)}</small><h3><a href="#/product/${escapeHTML(product.id)}">${escapeHTML(product.name)}</a></h3><div class="pr"><b>${currency(product.price)}</b></div><button class="add" data-act="add" data-id="${escapeHTML(product.id)}">${icon('bag')}Add to cart</button></div></article>`;

function catalogMessage() {
  if (state.catalogState === 'loading') return 'Loading the live catalog…';
  if (state.catalogState === 'error') return state.catalogMessage || 'The live catalog is temporarily unavailable. Please try again.';
  return 'There are no products available at the moment.';
}
function productGrid() {
  return visibleProducts().map(productCard).join('')
    || `<p class="empty">${state.category === 'Saved' && !state.search ? 'No saved products yet. Select a heart to save one.' : 'No products match your search.'}</p>`;
}
function homeView() {
  if (!products.length) {
    return `<section class="w sec"><h1>Shop</h1><p class="empty">${escapeHTML(catalogMessage())}</p><button class="cta" data-act="retry"${state.catalogState === 'loading' ? ' disabled' : ''}>Retry</button></section>`;
  }
  const featured = productById('1') || products[0];
  return `<section class="w hero"><div><h1>Technology for work, play, and everyday life</h1><p>Browse the live catalog, compare products, and place a cash-on-delivery order.</p><a class="cta" href="#/product/${escapeHTML(featured.id)}">View ${escapeHTML(featured.name)} · ${currency(featured.price)}</a> <button class="cta ghost" data-act="shop">Browse all</button></div><img src="${productImage(featured)}" alt="${escapeHTML(featured.name)}"></section>
<section class="w sec"><h2>Shop by category</h2><div class="tiles">${categories().map((category) => {
    const first = products.find((product) => product.category === category);
    const quantity = products.filter((product) => product.category === category).length;
    return `<button class="tile" data-act="category" data-value="${escapeHTML(category)}"><img src="${productImage(first)}" alt=""><div><b>${escapeHTML(category)}</b><span>${quantity} product${quantity === 1 ? '' : 's'}</span></div></button>`;
  }).join('')}</div></section>
<section class="w sec" id="shop"><h2>Products</h2><div class="tool"><div class="chips">${['All', 'Saved', ...categories()].map((category) => `<button class="chip${category === state.category ? ' on' : ''}" data-act="category" data-value="${escapeHTML(category)}">${escapeHTML(category)}</button>`).join('')}</div><div class="ctl"><input id="search" type="search" placeholder="Search products" value="${escapeHTML(state.search)}" aria-label="Search products"><select id="sort" aria-label="Sort products">${[['featured', 'Featured'], ['low', 'Price: low to high'], ['high', 'Price: high to low'], ['az', 'Name: A to Z']].map(([value, label]) => `<option value="${value}"${state.sort === value ? ' selected' : ''}>${label}</option>`).join('')}</select></div></div><div class="grid" id="grid">${productGrid()}</div></section>`;
}
function productDetail(id) {
  const product = productById(id);
  if (!product) return `<section class="w sec"><h1>Product not found</h1><p class="empty"><a href="#/">Return to the shop</a></p></section>`;
  const brandUrl = Object.hasOwn(brandLinks, product.brand) ? brandLinks[product.brand] : null;
  const brand = brandUrl
    ? `<a class="bl" href="${brandUrl}" target="_blank" rel="noopener noreferrer">${escapeHTML(product.brand)} website</a>`
    : escapeHTML(product.brand);
  const saved = state.favorites.includes(product.id);
  return `<div class="w"><div class="bc"><a href="#/">Home</a> / ${escapeHTML(product.category)} / ${escapeHTML(product.name)}</div><div class="pd"><div class="pm"><img src="${productImage(product)}" alt="${escapeHTML(product.name)}"></div><div><small style="color:var(--t2)">${escapeHTML(product.brand)} · ${escapeHTML(product.category)}</small><h1>${escapeHTML(product.name)}</h1><div class="big"><b>${currency(product.price)}</b></div><p class="lb">Brand: ${brand}</p><div class="row"><div class="q"><button data-act="quantity-down" aria-label="Less">${icon('minus')}</button><em>${state.quantity}</em><button data-act="quantity-up" aria-label="More">${icon('plus')}</button></div><button class="cta" data-act="add-quantity" data-id="${escapeHTML(product.id)}">${icon('bag')}Add to cart</button><button class="cta ghost" data-act="favorite" data-id="${escapeHTML(product.id)}">${icon('heart', saved)}${saved ? 'Saved' : 'Save'}</button></div></div></div><section class="sec"><h2>You may also like</h2><div class="grid" style="margin-top:20px">${products.filter((item) => item.id !== product.id).slice(0, 4).map(productCard).join('')}</div></section></div>`;
}
function drawerView() {
  const lines = cartLines();
  return `<div class="ov${state.cartOpen ? ' on' : ''}" data-act="drawer"></div><aside class="${state.cartOpen ? 'on' : ''}" aria-label="Shopping cart" ${state.cartOpen ? '' : 'inert'}><div class="ah"><h2>Your cart</h2><button data-act="drawer" aria-label="Close cart">${icon('x')}</button></div><div class="al">${lines.length ? lines.map(({ product, quantity }) => `<div class="ci"><img src="${productImage(product)}" alt="${escapeHTML(product.name)}"><div><b>${escapeHTML(product.name)}</b><span>${currency(product.price)}</span></div><div class="q"><button data-act="decrement" data-id="${product.id}" aria-label="Remove one">${icon('minus')}</button><em>${quantity}</em><button data-act="increment" data-id="${product.id}" aria-label="Add one">${icon('plus')}</button></div></div>`).join('') : '<p class="empty">Your cart is empty.</p>'}</div>${lines.length ? `<div class="af"><p><span>Estimated items subtotal</span><b>${currency(estimateSubtotal())}</b></p><button class="cta" data-act="checkout">Checkout</button></div>` : ''}</aside>`;
}
function footerView() {
  return `<footer><div class="w"><div class="fg"><div><b>TechZone</b>Electronics and gaming products.</div><div><b>Shop</b>${categories().map((category) => `<a href="#/" data-act="category" data-value="${escapeHTML(category)}">${escapeHTML(category)}</a>`).join('')}</div><div class="brands"><b>Brands</b>${Object.entries(brandLinks).map(([brand, url]) => `<a href="${url}" target="_blank" rel="noopener noreferrer">${escapeHTML(brand)}</a>`).join('')}</div><div><b>Payment</b>Cash on delivery only. No card details are collected by this site.</div></div><div class="cp">Orders are submitted as pending and can be cancelled before processing.</div></div></footer>`;
}

const field = (name, label, type = 'text', autocomplete = '', required = true) => `<label class="fl">${label}<input name="${name}" type="${type}" autocomplete="${autocomplete || name}" value="${type === 'password' ? '' : escapeHTML(state.form[name] || '')}"${required ? ' required' : ''}></label>`;
const messages = () => (state.error ? `<p class="err" role="alert">${escapeHTML(state.error)}</p>` : '') + (state.success ? `<p class="ok" role="status">${escapeHTML(state.success)}</p>` : '');
const submitButton = (label) => `<button class="cta"${state.busy ? ' disabled aria-busy="true"' : ''}>${state.busy ? 'Please wait…' : label}</button>`;
function authView(mode) {
  const views = {
    login: ['Log in', [field('email', 'Email', 'email', 'username'), field('password', 'Password', 'password', 'current-password')]],
    register: ['Create account', [field('name', 'Full name', 'text', 'name'), field('email', 'Email', 'email'), field('phone', 'Phone', 'tel'), field('password', 'Password (6+ characters)', 'password', 'new-password'), field('confirm', 'Confirm password', 'password', 'new-password')]],
    reset: ['Send reset link', [field('email', 'Email', 'email')]],
  };
  const [title, fields] = views[mode];
  const links = mode === 'login' ? '<a href="#/reset">Forgot password?</a> · <a href="#/register">Create account</a>' : '<a href="#/login">Back to log in</a>';
  return `<div class="w"><form class="box" id="form-${mode}" novalidate><h1>${mode === 'reset' ? 'Reset password' : title}</h1>${fields.join('')}${messages()}${submitButton(title)}<p class="sm">${links}</p></form></div>`;
}
function checkoutView() {
  const lines = cartLines();
  if (!lines.length) return `<section class="w sec"><h1>Checkout</h1><p class="empty">Your cart is empty. <a class="bl" href="#/">Browse products</a></p></section>`;
  return `<div class="w co"><form class="box" id="form-checkout" novalidate><h1>Delivery details</h1>${field('name', 'Full name', 'text', 'name')}${field('phone', 'Phone', 'tel', 'tel')}${field('address', 'Address', 'text', 'street-address')}${field('city', 'City', 'text', 'address-level2')}${field('notes', 'Notes (optional)', 'text', 'off', false)}<p class="lb">Payment: cash on delivery</p><p class="sm">The final items total is recalculated securely when you place the order.</p>${messages()}${submitButton('Place order')}</form><div class="box"><h2>Order summary</h2>${lines.map(({ product, quantity }) => `<div class="sl"><span>${escapeHTML(product.name)} × ${quantity}</span><b>${currency(product.price * quantity)}</b></div>`).join('')}<div class="sl tot"><span>Estimated items subtotal</span><b>${currency(estimateSubtotal())}</b></div></div></div>`;
}
function accountView() {
  const orders = state.orders;
  const orderDate = (order) => order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString('en-GB') : 'Recently placed';
  return `<div class="w co"><form class="box" id="form-profile" novalidate><h1>My account</h1><label class="fl">Email<input value="${escapeHTML(state.user?.email || '')}" disabled></label>${field('name', 'Full name', 'text', 'name')}${field('phone', 'Phone', 'tel', 'tel', false)}${messages()}${submitButton('Save changes')}<button type="button" class="cta ghost" data-act="logout">Log out</button></form><section class="box"><h2>My orders</h2>${orders === null ? '<p class="empty">Loading orders…</p>' : orders.length ? orders.map((order) => `<article class="od"><div class="sl"><b>${escapeHTML(orderDate(order))}</b><span class="st2 ${escapeHTML(order.status)}">${escapeHTML(order.status)}</span></div><p>${(Array.isArray(order.items) ? order.items : []).map((item) => `${escapeHTML(item.name)} × ${Number(item.qty)}`).join(', ')}</p><div class="sl"><b>${currency(order.total)}</b>${order.status === 'pending' ? `<button class="add" data-act="cancel" data-id="${escapeHTML(order.id)}">Cancel order</button>` : ''}</div></article>`).join('') : '<p class="empty">No orders yet.</p>'}</section></div>`;
}

const headerView = () => `<header><div class="w hd"><a class="logo" href="#/">Tech<i>Zone</i></a><nav><a href="#/">Home</a><button data-act="shop">Shop</button><button data-act="saved">Saved (${state.favorites.length})</button></nav>${state.user ? `<a class="lnk" href="#/account">${escapeHTML((state.user.displayName || 'Account').split(' ')[0])}</a><button class="lnk" data-act="logout">Log out</button>` : '<a class="lnk" href="#/login">Log in</a>'}<button class="cb" data-act="drawer" aria-label="Open cart">${icon('bag')}Cart${cartCount() ? `<span class="bd">${cartCount()}</span>` : ''}</button></div></header>`;
function route() {
  const hash = location.hash || '#/';
  if (hash.startsWith('#/product/')) return ['product', hash.slice('#/product/'.length)];
  const key = hash.slice(2);
  return [['login', 'register', 'reset', 'checkout', 'account'].includes(key) ? key : 'home'];
}
function render() {
  const root = $('#app');
  if (!root) return;
  if (!configured) {
    root.innerHTML = '<main class="w sec"><h1>Store setup incomplete</h1><p class="empty">This store is not connected yet. Please check back later.</p></main>';
    return;
  }
  if (!state.ready) {
    root.innerHTML = '<main class="w sec"><p class="empty">Loading your store…</p></main>';
    return;
  }
  const [page, id] = route();
  if ((page === 'checkout' || page === 'account') && !state.user) {
    state.nextRoute = location.hash;
    location.hash = '#/login';
    return;
  }
  if (page === 'checkout' && state.profile && !state.form.name) state.form = { name: state.profile.name || '', phone: state.profile.phone || '' };
  if (page === 'account' && state.user && !state.form.name) state.form = { name: state.profile?.name || state.user.displayName || '', phone: state.profile?.phone || '' };
  const pages = {
    home: homeView,
    login: () => authView('login'),
    register: () => authView('register'),
    reset: () => authView('reset'),
    checkout: checkoutView,
    account: accountView,
  };
  const body = page === 'product' ? productDetail(id) : (pages[page] || homeView)();
  root.innerHTML = headerView() + `<main>${body}</main>` + footerView() + drawerView();
  if (page === 'account' && state.user && state.orders === null && !state.loadingOrders) void loadOrders();
}

function messageFor(error) {
  const messagesByCode = {
    'auth/invalid-email': 'Enter a valid email address.',
    'auth/user-not-found': 'Email or password is incorrect.',
    'auth/wrong-password': 'Email or password is incorrect.',
    'auth/invalid-credential': 'Email or password is incorrect.',
    'auth/email-already-in-use': 'This email is already registered. Try logging in.',
    'auth/weak-password': 'Password must be at least 6 characters.',
    'auth/too-many-requests': 'Too many attempts. Please try again later.',
    'auth/network-request-failed': 'Connection problem. Check your internet and retry.',
    'functions/unauthenticated': 'Please log in before placing an order.',
    'functions/invalid-argument': error?.message || 'Check the delivery details and try again.',
    'functions/failed-precondition': error?.message || 'A product is no longer available. Refresh the catalog.',
    'functions/resource-exhausted': 'The service is busy. Please try again in a moment.',
    'permission-denied': 'You do not have permission to do that.',
  };
  return messagesByCode[error?.code] || 'Something went wrong. Please try again.';
}
function showSetupNeeded() {
  const node = $('#app');
  if (node) node.innerHTML = '<main class="w sec"><h1>Store setup incomplete</h1><p class="empty">This store is not connected yet. Please check back later.</p></main>';
}
async function loadProducts() {
  state.catalogState = 'loading';
  state.catalogMessage = '';
  render();
  try {
    const snapshot = await getDocs(collection(db, 'products'));
    products = snapshot.docs.map((item) => {
      const data = item.data();
      const id = String(item.id);
      const price = Number(data.price);
      if (!validProductId(id) || typeof data.name !== 'string' || !data.name.trim()
        || typeof data.brand !== 'string' || !data.brand.trim()
        || typeof data.category !== 'string' || !data.category.trim()
        || !Number.isFinite(price) || price <= 0) return null;
      return { id, name: data.name.trim(), brand: data.brand.trim(), category: data.category.trim(), price };
    }).filter(Boolean).sort((a, b) => Number(a.id) - Number(b.id));
    state.catalogState = products.length ? 'ready' : 'empty';
    if (!products.length) state.catalogMessage = 'The catalog has no valid products yet.';
  } catch (error) {
    products = [];
    state.catalogState = 'error';
    state.catalogMessage = messageFor(error);
  }
  render();
}
async function loadOrders() {
  state.loadingOrders = true;
  try {
    const result = await getDocs(query(collection(db, 'orders'), where('uid', '==', state.user.uid)));
    state.orders = result.docs.map((item) => ({ id: item.id, ...item.data() }))
      .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
  } catch (error) {
    state.orders = [];
    toast(messageFor(error));
  }
  state.loadingOrders = false;
  render();
}
const go = (hash) => {
  state.form = {};
  state.error = '';
  state.success = '';
  location.hash = hash;
};
const toShop = () => setTimeout(() => $('#shop')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0);
const validEmail = (email) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
const validPhone = (phone) => {
  const digits = String(phone).replace(/\D/g, '');
  return digits.length >= 7 && digits.length <= 15;
};

function mergeGuestCart(user) {
  const guest = cleanCart(readLocal('tz.cart.guest', {}));
  const saved = cleanCart(readLocal(`tz.cart.${user.uid}`, {}));
  for (const [id, quantity] of Object.entries(guest)) saved[id] = Math.min(MAX_QUANTITY, (saved[id] || 0) + quantity);
  state.cart = saved;
  writeLocal('tz.cart.guest', {});
  saveCart();
}

if (configured) {
  onAuthStateChanged(auth, async (user) => {
    state.user = user;
    if (user) {
      mergeGuestCart(user);
      try {
        const profile = await getDoc(doc(db, 'users', user.uid));
        state.profile = profile.exists() ? profile.data() : null;
      } catch {
        state.profile = null;
      }
    } else {
      state.cart = cleanCart(readLocal('tz.cart.guest', {}));
      state.profile = null;
      state.orders = null;
      state.form = {};
    }
    state.ready = true;
    render();
  });
  void loadProducts();
} else {
  showSetupNeeded();
}

window.addEventListener('hashchange', () => {
  if (!/^#\/(login|register|reset|checkout|account)/.test(location.hash)) {
    state.form = {};
    state.error = '';
    state.success = '';
  }
  render();
  window.scrollTo(0, 0);
});

document.addEventListener('input', (event) => {
  if (event.target.id === 'search') {
    state.search = event.target.value;
    const grid = $('#grid');
    if (grid) grid.innerHTML = productGrid();
  }
});
document.addEventListener('change', (event) => {
  if (event.target.id === 'sort') {
    state.sort = event.target.value;
    const grid = $('#grid');
    if (grid) grid.innerHTML = productGrid();
  }
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && state.cartOpen) {
    state.cartOpen = false;
    render();
  }
});
document.addEventListener('error', (event) => {
  const image = event.target;
  if (image.tagName !== 'IMG') return;
  const placeholder = document.createElement('div');
  placeholder.className = 'ph';
  placeholder.setAttribute('role', 'img');
  placeholder.setAttribute('aria-label', image.alt || 'Product image unavailable');
  placeholder.textContent = (image.alt || '?').trim().slice(0, 2).toUpperCase();
  image.replaceWith(placeholder);
}, true);

document.addEventListener('click', async (event) => {
  const button = event.target.closest('[data-act]');
  if (!button || button.disabled) return;
  const { act, id, value } = button.dataset;
  if (act === 'category') { state.category = value; render(); toShop(); }
  else if (act === 'shop') { state.category = 'All'; render(); toShop(); }
  else if (act === 'saved') { state.category = 'Saved'; render(); toShop(); }
  else if (act === 'retry') { void loadProducts(); }
  else if (act === 'favorite') {
    event.preventDefault();
    state.favorites = state.favorites.includes(id) ? state.favorites.filter((item) => item !== id) : [...state.favorites, id];
    writeLocal('tz.fav', state.favorites);
    render();
  } else if (act === 'quantity-down') { state.quantity = Math.max(1, state.quantity - 1); render(); }
  else if (act === 'quantity-up') { state.quantity = Math.min(MAX_QUANTITY, state.quantity + 1); render(); }
  else if (act === 'add' || act === 'add-quantity') {
    if (!productById(id)) return;
    state.cart[id] = Math.min(MAX_QUANTITY, (state.cart[id] || 0) + (act === 'add-quantity' ? state.quantity : 1));
    saveCart();
    if (act === 'add-quantity') { state.quantity = 1; state.cartOpen = true; render(); }
    else { render(); toast('Added to cart'); }
  } else if (act === 'increment' && productById(id)) {
    state.cart[id] = Math.min(MAX_QUANTITY, state.cart[id] + 1); saveCart(); render();
  } else if (act === 'decrement' && productById(id)) {
    if (state.cart[id] <= 1) delete state.cart[id]; else state.cart[id] -= 1;
    saveCart(); render();
  } else if (act === 'drawer') { state.cartOpen = !state.cartOpen; render(); }
  else if (act === 'checkout') { state.cartOpen = false; go('#/checkout'); }
  else if (act === 'logout') {
    try { await signOut(auth); state.cartOpen = false; go('#/'); }
    catch (error) { toast(messageFor(error)); }
  } else if (act === 'cancel') {
    try {
      await updateDoc(doc(db, 'orders', id), { status: 'cancelled' });
      state.orders = null;
      render();
      toast('Order cancelled.');
    } catch (error) { toast(messageFor(error)); }
  }
});

document.addEventListener('submit', async (event) => {
  const form = event.target;
  if (!form.id.startsWith('form-')) return;
  event.preventDefault();
  if (state.busy) return;
  const formType = form.id.slice('form-'.length);
  const data = Object.fromEntries(new FormData(form));
  state.form = data;
  state.error = '';
  state.success = '';
  const fail = (message) => { state.error = message; render(); };
  try {
    if (formType === 'login') {
      if (!validEmail(data.email.trim())) return fail('Enter a valid email address.');
      if (data.password.length < 6) return fail('Password must be at least 6 characters.');
      state.busy = true; render();
      await signInWithEmailAndPassword(auth, data.email.trim(), data.password);
      const destination = state.nextRoute || '#/'; state.nextRoute = ''; go(destination);
    } else if (formType === 'register') {
      const name = data.name.trim();
      if (name.length < 2 || name.length > 80) return fail('Enter your name (2–80 characters).');
      if (!validEmail(data.email.trim())) return fail('Enter a valid email address.');
      if (!validPhone(data.phone)) return fail('Enter a valid phone number.');
      if (data.password.length < 6) return fail('Password must be at least 6 characters.');
      if (data.password !== data.confirm) return fail('Passwords do not match.');
      state.busy = true; render();
      const credential = await createUserWithEmailAndPassword(auth, data.email.trim(), data.password);
      try {
        await updateProfile(credential.user, { displayName: name });
        await setDoc(doc(db, 'users', credential.user.uid), {
          name,
          email: data.email.trim(),
          phone: data.phone.trim(),
          createdAt: serverTimestamp(),
        });
      } catch (error) {
        try { await deleteUser(credential.user); } catch { /* Keep the original profile error. */ }
        throw error;
      }
      state.profile = { name, email: data.email.trim(), phone: data.phone.trim() };
      const destination = state.nextRoute || '#/'; state.nextRoute = ''; go(destination);
    } else if (formType === 'reset') {
      if (!validEmail(data.email.trim())) return fail('Enter a valid email address.');
      state.busy = true; render();
      await sendPasswordResetEmail(auth, data.email.trim());
      state.success = 'If an account exists for that email, a reset link was sent.';
    } else if (formType === 'profile') {
      const name = data.name.trim();
      if (name.length < 2 || name.length > 80) return fail('Enter your name (2–80 characters).');
      if (data.phone.trim() && !validPhone(data.phone)) return fail('Enter a valid phone number.');
      state.busy = true; render();
      await setDoc(doc(db, 'users', state.user.uid), {
        name,
        phone: data.phone.trim(),
        email: state.user.email || '',
      }, { merge: true });
      await updateProfile(auth.currentUser, { displayName: name });
      state.profile = { ...state.profile, name, phone: data.phone.trim() };
      state.success = 'Account details saved.';
    } else if (formType === 'checkout') {
      const lines = cartLines();
      if (!lines.length) return fail('Your cart is empty.');
      if (data.name.trim().length < 2 || data.name.trim().length > 80) return fail('Enter your full name (2–80 characters).');
      if (!validPhone(data.phone)) return fail('Enter a valid phone number.');
      if (data.address.trim().length < 8 || data.address.trim().length > 240) return fail('Enter a complete address (8–240 characters).');
      if (data.city.trim().length < 2 || data.city.trim().length > 80) return fail('Enter your city (2–80 characters).');
      if ((data.notes || '').trim().length > 500) return fail('Notes must be 500 characters or fewer.');
      state.busy = true; render();
      const placeOrder = httpsCallable(functions, 'createOrder');
      const result = await placeOrder({
        items: lines.map(({ product, quantity }) => ({ id: product.id, quantity })),
        delivery: {
          name: data.name.trim(),
          phone: data.phone.trim(),
          address: data.address.trim(),
          city: data.city.trim(),
          notes: (data.notes || '').trim(),
        },
      });
      const confirmedTotal = Number(result.data?.total);
      state.cart = {};
      saveCart();
      state.orders = null;
      go('#/account');
      toast(`Order received. Confirmed items total: ${currency(confirmedTotal)}. Payment: cash on delivery.`);
    }
  } catch (error) {
    state.error = messageFor(error);
  } finally {
    state.busy = false;
    render();
  }
});
