import React from 'react';
import { View, Text, Pressable } from 'react-native';
import Button from '../components/Button';
import { ChatThread } from '../components/Chat';
import { EmptyState, useToast } from '../components/Feedback';
import { PageTitle } from './parts';
import { colors, type } from '../theme';
import { useStore } from '../../data/StoreContext';
import { shortName } from '../../utils/format';

export default function ChatsScreen({ wide, selected, onSelect }) {
  const { state, actions } = useStore();
  const toast = useToast();
  const ids = Object.keys(state.chats).sort((a, b) => state.chats[b].slice(-1)[0].t - state.chats[a].slice(-1)[0].t);
  if (!ids.length) return <View><PageTitle>Chats</PageTitle><EmptyState>No chats yet.</EmptyState></View>;

  const sel = ids.indexOf(selected) >= 0 ? selected : wide ? ids[0] : null;
  const order = sel && state.orders.find((o) => o.id === sel);

  const list = (
    <View style={{ width: wide ? 280 : '100%' }}>
      {ids.map((id) => {
        const c = state.orders.find((o) => o.id === id);
        const last = state.chats[id].slice(-1)[0];
        return (
          <Pressable key={id} onPress={() => onSelect(id)} accessibilityRole="button" accessibilityLabel={`Chat ${id}`}
            style={{ paddingVertical: 12, paddingRight: 10, borderBottomWidth: 1, borderBottomColor: colors.line, backgroundColor: id === sel ? colors.primaryTint : 'transparent', paddingLeft: 8 }}>
            <Text style={[type.body, { fontWeight: '600' }]}>{id} · {shortName(c.customer)}</Text>
            <Text numberOfLines={1} style={type.small}>{last.text}</Text>
          </Pressable>
        );
      })}
    </View>
  );

  const thread = order ? (
    <View style={{ flex: 1, gap: 10 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <View style={{ flexShrink: 1 }}>
          <Text style={type.heading}>{order.id}</Text>
          <Text style={type.small}>{order.customer} and {order.driver || 'no rider'}</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {!wide ? <Button small title="Back" onPress={() => onSelect(null)} /> : null}
          <Button small icon="flag" title="Flag" onPress={() => { actions.flagChat(order.id); toast('Flagged. See Reports.'); }} />
        </View>
      </View>
      <View style={{ height: 340 }}><ChatThread messages={state.chats[order.id]} viewer="driver" /></View>
      <Text style={type.small}>Read only.</Text>
    </View>
  ) : null;

  return (
    <View>
      <PageTitle>Chats</PageTitle>
      {wide ? <View style={{ flexDirection: 'row', gap: 24 }}>{list}{thread}</View> : (thread || list)}
    </View>
  );
}
