import { signInWithEmailAndPassword } from 'firebase/auth';
import { arrayUnion, collection, doc, onSnapshot, runTransaction, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { menuItem } from '../data/menu';

// The delivery app signs in to the POS Firestore with one shared "Delivery App" account.
export async function signInDelivery() {
  const email = process.env.EXPO_PUBLIC_DELIVERY_EMAIL;
  const password = process.env.EXPO_PUBLIC_DELIVERY_PASSWORD;
  if (!email || !password) throw new Error('Missing EXPO_PUBLIC_DELIVERY_EMAIL / EXPO_PUBLIC_DELIVERY_PASSWORD in .env.local');
  await auth.authStateReady();
  if (auth.currentUser && auth.currentUser.email === email) return;
  await signInWithEmailAndPassword(auth, email, password);
}

// ---------- POS products and ingredients (live) ----------

// Returns a function that stops listening.
export function subscribeCatalog(onProducts, onIngredients, onError) {
  const stopProducts = onSnapshot(collection(db, 'products'), (snap) => onProducts(snap.docs.map((d) => d.data())), onError);
  const stopIngredients = onSnapshot(collection(db, 'ingredients'), (snap) => onIngredients(snap.docs.map((d) => d.data())), onError);
  return () => { stopProducts(); stopIngredients(); };
}

// POS menu categories (name + color). Deleting one in the POS removes it here too.
export function subscribeMenuCategories(onCategories, onError) {
  return onSnapshot(
    collection(db, 'menuCategories'),
    (snap) => onCategories(snap.docs.map((d) => ({ name: d.data().name || d.id, color: d.data().color }))),
    onError,
  );
}

// Subtract an order's ingredients from the real stock. usage = { ingredientId: amount }.
// A transaction, so two apps (or two orders) can't overwrite each other's numbers.
export function takeStock(usage) {
  const ids = Object.keys(usage);
  return runTransaction(db, async (tx) => {
    const refs = ids.map((id) => doc(db, 'ingredients', id));
    const snaps = await Promise.all(refs.map((r) => tx.get(r)));
    snaps.forEach((snap, i) => {
      if (!snap.exists()) return;
      const left = Math.max(0, snap.data().quantity - usage[ids[i]]);
      tx.update(refs[i], { quantity: Math.round(left * 100) / 100 });
    });
  });
}

// Staff stock edits from the delivery app.
export const setIngredientQty = (id, quantity) => updateDoc(doc(db, 'ingredients', String(id)), { quantity });

// ---------- Delivery orders and chat (live, shared by every phone) ----------
// One document per order in "deliveryOrders". Its "log" and "messages" are arrays that only ever grow.
// The security rules refuse any change once status is "delivered", which is what locks a finished chat.

const orderRef = (id) => doc(db, 'deliveryOrders', id);

export function subscribeOrders(onOrders, onError) {
  return onSnapshot(collection(db, 'deliveryOrders'), (snap) => onOrders(snap.docs.map((d) => d.data())), onError);
}

export function createOrder(order) {
  // JSON round trip drops undefined fields, which Firestore does not accept.
  return setDoc(orderRef(order.id), { ...JSON.parse(JSON.stringify(order)), messages: [] });
}

// Kitchen finished: preparing -> ready.
export function markReady(id, text) {
  return runTransaction(db, async (tx) => {
    const snap = await tx.get(orderRef(id));
    if (!snap.exists() || snap.data().status !== 'preparing') return false;
    tx.update(orderRef(id), { status: 'ready', log: arrayUnion({ t: Date.now(), text }) });
    return true;
  });
}

// A driver takes a job. Returns false if another driver got there first.
export function claimOrder(id, driver, text) {
  return runTransaction(db, async (tx) => {
    const snap = await tx.get(orderRef(id));
    if (!snap.exists() || snap.data().driver) return false;
    tx.update(orderRef(id), { driver, log: arrayUnion({ t: Date.now(), text }) });
    return true;
  });
}

// Move an order one step ("from" must still be its current status), optionally posting a system line in the chat.
export function advanceOrder(id, from, { to, log, chat }) {
  return runTransaction(db, async (tx) => {
    const snap = await tx.get(orderRef(id));
    if (!snap.exists() || snap.data().status !== from) return false;
    const patch = { status: to, log: arrayUnion({ t: Date.now(), text: log }) };
    if (chat) patch.messages = arrayUnion({ from: 'system', text: chat, t: Date.now() });
    tx.update(orderRef(id), patch);
    return true;
  });
}

// A chat message, plus an optional line on the order timeline.
export function sendMessage(id, message, logText) {
  const patch = { messages: arrayUnion(message) };
  if (logText) patch.log = arrayUnion({ t: Date.now(), text: logText });
  return updateDoc(orderRef(id), patch);
}

// ---------- Ratings ----------
// ratings/{orderId}: one per order (so an order can only be rated once).
// productStats/{productId}: running { sum, count } so the average is the same on every phone.

export function subscribeRatings(onRatings, onError) {
  return onSnapshot(collection(db, 'ratings'), (snap) => onRatings(snap.docs.map((d) => ({ id: d.id, ...d.data() }))), onError);
}

export function subscribeProductStats(onStats, onError) {
  return onSnapshot(collection(db, 'productStats'), (snap) => {
    const stats = {};
    snap.docs.forEach((d) => { stats[d.id] = { sum: Number(d.data().sum) || 0, count: Number(d.data().count) || 0 }; });
    onStats(stats);
  }, onError);
}

// stars = { productId: 1..5 }. Returns false if this order was already rated.
export function submitRating(orderId, customer, stars) {
  const ratingRef = doc(db, 'ratings', orderId);
  const ids = Object.keys(stars);
  return runTransaction(db, async (tx) => {
    const done = await tx.get(ratingRef);
    if (done.exists()) return false;
    const refs = ids.map((id) => doc(db, 'productStats', String(id)));
    const snaps = await Promise.all(refs.map((r) => tx.get(r)));
    snaps.forEach((snap, i) => {
      const cur = snap.exists() ? snap.data() : { sum: 0, count: 0 };
      tx.set(refs[i], { sum: (Number(cur.sum) || 0) + stars[ids[i]], count: (Number(cur.count) || 0) + 1 });
    });
    tx.set(ratingRef, { orderId, customer, stars, t: Date.now() });
    return true;
  });
}

// ---------- Announcements ----------

export function subscribeAnnouncements(onList, onError) {
  return onSnapshot(collection(db, 'announcements'), (snap) => onList(snap.docs.map((d) => d.data())), onError);
}

export function createAnnouncement(a) {
  return setDoc(doc(db, 'announcements', a.id), a);
}

// ---------- POS sales ----------

const PAYMENT_MODE = { gcash: 'G-Cash', maya: 'Maya', cod: 'Cash' };

// A finished delivery becomes a normal POS sale, numbered from the same counter the POS uses.
export function recordSale(order) {
  const counterRef = doc(db, 'counters', 'orders');
  const items = order.items.map(({ id, q }) => {
    const m = menuItem(id);
    return { id: Number(String(id).split('-')[0]), name: m ? m.name : String(id), price: m ? m.price : 0, quantity: q };
  });
  return runTransaction(db, async (tx) => {
    const snap = await tx.get(counterRef);
    const next = (snap.exists() ? snap.data().last : 0) + 1;
    tx.set(counterRef, { last: next });
    tx.set(doc(collection(db, 'sales')), {
      orderNumber: next,
      date: new Date().toISOString(),
      cashier: 'Delivery App',
      paymentMode: PAYMENT_MODE[order.pay] || 'Cash',
      amountPaid: order.total,
      change: 0,
      total: order.total,
      items,
      proofUrl: null,
      source: 'delivery',
      deliveryId: order.id,
    });
    return next;
  });
}