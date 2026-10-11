import React, { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform } from 'react-native';
import { ChatThread, Composer, ChatTabs, ChatHistoryList } from '../components/Chat';
import { EmptyState } from '../components/Feedback';
import { type } from '../theme';
import { useAuth } from '../../users';
import { useStore } from '../../data/StoreContext';
import { activeChatsOfCustomer, archivedChatsOfCustomer } from '../../data/selectors';

// One live chat at a time. Finished deliveries move to History and are read-only.
// orderId (optional): an order tapped from "My orders" / Home. A finished one opens straight in History.
export default function ChatScreen({ orderId, onPick }) {
  const { user } = useAuth();
  const { state, actions } = useStore();
  const [draft, setDraft] = useState('');
  const [view, setView] = useState('active');
  const pick = (id) => { if (onPick) onPick(id); };

  const live = activeChatsOfCustomer(state.orders, user.name);
  const archived = archivedChatsOfCustomer(state.orders, user.name);
  const opened = archived.find((o) => o.id === orderId);
  const thread = opened || live.find((o) => o.id === orderId) || live[0];
  const showList = view === 'history' && !opened;
  const tab = opened ? 'history' : view;

  const send = () => { actions.sendChat(thread.id, draft); setDraft(''); };
  const rows = archived.map((o) => {
    const msgs = state.chats[o.id] || [];
    return { id: o.id, title: `${o.id} · ${o.driver}`, last: msgs.length ? msgs[msgs.length - 1].text : 'No messages', t: o.t };
  });

  return (
    <KeyboardAvoidingView style={{ flex: 1, padding: 16, gap: 10 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ChatTabs view={tab} historyCount={archived.length} onChange={(v) => { setView(v); pick(null); }} />
      {showList ? (
        <ChatHistoryList rows={rows} onOpen={pick} />
      ) : !thread ? (
        <EmptyState>No active chat. Chat opens when a rider takes your order. Finished deliveries are in History.</EmptyState>
      ) : (
        <>
          <View>
            <Text style={type.heading}>{thread.driver}</Text>
            <Text style={type.small}>Rider · {thread.id}{thread.status === 'delivered' ? ' · Delivered' : thread.contactless ? ' · calls off' : ''}</Text>
          </View>
          <ChatThread messages={state.chats[thread.id] || []} viewer="customer" />
          {thread.status === 'delivered'
            ? <Text style={[type.small, { textAlign: 'center' }]}>Delivery finished. This chat is closed.</Text>
            : <Composer value={draft} onChangeText={setDraft} onSend={send} />}
        </>
      )}
    </KeyboardAvoidingView>
  );
}