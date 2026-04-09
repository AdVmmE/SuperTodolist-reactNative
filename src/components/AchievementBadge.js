// ===================================================
// AchievementBadge.js - Clean achievement card
// ===================================================

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function AchievementBadge({ achievement, unlocked = false }) {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: unlocked ? theme.primary + '10' : theme.surfaceSecondary,
          borderColor: unlocked ? theme.primary + '30' : theme.border,
          opacity: unlocked ? 1 : 0.45,
        },
      ]}
    >
      <View style={[styles.iconCircle, { backgroundColor: unlocked ? theme.primary + '20' : theme.border + '40' }]}>
        <Text style={[styles.icon, { color: unlocked ? theme.primary : theme.textMuted }]}>
          {achievement.icon}
        </Text>
      </View>
      <Text style={[styles.title, { color: unlocked ? theme.text : theme.textMuted }]} numberOfLines={1}>
        {achievement.title}
      </Text>
      <Text style={[styles.desc, { color: theme.textMuted }]} numberOfLines={2}>
        {achievement.desc}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '48%',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 10,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: { fontSize: 18, fontWeight: '800' },
  title: { fontSize: 13, fontWeight: '700', textAlign: 'center', marginBottom: 2 },
  desc: { fontSize: 10.5, textAlign: 'center', lineHeight: 14 },
});
