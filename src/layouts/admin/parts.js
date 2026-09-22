import React from 'react';
import { View, Text } from 'react-native';
import { colors, type } from '../theme';

export function Stats({ items }) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 20, marginBottom: 24 }}>
      {items.map((k) => (
        <View key={k.label} accessibilityLabel={`${k.label}: ${k.value}`} style={{ minWidth: 110 }}>
          <Text style={{ fontSize: 26, fontWeight: '700', color: k.bad ? colors.danger : colors.text }}>{k.value}</Text>
          <Text style={type.small}>{k.label}</Text>
        </View>
      ))}
    </View>
  );
}

export const PageTitle = ({ children }) => <Text style={[type.title, { marginBottom: 16 }]} accessibilityRole="header">{children}</Text>;
export const H = ({ children }) => <Text style={[type.heading, { marginTop: 8, marginBottom: 8 }]}>{children}</Text>;
