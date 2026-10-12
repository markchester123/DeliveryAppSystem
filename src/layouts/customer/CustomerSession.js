import React, { createContext, useContext, useMemo, useState } from 'react';
import { useStore } from '../../data/StoreContext';
import { menuItem } from '../../data/menu';
import { isSoldOut } from '../../data/selectors';
import { COUPON_RATE } from '../../data/constants';

const Ctx = createContext(null);
export const useCustomerSession = () => useContext(Ctx);

// The cart is { key: qty } where key is "<productId>-<size>", e.g. "3-12" or "3-16".
export function CustomerSessionProvider({ children }) {
  const { state } = useStore();
  const [cart, setCart] = useState({});
  const [addr, setAddr] = useState('');
  const [note, setNote] = useState('');
  const [useCoupon, setUseCoupon] = useState(true);
  const [contactless, setContactless] = useState(true);
  const [pay, setPay] = useState('gcash');

  const lines = useMemo(
    () => Object.keys(cart)
      .filter((key) => cart[key] > 0)
      .map((key) => ({ key, item: menuItem(key), qty: cart[key] }))
      .filter((l) => l.item && !isSoldOut(l.item, state.inventory)),
    [cart, state.inventory],
  );
  const subtotal = lines.reduce((a, l) => a + l.item.price * l.qty, 0);
  const count = lines.reduce((a, l) => a + l.qty, 0);
  const couponReady = state.coupon.claimed && !state.coupon.used;
  const discount = useCoupon && couponReady ? Math.round(subtotal * COUPON_RATE) : 0;

  const value = {
    cart, lines, subtotal, count, discount, total: subtotal - discount, couponReady,
    addr, setAddr, note, setNote, useCoupon, setUseCoupon, contactless, setContactless, pay, setPay,
    add: (key) => setCart((c) => ({ ...c, [key]: Math.min(9, (c[key] || 0) + 1) })),
    remove: (key) => setCart((c) => ({ ...c, [key]: Math.max(0, (c[key] || 0) - 1) })),
    clearCart: () => setCart({}),
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}