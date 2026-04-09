// ===================================================
// InsightCard.js - Clean insight card (minimal icons)
// ===================================================

import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const SEVERITY_COLORS = { success: 'success', warning: 'warning', danger: 'danger', info: 'primary' };

export default function InsightCard({ insight, index = 0 }) {
  const { theme } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, delay: index * 60, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 400, delay: index * 60, useNativeDriver: true }),
    ]).start();
  }, []);

  const accentColor = theme[SEVERITY_COLORS[insight.severity] || 'primary'];

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: theme.card,
          borderColor: theme.border,
          borderLeftColor: accentColor,
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      {/* Colored dot instead of emoji */}
      <View style={[styles.dot, { backgroundColor: accentColor }]} />

      <View style={styles.textContainer}>
        <Text style={[styles.title, { color: theme.text }]}>{insight.title}</Text>
        <Text style={[styles.message, { color: theme.textSecondary }]}>{insight.message}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderLeftWidth: 3,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 5,
    marginRight: 12,
  },
  textContainer: { flex: 1 },
  title: { fontSize: 14, fontWeight: '700', marginBottom: 3 },
  message: { fontSize: 12.5, lineHeight: 18 },
});
