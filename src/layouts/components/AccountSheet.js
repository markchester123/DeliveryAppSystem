import React from 'react';
import { Text, Pressable } from 'react-native';
import Sheet from './Sheet';
import Icon from './Icon';
import { colors } from '../theme';
import { useAuth } from '../../users';

export default function AccountSheet({ visible, onClose, actions = [] }) {
  const { user, signOut } = useAuth();
  if (!user) return null;
  const rows = actions.concat([{ icon: 'log-out', label: 'Sign out', onPress: () => { onClose(); signOut(); } }]);
  return (
    <Sheet visible={visible} onClose={onClose} title={user.name}>
      {rows.map((r) => (
        <Pressable key={r.label} onPress={r.onPress} accessibilityRole="button" accessibilityLabel={r.label}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 54, borderTopWidth: 1, borderTopColor: colors.line }}>
          <Icon name={r.icon} size={20} />
          <Text style={{ fontSize: 16, fontWeight: '600' }}>{r.label}</Text>
        </Pressable>
      ))}
    </Sheet>
  );
}
