import React from 'react';
import { ScrollView, View, Text, Image } from 'react-native';
import Button from '../components/Button';
import Stepper from '../components/Stepper';
import { useCustomerSession } from './CustomerSession';
import { colors, type } from '../theme';
import { useStore } from '../../data/StoreContext';
import { MENU } from '../../data/menu';
import { isSoldOut } from '../../data/selectors';
import { peso } from '../../utils/format';

function Row({ item, soldOut }) {
  const s = useCustomerSession();
  const q = s.cart[item.id] || 0;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.line }}>
      {item.image ? (
        <Image
          source={item.image}
          style={{ width: 56, height: 56, borderRadius: 10, backgroundColor: colors.line, opacity: soldOut ? 0.5 : 1 }}
          resizeMode="cover"
        />
      ) : null}
      <View style={{ flex: 1 }}>
        <Text style={[type.body, { fontWeight: '600', opacity: soldOut ? 0.5 : 1 }]}>{item.name}</Text>
        <Text style={type.small}>{peso(item.price)} · {item.size} oz</Text>
      </View>
      {soldOut
        ? <Text style={{ color: colors.danger, fontWeight: '600' }}>Sold out</Text>
        : <Stepper value={q} label={item.name} onMinus={() => s.remove(item.id)} onPlus={() => s.add(item.id)} minusDisabled={!q} />}
    </View>
  );
}

export default function MenuScreen({ openCart }) {
  const s = useCustomerSession();
  const { state } = useStore();
  const section = (title, list) => (
    <View style={{ marginBottom: 8 }}>
      <Text style={[type.heading, { marginTop: 8 }]}>{title}</Text>
      {list.map((m) => <Row key={m.id} item={m} soldOut={isSoldOut(m, state.inventory)} />)}
    </View>
  );
  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {section('Coffee', MENU.filter((m) => m.type === 'Coffee'))}
        {section('Non-coffee', MENU.filter((m) => m.type !== 'Coffee'))}
      </ScrollView>
      {s.count ? (
        <View style={{ padding: 16, paddingTop: 8 }}>
          <Button variant="primary" block title={`Checkout · ${s.count} item${s.count > 1 ? 's' : ''} · ${peso(s.subtotal)}`} onPress={openCart} />
        </View>
      ) : null}
    </View>
  );
}