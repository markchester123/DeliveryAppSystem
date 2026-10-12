import React from 'react';
import { ScrollView, View, Text, Image, Pressable } from 'react-native';
import { colors, type, radius } from '../theme';
import { useStore } from '../../data/StoreContext';
import { MENU, ratingOf } from '../../data/menu';

// How many drinks to feature. Set to 1 to show only the single top-rated drink.
const BEST_SELLER_COUNT = 3;

// Highest average rating first; more ratings wins a tie. Only drinks that are still on the menu.
export function rankedByRating(stats) {
  return MENU
    .map((m) => ({ item: m, rating: ratingOf(stats, m.id) }))
    .filter((r) => r.rating)
    .sort((a, b) => b.rating.avg - a.rating.avg || b.rating.count - a.rating.count);
}

export default function BestSellers({ go }) {
  const { state } = useStore();
  const top = rankedByRating(state.productStats).slice(0, BEST_SELLER_COUNT);
  if (!top.length) return null;
  return (
    <View>
      <Text style={[type.heading, { marginBottom: 8 }]}>Our Best Sellers</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
        {top.map(({ item, rating }, i) => (
          <Pressable
            key={item.id}
            onPress={() => go('menu')}
            accessibilityRole="button"
            accessibilityLabel={`${item.name}, rated ${rating.avg.toFixed(1)} out of 5`}
            style={{ width: 150, backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.line, padding: 10, gap: 6 }}
          >
            {item.image ? <Image source={item.image} style={{ width: '100%', height: 96, borderRadius: radius.md, backgroundColor: colors.line }} resizeMode="cover" /> : null}
            {i === 0 ? (
              <View style={{ position: 'absolute', top: 14, left: 14, backgroundColor: '#E0A100', borderRadius: radius.pill, paddingHorizontal: 8, paddingVertical: 2 }}>
                <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>#1</Text>
              </View>
            ) : null}
            <Text numberOfLines={2} style={[type.body, { fontWeight: '700' }]}>{item.name}</Text>
            <Text style={[type.small, { color: '#B07F00', fontWeight: '600' }]}>★ {rating.avg.toFixed(1)} · {rating.count} rating{rating.count > 1 ? 's' : ''}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}