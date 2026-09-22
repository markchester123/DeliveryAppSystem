import React from 'react';
import { View, Text } from 'react-native';
import BarChart from '../components/BarChart';
import { Stats, PageTitle, H } from './parts';
import { weekData, fmtK } from './adminData';
import { colors, type } from '../theme';
import { useStore } from '../../data/StoreContext';
import { dayIndex, sumTotal } from '../../data/selectors';
import { PAYMENT_LABEL } from '../../data/constants';
import { peso } from '../../utils/format';

export default function SalesScreen() {
  const { state } = useStore();
  const week = state.orders.filter((o) => dayIndex(o) >= -6);
  const total = sumTotal(week);
  return (
    <View>
      <PageTitle>Sales</PageTitle>
      <Stats items={[
        { label: 'Last 7 days', value: peso(total) },
        { label: 'Orders', value: String(week.length) },
        { label: 'Average order', value: peso(week.length ? total / week.length : 0) },
      ]} />
      <BarChart data={weekData(state.orders)} format={fmtK} />
      <View style={{ marginTop: 24 }}>
        <H>By payment</H>
        {['gcash', 'maya', 'cod'].map((k) => (
          <View key={k} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.line }}>
            <Text style={type.body}>{PAYMENT_LABEL[k]}</Text>
            <Text style={[type.body, { fontWeight: '600' }]}>{peso(sumTotal(week.filter((o) => o.pay === k)))}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
