import React, { useState } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import Screen from '../components/Screen';
import { Chip, ChipRow } from '../components/Inputs';
import LoginForm from './LoginForm';
import { type } from '../theme';
import { ROLES, ROLE_IDS } from '../../users';

export default function LoginScreen() {
  const [roleId, setRoleId] = useState('customer');
  return (
    <Screen>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }} keyboardShouldPersistTaps="handled">
          <View style={{ width: '100%', maxWidth: 380, gap: 20 }}>
            <Text style={[type.title, { fontSize: 28 }]} accessibilityRole="header">Pastures Café</Text>
            <ChipRow>{ROLE_IDS.map((id) => <Chip key={id} label={ROLES[id].title} selected={id === roleId} onPress={() => setRoleId(id)} />)}</ChipRow>
            <LoginForm roleId={roleId} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
