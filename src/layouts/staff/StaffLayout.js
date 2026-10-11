import React, { useState } from 'react';
import { ScrollView, Text } from 'react-native';
import Screen from '../components/Screen';
import TopBar from '../components/TopBar';
import { Chip, ChipRow } from '../components/Inputs';
import { EmptyState, useToast } from '../components/Feedback';
import { LowStockAlert, useLowStockToast } from '../components/LowStockAlert';
import StockRow from './StockRow';
import { type } from '../theme';
import { useStore } from '../../data/StoreContext';
import { stockStatus } from '../../data/selectors';

export default function StaffLayout() {
  const { state, actions } = useStore();
  const toast = useToast();
  const [filter, setFilter] = useState('all');
  const inv = state.inventory;
  useLowStockToast(inv);
  const count = (s) => inv.filter((i) => stockStatus(i) === s).length;
  const rows = inv.filter((i) => filter === 'all' || stockStatus(i) === filter);

  const restock = (id) => { actions.restock(id); toast(`${inv.find((i) => i.id === id).name} restocked`); };

  return (
    <Screen>
      <TopBar />
      <ScrollView contentContainerStyle={{ padding: 16, width: '100%', maxWidth: 720, alignSelf: 'center' }}>
        <Text style={[type.title, { marginBottom: 12 }]} accessibilityRole="header">Inventory</Text>
        <LowStockAlert inventory={inv} style={{ marginBottom: 12 }} />
        <ChipRow style={{ marginBottom: 8 }}>
          <Chip label={`All ${inv.length}`} selected={filter === 'all'} onPress={() => setFilter('all')} />
          <Chip label={`Low ${count('low')}`} selected={filter === 'low'} onPress={() => setFilter('low')} />
          <Chip label={`Out ${count('out')}`} selected={filter === 'out'} onPress={() => setFilter('out')} />
        </ChipRow>
        {rows.map((i) => <StockRow key={i.id} item={i} onAdjust={actions.adjustStock} onRestock={restock} />)}
        {!rows.length ? <EmptyState>Nothing here.</EmptyState> : null}
      </ScrollView>
    </Screen>
  );
}