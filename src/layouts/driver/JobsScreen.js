import React from 'react';
import { ScrollView, View, Text } from 'react-native';
import Button from '../components/Button';
import Pill from '../components/Pill';
import { EmptyState, useToast } from '../components/Feedback';
import { colors, type, radius } from '../theme';
import { useAuth } from '../../users';
import { useStore } from '../../data/StoreContext';
import { openJobs, activeJobOf, itemsText } from '../../data/selectors';
import { peso } from '../../utils/format';

export default function JobsScreen({ online, onAccepted }) {
  const { user } = useAuth();
  const { state, actions } = useStore();
  const toast = useToast();
  const jobs = openJobs(state.orders);
  const busy = !!activeJobOf(state.orders, user.name);

  if (!online) return <EmptyState style={{ padding: 16 }}>You're offline.</EmptyState>;
  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
      {busy ? <Text style={type.small}>Finish your current delivery first.</Text> : null}
      {jobs.length ? jobs.map((o) => (
        <View key={o.id} style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: radius.lg, padding: 16, gap: 8 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={type.heading}>{o.id}</Text>
            <Pill status={o.pay === 'cod' ? 'preparing' : 'picked'} label={o.pay === 'cod' ? `Collect ${peso(o.total)}` : 'Paid'} />
          </View>
          <Text style={type.body}>{itemsText(o)}</Text>
          <Text style={type.small}>{o.addr}</Text>
          <Button variant="primary" block title="Accept" disabled={busy} onPress={() => { if (actions.acceptJob(o.id)) { toast(`You took ${o.id}`); onAccepted(); } }} />
        </View>
      )) : <EmptyState>No jobs right now.</EmptyState>}
    </ScrollView>
  );
}
