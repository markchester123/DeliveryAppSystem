import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useStore } from '../../data/StoreContext';
import { menuItem } from '../../data/menu';
import { isSoldOut } from '../../data/selectors';
import { COUPON_RATE } from '../../data/constants';

const Ctx = createContext(null);
export const useCustomerSession = () => useContext(Ctx);

export function CustomerSessionProvider({ children }) {
  const { state } = useStore();
  const [cart, setCart] = useState({});
  const [addr, setAddr] = useState('');
  const [note, setNote] = useState('');
  const [useCoupon, setUseCoupon] = useState(true);
  const [contactless, setContactless] = useState(true);
  const [pay, setPay] = useState('gcash');

  // DEBUG: remove these once the problem is found
  console.log('PROVIDER RENDER', JSON.stringify(cart));
  useEffect(() => {
    console.log('PROVIDER MOUNTED');
    return () => console.log('PROVIDER UNMOUNTED');
  }, []);

  const lines = useMemo(
    () =>
      Object.keys(cart)
        .filter((id) => cart[id] > 0)
        .map((id) => ({ key: id, item: menuItem(id), qty: cart[id] }))
        .filter((l) => !isSoldOut(l.item, state.inventory)),
    [cart, state.inventory],
  );

  const subtotal = lines.reduce((a, l) => a + l.item.price * l.qty, 0);
  const count = lines.reduce((a, l) => a + l.qty, 0);
  const couponReady = state.coupon.claimed && !state.coupon.used;
  const discount = useCoupon && couponReady ? Math.round(subtotal * COUPON_RATE) : 0;

  const value = {
    cart,
    lines,
    subtotal,
    count,
    discount,
    total: subtotal - discount,
    couponReady,
    addr, setAddr,
    note, setNote,
    useCoupon, setUseCoupon,
    contactless, setContactless,
    pay, setPay,
    add: (id) => {
      console.log('ADD', id);
      setCart((c) => ({ ...c, [id]: Math.min(9, (c[id] || 0) + 1) }));
    },
    remove: (id) => {
      console.log('REMOVE', id);
      setCart((c) => ({ ...c, [id]: Math.max(0, (c[id] || 0) - 1) }));
    },
    clearCart: () => {
      console.log('CLEAR');
      setCart({});
    },
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}