import React from 'react';
import { View, Text } from 'react-native';
import Button from '../components/Button';
import { useToast } from '../components/Feedback';
import { colors, type, radius } from '../theme';
import { useStore } from '../../data/StoreContext';

export default function CouponsScreen() {
  const { state, actions } = useStore();
  const toast = useToast();
  const c = state.coupon;
  return (
    <View style={{ padding: 16 }}>
      <View style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: radius.lg, padding: 20, alignItems: 'center', gap: 6 }}>
        <Text style={{ fontSize: 40, fontWeight: '700', color: colors.primary }}>10% off</Text>
        <Text style={[type.small, { marginBottom: 10 }]}>Loyalty coupon</Text>
        {c.used ? <Button title={`Used on ${c.used}`} disabled />
          : c.claimed ? <Button title="Claimed" icon="check" disabled />
          : <Button title="Claim" variant="primary" style={{ minWidth: 140 }} onPress={() => { actions.claimCoupon(); toast('Coupon claimed'); }} />}
      </View>
    </View>
  );
}
