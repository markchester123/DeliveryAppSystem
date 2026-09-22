import React from 'react';
import { View, Text, Pressable } from 'react-native';
import Icon from './Icon';
import { colors } from '../theme';

export default function BottomTabs({ tabs, current, onChange }) {
  return (
    <View style={{ flexDirection: 'row', backgroundColor: colors.card, borderTopWidth: 1, borderTopColor: colors.line }} accessibilityRole="tablist">
      {tabs.map((t) => {
        const on = current === t.key;
        return (
          <Pressable key={t.key} onPress={() => onChange(t.key)} accessibilityRole="tab" accessibilityState={{ selected: on }} accessibilityLabel={t.label}
            style={{ flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 58, paddingVertical: 6 }}>
            <View>
              <Icon name={t.icon} size={22} color={on ? colors.primary : colors.muted} />
              {t.badge ? <View style={{ position: 'absolute', top: -5, right: -10, minWidth: 17, height: 17, borderRadius: 9, backgroundColor: colors.danger, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 }}><Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>{t.badge}</Text></View> : null}
            </View>
            <Text style={{ fontSize: 12, marginTop: 3, color: on ? colors.primary : colors.muted, fontWeight: on ? '700' : '500' }}>{t.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
