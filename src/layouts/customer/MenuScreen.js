import React, { useState } from 'react';
import { ScrollView, View, Text, Image, Pressable } from 'react-native';
import Button from '../components/Button';
import Stepper from '../components/Stepper';
import { EmptyState } from '../components/Feedback';
import { useCustomerSession } from './CustomerSession';
import { colors, type, radius } from '../theme';
import { useStore } from '../../data/StoreContext';
import { MENU, ratingOf } from '../../data/menu';
import { isSoldOut } from '../../data/selectors';
import { peso } from '../../utils/format';

const CARD_W = 168;
const colorOf = (c) => (typeof c === 'string' && /^(#|rgb|hsl)/i.test(c.trim()) ? c.trim() : colors.primary);

function CategoryChip({ label, color, selected, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
      style={{
        minHeight: 38, paddingHorizontal: 16, borderRadius: radius.pill, flexDirection: 'row', alignItems: 'center', gap: 8,
        backgroundColor: selected ? color : colors.card, borderWidth: 1, borderColor: selected ? color : colors.line,
      }}
    >
      {!selected && color ? <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: color }} /> : null}
      <Text style={{ fontSize: 14, fontWeight: '600', color: selected ? '#fff' : colors.text }}>{label}</Text>
    </Pressable>
  );
}

function SizeChip({ label, selected, count, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
      style={{
        flex: 1, minHeight: 34, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center',
        backgroundColor: selected ? colors.primary : colors.card, borderWidth: 1, borderColor: selected ? colors.primary : colors.line,
      }}
    >
      <Text style={{ fontSize: 13, fontWeight: '700', color: selected ? '#fff' : colors.text }}>
        {label}{count ? ` ×${count}` : ''}
      </Text>
    </Pressable>
  );
}

function ProductCard({ item, soldOut, rating }) {
  const s = useCustomerSession();
  const [size, setSize] = useState(16);
  const picked = item.sizes.find((o) => o.size === size) || item.sizes[item.sizes.length - 1];
  const key = `${item.id}-${picked.size}`;
  const q = s.cart[key] || 0;

  return (
    <View style={{ width: CARD_W, backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.line, padding: 10, gap: 8 }}>
      {item.image ? (
        <Image source={item.image} style={{ width: '100%', height: 110, borderRadius: radius.md, backgroundColor: colors.line, opacity: soldOut ? 0.5 : 1 }} resizeMode="cover" />
      ) : null}
      <View>
        <Text numberOfLines={2} style={[type.body, { fontWeight: '700', opacity: soldOut ? 0.5 : 1 }]}>{item.name}</Text>
        <Text style={type.small}>{peso(picked.price)}</Text>
        {rating ? <Text style={[type.small, { color: '#B07F00' }]}>★ {rating.avg.toFixed(1)} ({rating.count})</Text> : null}
      </View>

      {item.sizes.length > 1 ? (
        <View style={{ flexDirection: 'row', gap: 6 }}>
          {item.sizes.map((o) => (
            <SizeChip key={o.size} label={`${o.size}oz`} selected={o.size === picked.size} count={s.cart[`${item.id}-${o.size}`] || 0} onPress={() => setSize(o.size)} />
          ))}
        </View>
      ) : (
        <Text style={type.small}>16 oz</Text>
      )}

      {soldOut ? (
        <Text style={{ color: colors.danger, fontWeight: '600' }}>Sold out</Text>
      ) : (
        <Stepper value={q} label={`${item.name} ${picked.size}oz`} onMinus={() => s.remove(key)} onPlus={() => s.add(key)} minusDisabled={!q} />
      )}
    </View>
  );
}

// One category: its name, then its drinks side by side (swipe sideways).
function Section({ title, color, list, inventory, stats }) {
  return (
    <View style={{ marginBottom: 18 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <View style={{ width: 6, height: 20, borderRadius: 3, backgroundColor: color }} />
        <Text style={type.heading}>{title}</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingRight: 16 }}>
        {list.map((m) => <ProductCard key={m.id} item={m} soldOut={isSoldOut(m, inventory)} rating={ratingOf(stats, m.id)} />)}
      </ScrollView>
    </View>
  );
}

export default function MenuScreen({ openCart }) {
  const s = useCustomerSession();
  const { state } = useStore();
  const [picked, setPicked] = useState('all');

  // Categories come live from the POS. Drinks whose category was deleted there go under "Other".
  const cats = state.menuCategories.map((c) => ({ name: c.name, color: colorOf(c.color) }));
  const known = new Set(cats.map((c) => c.name));
  const groups = cats.map((c) => ({ ...c, list: MENU.filter((m) => m.type === c.name) }));
  const orphans = MENU.filter((m) => !known.has(m.type));
  if (orphans.length) groups.push({ name: 'Other', color: colors.muted, list: orphans });

  const active = picked === 'all' || groups.some((g) => g.name === picked) ? picked : 'all';
  const shown = groups.filter((g) => g.list.length && (active === 'all' || g.name === active));

  return (
    <View style={{ flex: 1 }}>
      <View style={{ borderBottomWidth: 1, borderBottomColor: colors.line, backgroundColor: colors.bg }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, padding: 12, paddingHorizontal: 16 }}>
          <CategoryChip label="All" color={colors.primary} selected={active === 'all'} onPress={() => setPicked('all')} />
          {groups.map((g) => (
            <CategoryChip key={g.name} label={g.name} color={g.color} selected={active === g.name} onPress={() => setPicked(g.name)} />
          ))}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {!state.catalogReady ? <EmptyState>Loading the menu…</EmptyState> : null}
        {state.catalogReady && !shown.length ? <EmptyState>No drinks in this category yet.</EmptyState> : null}
        {shown.map((g) => (
          <Section key={g.name} title={g.name} color={g.color} list={g.list} inventory={state.inventory} stats={state.productStats} />
        ))}
      </ScrollView>

      {s.count ? (
        <View style={{ padding: 16, paddingTop: 8 }}>
          <Button variant="primary" block title={`Checkout · ${s.count} item${s.count > 1 ? 's' : ''} · ${peso(s.subtotal)}`} onPress={openCart} />
        </View>
      ) : null}
    </View>
  );
}