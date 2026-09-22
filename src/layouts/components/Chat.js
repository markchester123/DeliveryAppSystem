import React, { useRef } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet } from 'react-native';
import Icon from './Icon';
import { colors, radius } from '../theme';
import { timeText } from '../../utils/format';

export function ChatThread({ messages, viewer, style }) {
  const ref = useRef(null);
  return (
    <ScrollView ref={ref} style={[{ flex: 1 }, style]} contentContainerStyle={{ padding: 4, gap: 8 }}
      onContentSizeChange={() => ref.current && ref.current.scrollToEnd({ animated: false })} accessibilityLabel="Messages">
      {messages.map((m, i) =>
        m.from === 'system' ? (
          <Text key={i} style={styles.sys}>{m.text}</Text>
        ) : (
          <View key={i} style={[styles.row, m.from === viewer ? { alignSelf: 'flex-end', alignItems: 'flex-end' } : { alignSelf: 'flex-start' }]}>
            <View style={[styles.bubble, m.from === viewer ? { backgroundColor: colors.primary } : { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line }]}>
              <Text style={{ fontSize: 15, color: m.from === viewer ? '#fff' : colors.text }}>{m.text}</Text>
            </View>
            <Text style={styles.time}>{timeText(m.t)}</Text>
          </View>
        ),
      )}
    </ScrollView>
  );
}

export function Composer({ value, onChangeText, onSend }) {
  return (
    <View style={styles.composer}>
      <TextInput value={value} onChangeText={onChangeText} onSubmitEditing={onSend} placeholder="Message" placeholderTextColor="#9A948B" accessibilityLabel="Message" style={styles.input} returnKeyType="send" />
      <Pressable onPress={onSend} accessibilityRole="button" accessibilityLabel="Send message" style={styles.send}><Icon name="send" size={18} color="#fff" /></Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  sys: { alignSelf: 'center', fontSize: 13, color: colors.muted },
  row: { maxWidth: '80%', gap: 2 },
  bubble: { paddingVertical: 8, paddingHorizontal: 13, borderRadius: radius.lg },
  time: { fontSize: 11, color: colors.muted, paddingHorizontal: 6 },
  composer: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: 24, paddingLeft: 16, paddingRight: 4, paddingVertical: 4, borderWidth: 1, borderColor: colors.line, gap: 8 },
  input: { flex: 1, minHeight: 42, fontSize: 16, color: colors.text },
  send: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
});
