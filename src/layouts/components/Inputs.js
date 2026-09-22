import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, Switch, StyleSheet } from 'react-native';
import Icon from './Icon';
import { colors, radius } from '../theme';

export function TextField({ label, value, onChangeText, secret, numeric, maxLength, multiline, placeholder, onSubmitEditing, style }) {
  const [shown, setShown] = useState(false);
  return (
    <View style={[{ marginBottom: 14 }, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={!!secret && !shown}
          keyboardType={numeric ? 'number-pad' : 'default'}
          maxLength={maxLength}
          multiline={multiline}
          placeholder={placeholder}
          placeholderTextColor="#9A948B"
          autoCapitalize="none"
          autoCorrect={false}
          onSubmitEditing={onSubmitEditing}
          accessibilityLabel={label}
          style={[styles.input, multiline && { minHeight: 72, paddingTop: 12, textAlignVertical: 'top' }, secret && !numeric && { paddingRight: 48 }]}
        />
        {secret && !numeric ? (
          <Pressable onPress={() => setShown(!shown)} accessibilityRole="button" accessibilityLabel={shown ? 'Hide password' : 'Show password'} style={styles.eye}>
            <Icon name={shown ? 'eye-off' : 'eye'} size={18} color={colors.muted} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

export function SwitchRow({ title, value, onValueChange }) {
  return (
    <View style={styles.switchRow}>
      <Text style={{ flex: 1, fontSize: 15, color: colors.text }}>{title}</Text>
      <Switch value={value} onValueChange={onValueChange} trackColor={{ false: '#CFC8BD', true: colors.primary }} thumbColor="#FFFFFF" activeThumbColor="#FFFFFF" accessibilityLabel={title} />
    </View>
  );
}

export function Chip({ label, selected, onPress }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityState={{ selected: !!selected }} accessibilityLabel={label}
      style={[styles.chip, selected && { backgroundColor: colors.primary, borderColor: colors.primary }]}>
      <Text style={[styles.chipText, selected && { color: '#fff' }]}>{label}</Text>
    </Pressable>
  );
}

export function ChipRow({ children, style }) {
  return <View style={[{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  label: { fontWeight: '600', fontSize: 14, color: colors.text, marginBottom: 6 },
  input: { minHeight: 48, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.card, borderRadius: radius.md, paddingHorizontal: 14, fontSize: 16, color: colors.text },
  eye: { position: 'absolute', right: 2, top: 3, width: 42, height: 42, alignItems: 'center', justifyContent: 'center' },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
  chip: { minHeight: 38, paddingHorizontal: 16, borderRadius: radius.pill, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
  chipText: { fontSize: 14, fontWeight: '600', color: colors.text },
});
