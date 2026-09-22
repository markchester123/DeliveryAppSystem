import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { TextField } from '../components/Inputs';
import Button from '../components/Button';
import { colors } from '../theme';
import { ROLES, useAuth, demoCredentials } from '../../users';

export default function LoginForm({ roleId }) {
  const role = ROLES[roleId];
  const { signIn } = useAuth();
  const [values, setValues] = useState({});
  const [error, setError] = useState('');
  const [lockedUntil, setLockedUntil] = useState(0);
  const [, tick] = useState(0);

  useEffect(() => { setValues({}); setError(''); }, [roleId]);

  useEffect(() => {
    if (!lockedUntil) return undefined;
    const h = setInterval(() => {
      if (Date.now() >= lockedUntil) { setLockedUntil(0); setError(''); } else tick((n) => n + 1);
    }, 500);
    return () => clearInterval(h);
  }, [lockedUntil]);

  const locked = lockedUntil > Date.now();
  const secondsLeft = Math.max(0, Math.ceil((lockedUntil - Date.now()) / 1000));

  const submit = () => {
    if (locked) return;
    const result = signIn(roleId, values);
    if (result.ok) return;
    if (result.lockedUntil) setLockedUntil(result.lockedUntil);
    setError(result.error);
    setValues((v) => ({ id: v.id }));
  };

  const fillDemo = () => {
    const d = demoCredentials(roleId);
    const next = {};
    role.credentials.forEach((f) => { next[f.key] = d[f.key]; });
    setValues(next);
    setError('');
  };

  return (
    <View>
      {error ? (
        <Text accessibilityRole="alert" style={{ color: colors.danger, marginBottom: 14, fontSize: 14 }}>
          {locked ? `Too many attempts. Try again in ${secondsLeft}s.` : error}
        </Text>
      ) : null}

      {role.credentials.map((f, i) => (
        <TextField key={f.key} label={f.label} value={values[f.key] || ''} onChangeText={(t) => setValues((v) => ({ ...v, [f.key]: t }))}
          secret={f.secret} numeric={f.numeric} maxLength={f.maxLength} onSubmitEditing={i === role.credentials.length - 1 ? submit : undefined} />
      ))}

      <Button title="Sign in" variant="primary" onPress={submit} disabled={locked} block />
      <Button title="Use demo account" variant="ghost" small onPress={fillDemo} style={{ alignSelf: 'center', marginTop: 8 }} />
    </View>
  );
}
