import React from 'react';
import { View, Text, Pressable } from 'react-native';
import Icon from './Icon';
import { colors } from '../theme';

function Round({ icon, label, onPress, disabled }) {
  return (
    <Pressable onPress={onPress} disabled={disabled} accessibilityRole="button" accessibilityLabel={label}
      style={{ width: 38, height: 38, borderRadius: 19, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center', opacity: disabled ? 0.35 : 1 }}>
      <Icon name={icon} size={16} />
    </Pressable>
  );
}

export default function Stepper({ value, onMinus, onPlus, minusDisabled, plusDisabled, label = '' }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <Round icon="minus" label={`Remove ${label}`.trim()} onPress={onMinus} disabled={minusDisabled} />
      <Text style={{ minWidth: 34, textAlign: 'center', fontWeight: '700', fontSize: 16 }} accessibilityLabel={`${value}`}>{value}</Text>
      <Round icon="plus" label={`Add ${label}`.trim()} onPress={onPlus} disabled={plusDisabled} />
    </View>
  );
}
