import React from 'react';
import { ScrollView, View, Text } from 'react-native';
import Button from '../components/Button';
import Pill from '../components/Pill';
import { Note, EmptyState } from '../components/Feedback';
import { colors, type, radius } from '../theme';
import { useAuth } from '../../users';
import { useStore } from '../../data/StoreContext';
import { ordersOfCustomer, activeOrders } from '../../data/selectors';
import { STATUS_LABEL } from '../../data/constants';
import { peso, firstName } from '../../utils/format';

export function OrderCard({ order, onChat }) {
  const last = order.log[order.log.length - 1];
  return (
    <View style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: radius.lg, padding: 16, gap: 10 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={type.heading}>Order {order.id}</Text>
        <Pill status={order.status} label={STATUS_LABEL[order.status]} />
      </View>
      <Text style={type.body}>{last.text}</Text>
      {(order.status === 'arrived' || order.status === 'dropping') && order.pay === 'cod' ? <Note tone="warn">Prepare {peso(order.total)} in cash.</Note> : null}
      {order.contactless ? <Text style={type.small}>Contactless: messages only, no calls.</Text> : null}
      {order.driver ? <Button small title={`Chat with ${firstName(order.driver)}`} icon="message-circle" onPress={onChat} /> : null}
    </View>
  );
}

export default function HomeScreen({ go, openChat }) {
  const { user } = useAuth();
  const { state } = useStore();
  const active = activeOrders(ordersOfCustomer(state.orders, user.name));
  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
      <Button title="Order a drink" variant="primary" onPress={() => go('menu')} block />
      {active.length ? active.map((o) => <OrderCard key={o.id} order={o} onChat={() => openChat(o.id)} />) : <EmptyState>No orders on the way.</EmptyState>}
    </ScrollView>
  );
}