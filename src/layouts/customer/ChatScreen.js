import React, { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform } from 'react-native';
import { ChatThread, Composer } from '../components/Chat';
import { Chip, ChipRow } from '../components/Inputs';
import { EmptyState } from '../components/Feedback';
import { colors, type } from '../theme';
import { useAuth } from '../../users';
import { useStore } from '../../data/StoreContext';
import { ordersOfCustomer } from '../../data/selectors';

export default function ChatScreen({ orderId, onPick }) {
  const { user } = useAuth();
  const { state, actions } = useStore();
  const [draft, setDraft] = useState('');
  const threads = ordersOfCustomer(state.orders, user.name).filter((o) => o.driver);
  const order = threads.find((o) => o.id === orderId) || threads.find((o) => o.status !== 'delivered') || threads[0];
  if (!order) return <EmptyState style={{ padding: 16 }}>Chat opens when a rider takes your order.</EmptyState>;

  const send = () => { actions.sendChat(order.id, draft); setDraft(''); };
  return (
    <KeyboardAvoidingView style={{ flex: 1, padding: 16, gap: 10 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View>
        <Text style={type.heading}>{order.driver}</Text>
        <Text style={type.small}>Rider · {order.id}{order.contactless ? ' · calls off' : ''}</Text>
      </View>
      {threads.length > 1 ? <ChipRow>{threads.map((o) => <Chip key={o.id} label={o.id} selected={o.id === order.id} onPress={() => onPick(o.id)} />)}</ChipRow> : null}
      <ChatThread messages={state.chats[order.id] || []} viewer="customer" />
      {order.status === 'delivered'
        ? <Text style={[type.small, { textAlign: 'center' }]}>Delivery complete. Chat closed.</Text>
        : <Composer value={draft} onChangeText={setDraft} onSend={send} />}
    </KeyboardAvoidingView>
  );
}
