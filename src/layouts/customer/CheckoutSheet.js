import React, { useState } from 'react';
import { View, Text, Image, Pressable, Modal } from 'react-native';
import Sheet from '../components/Sheet';
import Button from '../components/Button';
import Stepper from '../components/Stepper';
import { TextField, SwitchRow } from '../components/Inputs';
import { EmptyState, useToast } from '../components/Feedback';
import { useCustomerSession } from './CustomerSession';
import { colors, type, radius } from '../theme';
import { useStore } from '../../data/StoreContext';
import { peso } from '../../utils/format';

const PAY = [['gcash', 'G-Cash'], ['maya', 'Maya'], ['cod', 'Cash on delivery']];

function Card({ children, style }) {
  return (
    <View style={[{ backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.line, padding: 14, marginBottom: 12 }, style]}>
      {children}
    </View>
  );
}

function SectionLabel({ children }) {
  return <Text style={[type.small, { color: colors.sub || colors.text, fontWeight: '700', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }]}>{children}</Text>;
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

export default function CheckoutSheet({ visible, onClose, onPlaced }) {
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

  const cancelCart = () => {
    s.clearCart();
    toast('Cart cleared');
    onClose();
  };

  const payLabel = PAY.find(([k]) => k === s.pay)?.[1] ?? '';

  return (
    <Sheet visible={visible} onClose={onClose} title="Your order">
      {!s.lines.length ? <EmptyState>Your order is empty.</EmptyState> : (
        <View>
          <Card>
            <SectionLabel>Delivery address</SectionLabel>
            <TextField label="Address" value={s.addr} onChangeText={s.setAddr} />
            <TextField label="Note for the rider (optional)" value={s.note} onChangeText={s.setNote} />
            <SwitchRow title="Contactless (no calls)" value={s.contactless} onValueChange={s.setContactless} />
          </Card>

          <Card>
            <SectionLabel>Items</SectionLabel>
            {s.lines.map(({ item, qty }) => (
              <View key={item.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 }}>
                {item.image ? (
                  <Image source={item.image} style={{ width: 48, height: 48, borderRadius: 8, backgroundColor: colors.line }} resizeMode="cover" />
                ) : null}
                <View style={{ flex: 1 }}>
                  <Text style={[type.body, { fontWeight: '600' }]}>{item.name}</Text>
                  <Text style={type.small}>{peso(item.price)} each</Text>
                </View>
                <Stepper value={qty} label={item.name} onMinus={() => s.remove(item.id)} onPlus={() => s.add(item.id)} />
              </View>
            ))}
            {s.couponReady ? <SwitchRow title="Use 10% coupon" value={s.useCoupon} onValueChange={s.setUseCoupon} /> : null}
          </Card>

          <Card>
            <SectionLabel>Payment method</SectionLabel>
            <View accessibilityRole="radiogroup">{PAY.map(([k, l]) => <Radio key={k} label={l} selected={s.pay === k} onPress={() => s.setPay(k)} />)}</View>
          </Card>

          <Card>
            <SectionLabel>Order summary</SectionLabel>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 }}>
              <Text style={type.body}>Subtotal</Text>
              <Text style={type.body}>{peso(s.subtotal)}</Text>
            </View>
            {s.discount ? (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 }}>
                <Text style={type.body}>Coupon discount</Text>
                <Text style={[type.body, { color: colors.primary }]}>-{peso(s.discount)}</Text>
              </View>
            ) : null}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingTop: 10, marginTop: 6, borderTopWidth: 1, borderTopColor: colors.line }}>
              <Text style={type.heading}>Total</Text>
              <Text style={type.heading}>{peso(s.total)}</Text>
            </View>
          </Card>

          <Button variant="primary" block style={{ marginTop: 4 }} title={`Place order · ${peso(s.total)}`} onPress={requestPlace} />
          <Pressable onPress={cancelCart} style={{ alignItems: 'center', paddingVertical: 14 }} accessibilityRole="button" accessibilityLabel="Clear cart">
            <Text style={{ color: colors.danger, fontWeight: '600' }}>Clear cart</Text>
          </Pressable>
        </View>
      )}

      <Modal visible={confirmOpen} transparent animationType="fade" onRequestClose={() => setConfirmOpen(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <View style={{ width: '100%', maxWidth: 360, backgroundColor: colors.card, borderRadius: radius.lg, padding: 20 }}>
            <Text style={[type.heading, { marginBottom: 6 }]}>Confirm your order?</Text>
            <Text style={[type.body, { marginBottom: 4 }]}>{s.count} item{s.count > 1 ? 's' : ''} · {peso(s.total)}</Text>
            <Text style={[type.small, { marginBottom: 16 }]}>Paying with {payLabel}, delivered to: {s.addr.trim()}</Text>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Pressable
                onPress={() => setConfirmOpen(false)}
                style={{ flex: 1, paddingVertical: 12, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.line, alignItems: 'center' }}
              >
                <Text style={[type.body, { fontWeight: '600' }]}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={place}
                style={{ flex: 1, paddingVertical: 12, borderRadius: radius.lg, backgroundColor: colors.primary, alignItems: 'center' }}
              >
                <Text style={[type.body, { fontWeight: '700', color: '#fff' }]}>Confirm</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </Sheet>
  );
}