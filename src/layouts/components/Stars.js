import React from 'react';
import { View, Text, Pressable } from 'react-native';

// Five stars. Pass onChange to make them tappable; leave it out for a read-only display.
export default function Stars({ value = 0, onChange, size = 28 }) {
  return (
    <View style={{ flexDirection: 'row', gap: 4 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Pressable
          key={n}
          disabled={!onChange}
          onPress={() => onChange(n)}
          hitSlop={4}
          accessibilityRole={onChange ? 'button' : 'text'}
          accessibilityLabel={`${n} star${n > 1 ? 's' : ''}`}
        >
          <Text style={{ fontSize: size, lineHeight: size + 4, color: n <= value ? '#E0A100' : '#CFC8BD' }}>★</Text>
        </Pressable>
      ))}
    </View>
  );
}