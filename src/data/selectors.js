import { menuItem } from './menu';

export const DAY = 86400000;
export const MIN = 60000;

export const startOfToday = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d.getTime(); };
export const dayIndex = (o) => Math.floor((o.t - startOfToday()) / DAY);

export const stockStatus = (i) => (i.qty <= 0 ? 'out' : i.qty <= i.reorder ? 'low' : 'ok');
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
