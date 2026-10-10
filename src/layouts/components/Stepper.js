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

export default function Stepper({ value, label, onMinus, onPlus }) {
  const btn = {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  };

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      <Pressable
        onPress={onMinus}
        hitSlop={8}
        style={btn}
        accessibilityRole="button"
        accessibilityLabel={`Decrease ${label}`}
      >
        <Text style={{ fontSize: 18 }}>−</Text>
      </Pressable>

      <Text style={{ fontWeight: '700', minWidth: 16, textAlign: 'center' }}>
        {value}
      </Text>

      <Pressable
        onPress={onPlus}
        hitSlop={8}
        style={btn}
        accessibilityRole="button"
        accessibilityLabel={`Increase ${label}`}
      >
        <Text style={{ fontSize: 18 }}>+</Text>
      </Pressable>
    </View>
  );
}
