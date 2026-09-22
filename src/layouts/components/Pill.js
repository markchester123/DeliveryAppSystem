import React from 'react';
import { View, Text } from 'react-native';
import { statusColors } from '../theme';

export default function Pill({ status, label, style }) {
  const [bg, fg] = statusColors[status] || ['#ECE8E1', '#5E5850'];
  return (
    <View style={[{ alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 999, backgroundColor: bg }, style]}>
      <Text style={{ fontSize: 13, fontWeight: '600', color: fg }}>{label}</Text>
    </View>
  );
}
