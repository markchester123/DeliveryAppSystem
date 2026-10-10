import React, { useEffect, useRef } from 'react';
import { View, Text } from 'react-native';
import { colors, radius } from '../theme';
import { useToast } from './Feedback';
import { stockStatus, lowStockReason } from '../../data/selectors';
import { formatQty } from '../../utils/format';

// Banner listing every ingredient that is low or out. Renders nothing when stock is fine.
export function LowStockAlert({ inventory, style }) {
  const items = inventory.filter((i) => stockStatus(i) !== 'ok');
  if (!items.length) return null;
  return (
    <View accessibilityRole="alert" style={[{ padding: 12, borderRadius: radius.md, backgroundColor: colors.warnTint, gap: 4 }, style]}>
      <Text style={{ fontSize: 14, fontWeight: '700', color: colors.warn }}>Low Stock</Text>
      {items.map((i) => (
        <Text key={i.id} style={{ fontSize: 14, color: colors.warn }}>
          {stockStatus(i) === 'out'
            ? `${i.name}: out of stock`
            : `${i.name}: ${formatQty(i.qty)} ${i.unit} left (${lowStockReason(i)})`}
        </Text>
      ))}
    </View>
  );
}

// Toast the moment an ingredient goes from fine to low/out, even if one order skipped straight past the threshold.
// Several ingredients dropping on the same order are combined into one toast.
export function useLowStockToast(inventory) {
  const toast = useToast();
  const prev = useRef(null);
  useEffect(() => {
    const now = {};
    inventory.forEach((i) => { now[i.id] = stockStatus(i); });
    if (prev.current) {
      const fresh = inventory.filter((i) => now[i.id] !== 'ok' && prev.current[i.id] === 'ok');
      if (fresh.length) {
        const names = fresh.slice(0, 3).map((i) => i.name).join(', ');
        toast(`Low Stock: ${names}${fresh.length > 3 ? ` +${fresh.length - 3} more` : ''}`);
      }
    }
    prev.current = now;
  }, [inventory, toast]);
}