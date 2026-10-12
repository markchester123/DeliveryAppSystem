// The menu comes from the POS "products" collection in Firestore (see StoreContext).
// MENU is filled by setCatalog() and keeps the same shape the screens already use.
const IMG_CARAMEL = require('../../assets/products/caramel macchiato.png');
const IMG_MATCHA = require('../../assets/products/dirty_labubu.png');
const IMG_SPANISH = require('../../assets/products/image-removebg-preview.png');

// The POS has no pictures, so pick one by drink name. Anything unmatched gets the default.
const imageFor = (name) => {
  const n = String(name).toLowerCase();
  if (n.includes('spanish')) return IMG_SPANISH;
  if (n.includes('matcha')) return IMG_MATCHA;
  return IMG_CARAMEL;
};

// Sizes: everything is 16oz at the POS "price". Only products that also have a
// "price12" field in Firestore can be ordered as 12oz.
const sizesFor = (price, price12) => {
  const list = [];
  if (price12 > 0) list.push({ size: 12, price: price12 });
  list.push({ size: 16, price });
  return list;
};

// Same array object forever (screens import it directly); setCatalog swaps its contents.
export const MENU = [];

// products: POS product docs. ingredients: POS ingredient docs.
// A recipe names its ingredients ("Milk"), so we look each name up to get that ingredient's id.
export function setCatalog(products, ingredients) {
  const idByName = {};
  ingredients.forEach((i) => { idByName[String(i.name).trim().toLowerCase()] = String(i.id); });

  const next = products
    .slice()
    .sort((a, b) => a.id - b.id)
    .map((p) => {
      const needs = {};
      (p.recipe || []).forEach((r) => {
        const id = idByName[String(r.ingredient).trim().toLowerCase()];
        if (id) needs[id] = (needs[id] || 0) + Number(r.amount);
        else console.log(`Recipe for "${p.name}" uses unknown ingredient "${r.ingredient}"`);
      });
      const price = Number(p.price) || 0;
      const price12 = Number(p.price12) || 0;
      return {
        id: String(p.id), name: p.name, price, type: p.category, size: 16, needs,
        image: imageFor(p.name), sizes: sizesFor(price, price12),
      };
    });

  MENU.splice(0, MENU.length, ...next);
}

// The POS has no "max" for an ingredient, so remember the highest amount seen
// (and at least 10x the threshold) to draw the stock bar and to restock to.
const seenMax = {};

// POS ingredient doc -> the inventory item shape the screens use.
export function toInventoryItem(i) {
  const id = String(i.id);
  const qty = Number(i.quantity) || 0;
  const reorder = Number(i.threshold) || 0;
  seenMax[id] = Math.max(seenMax[id] || 0, qty, reorder * 10);
  return { id, name: i.name, unit: i.unit, category: i.category, qty, reorder, max: seenMax[id] };
}

// Accepts a plain id ("1" = 16oz) or a cart key ("1-12").
export const menuItem = (key) => {
  key = String(key);
  const exact = MENU.find((m) => m.id === key);
  if (exact) return exact;
  const i = key.lastIndexOf('-');
  if (i < 0) return undefined;
  const base = MENU.find((m) => m.id === key.slice(0, i));
  if (!base) return undefined;
  const size = Number(key.slice(i + 1));
  const picked = base.sizes.find((s) => s.size === size) || base.sizes.find((s) => s.size === 16);
  return { ...base, size: picked.size, price: picked.price };
};

// "3-12" -> "3"
export const baseId = (key) => String(key).split('-')[0];

// Average rating of a product from productStats = { id: { sum, count } }.
export const ratingOf = (stats, id) => {
  const s = stats && stats[String(id)];
  return s && s.count ? { avg: s.sum / s.count, count: s.count } : null;
};