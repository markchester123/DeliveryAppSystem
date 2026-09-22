import React from 'react';
import { View, Text } from 'react-native';
import BarChart from '../components/BarChart';
import Pill from '../components/Pill';
import { Stats, PageTitle, H } from './parts';
import { weekData, fmtK } from './adminData';
import { colors, type } from '../theme';
import { useStore } from '../../data/StoreContext';
import { dayIndex, sumTotal, activeOrders } from '../../data/selectors';
import { STATUS_LABEL } from '../../data/constants';
import { peso, shortName } from '../../utils/format';

export default function DashboardScreen() {
  const { state } = useStore();
  const today = state.orders.filter((o) => dayIndex(o) === 0);
  const active = activeOrders(state.orders);
  const open = state.reports.filter((r) => r.status === 'open').length;
  return (
    <View>
      <PageTitle>Dashboard</PageTitle>
      <Stats items={[
        { label: 'Sales today', value: peso(sumTotal(today)) },
        { label: 'Orders today', value: String(today.length) },
        { label: 'In progress', value: String(active.length) },
        { label: 'Open reports', value: String(open), bad: open > 0 },
      ]} />
      <H>Last 7 days</H>
      <BarChart data={weekData(state.orders)} format={fmtK} />
      <View style={{ marginTop: 24 }}>
        <H>In progress</H>
        {active.length ? active.map((o) => (
          <View key={o.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.line }}>
            <View style={{ flex: 1 }}>
              <Text style={[type.body, { fontWeight: '600' }]}>{o.id} · {shortName(o.customer)}</Text>
              <Text style={type.small}>{peso(o.total)}</Text>
            </View>
            <Pill status={o.status} label={STATUS_LABEL[o.status]} />
          </View>
        )) : <Text style={type.small}>Nothing in progress.</Text>}
      </View>
    </View>
  );
}
