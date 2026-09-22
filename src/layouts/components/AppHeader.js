import React from 'react';
import { View, Text, Pressable } from 'react-native';
import Icon from './Icon';
import { colors, type } from '../theme';

export function IconButton({ icon, label, onPress, badge }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} style={{ width: 42, height: 42, alignItems: 'center', justifyContent: 'center' }}>
      <Icon name={icon} size={22} />
      {badge ? <View style={{ position: 'absolute', top: 3, right: 3, minWidth: 18, height: 18, borderRadius: 9, backgroundColor: colors.danger, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 }}><Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>{badge}</Text></View> : null}
    </Pressable>
  );
}

export default function AppHeader({ title, right }) {
  return (
    <View style={{ height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft: 16, paddingRight: 8, backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.line }}>
      <Text style={type.title} accessibilityRole="header">{title}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>{right}</View>
    </View>
  );
}
