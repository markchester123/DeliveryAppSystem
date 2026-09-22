export const peso = (n) => '₱' + String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

export function timeText(t) {
  const d = new Date(t);
  const h = d.getHours();
  const m = d.getMinutes();
  return `${h % 12 || 12}:${m < 10 ? '0' : ''}${m} ${h < 12 ? 'AM' : 'PM'}`;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
export const weekdayShort = (t) => DAYS[new Date(t).getDay()];
export function dateText(t) {
  const d = new Date(t);
  return `${DAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}`;
}

export const firstName = (n) => String(n).split(' ')[0];
export const initials = (n) => String(n).split(' ').map((x) => x[0]).join('').slice(0, 2).toUpperCase();
export function shortName(n) {
  const p = String(n).split(' ');
  return p.length > 1 ? `${p[0]} ${p[p.length - 1][0]}.` : n;
}
export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const roundQty = (n) => Math.round(n * 1000) / 1000;
export const formatQty = (n) => String(Math.round(n * 100) / 100);
