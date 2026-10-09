import React, { useState } from 'react';
import { View } from 'react-native';
import Screen from '../components/Screen';
import Frame from '../components/Frame';
import AppHeader, { IconButton } from '../components/AppHeader';
import BottomTabs from '../components/BottomTabs';
import AccountSheet from '../components/AccountSheet';
import { CustomerSessionProvider, useCustomerSession } from './CustomerSession';
import { useAuth } from '../../users';
import { useStore } from '../../data/StoreContext';
import { ordersOfCustomer, activeOrders } from '../../data/selectors';
import HomeScreen from './HomeScreen';
import MenuScreen from './MenuScreen';
import CouponsScreen from './CouponsScreen';
import ChatScreen from './ChatScreen';
import CheckoutSheet from './CheckoutSheet';
import OrdersSheet from './OrdersSheet';
import OrderDetailsSheet from './OrderDetailsSheet';
import ReportSheet from './ReportSheet';

const TABS = [
  { key: 'home', label: 'Home', icon: 'home' },
  { key: 'menu', label: 'Menu', icon: 'coffee' },
  { key: 'coupons', label: 'Coupons', icon: 'tag' },
  { key: 'chat', label: 'Chat', icon: 'message-circle' },
];

function Shell() {
  const s = useCustomerSession();
  const { user } = useAuth();
  const { state } = useStore();
  const activeCount = activeOrders(ordersOfCustomer(state.orders, user.name)).length;

  const [tab, setTab] = useState('home');
  const [sheet, setSheet] = useState(null);
  const [chatOrder, setChatOrder] = useState(null);
  const openChat = (id) => { setChatOrder(id); setTab('chat'); setSheet(null); };

  // Saved cart: [{ id, qty }]. Only changes when "Add to cart" is pressed.
  const [saved, setSaved] = useState([]);
  const savedCount = saved.reduce((n, l) => n + l.qty, 0);

  // "Add to cart": move Menu items into the saved cart, reset Menu counters to 0
  const addToCart = () => {
    if (!s.lines.length) { setSheet(null); return; }
    setSaved((prev) => {
      const next = prev.map((l) => ({ ...l }));
      s.lines.forEach(({ item, qty }) => {
        const found = next.find((l) => l.id === item.id);
        if (found) found.qty += qty;
        else next.push({ id: item.id, qty });
      });
      return next;
    });
    s.clearCart();
    setSheet(null);
  };

  // Cart icon: load saved items into the session, then open the checkout form
  const openForm = () => {
    saved.forEach(({ id, qty }) => {
      for (let i = 0; i < qty; i++) s.add(id);
    });
    setSaved([]);
    setSheet('form');
  };

  // Closed the form without ordering: put the items back in the saved cart
  const closeForm = () => {
    setSaved(s.lines.map(({ item, qty }) => ({ id: item.id, qty })));
    s.clearCart();
    setSheet(null);
  };

  return (
    <Screen background="#EFEAE2">
      <Frame>
        <AppHeader
          title={TABS.find((t) => t.key === tab).label}
          right={<>
            <IconButton
              icon="clipboard"
              label={`My orders, ${activeCount} active`}
              badge={activeCount || null}
              onPress={() => setSheet('orders')}
            />
            <IconButton
              icon="shopping-cart"
              label={`Cart, ${savedCount} items`}
              badge={savedCount || null}
              onPress={openForm}
            />
            <IconButton icon="menu" label="Account" onPress={() => setSheet('account')} />
          </>}
        />
        <View style={{ flex: 1 }}>
          {tab === 'home' && <HomeScreen go={setTab} openChat={openChat} />}
          {tab === 'menu' && <MenuScreen openCart={() => setSheet('cart')} />}
          {tab === 'coupons' && <CouponsScreen />}
          {tab === 'chat' && <ChatScreen orderId={chatOrder} onPick={setChatOrder} />}
        </View>
        <BottomTabs tabs={TABS} current={tab} onChange={setTab} />
      </Frame>

      {/* Menu bar: items you picked, Add to cart, Clear cart */}
      <CheckoutSheet
        visible={sheet === 'cart'}
        onClose={() => setSheet(null)}
        onCheckout={addToCart}
      />

      {/* Cart icon: address, payment, summary, Place order */}
      <OrdersSheet
        visible={sheet === 'form'}
        onClose={closeForm}
        onPlaced={() => setSheet('orders')}
      />

      {/* Clipboard icon: My orders + order details */}
      <OrderDetailsSheet
        visible={sheet === 'orders'}
        onClose={() => setSheet(null)}
        onChat={openChat}
      />

      <ReportSheet visible={sheet === 'report'} onClose={() => setSheet(null)} />
      <AccountSheet visible={sheet === 'account'} onClose={() => setSheet(null)} actions={[{ icon: 'flag', label: 'Report a problem', onPress: () => setSheet('report') }]} />
    </Screen>
  );
}

export default function CustomerLayout() {
  return <CustomerSessionProvider><Shell /></CustomerSessionProvider>;
}