// ===================================================
// XPNotification.js - Popup notification for XP gain
// ===================================================

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

/**
 * A floating notification that shows XP gain and optional messages.
 * Auto-dismisses after a timeout.
 * 
 * @param {Object} props
 * @param {boolean} props.visible - Show notification
 * @param {number} props.xp - XP amount gained
 * @param {string} props.message - Additional message (e.g. "Level Up!")
 * @param {Function} props.onDismiss - Called when animation ends
 */
export default function XPNotification({ visible, xp, message, onDismiss }) {
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Slide in
      Animated.parallel([
        Animated.spring(slideAnim, { toValue: 50, friction: 8, useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start();

      // Auto dismiss after 2.5 seconds
      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(slideAnim, { toValue: -100, duration: 300, useNativeDriver: true }),
          Animated.timing(opacityAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
        ]).start(() => {
          onDismiss && onDismiss();
        });
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <Text style={styles.xpText}>+{xp} XP ⚡</Text>
      {message && <Text style={styles.message}>{message}</Text>}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: width * 0.15,
    right: width * 0.15,
    backgroundColor: '#6C5CE7',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#6C5CE7',
    shadowOpacity: 0.5,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 16,
    elevation: 10,
    zIndex: 9999,
  },
  xpText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  message: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
});
