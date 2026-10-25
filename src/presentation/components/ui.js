import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

export const colors = { ink: '#162C35', muted: '#546973', bg: '#F2F5F5', teal: '#006B61', line: '#D8E1E3' };
export const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, paddingBottom: 40, gap: 16 },
  card: { backgroundColor: '#FFFFFF', padding: 18, borderRadius: 16, borderWidth: 1, borderColor: colors.line, gap: 10 },
  title: { fontSize: 26, fontWeight: '800', color: colors.ink },
  heading: { fontSize: 19, fontWeight: '700', color: colors.ink },
  text: { fontSize: 16, lineHeight: 23, color: colors.ink },
  muted: { fontSize: 14, lineHeight: 21, color: colors.muted },
  label: { fontSize: 14, fontWeight: '700', color: colors.ink, marginBottom: 7 },
  input: { minHeight: 52, borderWidth: 1, borderColor: '#9CACB2', borderRadius: 10, padding: 13, backgroundColor: '#FFFFFF', color: colors.ink, fontSize: 16 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  error: { color: '#A12222', fontSize: 15, lineHeight: 22 },
});

export function Button({ title, onPress, secondary, disabled, busy }) {
  return <Pressable accessibilityRole="button" accessibilityState={{ disabled: !!disabled || !!busy }}
    disabled={disabled || busy} onPress={onPress}
    style={({ pressed }) => ({ backgroundColor: secondary ? '#E2EEEB' : colors.teal, minHeight: 52,
      borderRadius: 12, justifyContent: 'center', alignItems: 'center', padding: 14, opacity: disabled || busy ? 0.5 : pressed ? 0.8 : 1 })}>
    {busy ? <ActivityIndicator color={secondary ? colors.teal : '#FFFFFF'} /> : <Text style={{ color: secondary ? colors.teal : '#FFFFFF', fontWeight: '700', fontSize: 16 }}>{title}</Text>}
  </Pressable>;
}
export function Field({ label, multiline, ...props }) {
  return <View><Text style={styles.label}>{label}</Text><TextInput accessibilityLabel={label}
    placeholderTextColor="#687D85" style={[styles.input, multiline && { minHeight: 100, textAlignVertical: 'top' }]}
    multiline={multiline} {...props} /></View>;
}
export function Badge({ status }) {
  const palette = status === 'Pendente' ? ['#FFF0CC', '#795100'] : status === 'Em andamento' ? ['#E4EEFF', '#234F9A'] : ['#DDF2E7', '#176341'];
  return <View style={{ alignSelf: 'flex-start', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: palette[0] }}>
    <Text style={{ color: palette[1], fontSize: 13, fontWeight: '700' }}>{status}</Text></View>;
}
export function Feedback({ error }) {
  return error ? <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.error}>{error}</Text> : null;
}
export const formatDate = value => value ? new Date(value).toLocaleString('pt-BR') : '—';
