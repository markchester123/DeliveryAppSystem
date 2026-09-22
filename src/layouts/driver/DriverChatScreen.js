import React, { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform } from 'react-native';
import { ChatThread, Composer } from '../components/Chat';
import { Chip, ChipRow } from '../components/Inputs';
import { EmptyState, useToast } from '../components/Feedback';
import { type } from '../theme';
import { useAuth } from '../../users';
import { useStore } from '../../data/StoreContext';
import { activeJobOf } from '../../data/selectors';
import { QUICK_UPDATES } from '../../data/constants';
import { shortName } from '../../utils/format';

export default function DriverChatScreen() {
  const { user } = useAuth();
  const { state, actions } = useStore();
  const toast = useToast();
  const [draft, setDraft] = useState('');
  const o = activeJobOf(state.orders, user.name);
  if (!o) return <EmptyState style={{ padding: 16 }}>No active delivery.</EmptyState>;

  return (
    <KeyboardAvoidingView style={{ flex: 1, padding: 16, gap: 10 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View><Text style={type.heading}>{shortName(o.customer)}</Text><Text style={type.small}>Customer · {o.id} · number hidden</Text></View>
      <ChatThread messages={state.chats[o.id] || []} viewer="driver" />
      <ChipRow>{QUICK_UPDATES.map((q) => <Chip key={q.text} label={q.text} onPress={() => { actions.quickUpdate(o.id, q.text, q.log); toast('Sent'); }} />)}</ChipRow>
      <Composer value={draft} onChangeText={setDraft} onSend={() => { actions.sendChat(o.id, draft); setDraft(''); }} />
    </KeyboardAvoidingView>
  );
}
