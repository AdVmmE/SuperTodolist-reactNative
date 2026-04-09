// ===================================================
// StatCard.js - Clean stat box (no emojis)
// ===================================================

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function StatCard({ icon, label, value, color }) {
  const { theme } = useTheme();
  const accentColor = color || theme.primary;

  return (
    <View style={[styles.container, { backgroundColor: accentColor + '08', borderColor: accentColor + '20' }]}>
      <Text style={[styles.icon, { color: accentColor }]}>{icon}</Text>
      <Text style={[styles.value, { color: theme.text }]}>{value}</Text>
      <Text style={[styles.label, { color: theme.textMuted }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginHorizontal: 4,
  },
  icon: { fontSize: 18, fontWeight: '700', marginBottom: 4 },
  value: { fontSize: 18, fontWeight: '800' },
  label: { fontSize: 10, marginTop: 2, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
});
