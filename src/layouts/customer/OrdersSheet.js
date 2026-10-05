import React, { useState } from 'react';
import { ScrollView, View, Text, Pressable, Modal, StyleSheet } from 'react-native';
import Sheet from '../components/Sheet';
import Pill from '../components/Pill';
import Icon from '../components/Icon';
import { EmptyState } from '../components/Feedback';
import { OrderCard } from './HomeScreen';
import { colors, type, radius } from '../theme';
import { useAuth } from '../../users';
import { useStore } from '../../data/StoreContext';
import { ordersOfCustomer, activeOrders } from '../../data/selectors';
import { STATUS_LABEL } from '../../data/constants';
import { menuItem } from '../../data/menu';
import { peso, firstName } from '../../utils/format';

function Tab({ label, selected, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityState={{ selected }}
      style={{
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: selected ? colors.primary : 'transparent',
      }}
    >
      <Text style={[type.body, { fontWeight: '600', color: selected ? colors.primary : colors.text }]}>{label}</Text>
    </Pressable>
  );
}

const PAY_LABEL = { gcash: 'G-Cash', maya: 'Maya', cod: 'Cash on delivery' };

function Row({ label, value }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 }}>
      <Text style={type.body}>{label}</Text>
      <Text style={[type.body, { fontWeight: '600' }]}>{value}</Text>
    </View>
  );
}

function OrderDetail({ order, onClose, onChat }) {
  return (
    <Modal visible={!!order} transparent animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' }}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Close" />
        <View style={{ maxHeight: '85%', backgroundColor: colors.card, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg, padding: 18 }}>
          {order ? (
            <>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <Text style={type.title}>Order {order.id}</Text>
                <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Close" style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="x" size={22} />
                </Pressable>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={{ flexDirection: 'row', marginBottom: 12 }}>
                  <Pill status={order.status} label={STATUS_LABEL[order.status]} />
                </View>

                <Text style={[type.small, { fontWeight: '700', textTransform: 'uppercase', marginBottom: 6 }]}>Items</Text>
                {order.items.map((line, idx) => {
                  const m = menuItem(line.id);
                  return (
                    <View key={idx} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 }}>
                      <Text style={type.body}>{m ? m.name : line.id} × {line.q}</Text>
                      <Text style={type.body}>{m ? peso(m.price * line.q) : ''}</Text>
                    </View>
                  );
                })}

                <View style={{ borderTopWidth: 1, borderTopColor: colors.line, marginTop: 8, paddingTop: 8 }}>
                  <Row label="Subtotal" value={peso(order.subtotal)} />
                  {order.discount ? <Row label="Discount" value={`-${peso(order.discount)}`} /> : null}
                  <Row label="Total" value={peso(order.total)} />
                </View>

                <Text style={[type.small, { fontWeight: '700', textTransform: 'uppercase', marginTop: 16, marginBottom: 6 }]}>Delivery</Text>
                <Text style={type.body}>{order.addr}</Text>
                {order.note ? <Text style={type.small}>Note: {order.note}</Text> : null}
                <Text style={type.small}>{order.contactless ? 'Contactless: messages only, no calls.' : 'Calls okay.'}</Text>

                <Text style={[type.small, { fontWeight: '700', textTransform: 'uppercase', marginTop: 16, marginBottom: 6 }]}>Payment</Text>
                <Text style={type.body}>{PAY_LABEL[order.pay] || order.pay} {order.paid ? '· Paid' : '· Pay on delivery'}</Text>

                {order.driver ? (
                  <>
                    <Text style={[type.small, { fontWeight: '700', textTransform: 'uppercase', marginTop: 16, marginBottom: 6 }]}>Rider</Text>
                    <Text style={type.body}>{order.driver}</Text>
                  </>
                ) : null}

                <Text style={[type.small, { fontWeight: '700', textTransform: 'uppercase', marginTop: 16, marginBottom: 6 }]}>Status timeline</Text>
                {order.log.map((entry, idx) => (
                  <View key={idx} style={{ flexDirection: 'row', gap: 8, paddingVertical: 4 }}>
                    <Text style={[type.small, { width: 64 }]}>{new Date(entry.t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                    <Text style={[type.body, { flex: 1 }]}>{entry.text}</Text>
                  </View>
                ))}

                {order.driver ? (
                  <Pressable onPress={() => onChat(order.id)} style={{ marginTop: 18, paddingVertical: 12, borderRadius: radius.lg, backgroundColor: colors.primary, alignItems: 'center' }}>
                    <Text style={{ color: '#fff', fontWeight: '700' }}>Chat with {firstName(order.driver)}</Text>
                  </Pressable>
                ) : null}

                <View style={{ height: 12 }} />
              </ScrollView>
            </>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

export default function OrdersSheet({ visible, onClose, onChat }) {
  const { user } = useAuth();
  const { state } = useStore();
  const [tab, setTab] = useState('active');
  const [selected, setSelected] = useState(null);

  const all = ordersOfCustomer(state.orders, user.name);
  const active = activeOrders(all);
  const activeIds = new Set(active.map((o) => o.id));
  const history = all.filter((o) => !activeIds.has(o.id));
  const list = tab === 'active' ? active : history;

  return (
    <Sheet visible={visible} onClose={onClose} title="My orders">
      <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.line, marginBottom: 12 }}>
        <Tab label={`Active${active.length ? ` (${active.length})` : ''}`} selected={tab === 'active'} onPress={() => setTab('active')} />
        <Tab label="History" selected={tab === 'history'} onPress={() => setTab('history')} />
      </View>

      <ScrollView contentContainerStyle={{ gap: 12 }}>
        {list.length
          ? list.map((o) => (
              <Pressable key={o.id} onPress={() => setSelected(o)}>
                <OrderCard order={o} onChat={() => onChat(o.id)} />
              </Pressable>
            ))
          : <EmptyState>{tab === 'active' ? 'No orders on the way.' : 'No past orders yet.'}</EmptyState>}
      </ScrollView>

      <OrderDetail order={selected} onClose={() => setSelected(null)} onChat={(id) => { setSelected(null); onChat(id); }} />
    </Sheet>
  );
}