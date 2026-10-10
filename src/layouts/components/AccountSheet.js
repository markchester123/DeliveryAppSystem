import React, { useEffect, useRef, useState } from 'react';
import { Modal, View, Text, Pressable, Animated, Easing, StyleSheet, useWindowDimensions } from 'react-native';
import Icon from './Icon';
import { colors, type } from '../theme';
import { useAuth } from '../../users';

// Right-hand drawer opened from the burger icon. Slides in from the right while the background fades to a dim.
export default function AccountSheet({ visible, onClose, actions = [] }) {
  const { user, signOut } = useAuth();
  const { width } = useWindowDimensions();
  const drawerW = Math.min(320, Math.round(width * 0.82));
  const progress = useRef(new Animated.Value(0)).current; // 0 = closed, 1 = open
  const [mounted, setMounted] = useState(visible);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      Animated.timing(progress, { toValue: 1, duration: 280, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
    } else {
      Animated.timing(progress, { toValue: 0, duration: 220, easing: Easing.in(Easing.cubic), useNativeDriver: true }).start(({ finished }) => {
        if (finished) setMounted(false);
      });
    }
  }, [visible, progress]);

  if (!user) return null;
  const rows = actions.concat([{ icon: 'log-out', label: 'Sign out', onPress: () => { onClose(); signOut(); } }]);
  const translateX = progress.interpolate({ inputRange: [0, 1], outputRange: [drawerW, 0] });

  return (
    <Modal visible={mounted} transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.root}>
        <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.dim, { opacity: progress }]} />
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Close menu" />
        <Animated.View style={[styles.drawer, { width: drawerW, transform: [{ translateX }] }]} accessibilityViewIsModal>
          <View style={styles.head}>
            <Text style={[type.title, { flex: 1 }]} numberOfLines={1}>{user.name}</Text>
            <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Close menu" style={styles.x}><Icon name="x" size={22} /></Pressable>
          </View>
          {rows.map((r) => (
            <Pressable key={r.label} onPress={r.onPress} accessibilityRole="button" accessibilityLabel={r.label}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 54, borderTopWidth: 1, borderTopColor: colors.line }}>
              <Icon name={r.icon} size={20} />
              <Text style={{ fontSize: 16, fontWeight: '600' }}>{r.label}</Text>
            </Pressable>
          ))}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, flexDirection: 'row', justifyContent: 'flex-end' },
  dim: { backgroundColor: 'rgba(0,0,0,0.45)' },
  drawer: { height: '100%', backgroundColor: colors.card, padding: 18, paddingTop: 24, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 12, shadowOffset: { width: -2, height: 0 }, elevation: 8 },
  head: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  x: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
});