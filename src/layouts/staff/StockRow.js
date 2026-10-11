import React from 'react';
import { View, Text } from 'react-native';
import Button from '../components/Button';
import Stepper from '../components/Stepper';
import { colors, type } from '../theme';
import { stockStatus, stepFor } from '../../data/selectors';
import { formatQty } from '../../utils/format';

const LABEL = { ok: 'In stock', low: 'Low', out: 'Out' };

export default function StockRow({ item, onAdjust, onRestock }) {
  const st = stockStatus(item);
  const step = stepFor(item);
  return (
    <View style={{ paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.line, gap: 10 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
        <View style={{ flex: 1 }}>
          <Text style={[type.body, { fontWeight: '600' }]}>{item.name}</Text>
          <Text style={type.small}>{formatQty(item.qty)} of {item.max} {item.unit}</Text>
        </View>
        <Text style={{ fontSize: 13, color: colors.muted }}>{LABEL[st]}</Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Stepper value={formatQty(item.qty)} label={item.name} onMinus={() => onAdjust(item.id, -step)} onPlus={() => onAdjust(item.id, step)} minusDisabled={item.qty <= 0} plusDisabled={item.qty >= item.max} />
        <Button small title="Restock" disabled={item.qty >= item.max} onPress={() => onRestock(item.id)} />
      </View>
    </View>
  );
}