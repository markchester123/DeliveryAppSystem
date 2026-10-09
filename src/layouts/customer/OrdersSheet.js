import React, { useState } from 'react';
import { View, Text, Pressable, Modal } from 'react-native';
import Sheet from '../components/Sheet';
import Button from '../components/Button';
import { TextField, SwitchRow } from '../components/Inputs';
import { EmptyState, useToast } from '../components/Feedback';
import { useCustomerSession } from './CustomerSession';
import { colors, type, radius } from '../theme';
import { useStore } from '../../data/StoreContext';
import { peso } from '../../utils/format';

const PAY = [['gcash', 'G-Cash'], ['maya', 'Maya'], ['cod', 'Cash on delivery']];

function Card({ children }) {
  return (
    <View style={{ backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.line, padding: 14, marginBottom: 12 }}>
      {children}
    </View>
  );
}

function SectionLabel({ children }) {
  return <Text style={[type.small, { fontWeight: '700', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }]}>{children}</Text>;
}

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

function Line({ label, value, color }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 }}>
      <Text style={type.body}>{label}</Text>
      <Text style={[type.body, color ? { color } : null]}>{value}</Text>
    </View>
  );
}

export default function OrdersSheet({ visible, onClose, onPlaced }) {
  const s = useCustomerSession();
  const { actions } = useStore();
  const toast = useToast();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const requestPlace = () => {
    if (!s.addr.trim()) { toast('Enter your address first'); return; }
    setConfirmOpen(true);
  };

  const place = () => {
    const result = actions.placeOrder({
      items: s.lines.map((l) => ({ id: l.item.id, qty: l.qty })),
      pay: s.pay, contactless: s.contactless, useCoupon: s.useCoupon,
      loc: { addr: s.addr.trim(), land: '', note: s.note.trim() },
    });
    setConfirmOpen(false);
    if (!result.ok) { toast(result.reason); return; }
    s.clearCart();
    onPlaced();
    toast(`Order ${result.id} placed`);
  };

  const payLabel = PAY.find(([k]) => k === s.pay)?.[1] ?? '';

  return (
    <Sheet visible={visible} onClose={onClose} title="Place your order">
      {!s.lines.length ? <EmptyState>Your cart is empty.</EmptyState> : (
        <View>
          <Card>
            <SectionLabel>Delivery address</SectionLabel>
            <TextField label="Address" value={s.addr} onChangeText={s.setAddr} />
            <TextField label="Note for the rider (optional)" value={s.note} onChangeText={s.setNote} />
            <SwitchRow title="Contactless (no calls)" value={s.contactless} onValueChange={s.setContactless} />
          </Card>

          <Card>
            <SectionLabel>Payment method</SectionLabel>
            <View accessibilityRole="radiogroup">
              {PAY.map(([k, l]) => <Radio key={k} label={l} selected={s.pay === k} onPress={() => s.setPay(k)} />)}
            </View>
          </Card>

          <Card>
            <SectionLabel>Order summary</SectionLabel>
            {s.lines.map(({ item, qty }) => (
              <Line key={item.id} label={`${item.name} × ${qty}`} value={peso(item.price * qty)} />
            ))}
            {s.couponReady ? <SwitchRow title="Use 10% coupon" value={s.useCoupon} onValueChange={s.setUseCoupon} /> : null}
            <View style={{ borderTopWidth: 1, borderTopColor: colors.line, marginTop: 8, paddingTop: 8 }}>
              <Line label="Subtotal" value={peso(s.subtotal)} />
              {s.discount ? <Line label="Coupon discount" value={`-${peso(s.discount)}`} color={colors.primary} /> : null}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingTop: 6 }}>
                <Text style={type.heading}>Total</Text>
                <Text style={type.heading}>{peso(s.total)}</Text>
              </View>
            </View>
          </Card>

          <Button variant="primary" block title={`Place order · ${peso(s.total)}`} onPress={requestPlace} />
        </View>
      )}

      <Modal visible={confirmOpen} transparent animationType="fade" onRequestClose={() => setConfirmOpen(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <View style={{ width: '100%', maxWidth: 360, backgroundColor: colors.card, borderRadius: radius.lg, padding: 20 }}>
            <Text style={[type.heading, { marginBottom: 6 }]}>Confirm your order?</Text>
            <Text style={[type.body, { marginBottom: 4 }]}>{s.count} item{s.count > 1 ? 's' : ''} · {peso(s.total)}</Text>
            <Text style={[type.small, { marginBottom: 16 }]}>Paying with {payLabel}, delivered to: {s.addr.trim()}</Text>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Pressable onPress={() => setConfirmOpen(false)}
                style={{ flex: 1, paddingVertical: 12, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.line, alignItems: 'center' }}>
                <Text style={[type.body, { fontWeight: '600' }]}>Cancel</Text>
              </Pressable>
              <Pressable onPress={place}
                style={{ flex: 1, paddingVertical: 12, borderRadius: radius.lg, backgroundColor: colors.primary, alignItems: 'center' }}>
                <Text style={[type.body, { fontWeight: '700', color: '#fff' }]}>Confirm</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </Sheet>
  );
}