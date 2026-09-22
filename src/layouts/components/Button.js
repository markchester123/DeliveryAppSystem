import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import Icon from './Icon';
import { colors, radius } from '../theme';

const VARIANTS = {
  default: { bg: colors.card, border: colors.line, fg: colors.text },
  primary: { bg: colors.primary, border: colors.primary, fg: colors.white },
  ghost: { bg: 'transparent', border: 'transparent', fg: colors.primary },
};

export default function Button({ title, onPress, variant = 'default', icon, disabled, small, block, style }) {
  const v = VARIANTS[variant];
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: !!disabled }}
      style={({ pressed }) => [styles.base, small && styles.small, block && { alignSelf: 'stretch' }, { backgroundColor: v.bg, borderColor: v.border }, pressed && { opacity: 0.85 }, disabled && { opacity: 0.45 }, style]}
    >
      {icon ? <Icon name={icon} size={small ? 16 : 18} color={v.fg} /> : null}
      <Text style={[styles.label, { color: v.fg }, small && { fontSize: 14 }]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { minHeight: 48, paddingHorizontal: 18, borderRadius: radius.md, borderWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  small: { minHeight: 38, paddingHorizontal: 14 },
  label: { fontWeight: '600', fontSize: 16 },
});
