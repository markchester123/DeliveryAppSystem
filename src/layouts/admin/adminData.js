import { dayIndex, startOfToday, DAY, sumTotal } from '../../data/selectors';
import { weekdayShort } from '../../utils/format';

export function weekData(orders) {
  return [-6, -5, -4, -3, -2, -1, 0].map((d) => ({
    label: d === 0 ? 'Today' : weekdayShort(startOfToday() + d * DAY),
    value: sumTotal(orders.filter((o) => dayIndex(o) === d)),
    highlight: d === 0,
  }));
}
export const fmtK = (v) => (v >= 1000 ? `₱${(v / 1000).toFixed(1)}k` : `₱${Math.round(v)}`);
