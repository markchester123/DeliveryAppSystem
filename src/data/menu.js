const BASE_MENU = [
  { id: 'spanish', name: 'Spanish Latte', price: 85, type: 'Coffee', size: 16, needs: { beans: 0.02, milk: 0.2, cup16: 1, lids: 1, straws: 1 }, image: require('../../assets/products/image-removebg-preview.png') },
  { id: 'caramel', name: 'Caramel Macchiato', price: 90, type: 'Coffee', size: 16, needs: { beans: 0.02, milk: 0.2, caramel: 0.04, cup16: 1, lids: 1, straws: 1 }, image: require('../../assets/products/caramel macchiato.png') },
  { id: 'matcha', name: 'Dirty Matcha', price: 80, type: 'Coffee', size: 16, needs: { matcha: 0.06, beans: 0.02, milk: 0.2, cup16: 1, lids: 1, straws: 1 }, image: require('../../assets/products/dirty_labubu.png') },
  { id: 'hazel', name: 'Hazelnut Coffee', price: 80, type: 'Coffee', size: 16, needs: { beans: 0.02, hazelnut: 0.04, milk: 0.2, cup16: 1, lids: 1, straws: 1 }, image: require('../../assets/products/caramel macchiato.png') },
  { id: 'straw', name: 'Strawberry Soda', price: 65, type: 'Soda', size: 12, needs: { strawberry: 0.04, soda: 0.3, cup12: 1, lids: 1, straws: 1 }, image: require('../../assets/products/caramel macchiato.png') },
  { id: 'blue', name: 'Blueberry Soda', price: 65, type: 'Soda', size: 12, needs: { blueberry: 0.04, soda: 0.3, cup12: 1, lids: 1, straws: 1 }, image: require('../../assets/products/caramel macchiato.png') },
  { id: 'cuke', name: 'Cucumber Fresh', price: 65, type: 'Juice', size: 12, needs: { cucumber: 0.1, soda: 0.3, cup12: 1, lids: 1, straws: 1 }, image: require('../../assets/products/caramel macchiato.png') },
];

// Price change per size, relative to 16oz. Edit these to match your real prices.
const SIZE_ADD = { 8: -20, 12: -10, 16: 0, 24: 20 };

// Builds the size list from each item's base price and base size.
const sizesFor = (price, baseSize) =>
  Object.keys(SIZE_ADD).map(Number).map((size) => ({
    size,
    price: price + SIZE_ADD[size] - SIZE_ADD[baseSize],
  }));

export const MENU = BASE_MENU.map((m) => ({ ...m, sizes: sizesFor(m.price, m.size) }));

// Accepts a plain id ("spanish") or a cart key ("spanish-24").
export const menuItem = (key) => {
  const exact = MENU.find((m) => m.id === key);
  if (exact) return exact;
  const i = key.lastIndexOf('-');
  const base = MENU.find((m) => m.id === key.slice(0, i));
  if (!base) return undefined;
  const size = Number(key.slice(i + 1));
  const picked = base.sizes.find((s) => s.size === size) || base.sizes[0];
  return { ...base, size: picked.size, price: picked.price };
};