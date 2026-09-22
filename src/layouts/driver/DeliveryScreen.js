import React from 'react';
import { ScrollView, View, Text } from 'react-native';
import Button from '../components/Button';
import Pill from '../components/Pill';
import { Chip, ChipRow } from '../components/Inputs';
import { Note, EmptyState, useToast } from '../components/Feedback';
import { colors, type } from '../theme';
import { useAuth } from '../../users';
import { useStore } from '../../data/StoreContext';
import { activeJobOf, itemsText } from '../../data/selectors';
import { STATUS_LABEL, PAYMENT_LABEL, QUICK_UPDATES } from '../../data/constants';
import { peso, shortName, firstName } from '../../utils/format';

const NEXT_LABEL = { ready: 'Picked up', picked: "I've arrived", arrived: 'Dropped off' };

const Fact = ({ k, v }) => (
  <View style={{ flexDirection: 'row', gap: 10, paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: colors.line }}>
    <Text style={[type.small, { width: 72 }]}>{k}</Text>
    <Text style={[type.body, { flex: 1 }]}>{v}</Text>
  </View>
);

export default function DeliveryScreen({ onMessage, onDone }) {
  const { user } = useAuth();
  const { state, actions } = useStore();
  const toast = useToast();
  const o = activeJobOf(state.orders, user.name);
  if (!o) return <EmptyState style={{ padding: 16 }}>No active delivery. Take a job from Jobs.</EmptyState>;

  const advance = () => {
    const finishing = o.status === 'arrived';
    actions.advanceDelivery(o.id);
    if (finishing) { toast('Delivery complete'); onDone(); }
  };
  const note = [o.land, o.note].filter(Boolean).join(' · ');

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 14 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View><Text style={type.title}>{o.id}</Text><Text style={type.small}>{shortName(o.customer)}</Text></View>
          <Pill status={o.status} label={STATUS_LABEL[o.status]} />
        </View>

        {o.contactless
          ? <Note tone="warn">Contactless: leave it quietly. No ringing, no calls.</Note>
          : <Note>Hand it to the customer.</Note>}

        <View>
          <Fact k="Address" v={o.addr} />
          <Fact k="Note" v={note || 'None'} />
          <Fact k="Items" v={itemsText(o)} />
          <Fact k="Payment" v={o.pay === 'cod' ? `Collect ${peso(o.total)} cash` : `Paid · ${PAYMENT_LABEL[o.pay]}`} />
        </View>

        <View style={{ gap: 8 }}>
          <Text style={type.heading}>Quick updates</Text>
          <ChipRow>{QUICK_UPDATES.map((q) => <Chip key={q.text} label={q.text} onPress={() => { actions.quickUpdate(o.id, q.text, q.log); toast('Sent'); }} />)}</ChipRow>
        </View>

        <View style={{ gap: 8 }}>
          <Text style={type.heading}>Contact {firstName(o.customer)}</Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Button icon="message-circle" title="Message" onPress={onMessage} style={{ flex: 1 }} />
            <Button icon={o.contactless ? 'phone-off' : 'phone'} title="Call" onPress={() => toast('Calling on a masked line')} disabled={o.contactless} style={{ flex: 1 }} />
          </View>
          <Text style={type.small}>{o.contactless ? 'Calls are off for this order.' : 'Numbers stay hidden.'}</Text>
        </View>
      </ScrollView>
      <View style={{ padding: 16, paddingTop: 8 }}>
        <Button variant="primary" block title={NEXT_LABEL[o.status]} onPress={advance} />
      </View>
    </View>
  );
}
