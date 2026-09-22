import React from 'react';
import { View } from 'react-native';
import { colors } from '../theme';

export default function Frame({ children }) {
  return (
    <View style={{ flex: 1, backgroundColor: colors.outside, alignItems: 'center' }}>
      <View style={{ flex: 1, width: '100%', maxWidth: 480, backgroundColor: colors.bg }}>{children}</View>
    </View>
  );
}
