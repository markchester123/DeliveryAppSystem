import React, { useState } from 'react';
import { ScrollView, View, Text, Pressable, useWindowDimensions } from 'react-native';
import Screen from '../components/Screen';
import TopBar from '../components/TopBar';
import Icon from '../components/Icon';
import BottomTabs from '../components/BottomTabs';
import DashboardScreen from './DashboardScreen';
import SalesScreen from './SalesScreen';
import OrdersScreen from './OrdersScreen';
import ChatsScreen from './ChatsScreen';
import ReportsScreen from './ReportsScreen';
import AnnouncementsScreen from '../customer/AnnouncementsScreen';
import { useLowStockToast } from '../components/LowStockAlert';
import { colors } from '../theme';
import { useStore } from '../../data/StoreContext';
import { activeOrders } from '../../data/selectors';

export default function AdminLayout() {
  const { state } = useStore();
  useLowStockToast(state.inventory);
  const { width } = useWindowDimensions();
  const wide = width >= 820;
  const [tab, setTab] = useState('dashboard');
  const [chatSel, setChatSel] = useState(null);

  const openChat = (id) => { setChatSel(id); setTab('chats'); };
  const inProgress = activeOrders(state.orders).length;
  const openReports = state.reports.filter((r) => r.status === 'open').length;

  const nav = [
    { key: 'dashboard', label: 'Dashboard', icon: 'grid' },
    { key: 'sales', label: 'Sales', icon: 'dollar-sign' },
    { key: 'orders', label: 'Orders', icon: 'file-text', badge: inProgress || null },
    { key: 'chats', label: 'Chats', icon: 'message-circle' },
    { key: 'reports', label: 'Reports', icon: 'flag', badge: openReports || null },
    { key: 'news', label: 'News', icon: 'bell' },
  ];

  const body = (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 40, width: '100%', maxWidth: 960, alignSelf: 'center' }} keyboardShouldPersistTaps="handled">
      {tab === 'dashboard' && <DashboardScreen />}
      {tab === 'sales' && <SalesScreen />}
      {tab === 'orders' && <OrdersScreen openChat={openChat} />}
      {tab === 'chats' && <ChatsScreen wide={wide} selected={chatSel} onSelect={setChatSel} />}
      {tab === 'reports' && <ReportsScreen openChat={openChat} />}
      {tab === 'news' && <AnnouncementsScreen scroll={false} />}
    </ScrollView>
  );

  return (
    <Screen>
      <TopBar />
      {wide ? (
        <View style={{ flex: 1, flexDirection: 'row' }}>
          <View style={{ width: 200, padding: 12, gap: 4, backgroundColor: colors.card, borderRightWidth: 1, borderRightColor: colors.line }} accessibilityRole="tablist">
            {nav.map((n) => (
              <Pressable key={n.key} onPress={() => setTab(n.key)} accessibilityRole="tab" accessibilityState={{ selected: tab === n.key }} accessibilityLabel={n.label}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 44, paddingHorizontal: 12, borderRadius: 10, backgroundColor: tab === n.key ? colors.primaryTint : 'transparent' }}>
                <Icon name={n.icon} size={19} color={tab === n.key ? colors.primary : colors.muted} />
                <Text style={{ flex: 1, fontWeight: '600', color: tab === n.key ? colors.primary : colors.text }}>{n.label}</Text>
                {n.badge ? <Text style={{ fontWeight: '700', color: colors.muted }}>{n.badge}</Text> : null}
              </Pressable>
            ))}
          </View>
          {body}
        </View>
      ) : (
        <View style={{ flex: 1 }}>{body}<BottomTabs tabs={nav} current={tab} onChange={setTab} /></View>
      )}
    </Screen>
  );
}