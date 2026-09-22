import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import Pill from '../components/Pill';
import Button from '../components/Button';
import { Chip, ChipRow } from '../components/Inputs';
import { EmptyState } from '../components/Feedback';
import { PageTitle } from './parts';
import { colors, type } from '../theme';
import { useStore } from '../../data/StoreContext';
import { dayIndex, itemsText } from '../../data/selectors';
import { STATUS_LABEL, PAYMENT_LABEL } from '../../data/constants';
import { peso, timeText } from '../../utils/format';

export default function OrdersScreen({ openChat }) {
  const { state } = useStore();
  const [filter, setFilter] = useState('all');
  const [open, setOpen] = useState(null);
  const rows = state.orders.filter((o) => dayIndex(o) === 0 && (filter === 'all' || (filter === 'active' ? o.status !== 'delivered' : o.status === 'delivered')));
  return (
    <View>
      <PageTitle>Orders</PageTitle>
      <ChipRow style={{ marginBottom: 8 }}>{[['all', 'All'], ['active', 'In progress'], ['done', 'Delivered']].map(([k, l]) => <Chip key={k} label={l} selected={filter === k} onPress={() => setFilter(k)} />)}</ChipRow>
      {rows.map((o) => (
        <View key={o.id} style={{ borderBottomWidth: 1, borderBottomColor: colors.line }}>
          <Pressable onPress={() => setOpen(open === o.id ? null : o.id)} accessibilityRole="button" accessibilityState={{ expanded: open === o.id }} accessibilityLabel={`Order ${o.id}`}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={[type.body, { fontWeight: '600' }]}>{o.id} · {o.customer}</Text>
              <Text style={type.small}>{timeText(o.t)} · {peso(o.total)} · {PAYMENT_LABEL[o.pay]}</Text>
            </View>
            <Pill status={o.status} label={STATUS_LABEL[o.status]} />
          </Pressable>
          {open === o.id ? (
            <View style={{ paddingBottom: 12, gap: 4 }}>
              <Text style={type.body}>{itemsText(o)}</Text>
              <Text style={type.small}>{o.addr}{o.note ? ` · ${o.note}` : ''}</Text>
              <Text style={type.small}>Rider: {o.driver || 'not assigned'}</Text>
              {state.chats[o.id] ? <Button small icon="message-circle" title="View chat" onPress={() => openChat(o.id)} style={{ alignSelf: 'flex-start', marginTop: 6 }} /> : null}
            </View>
          ) : null}
        </View>
      ))}
      {!rows.length ? <EmptyState>No orders.</EmptyState> : null}
    </View>
  );
}
