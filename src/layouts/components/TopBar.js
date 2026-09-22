import React from 'react';
import { View, Text, Pressable } from 'react-native';
import Icon from './Icon';
import { colors, type } from '../theme';
import { useAuth, ROLES } from '../../users';

export default function TopBar() {
  const { user, signOut } = useAuth();
  return (
    <View style={{ height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.line }}>
      <Text style={type.heading}>Pastures Café · {ROLES[user.role].title}</Text>
      <Pressable onPress={signOut} accessibilityRole="button" accessibilityLabel="Sign out" style={{ flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 40, paddingHorizontal: 6 }}>
        <Icon name="log-out" size={18} />
        <Text style={{ fontWeight: '600' }}>Sign out</Text>
      </Pressable>
    </View>
  );
}
