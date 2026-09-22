import React from 'react';
import { View, Text, Pressable } from 'react-native';
import Sheet from '../components/Sheet';
import Button from '../components/Button';
import Stepper from '../components/Stepper';
import { TextField, SwitchRow } from '../components/Inputs';
import { EmptyState, useToast } from '../components/Feedback';
import { useCustomerSession } from './CustomerSession';
import { colors, type } from '../theme';
import { useStore } from '../../data/StoreContext';
import { peso } from '../../utils/format';

const PAY = [['gcash', 'G-Cash'], ['maya', 'Maya'], ['cod', 'Cash on delivery']];

function Radio({ selected, label, onPress }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="radio" accessibilityState={{ selected }} accessibilityLabel={label}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 46 }}>
      <View style={{ width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: selected ? colors.primary : colors.line, alignItems: 'center', justifyContent: 'center' }}>
        {selected ? <View style={{ width: 11, height: 11, borderRadius: 6, backgroundColor: colors.primary }} /> : null}
      </View>
      <Text style={type.body}>{label}</Text>
    </Pressable>
  );
}

export default function CheckoutSheet({ visible, onClose, onPlaced }) {
  const s = useCustomerSession();
  const { actions } = useStore();
  const toast = useToast();

  const place = () => {
    if (!s.addr.trim()) { toast('Enter your address first'); return; }
    const result = actions.placeOrder({
      items: s.lines.map((l) => ({ id: l.item.id, qty: l.qty })),
      pay: s.pay, contactless: s.contactless, useCoupon: s.useCoupon,
      loc: { addr: s.addr.trim(), land: '', note: s.note.trim() },
    });
    if (!result.ok) { toast(result.reason); return; }
    s.clearCart();
    onPlaced();
    toast(`Order ${result.id} placed`);
  };

  return (
    <Sheet visible={visible} onClose={onClose} title="Your order">
      {!s.lines.length ? <EmptyState>Your order is empty.</EmptyState> : (
        <View>
          {s.lines.map(({ item, qty }) => (
            <View key={item.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 }}>
              <View style={{ flex: 1 }}>
                <Text style={[type.body, { fontWeight: '600' }]}>{item.name}</Text>
                <Text style={type.small}>{peso(item.price * qty)}</Text>
              </View>
              <Stepper value={qty} label={item.name} onMinus={() => s.remove(item.id)} onPlus={() => s.add(item.id)} />
            </View>
          ))}

          {s.couponReady ? <SwitchRow title="Use 10% coupon" value={s.useCoupon} onValueChange={s.setUseCoupon} /> : null}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderTopWidth: 1, borderTopColor: colors.line, marginTop: 6 }}>
            <Text style={type.heading}>Total</Text>
            <Text style={type.heading}>{peso(s.total)}</Text>
          </View>
          {s.discount ? <Text style={[type.small, { marginTop: -6, marginBottom: 6 }]}>Includes {peso(s.discount)} off</Text> : null}

          <TextField label="Address" value={s.addr} onChangeText={s.setAddr} style={{ marginTop: 8 }} />
          <TextField label="Note for the rider (optional)" value={s.note} onChangeText={s.setNote} />
          <SwitchRow title="Contactless (no calls)" value={s.contactless} onValueChange={s.setContactless} />

          <Text style={[type.heading, { marginTop: 12, marginBottom: 2 }]}>Pay with</Text>
          <View accessibilityRole="radiogroup">{PAY.map(([k, l]) => <Radio key={k} label={l} selected={s.pay === k} onPress={() => s.setPay(k)} />)}</View>

          <Button variant="primary" block style={{ marginTop: 16 }} title={`Place order · ${peso(s.total)}`} onPress={place} />
        </View>
      )}
    </Sheet>
  );
}
