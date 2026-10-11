import React, { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform } from 'react-native';
import { ChatThread, Composer, ChatTabs, ChatHistoryList } from '../components/Chat';
import { Chip, ChipRow } from '../components/Inputs';
import { EmptyState, useToast } from '../components/Feedback';
import { type } from '../theme';
import { useAuth } from '../../users';
import { useStore } from '../../data/StoreContext';
import { activeJobOf, archivedChatsOfDriver } from '../../data/selectors';
import { QUICK_UPDATES } from '../../data/constants';
import { shortName } from '../../utils/format';

// The driver's live chat is their one active delivery. Finished deliveries move to History and are read-only.
export default function DriverChatScreen() {
  const { user } = useAuth();
  const { state, actions } = useStore();
  const toast = useToast();
  const [draft, setDraft] = useState('');
  const [view, setView] = useState('active');
  const [openId, setOpenId] = useState(null);

  const active = activeJobOf(state.orders, user.name);
  const archived = archivedChatsOfDriver(state.orders, user.name);
  const opened = archived.find((o) => o.id === openId);
  const thread = opened || active;
  const showList = view === 'history' && !opened;
  const tab = opened ? 'history' : view;

  const rows = archived.map((o) => {
    const msgs = state.chats[o.id] || [];
    return { id: o.id, title: `${o.id} · ${shortName(o.customer)}`, last: msgs.length ? msgs[msgs.length - 1].text : 'No messages', t: o.t };
  });

  return (
    <KeyboardAvoidingView style={{ flex: 1, padding: 16, gap: 10 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ChatTabs view={tab} historyCount={archived.length} onChange={(v) => { setView(v); setOpenId(null); }} />
      {showList ? (
        <ChatHistoryList rows={rows} onOpen={setOpenId} />
      ) : !thread ? (
        <EmptyState>No active delivery. Finished deliveries are in History.</EmptyState>
      ) : (
        <>
          <View>
            <Text style={type.heading}>{shortName(thread.customer)}</Text>
            <Text style={type.small}>Customer · {thread.id}{thread.status === 'delivered' ? ' · Delivered' : ' · number hidden'}</Text>
          </View>
          <ChatThread messages={state.chats[thread.id] || []} viewer="driver" />
          {thread.status === 'delivered' ? (
            <Text style={[type.small, { textAlign: 'center' }]}>Delivery finished. This chat is closed.</Text>
          ) : (
            <>
              <ChipRow>{QUICK_UPDATES.map((q) => <Chip key={q.text} label={q.text} onPress={() => { actions.quickUpdate(thread.id, q.text, q.log); toast('Sent'); }} />)}</ChipRow>
              <Composer value={draft} onChangeText={setDraft} onSend={() => { actions.sendChat(thread.id, draft); setDraft(''); }} />
            </>
          )}
        </>
      )}
    </KeyboardAvoidingView>
  );
}