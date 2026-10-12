import React, { useState } from 'react';
import { View } from 'react-native';
import Screen from '../components/Screen';
import Frame from '../components/Frame';
import AppHeader, { IconButton } from '../components/AppHeader';
import BottomTabs from '../components/BottomTabs';
import AccountSheet from '../components/AccountSheet';
import { CustomerSessionProvider, useCustomerSession } from './CustomerSession';
import { useAuth } from '../../users';
import { useStore, unreadAnnouncements } from '../../data/StoreContext';
import { ordersOfCustomer, activeOrders } from '../../data/selectors';
import HomeScreen from './HomeScreen';
import MenuScreen from './MenuScreen';
import CouponsScreen from './CouponsScreen';
import ChatScreen from './ChatScreen';
import CheckoutSheet from './CheckoutSheet';
import OrdersSheet from './OrdersSheet';
import OrderDetailsSheet from './OrderDetailsSheet';
import ReportSheet from './ReportSheet';
import AnnouncementsScreen from './AnnouncementsScreen';

const TABS = [
  { key: 'home', label: 'Home', icon: 'home' },
  { key: 'menu', label: 'Menu', icon: 'coffee' },
  { key: 'coupons', label: 'Coupons', icon: 'tag' },
  { key: 'chat', label: 'Chat', icon: 'message-circle' },
  { key: 'news', label: 'News', icon: 'bell' },
];

function Shell() {
  const s = useCustomerSession();
  const { user } = useAuth();
  const { state } = useStore();
  const activeCount = activeOrders(ordersOfCustomer(state.orders, user.name)).length;
  const unread = unreadAnnouncements(state);
  const tabs = TABS.map((t) => (t.key === 'news' ? { ...t, badge: unread || null } : t));

  const [tab, setTab] = useState('home');
  const [sheet, setSheet] = useState(null);
  const [chatOrder, setChatOrder] = useState(null);
  const openChat = (id) => { setChatOrder(id); setTab('chat'); setSheet(null); };

  // Saved cart: [{ key, qty }] (key = "<productId>-<size>"). Only changes when "Add to cart" is pressed.
  const [saved, setSaved] = useState([]);
  const savedCount = saved.reduce((n, l) => n + l.qty, 0);

  // "Add to cart": move Menu items into the saved cart, reset Menu counters to 0
  const addToCart = () => {
    if (!s.lines.length) { setSheet(null); return; }
    setSaved((prev) => {
      const next = prev.map((l) => ({ ...l }));
      s.lines.forEach(({ key, qty }) => {
        const found = next.find((l) => l.key === key);
        if (found) found.qty += qty;
        else next.push({ key, qty });
      });
      return next;
    });
    s.clearCart();
    setSheet(null);
  };

  // Cart icon: load saved items into the session, then open the checkout form
  const openForm = () => {
    saved.forEach(({ key, qty }) => {
      for (let i = 0; i < qty; i++) s.add(key);
    });
    setSaved([]);
    setSheet('form');
  };

  // Closed the form without ordering: put the items back in the saved cart
  const closeForm = () => {
    setSaved(s.lines.map(({ key, qty }) => ({ key, qty })));
    s.clearCart();
    setSheet(null);
  };

  return (
    <Screen background="#EFEAE2">
      <Frame>
        <AppHeader
          title={tab === 'news' ? 'Announcements' : TABS.find((t) => t.key === tab).label}
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
          {tab === 'news' && <AnnouncementsScreen />}
        </View>
        <BottomTabs tabs={tabs} current={tab} onChange={setTab} />
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