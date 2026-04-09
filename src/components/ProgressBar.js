// ===================================================
// ProgressBar.js - Animated progress / XP bar
// ===================================================

import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../context/ThemeContext';

/**
 * @param {Object} props
 * @param {number} props.percentage - 0 to 100
 * @param {string} props.label - Label text (optional)
 * @param {string} props.color - Override fill color
 * @param {boolean} props.showPercentage - Show % text (default true)
 * @param {number} props.height - Bar height (default 10)
 */
export default function ProgressBar({ percentage = 0, label, color, showPercentage = true, height = 10 }) {
  const { theme } = useTheme();
  const animWidth = useRef(new Animated.Value(0)).current;
  const clamped = Math.min(100, Math.max(0, percentage));
  const barColor = color || theme.primary;

  useEffect(() => {
    Animated.timing(animWidth, {
      toValue: clamped,
      duration: 800,
      useNativeDriver: false,
    }).start();
  }, [clamped]);

  return (
    <View style={styles.container}>
      {(label || showPercentage) && (
        <View style={styles.labelRow}>
          {label && <Text style={[styles.label, { color: theme.text }]}>{label}</Text>}
          {showPercentage && (
            <Text style={[styles.percent, { color: theme.textSecondary }]}>
              {Math.round(clamped)}%
            </Text>
          )}
        </View>
      )}
      <View style={[styles.track, { backgroundColor: theme.xpBarBg, height }]}>
        <Animated.View
          style={[
            styles.fill,
            {
              backgroundColor: barColor,
              height,
              width: animWidth.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginVertical: 6 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  label: { fontSize: 13, fontWeight: '600' },
  percent: { fontSize: 13, fontWeight: '600' },
  track: { borderRadius: 5, overflow: 'hidden' },
  fill: { borderRadius: 5 },
});
