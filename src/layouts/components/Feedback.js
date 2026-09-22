import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radius } from '../theme';

export function EmptyState({ children, style }) {
  return <Text style={[{ color: colors.muted, textAlign: 'center', paddingVertical: 24, fontSize: 15 }, style]}>{children}</Text>;
}

export function Note({ tone = 'info', children, style }) {
  const warn = tone === 'warn';
  return (
    <View style={[{ padding: 12, borderRadius: radius.md, backgroundColor: warn ? colors.warnTint : colors.primaryTint }, style]}>
      <Text style={{ fontSize: 14, color: warn ? colors.warn : '#1F5230', fontWeight: '600' }}>{children}</Text>
    </View>
  );
}

const ToastContext = createContext(() => {});
export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }) {
  const [msg, setMsg] = useState('');
  const timer = useRef(null);
  const show = useCallback((m) => {
    setMsg(m);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setMsg(''), 2400);
  }, []);
  return (
    <ToastContext.Provider value={show}>
      {children}
      {msg ? (
        <View pointerEvents="none" style={styles.wrap}>
          <View style={styles.toast} accessibilityLiveRegion="polite"><Text style={{ color: '#fff', fontWeight: '600' }}>{msg}</Text></View>
        </View>
      ) : null}
    </ToastContext.Provider>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', top: 70, left: 0, right: 0, alignItems: 'center', zIndex: 999 },
  toast: { backgroundColor: '#222', paddingVertical: 10, paddingHorizontal: 18, borderRadius: radius.md, maxWidth: '90%' },
});
