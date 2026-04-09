// ===================================================
// Card.js - Reusable themed card wrapper
// ===================================================

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

/**
 * @param {Object} props
 * @param {ReactNode} props.children
 * @param {Object} props.style - Additional styles
 * @param {boolean} props.elevated - Show shadow (default true)
 */
export default function Card({ children, style, elevated = true }) {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.card, borderColor: theme.border },
        elevated && {
          shadowColor: theme.shadow,
          shadowOpacity: 0.06,
          shadowOffset: { width: 0, height: 3 },
          shadowRadius: 10,
          elevation: 3,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
});
