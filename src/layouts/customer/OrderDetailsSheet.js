import React, { useState } from 'react';
import { ScrollView, View, Text, Pressable, Modal, StyleSheet } from 'react-native';
import Sheet from '../components/Sheet';
import Pill from '../components/Pill';
import Icon from '../components/Icon';
import { EmptyState, useToast } from '../components/Feedback';
import Stars from '../components/Stars';
import { OrderCard } from './HomeScreen';
import { colors, type, radius } from '../theme';
import { useAuth } from '../../users';
import { useStore } from '../../data/StoreContext';
import { ordersOfCustomer, activeOrders } from '../../data/selectors';
import { STATUS_LABEL } from '../../data/constants';
import { menuItem, baseId } from '../../data/menu';
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

function SectionTitle({ children, first }) {
  return (
    <Text style={[type.small, { fontWeight: '700', textTransform: 'uppercase', marginTop: first ? 0 : 16, marginBottom: 6 }]}>
      {children}
    </Text>
  );
}

// Rate each drink of a delivered order (once per order). Averages are kept in Firestore.
function RateOrder({ order }) {
  const { state, actions } = useStore();
  const toast = useToast();
  const [picks, setPicks] = useState({});
  const [busy, setBusy] = useState(false);

  const ids = [];
  order.items.forEach((l) => { const id = baseId(l.id); if (menuItem(id) && !ids.includes(id)) ids.push(id); });
  if (!ids.length) return null;

  const done = state.ratings[order.id];
  const ready = ids.every((id) => picks[id] > 0);

  const submit = async () => {
    setBusy(true);
    try {
      const ok = await actions.rateOrder(order.id, picks);
      toast(ok ? 'Thanks for your rating!' : 'This order was already rated');
    } catch (e) {
      toast('Could not save your rating. Try again.');
    }
    setBusy(false);
  };

  return (
    <>
      <SectionTitle>{done ? 'Your rating' : 'Rate your drinks'}</SectionTitle>
      {ids.map((id) => (
        <View key={id} style={{ paddingVertical: 6 }}>
          <Text style={[type.body, { marginBottom: 4 }]}>{menuItem(id).name}</Text>
          {done
            ? <Stars value={(done.stars && done.stars[id]) || 0} size={24} />
            : <Stars value={picks[id] || 0} onChange={(n) => setPicks((p) => ({ ...p, [id]: n }))} />}
        </View>
      ))}
      {!done ? (
        <Pressable
          disabled={!ready || busy}
          onPress={submit}
          accessibilityRole="button"
          style={{ marginTop: 10, paddingVertical: 12, borderRadius: radius.lg, backgroundColor: ready && !busy ? colors.primary : colors.line, alignItems: 'center' }}
        >
          <Text style={{ color: ready && !busy ? '#fff' : colors.muted, fontWeight: '700' }}>{busy ? 'Saving…' : 'Submit rating'}</Text>
        </Pressable>
      ) : null}
    </>
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

                <SectionTitle first>Items</SectionTitle>
                {order.items.map((line, idx) => {
                  const m = menuItem(line.id);
                  return (
                    <View key={idx} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 }}>
                      <Text style={type.body}>{m ? `${m.name} · ${m.size}oz` : line.id} × {line.q}</Text>
                      <Text style={type.body}>{m ? peso(m.price * line.q) : ''}</Text>
                    </View>
                  );
                })}

                <View style={{ borderTopWidth: 1, borderTopColor: colors.line, marginTop: 8, paddingTop: 8 }}>
                  <Row label="Subtotal" value={peso(order.subtotal)} />
                  {order.discount ? <Row label="Discount" value={`-${peso(order.discount)}`} /> : null}
                  <Row label="Total" value={peso(order.total)} />
                </View>

                <SectionTitle>Delivery address</SectionTitle>
                <Text style={type.body}>{order.addr}</Text>
                {order.note ? <Text style={type.small}>Note: {order.note}</Text> : null}
                <Text style={type.small}>{order.contactless ? 'Contactless: messages only, no calls.' : 'Calls okay.'}</Text>

                <SectionTitle>Payment</SectionTitle>
                <Text style={type.body}>
                  {PAY_LABEL[order.pay] || order.pay} {order.paid ? '· Paid' : '· Pay on delivery'}
                </Text>

                {order.driver ? (
                  <>
                    <SectionTitle>Rider</SectionTitle>
                    <Text style={type.body}>{order.driver}</Text>
                  </>
                ) : null}

                <SectionTitle>Status timeline</SectionTitle>
                {order.log.map((entry, idx) => (
                  <View key={idx} style={{ flexDirection: 'row', gap: 8, paddingVertical: 4 }}>
                    <Text style={[type.small, { width: 64 }]}>
                      {new Date(entry.t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                    <Text style={[type.body, { flex: 1 }]}>{entry.text}</Text>
                  </View>
                ))}

                {order.status === 'delivered' ? <RateOrder order={order} /> : null}

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

export default function OrderDetailsSheet({ visible, onClose, onChat }) {
  const { user } = useAuth();
  const { state } = useStore();
  const [tab, setTab] = useState('active');
  const [selectedId, setSelectedId] = useState(null);

  const all = ordersOfCustomer(state.orders, user.name);
  const active = activeOrders(all);
  const activeIds = new Set(active.map((o) => o.id));
  const history = all.filter((o) => !activeIds.has(o.id));
  const list = tab === 'active' ? active : history;
  const selected = all.find((o) => o.id === selectedId) || null;

  return (
    <Sheet visible={visible} onClose={onClose} title="My orders">
      <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.line, marginBottom: 12 }}>
        <Tab label={`Active${active.length ? ` (${active.length})` : ''}`} selected={tab === 'active'} onPress={() => setTab('active')} />
        <Tab label="History" selected={tab === 'history'} onPress={() => setTab('history')} />
      </View>

      <ScrollView contentContainerStyle={{ gap: 12 }}>
        {list.length
          ? list.map((o) => (
              <View key={o.id}>
                <OrderCard order={o} onChat={() => onChat(o.id)} />
                <Pressable
                  onPress={() => setSelectedId(o.id)}
                  accessibilityRole="button"
                  accessibilityLabel={`View details for order ${o.id}`}
                  style={{
                    marginTop: 8,
                    paddingVertical: 10,
                    borderRadius: radius.lg,
                    borderWidth: 1,
                    borderColor: colors.primary,
                    alignItems: 'center',
                  }}
                >
                  <Text style={[type.body, { fontWeight: '600', color: colors.primary }]}>
                    {o.status === 'delivered' && !state.ratings[o.id] ? '★ Rate your order' : 'View details'}
                  </Text>
                </Pressable>
              </View>
            ))
          : <EmptyState>{tab === 'active' ? 'No orders on the way.' : 'No past orders yet.'}</EmptyState>}
      </ScrollView>

      <OrderDetail
        order={selected}
        onClose={() => setSelectedId(null)}
        onChat={(id) => { setSelectedId(null); onChat(id); }}
      />
    </Sheet>
  );
}