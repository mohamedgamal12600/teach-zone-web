// Product data
const D = [
  [1, 'Sony', 'PlayStation 5', 'Consoles', 27800],
  [2, 'Sony', 'PlayStation 5 Digital Edition', 'Consoles', 24750],
  [3, 'Sony', 'DualSense Wireless Controller', 'Consoles', 2200],
  [4, 'Microsoft', 'Xbox Series X', 'Consoles', 21500],
  [5, 'Nintendo', 'Nintendo Switch OLED', 'Consoles', 13500],
  [6, 'Apple', 'MacBook Pro 14" M4 Pro', 'Laptops', 89999],
  [7, 'Dell', 'XPS 15 9530', 'Laptops', 62500],
  [8, 'ASUS', 'ROG Zephyrus G14', 'Laptops', 55000],
  [9, 'Lenovo', 'ThinkPad X1 Carbon Gen 12', 'Laptops', 71000],
  [10, 'HP', 'HP Spectre x360 14', 'Laptops', 48000],
  [11, 'Apple', 'iPhone 16 Pro Max', 'Smartphones', 42000],
  [12, 'Samsung', 'Galaxy S25 Ultra', 'Smartphones', 38500],
  [13, 'Google', 'Pixel 9 Pro', 'Smartphones', 28000],
  [14, 'OnePlus', 'OnePlus 12', 'Smartphones', 21000],
  [15, 'Xiaomi', 'Xiaomi 14 Ultra', 'Smartphones', 25500],
  [16, 'Sony', 'PULSE 3D Wireless Headset', 'Headphones', 3150],
  [17, 'Sony', 'WH-1000XM5', 'Headphones', 8900],
  [18, 'Apple', 'AirPods Pro 2nd Gen', 'Headphones', 6200],
  [19, 'Bose', 'QuietComfort Ultra', 'Headphones', 11500],
  [20, 'Samsung', 'Galaxy Buds3 Pro', 'Headphones', 4800],
  [21, 'Apple', 'iPad Pro 13" M4', 'Tablets', 52000],
  [22, 'Samsung', 'Galaxy Tab S10 Ultra', 'Tablets', 38000],
  [23, 'Lenovo', 'Tab P12 Pro', 'Tablets', 19500],
  [24, 'Sony', 'DualSense Charging Station', 'Accessories', 950],
  [25, 'Sony', 'PS5 Media Remote', 'Accessories', 790],
  [26, 'Logitech', 'MX Master 3S', 'Accessories', 2800],
  [27, 'Logitech', 'MX Keys S', 'Accessories', 3200],
  [28, 'Anker', 'PowerCore 26800 mAh', 'Accessories', 1650],
  [29, 'Samsung', '65W Super Fast Charger', 'Accessories', 850],
  [30, 'Apple', 'MagSafe Charger 15W', 'Accessories', 950],
  [31, 'Dell', 'UltraSharp U2724D 27" Monitor', 'Accessories', 14500],
  [32, 'Meta', 'Meta Quest 3', 'Accessories', 18000],
  [33, 'Razer', 'Razer DeathAdder V3 HyperSpeed', 'Accessories', 2100],
  [34, 'SteelSeries', 'Arctis Nova Pro Wireless', 'Accessories', 9800],
  [35, 'Elgato', 'Stream Deck MK.2', 'Accessories', 3900]
];

const brandLinks = {
  Sony: 'https://www.sony.com',
  Microsoft: 'https://www.xbox.com',
  Nintendo: 'https://www.nintendo.com',
  Apple: 'https://www.apple.com',
  Dell: 'https://www.dell.com',
  ASUS: 'https://www.asus.com',
  Lenovo: 'https://www.lenovo.com',
  HP: 'https://www.hp.com',
  Samsung: 'https://www.samsung.com',
  Google: 'https://store.google.com',
  OnePlus: 'https://www.oneplus.com',
  Xiaomi: 'https://www.mi.com',
  Bose: 'https://www.bose.com',
  Logitech: 'https://www.logitech.com',
  Anker: 'https://www.anker.com',
  Meta: 'https://www.meta.com',
  Razer: 'https://www.razer.com',
  SteelSeries: 'https://steelseries.com',
  Elgato: 'https://www.elgato.com'
};

// Image mapping - using local assets/images folder
const IMG = {
  "1": "assets/images/ps5.png",
  "2": "assets/images/ps5_digital.png",
  "3": "assets/images/dualsense.png",
  "4": "assets/images/xbox_series_x.png",
  "5": "assets/images/nintendo_switch_oled.png",
  "6": "assets/images/macbook_pro_14.png",
  "7": "assets/images/dell_xps_15.png",
  "8": "assets/images/rog_zephyrus_g14.png",
  "9": "assets/images/thinkpad_x1_carbon.png",
  "10": "assets/images/hp_spectre_x360.png",
  "11": "assets/images/iphone_16_pro_max.png",
  "12": "assets/images/galaxy_s25_ultra.png",
  "13": "assets/images/pixel_9_pro.png",
  "14": "assets/images/oneplus_12.png",
  "15": "assets/images/xiaomi_14_ultra.png",
  "16": "assets/images/pulse_3d.png",
  "17": "assets/images/wh_1000xm5.png",
  "18": "assets/images/airpods_pro_2.png",
  "19": "assets/images/bose_qc_ultra.png",
  "20": "assets/images/galaxy_buds3_pro.png",
  "21": "assets/images/ipad_pro_13.png",
  "22": "assets/images/galaxy_tab_s10_ultra.png",
  "23": "assets/images/lenovo_tab_p12_pro.png",
  "24": "assets/images/charging_station.png",
  "25": "assets/images/media_remote.png",
  "26": "assets/images/mx_master_3s.png",
  "27": "assets/images/mx_keys_s.png",
  "28": "assets/images/anker_powercore.png",
  "29": "assets/images/samsung_65w_charger.png",
  "30": "assets/images/magsafe_charger.png",
  "31": "assets/images/dell_ultrasharp_u2724d.png",
  "32": "assets/images/meta_quest_3.png",
  "33": "assets/images/razer_deathadder_v3.png",
  "34": "assets/images/arctis_nova_pro.png",
  "35": "assets/images/stream_deck_mk2.png"
};

// Product objects with images
const P = D.map(([id, brand, name, cat, price]) => ({
  id: String(id),
  brand,
  name,
  cat,
  price,
  img: IMG[id] || `assets/images/${id}.png`
}));

// SVG Icons
const I = {
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  menu: '<path d="M4 9h16M4 15h16"/>',
  bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
  sliders: '<path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/>',
  heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21.2l7.8-7.7 1-1.1a5.5 5.5 0 0 0 0-7.8z"/>',
  eye: '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"/><circle cx="12" cy="12" r="3"/>',
  bag: '<path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0"/>',
  user: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  home: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM9 22V12h6v10"/>',
  back: '<path d="M15 18l-6-6 6-6"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>'
};

const ic = (n, f) => `<svg class="ic${f ? ' f' : ''}" viewBox="0 0 24 24" aria-hidden="true">${I[n]}</svg>`;

const $ = s => document.querySelector(s);

// LocalStorage helpers
const ld = (k, d) => {
  try {
    return JSON.parse(localStorage.getItem(k)) ?? d;
  } catch {
    return d;
  }
};

const sv = (k, v) => {
  try {
    localStorage.setItem(k, JSON.stringify(v));
  } catch { }
};

// Escape HTML
const esc = s => s.replace(/[&<>"]/g, c => ({ '&': '&', '<': '<', '>': '>', '"': '"' }[c]));

// State
const S = {
  cat: 'All',
  q: '',
  sort: 'feat',
  color: 0,
  qty: 1,
  open: false,
  fav: ld('tz.fav', []),
  cart: ld('tz.cart', {})
};

const cats = [...new Set(P.map(p => p.cat))];

const money = v => 'EGP ' + v.toLocaleString('en-US');

const count = () => Object.values(S.cart).reduce((a, b) => a + b, 0);

const find = id => P.find(p => p.id === id);

// Filter & sort visible products
const vis = () => {
  let r = P.filter(p =>
    (S.cat === 'All' || (S.cat === 'Saved' ? S.fav.includes(p.id) : p.cat === S.cat)) &&
    p.name.toLowerCase().includes(S.q.trim().toLowerCase())
  );
  if (S.sort === 'lo') r.sort((a, b) => a.price - b.price);
  if (S.sort === 'hi') r.sort((a, b) => b.price - a.price);
  if (S.sort === 'az') r.sort((a, b) => a.name.localeCompare(b.name));
  return r;
};

// Heart button
const heart = p => `<button class="hb${S.fav.includes(p.id) ? ' on' : ''}" data-act="fav" data-id="${p.id}" aria-label="Save ${p.name}">${ic('heart', S.fav.includes(p.id))}</button>`;

// Product card
const card = p => `<article class="pc">${heart(p)}<a class="pi" href="#/product/${p.id}"><img src="${p.img}" alt="${p.name}" loading="lazy" onerror="this.onerror=null;this.src='data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 200 200%22><text x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 font-size=%2220%22 fill=%22%23A0B0BC%22>Image%20Not%20Found</text></svg>'"></a><div class="pb"><small>${p.brand} • ${p.cat}</small><h3><a href="#/product/${p.id}">${p.name}</a></h3><div class="pr"><b>${money(p.price)}</b>${p.old ? ` <s>${money(p.old)}</s>` : ''}</div><button class="add" data-act="add" data-id="${p.id}">${ic('bag')}Add to cart</button></div></article>`;

// Grid HTML
const gridHTML = () => vis().map(card).join('') || `<p class="empty">${S.cat === 'Saved' && !S.q ? 'No saved products yet. Tap a heart to save one.' : 'No products match your search.'}</p>`;

// Header
const header = () => `<header><div class="w hd"><a class="logo" href="#/">Tech<i>Zone</i></a><nav><a href="#/">Home</a><button data-act="shop">Shop</button><button data-act="saved">Saved (${S.fav.length})</button></nav><button class="cb" data-act="drawer" aria-label="Open cart">${ic('bag')}Cart${count() ? `<span class="bd">${count()}</span>` : ''}</button></div></header>`;

// Home page
const home = () => {
  const h = find('1');
  return `<section class="w hero"><div><h1>PlayStation 5 and gear, all in one place</h1><p>Consoles, controllers, headsets and accessories. Compare options and add what you need in a few taps.</p><a class="cta" href="#/product/1">View PS5 • ${money(h.price)}</a> <button class="cta ghost" data-act="shop">Browse all</button></div><img src="${h.img}" alt="Playstation 5 with controller" onerror="this.onerror=null;this.src='data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 400 300%22><text x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 font-size=%2224%22 fill=%22%23A0B0BC%22>PlayStation%205</text></svg>'"></section>
<section class="w sec"><h2>Shop by category</h2><div class="tiles">${cats.map(c => {
    const ps = P.filter(p => p.cat === c);
    return `<button class="tile" data-act="cat" data-v="${c}"><img src="${ps[0].img}" alt="${c}" onerror="this.onerror=null;this.src='data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 72 72%22><text x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 font-size=%2214%22 fill=%22%23A0B0BC%22>${c}</text></svg>'"><div><b>${c}</b><span>${ps.length} product${ps.length > 1 ? 's' : ''}</span></div></button>`;
  }).join('')}</div></section>
<section class="w sec" id="shop"><h2>Products</h2><div class="tool"><div class="chips">${['All', 'Saved', ...cats].map(c => `<button class="chip${c === S.cat ? ' on' : ''}" data-act="cat" data-v="${c}">${c}</button>`).join('')}</div><div class="ctl"><input id="q" type="search" placeholder="Search products" value="${esc(S.q)}" aria-label="Search products"><select id="sort" aria-label="Sort products">${[['feat', 'Featured'], ['lo', 'Price: low to high'], ['hi', 'Price: high to low'], ['az', 'Name: A to Z']].map(([v, l]) => `<option value="${v}"${S.sort === v ? ' selected' : ''}>${l}</option>`).join('')}</select></div></div><div class="grid" id="grid">${gridHTML()}</div></section>`;
};

// Product detail
const detail = id => {
  const p = find(id);
  if (!p) return `<div class="w sec"><h2>Product not found</h2><p class="empty">Go back to <a href="#/">the shop</a>.</p></div>`;
  const f = S.fav.includes(p.id);
  return `<div class="w"><div class="bc"><a href="#/">Home</a> / ${p.cat} / ${p.name}</div><div class="pd"><div class="pm"><img src="${p.img}" alt="${p.name}" onerror="this.onerror=null;this.src='data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 400 400%22><text x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 font-size=%2224%22 fill=%22%23A0B0BC%22>${p.name}</text></svg>'"></div><div><small style="color:var(--t2)">${p.brand} • ${p.cat}</small><h1>${p.name}</h1><div class="big"><b>${money(p.price)}</b>${p.old ? ` <s>${money(p.old)}</s>` : ''}</div><p class="lb">Brand: <a class="bl" href="${brandLinks[p.brand]}" target="_blank" rel="noopener noreferrer">${p.brand} website</a></p><div class="row"><div class="q"><button data-act="qm" aria-label="Less">${ic('minus')}</button><em>${S.qty}</em><button data-act="qp" aria-label="More">${ic('plus')}</button></div><button class="cta" data-act="addq" data-id="${p.id}">${ic('bag')}Add to cart</button><button class="cta ghost" data-act="fav" data-id="${p.id}">${ic('heart', f)}${f ? 'Saved' : 'Save'}</button></div></div></div>
<section class="sec"><h2>You may also like</h2><div class="grid" style="margin-top:20px">${P.filter(x => x.id !== id).slice(0, 4).map(card).join('')}</div></section></div>`;
};

// Cart drawer
const drawer = () => {
  const ids = Object.keys(S.cart).filter(id => find(id));
  const total = ids.reduce((s, id) => s + find(id).price * S.cart[id], 0);
  return `<div class="ov${S.open ? ' on' : ''}" data-act="drawer"></div><aside class="${S.open ? 'on' : ''}" aria-label="Cart" ${S.open ? '' : 'inert'}><div class="ah"><h2>Your cart</h2><button data-act="drawer" aria-label="Close cart">${ic('x')}</button></div><div class="al">${ids.length ? ids.map(id => {
    const p = find(id);
    return `<div class="ci"><img src="${p.img}" alt="${p.name}" onerror="this.onerror=null;this.src='data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 60 60%22><text x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 font-size=%2212%22 fill=%22%23A0B0BC%22>${p.name.slice(0,10)}</text></svg>'"><div><b>${p.name}</b><span>${money(p.price)}</span></div><div class="q"><button data-act="dec" data-id="${id}" aria-label="Remove one">${ic('minus')}</button><em>${S.cart[id]}</em><button data-act="inc" data-id="${id}" aria-label="Add one">${ic('plus')}</button></div></div>`;
  }).join('') : '<p class="empty">Your cart is empty.</p>'}</div>${ids.length ? `<div class="af"><p><span>Subtotal</span><b>${money(total)}</b></p><button class="cta" data-act="checkout">Checkout</button></div>` : ''}</aside>`;
};

// Footer
const footer = () => `<footer><div class="w"><div class="fg"><div><b>TechZone</b>Gaming and electronics demo store.</div><div><b>Shop</b>${cats.map(c => `<a href="#/" data-act="cat" data-v="${c}">${c}</a>`).join('')}</div><div class="brands"><b>Brands</b>${Object.entries(brandLinks).map(([b, u]) => `<a href="${u}" target="_blank" rel="noopener noreferrer">${b}</a>`).join('')}</div></div><div class="cp">Store design based on the free Electronics E-Commerce App UI by Heba Zatar (personal use). Demo project: no real orders or payments.</div></div></footer>`;

// Render
function render() {
  const m = location.hash.match(/^#\/product\/(\w+)/);
  $('#app').innerHTML = header() + `<main>${m ? detail(m[1]) : home()}</main>` + footer() + drawer();
}

// Toast notifications
let tm;
function toast(m) {
  clearTimeout(tm);
  let t = $('#toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'toast';
    t.setAttribute('role', 'status');
    document.body.appendChild(t);
  }
  t.textContent = m;
  t.className = 'show';
  tm = setTimeout(() => t.className = '', 2400);
}

const save = () => sv('tz.cart', S.cart);

const home_ = () => {
  if (location.hash.startsWith('#/product')) location.hash = '#/';
  else render();
};

const toShop = () => setTimeout(() => $('#shop')?.scrollIntoView(), 0);

// Event delegation
document.addEventListener('click', e => {
  const t = e.target.closest('[data-act]');
  if (!t) return;
  const a = t.dataset.act, id = t.dataset.id, v = t.dataset.v;

  if (a === 'cat') { S.cat = v; home_(); toShop(); }
  else if (a === 'shop') { S.cat = 'All'; home_(); toShop(); }
  else if (a === 'saved') { S.cat = 'Saved'; home_(); toShop(); }
  else if (a === 'fav') {
    e.preventDefault();
    S.fav = S.fav.includes(id) ? S.fav.filter(x => x !== id) : [...S.fav, id];
    sv('tz.fav', S.fav);
    render();
  }
  else if (a === 'color') { S.color = +v; render(); }
  else if (a === 'qm') { S.qty = Math.max(1, S.qty - 1); render(); }
  else if (a === 'qp') { S.qty = Math.min(10, S.qty + 1); render(); }
  else if (a === 'add') { S.cart[id] = (S.cart[id] || 0) + 1; save(); render(); toast('Added to cart'); }
  else if (a === 'addq') { S.cart[id] = (S.cart[id] || 0) + S.qty; save(); S.qty = 1; S.open = true; render(); }
  else if (a === 'inc') { S.cart[id]++; save(); render(); }
  else if (a === 'dec') { if (--S.cart[id] < 1) delete S.cart[id]; save(); render(); }
  else if (a === 'drawer') { S.open = !S.open; render(); }
  else if (a === 'checkout') { toast('Checkout is not available in this demo. No payment is taken.'); }
});

document.addEventListener('input', e => {
  if (e.target.id === 'q') { S.q = e.target.value; $('#grid').innerHTML = gridHTML(); }
});

document.addEventListener('change', e => {
  if (e.target.id === 'sort') { S.sort = e.target.value; $('#grid').innerHTML = gridHTML(); }
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && S.open) { S.open = false; render(); }
});

window.addEventListener('hashchange', () => {
  S.color = 0;
  S.qty = 1;
  render();
  scrollTo(0, 0);
});

// Image error fallback
document.addEventListener('error', e => {
  const i = e.target;
  if (i.tagName !== 'IMG') return;
  const d = document.createElement('div');
  d.className = 'ph';
  d.textContent = (i.alt || '?').trim().slice(0, 2).toUpperCase();
  i.replaceWith(d);
}, true);

// Initial render
render();