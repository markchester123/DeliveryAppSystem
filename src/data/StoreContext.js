import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useReducer, useRef } from 'react';
import { useAuth, can } from '../users';
import { menuItem, setCatalog, toInventoryItem } from './menu';
import { STATUS_LOG, COUPON_RATE } from './constants';
import { isSoldOut, usageFor } from './selectors';
import { clamp, roundQty } from '../utils/format';
import {
  signInDelivery, subscribeCatalog, subscribeOrders, takeStock, setIngredientQty,
  createOrder, markReady, claimOrder, advanceOrder, sendMessage, recordSale,
  subscribeMenuCategories, subscribeRatings, subscribeProductStats, submitRating,
  subscribeAnnouncements, createAnnouncement,
} from '../services/posApi';

const StoreContext = createContext(null);

// Inventory, the menu, orders and chats all come live from Firestore, so they start empty.
const initialState = () => ({
  inventory: [],
  catalogReady: false,
  menuCategories: [],
  ratings: {},
  productStats: {},
  announcements: [],
  seen: [],
  seenLoaded: false,
  orders: [],
  chats: {},
  reports: [],
  coupon: { claimed: false, used: null },
  orderSeq: 1001,
  reportSeq: 1,
});

// `log` goes on the order timeline. `chat` (optional) also posts a system line in the chat for both sides.
const NEXT = {
  ready: { to: 'picked', log: 'left the café with your order.' },
  picked: { to: 'arrived', log: 'has arrived.', chat: (n) => `${n} has arrived.` },
  arrived: { to: 'dropping', log: 'is dropping off your order.', chat: (n) => `${n} is dropping off the order.` },
  dropping: { to: 'delivered', log: 'finished the delivery.', chat: () => 'Delivery finished. This chat is now closed.' },
};

function reducer(s, a) {
  switch (a.type) {
    case 'SET_INVENTORY':
      return { ...s, inventory: a.inventory, catalogReady: true };
    case 'SET_CATEGORIES':
      return { ...s, menuCategories: a.categories };
    case 'SET_RATINGS': {
      const ratings = {};
      a.ratings.forEach((r) => { ratings[r.id] = r; });
      return { ...s, ratings };
    }
    case 'SET_STATS':
      return { ...s, productStats: a.stats };
    case 'SET_ANNOUNCEMENTS':
      return { ...s, announcements: a.list.slice().sort((x, y) => (x.date < y.date ? 1 : -1)) };
    case 'SET_SEEN':
      return { ...s, seen: a.seen, seenLoaded: true };
    case 'SET_ORDERS': {
      // Newest first. Each order's messages become that order's chat.
      const orders = a.orders.slice().sort((x, y) => y.t - x.t);
      const chats = {};
      orders.forEach((o) => { chats[o.id] = o.messages || []; });
      return { ...s, orders, chats };
    }
    case 'PLACE_ORDER': {
      // Only the stock reservation and coupon happen here; the order itself is saved to Firestore.
      const inventory = s.inventory.map((i) => (a.usage[i.id] ? { ...i, qty: roundQty(Math.max(0, i.qty - a.usage[i.id])) } : i));
      const next = { ...s, inventory, orderSeq: s.orderSeq + 1 };
      if (a.order.discount) next.coupon = { ...s.coupon, used: a.order.id };
      return next;
    }
    case 'CLAIM_COUPON':
      return { ...s, coupon: { ...s.coupon, claimed: true } };
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

// Announcements this person has not opened yet (drives the badge on the News tab).
export const unreadAnnouncements = (s) => (s.seenLoaded ? s.announcements.filter((a) => !s.seen.includes(a.id)).length : 0);

const logError = (what) => (e) => console.log(`${what}:`, e.code || '', e.message);

// Delivered orders already written to the POS "sales" collection (guards against a double tap).
const recorded = new Set();

// Order numbers must not repeat between phones, so build one from the clock instead of a per-phone counter.
const newOrderId = () => `PC-${String(Date.now()).slice(-6)}`;

export function StoreProvider({ children }) {
  const { user } = useAuth();
  const [state, dispatch] = useReducer(reducer, undefined, initialState);
  const stateRef = useRef(state);
  stateRef.current = state;

  // Sign in to the POS Firestore, then follow products, ingredients and delivery orders live.
  useEffect(() => {
    let cancelled = false;
    let stops = [];
    (async () => {
      try {
        await signInDelivery();
        if (cancelled) return;
        let products = null;
        let ingredients = null;
        const apply = () => {
          if (!products || !ingredients) return;
          setCatalog(products, ingredients);
          dispatch({ type: 'SET_INVENTORY', inventory: ingredients.map(toInventoryItem).sort((a, b) => Number(a.id) - Number(b.id)) });
        };
        stops = [
          subscribeCatalog(
            (p) => { products = p; apply(); },
            (i) => { ingredients = i; apply(); },
            logError('Catalog error'),
          ),
          subscribeOrders((orders) => dispatch({ type: 'SET_ORDERS', orders }), logError('Orders error')),
          subscribeMenuCategories((categories) => dispatch({ type: 'SET_CATEGORIES', categories }), logError('Categories error')),
          subscribeRatings((ratings) => dispatch({ type: 'SET_RATINGS', ratings }), logError('Ratings error')),
          subscribeProductStats((stats) => dispatch({ type: 'SET_STATS', stats }), logError('Stats error')),
          subscribeAnnouncements((list) => dispatch({ type: 'SET_ANNOUNCEMENTS', list }), logError('Announcements error')),
        ];
      } catch (e) {
        console.log('POS sign-in failed:', e.message);
      }
    })();
    return () => { cancelled = true; stops.forEach((stop) => stop()); };
  }, []);

  // Which announcements this person already opened (kept on this phone, per account).
  const seenKey = `seenAnnouncements:${user ? user.name : ''}`;
  useEffect(() => {
    let live = true;
    AsyncStorage.getItem(seenKey)
      .then((raw) => { if (live) dispatch({ type: 'SET_SEEN', seen: raw ? JSON.parse(raw) : [] }); })
      .catch(() => { if (live) dispatch({ type: 'SET_SEEN', seen: [] }); });
    return () => { live = false; };
  }, [seenKey]);

  const actions = useMemo(() => {
    const allowed = (perm) => can(user, perm);

    return {
      placeOrder({ items, pay, contactless, loc, useCoupon }) {
        if (!allowed('order.place')) return { ok: false, reason: 'Not allowed' };
        const s = stateRef.current;
        const lines = items.filter(({ id, qty }) => qty > 0 && menuItem(id) && !isSoldOut(menuItem(id), s.inventory));
        if (!lines.length) return { ok: false, reason: 'Those drinks are sold out' };

        const usage = usageFor(lines);
        const short = s.inventory.find((i) => usage[i.id] && i.qty + 1e-9 < usage[i.id]);
        if (short) return { ok: false, reason: `Not enough ${short.name.toLowerCase()} for this order` };

        const subtotal = lines.reduce((a, { id, qty }) => a + menuItem(id).price * qty, 0);
        const discount = useCoupon && s.coupon.claimed && !s.coupon.used ? Math.round(subtotal * COUPON_RATE) : 0;
        const id = newOrderId();
        const order = {
          id, customer: user.name, items: lines.map(({ id: i, qty }) => ({ id: i, q: qty })), subtotal, discount, total: subtotal - discount,
          pay, paid: pay !== 'cod', status: 'preparing', driver: null, addr: loc.addr, land: loc.land, note: loc.note,
          contactless, t: Date.now(), log: [{ t: Date.now(), text: STATUS_LOG.preparing }],
        };
        // Reserve the stock right now, before React re-renders. Without this, two orders
        // placed in the same moment both check the same stale inventory.
        const action = { type: 'PLACE_ORDER', order, usage };
        stateRef.current = reducer(s, action);
        dispatch(action);
        // Save the order, then take the same ingredients out of the real POS stock.
        createOrder(order)
          .then(() => takeStock(usage))
          .catch(logError('Order save failed'));
        setTimeout(() => markReady(id, STATUS_LOG.ready).catch(logError('Kitchen update failed')), 6000);
        return { ok: true, id };
      },
      // stars = { productId: 1..5 } for a delivered order. Resolves true if saved, false if already rated.
      async rateOrder(orderId, stars) {
        if (!allowed('order.place')) return false;
        const order = stateRef.current.orders.find((o) => o.id === orderId);
        if (!order || order.status !== 'delivered' || order.customer !== user.name) return false;
        const clean = {};
        Object.keys(stars).forEach((id) => { const n = Math.round(Number(stars[id])); if (n >= 1 && n <= 5) clean[id] = n; });
        if (!Object.keys(clean).length) return false;
        return submitRating(orderId, user.name, clean);
      },
      async postAnnouncement({ title, body, image }) {
        if (!allowed('announce.post')) return false;
        const now = new Date();
        await createAnnouncement({
          id: `A${now.getTime()}`, title: title.trim(), body: body.trim(), image: image || null,
          date: now.toISOString(), author: user.name,
        });
        return true;
      },
      markAnnouncementsSeen() {
        const s = stateRef.current;
        const seen = Array.from(new Set(s.seen.concat(s.announcements.map((a) => a.id))));
        if (seen.length === s.seen.length) return;
        dispatch({ type: 'SET_SEEN', seen });
        AsyncStorage.setItem(seenKey, JSON.stringify(seen)).catch(() => {});
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
        const order = stateRef.current.orders.find((o) => o.id === orderId);
        if (!order || order.status === 'delivered') return; // a finished chat is closed
        sendMessage(orderId, { from: user.role === 'driver' ? 'driver' : 'customer', text: text.trim(), t: Date.now() }).catch(logError('Message failed'));
      },
      acceptJob(orderId) {
        if (!allowed('job.accept')) return false;
        const s = stateRef.current;
        if (s.orders.some((o) => o.driver === user.name && o.status !== 'delivered')) return false;
        claimOrder(orderId, user.name, `${user.name.split(' ')[0]} accepted your order.`).catch(logError('Accept failed'));
        return true;
      },
      advanceDelivery(orderId) {
        if (!allowed('delivery.update')) return;
        const order = stateRef.current.orders.find((o) => o.id === orderId);
        const nx = order && NEXT[order.status];
        if (!nx) return;
        const first = user.name.split(' ')[0];
        advanceOrder(orderId, order.status, { to: nx.to, log: `${first} ${nx.log}`, chat: nx.chat ? nx.chat(first) : null })
          .then((moved) => {
            // The last tap ("Finish delivery") also records the order as a POS sale.
            if (moved && nx.to === 'delivered' && !recorded.has(order.id)) {
              recorded.add(order.id);
              recordSale(order).catch((e) => { recorded.delete(order.id); logError('Sale save failed')(e); });
            }
          })
          .catch(logError('Update failed'));
      },
      quickUpdate(orderId, text, log) {
        if (!allowed('delivery.update')) return;
        const order = stateRef.current.orders.find((o) => o.id === orderId);
        if (!order || order.status === 'delivered') return;
        sendMessage(orderId, { from: 'driver', text, t: Date.now() }, log).catch(logError('Message failed'));
      },
      adjustStock(id, delta) {
        if (!allowed('inventory.adjust')) return;
        const item = stateRef.current.inventory.find((i) => i.id === id);
        if (!item) return;
        const qty = roundQty(clamp(item.qty + delta, 0, item.max));
        dispatch({ type: 'STOCK', id, qty });
        setIngredientQty(id, qty).catch(logError('Stock save failed'));
      },
      restock(id) {
        if (!allowed('inventory.adjust')) return;
        const item = stateRef.current.inventory.find((i) => i.id === id);
        if (!item) return;
        dispatch({ type: 'STOCK', id, qty: item.max });
        setIngredientQty(id, item.max).catch(logError('Stock save failed'));
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
  }, [user, seenKey]);

  const value = useMemo(() => ({ state, actions }), [state, actions]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside <StoreProvider>');
  return ctx;
}