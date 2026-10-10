import React, { useState } from 'react';
import { ScrollView, View, Text, Image, Pressable } from 'react-native';
import Button from '../components/Button';
import Stepper from '../components/Stepper';
import { useCustomerSession } from './CustomerSession';
import { colors, type } from '../theme';
import { useStore } from '../../data/StoreContext';
import { MENU } from '../../data/menu';
import { isSoldOut } from '../../data/selectors';
import { peso } from '../../utils/format';

function SizeChips({ sizes, value, onChange }) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
      {sizes.map((z) => {
        const active = z === value;
        return (
          <Pressable
            key={z}
            onPress={() => onChange(z)}
            accessibilityRole="radio"
            accessibilityState={{ selected: active }}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 3,
              paddingVertical: 4,
              paddingHorizontal: 9,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: active ? '#2f4a2a' : '#e3d6bf',
              backgroundColor: active ? '#2f4a2a' : '#fbf6ec',
            }}
          >
            {active ? <Text style={{ color: '#fff', fontSize: 10 }}>✓</Text> : null}
            <Text style={{ fontSize: 12, fontWeight: active ? '700' : '600', color: active ? '#fff' : '#2b1d12' }}>
              {z}oz
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function Row({ item, soldOut }) {
  const s = useCustomerSession();
  const [size, setSize] = useState(item.size);
  const current = item.sizes.find((x) => x.size === size);
  const key = `${item.id}-${size}`;
  const q = s.cart[key] || 0;

  return (
    <View style={{ paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.line }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        {item.image ? (
          <Image
            source={item.image}
            style={{ width: 56, height: 56, borderRadius: 10, backgroundColor: colors.line, opacity: soldOut ? 0.5 : 1 }}
            resizeMode="cover"
          />
        ) : null}
        <View style={{ flex: 1 }}>
          <Text style={[type.body, { fontWeight: '600', opacity: soldOut ? 0.5 : 1 }]}>{item.name}</Text>
          <Text style={type.small}>{peso(current.price)} · {size} oz</Text>
        </View>
        {soldOut
          ? <Text style={{ color: colors.danger, fontWeight: '600' }}>Sold out</Text>
          : <Stepper value={q} label={`${item.name} ${size}oz`} onMinus={() => s.remove(key)} onPlus={() => s.add(key)} minusDisabled={!q} />}
      </View>

      {!soldOut ? (
        <View style={{ marginLeft: item.image ? 68 : 0 }}>
          <SizeChips sizes={item.sizes.map((x) => x.size)} value={size} onChange={setSize} />
        </View>
      ) : null}
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