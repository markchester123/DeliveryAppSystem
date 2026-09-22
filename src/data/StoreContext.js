import React, { createContext, useContext, useMemo, useReducer, useRef } from 'react';
import { useAuth, can } from '../users';
import { menuItem } from './menu';
import { INITIAL_INVENTORY } from './inventory';
import { STATUS_LOG, COUPON_RATE } from './constants';
import { isSoldOut, usageFor } from './selectors';
import { clamp, roundQty } from '../utils/format';

const StoreContext = createContext(null);

const initialState = () => ({
  inventory: INITIAL_INVENTORY.map((i) => ({ ...i })),
  orders: [],
  chats: {},
  reports: [],
  coupon: { claimed: false, used: null },
  orderSeq: 1001,
  reportSeq: 1,
});

const patchOrder = (s, id, fn) => ({ ...s, orders: s.orders.map((o) => (o.id === id ? fn(o) : o)) });
const addMessage = (s, orderId, from, text) => ({ ...s, chats: { ...s.chats, [orderId]: (s.chats[orderId] || []).concat({ from, text, t: Date.now() }) } });
const addLog = (o, text) => ({ ...o, log: o.log.concat({ t: Date.now(), text }) });

const NEXT = {
  ready: { to: 'picked', log: 'left the café with your order.' },
  picked: { to: 'arrived', log: 'has arrived.' },
  arrived: { to: 'delivered', log: 'dropped off your order.' },
};

function reducer(s, a) {
  switch (a.type) {
    case 'PLACE_ORDER': {
      const inventory = s.inventory.map((i) => (a.usage[i.id] ? { ...i, qty: roundQty(Math.max(0, i.qty - a.usage[i.id])) } : i));
      const next = { ...s, inventory, orders: [a.order].concat(s.orders), orderSeq: s.orderSeq + 1 };
      if (a.order.discount) next.coupon = { ...s.coupon, used: a.order.id };
      return next;
    }
    case 'KITCHEN_READY':
      return patchOrder(s, a.id, (o) => (o.status === 'preparing' ? addLog({ ...o, status: 'ready' }, STATUS_LOG.ready) : o));
    case 'CLAIM_COUPON':
      return { ...s, coupon: { ...s.coupon, claimed: true } };
    case 'ACCEPT':
      return patchOrder(s, a.id, (o) => addLog({ ...o, driver: a.driver }, `${a.driver.split(' ')[0]} accepted your order.`));
    case 'ADVANCE': {
      const order = s.orders.find((o) => o.id === a.id);
      const nx = order && NEXT[order.status];
      if (!nx) return s;
      return patchOrder(s, a.id, (o) => addLog({ ...o, status: nx.to }, `${a.driver.split(' ')[0]} ${nx.log}`));
    }
    case 'CHAT':
      return addMessage(s, a.orderId, a.from, a.text);
    case 'LOG':
      return patchOrder(s, a.orderId, (o) => addLog(o, a.text));
    case 'STOCK':
      return { ...s, inventory: s.inventory.map((i) => (i.id === a.id ? { ...i, qty: roundQty(clamp(a.qty, 0, i.max)) } : i)) };
    case 'ADD_REPORT':
      return { ...s, reports: [a.report].concat(s.reports), reportSeq: s.reportSeq + 1 };
    case 'SET_REPORT':
      return { ...s, reports: s.reports.map((r) => (r.id === a.id ? { ...r, status: a.status, note: a.note != null ? a.note : r.note } : r)) };
    default:
      return s;
  }
}

export function StoreProvider({ children }) {
  const { user } = useAuth();
  const [state, dispatch] = useReducer(reducer, undefined, initialState);
  const stateRef = useRef(state);
  stateRef.current = state;

  const actions = useMemo(() => {
    const allowed = (perm) => can(user, perm);

    return {
      placeOrder({ items, pay, contactless, loc, useCoupon }) {
        if (!allowed('order.place')) return { ok: false, reason: 'Not allowed' };
        const s = stateRef.current;
        const lines = items.filter(({ id, qty }) => qty > 0 && !isSoldOut(menuItem(id), s.inventory));
        if (!lines.length) return { ok: false, reason: 'Those drinks are sold out' };

        const usage = usageFor(lines);
        const short = s.inventory.find((i) => usage[i.id] && i.qty + 1e-9 < usage[i.id]);
        if (short) return { ok: false, reason: `Not enough ${short.name.toLowerCase()} for this order` };

        const subtotal = lines.reduce((a, { id, qty }) => a + menuItem(id).price * qty, 0);
        const discount = useCoupon && s.coupon.claimed && !s.coupon.used ? Math.round(subtotal * COUPON_RATE) : 0;
        const id = `PC-${s.orderSeq}`;
        const order = {
          id, customer: user.name, items: lines.map(({ id: i, qty }) => ({ id: i, q: qty })), subtotal, discount, total: subtotal - discount,
          pay, paid: pay !== 'cod', status: 'preparing', driver: null, addr: loc.addr, land: loc.land, note: loc.note,
          contactless, t: Date.now(), log: [{ t: Date.now(), text: STATUS_LOG.preparing }],
        };
        dispatch({ type: 'PLACE_ORDER', order, usage });
        setTimeout(() => dispatch({ type: 'KITCHEN_READY', id }), 6000);
        return { ok: true, id };
      },
      claimCoupon() { if (allowed('coupon.claim')) dispatch({ type: 'CLAIM_COUPON' }); },
      createReport(category, message) {
        if (!allowed('report.create')) return;
        const s = stateRef.current;
        const mine = s.orders.find((o) => o.customer === user.name);
        dispatch({ type: 'ADD_REPORT', report: { id: `R-${s.reportSeq}`, order: mine ? mine.id : '—', by: user.name, category, message, status: 'open', t: Date.now(), note: '' } });
      },
      sendChat(orderId, text) {
        if (!allowed('chat.send') || !text.trim()) return;
        dispatch({ type: 'CHAT', orderId, from: user.role === 'driver' ? 'driver' : 'customer', text: text.trim() });
      },
      acceptJob(orderId) {
        if (!allowed('job.accept')) return false;
        const s = stateRef.current;
        if (s.orders.some((o) => o.driver === user.name && o.status !== 'delivered')) return false;
        dispatch({ type: 'ACCEPT', id: orderId, driver: user.name });
        return true;
      },
      advanceDelivery(orderId) { if (allowed('delivery.update')) dispatch({ type: 'ADVANCE', id: orderId, driver: user.name }); },
      quickUpdate(orderId, text, log) {
        if (!allowed('delivery.update')) return;
        dispatch({ type: 'CHAT', orderId, from: 'driver', text });
        if (log) dispatch({ type: 'LOG', orderId, text: log });
      },
      adjustStock(id, delta) {
        if (!allowed('inventory.adjust')) return;
        const item = stateRef.current.inventory.find((i) => i.id === id);
        if (item) dispatch({ type: 'STOCK', id, qty: item.qty + delta });
      },
      restock(id) {
        if (!allowed('inventory.adjust')) return;
        const item = stateRef.current.inventory.find((i) => i.id === id);
        if (item) dispatch({ type: 'STOCK', id, qty: item.max });
      },
      flagChat(orderId) {
        if (!allowed('reports.handle')) return;
        const s = stateRef.current;
        dispatch({ type: 'ADD_REPORT', report: { id: `R-${s.reportSeq}`, order: orderId, by: 'Manager review', category: 'Chat flagged', message: 'Conversation flagged for a closer look.', status: 'open', t: Date.now(), note: '' } });
      },
      startReport(id) { if (allowed('reports.handle')) dispatch({ type: 'SET_REPORT', id, status: 'progress' }); },
      resolveReport(id, note) {
        if (allowed('reports.handle')) dispatch({ type: 'SET_REPORT', id, status: 'resolved', note: note && note.trim() ? note.trim() : 'Resolved by the manager.' });
      },
    };
  }, [user]);

  const value = useMemo(() => ({ state, actions }), [state, actions]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside <StoreProvider>');
  return ctx;
}
