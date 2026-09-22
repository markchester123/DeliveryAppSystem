import React from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme';

export default function Screen({ children, background = colors.bg }) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: background }}>
      <View style={{ flex: 1 }}>{children}</View>
    </SafeAreaView>
  );
}
