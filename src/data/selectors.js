import { MENU, menuItem } from './menu';

export const DAY = 86400000;
export const MIN = 60000;

export const startOfToday = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d.getTime(); };
export const dayIndex = (o) => Math.floor((o.t - startOfToday()) / DAY);

// The most of one ingredient a single drink can use, i.e. what "one more order" needs.
export const oneOrderNeed = (id) => MENU.reduce((m, d) => Math.max(m, d.needs[id] || 0), 0);

// out = nothing left
// low = at or below the reorder threshold (i.reorder), OR above it but not enough for one more order.
// The second check is the safety net: several orders can land at once and jump an ingredient
// straight past the threshold, so "low" must also mean "the next order may not be covered".
export const stockStatus = (i) => {
  if (i.qty <= 0) return 'out';
  if (i.qty <= i.reorder || i.qty + 1e-9 < oneOrderNeed(i.id)) return 'low';
  return 'ok';
};
export const lowStockReason = (i) => (i.qty <= i.reorder ? 'at or below the reorder level' : 'not enough for one more order');
export const stepFor = (i) => (i.unit === 'pcs' ? 10 : 1);

export function missingIngredients(m, inventory) {
  return Object.keys(m.needs)
    .map((id) => inventory.find((i) => i.id === id))
    .filter((i) => i && i.qty + 1e-9 < m.needs[i.id]);
}
export const isSoldOut = (m, inventory) => missingIngredients(m, inventory).length > 0;

export function usageFor(lines) {
  const usage = {};
  lines.forEach(({ id, qty }) => {
    const needs = menuItem(id).needs;
    Object.keys(needs).forEach((k) => { usage[k] = (usage[k] || 0) + needs[k] * qty; });
  });
  return usage;
}

export const sumTotal = (orders) => orders.reduce((a, o) => a + o.total, 0);
export const itemsText = (o) => o.items.map((i) => `${i.q}× ${menuItem(i.id).name}`).join(', ');

export const ordersOfCustomer = (orders, name) => orders.filter((o) => o.customer === name);
export const activeOrders = (orders) => orders.filter((o) => o.status !== 'delivered');
export const openJobs = (orders) => orders.filter((o) => o.status === 'ready' && !o.driver);
export const activeJobOf = (orders, driverName) => orders.find((o) => o.driver === driverName && o.status !== 'delivered');

// Chat: a customer sees one live chat at a time (oldest active order with a rider, or the one they tapped).
// Delivered orders are archived and read-only.
export const activeChatsOfCustomer = (orders, name) => orders.filter((o) => o.customer === name && o.driver && o.status !== 'delivered').sort((a, b) => a.t - b.t);
export const archivedChatsOfCustomer = (orders, name) => orders.filter((o) => o.customer === name && o.driver && o.status === 'delivered').sort((a, b) => b.t - a.t);
export const archivedChatsOfDriver = (orders, name) => orders.filter((o) => o.driver === name && o.status === 'delivered').sort((a, b) => b.t - a.t);