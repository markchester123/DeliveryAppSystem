import React from 'react';
import { View, Text } from 'react-native';
import { colors } from '../theme';

export default function BarChart({ data, height = 170, format }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const summary = data.map((d) => `${d.label} ${format(d.value)}`).join(', ');
  return (
    <View accessibilityRole="image" accessibilityLabel={`Sales chart: ${summary}`}>
      <View style={{ flexDirection: 'row', height, alignItems: 'flex-end', gap: 8, borderBottomWidth: 1, borderBottomColor: colors.line }}>
        {data.map((d) => (
          <View key={d.label} style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end' }}>
            <Text style={{ fontSize: 11, color: colors.muted, marginBottom: 4 }}>{format(d.value)}</Text>
            <View style={{ width: '70%', height: Math.max(3, ((height - 22) * d.value) / (max * 1.05)), borderTopLeftRadius: 5, borderTopRightRadius: 5, backgroundColor: d.highlight ? colors.primary : '#BBD3C1' }} />
          </View>
        ))}
      </View>
      <View style={{ flexDirection: 'row', gap: 8, paddingTop: 6 }}>
        {data.map((d) => <Text key={d.label} style={{ flex: 1, textAlign: 'center', fontSize: 12, color: colors.muted }}>{d.label}</Text>)}
      </View>
    </View>
  );
}
