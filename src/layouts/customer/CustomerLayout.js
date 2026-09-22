import React, { useState } from 'react';
import Screen from '../components/Screen';
import Frame from '../components/Frame';
import AppHeader, { IconButton } from '../components/AppHeader';
import BottomTabs from '../components/BottomTabs';
import AccountSheet from '../components/AccountSheet';
import { CustomerSessionProvider, useCustomerSession } from './CustomerSession';
import HomeScreen from './HomeScreen';
import MenuScreen from './MenuScreen';
import CouponsScreen from './CouponsScreen';
import ChatScreen from './ChatScreen';
import CheckoutSheet from './CheckoutSheet';
import ReportSheet from './ReportSheet';

const TABS = [
  { key: 'home', label: 'Home', icon: 'home' },
  { key: 'menu', label: 'Menu', icon: 'coffee' },
  { key: 'coupons', label: 'Coupons', icon: 'tag' },
  { key: 'chat', label: 'Chat', icon: 'message-circle' },
];

function Shell() {
  const s = useCustomerSession();
  const [tab, setTab] = useState('home');
  const [sheet, setSheet] = useState(null);
  const [chatOrder, setChatOrder] = useState(null);
  const openChat = (id) => { setChatOrder(id); setTab('chat'); };

  return (
    <Screen background="#EFEAE2">
      <Frame>
        <AppHeader
          title={TABS.find((t) => t.key === tab).label}
          right={<>
            <IconButton icon="shopping-cart" label={`Your order, ${s.count} items`} badge={s.count || null} onPress={() => setSheet('cart')} />
            <IconButton icon="menu" label="Account" onPress={() => setSheet('account')} />
          </>}
        />
        {tab === 'home' && <HomeScreen go={setTab} openChat={openChat} />}
        {tab === 'menu' && <MenuScreen openCart={() => setSheet('cart')} />}
        {tab === 'coupons' && <CouponsScreen />}
        {tab === 'chat' && <ChatScreen orderId={chatOrder} onPick={setChatOrder} />}
        <BottomTabs tabs={TABS} current={tab} onChange={setTab} />
      </Frame>

      <CheckoutSheet visible={sheet === 'cart'} onClose={() => setSheet(null)} onPlaced={() => { setSheet(null); setTab('home'); }} />
      <ReportSheet visible={sheet === 'report'} onClose={() => setSheet(null)} />
      <AccountSheet visible={sheet === 'account'} onClose={() => setSheet(null)} actions={[{ icon: 'flag', label: 'Report a problem', onPress: () => setSheet('report') }]} />
    </Screen>
  );
}

export default function CustomerLayout() {
  return <CustomerSessionProvider><Shell /></CustomerSessionProvider>;
}
