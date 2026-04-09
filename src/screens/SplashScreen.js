// ===================================================
// SplashScreen.js - ADVXM branded intro with sound
// ===================================================

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, StatusBar } from 'react-native';
import { Audio } from 'expo-av';

const { width, height } = Dimensions.get('window');

/**
 * Premium splash/intro screen showing "ADVXM" branding
 * with smooth animations and a subtle sound effect.
 * 
 * @param {Function} onFinish - Called when splash animation completes
 */
export default function SplashScreen({ onFinish }) {
  // ─── Animation values ─────────────────────────
  const logoScale = useRef(new Animated.Value(0.3)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const taglineSlide = useRef(new Animated.Value(20)).current;
  const lineWidth = useRef(new Animated.Value(0)).current;
  const containerOpacity = useRef(new Animated.Value(1)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    playSplash();
  }, []);

  const playSplash = async () => {
    // ─── Try to play a subtle sound ────────────
    try {
      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
      const { sound } = await Audio.Sound.createAsync(
        // Subtle digital whoosh / notification sound
        { uri: 'https://cdn.pixabay.com/audio/2022/03/10/audio_5765cc834b.mp3' },
        { shouldPlay: true, volume: 0.5 }
      );
      // Cleanup after playing
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) sound.unloadAsync();
      });
    } catch (e) {
      // Sound failed? No problem — animation still plays
      console.log('Splash sound skipped');
    }

    // ─── Run animation sequence ────────────────
    Animated.sequence([
      // Phase 1: Logo appears with scale + glow
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(glowOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),

      // Phase 2: Line animates across
      Animated.timing(lineWidth, {
        toValue: 1,
        duration: 500,
        useNativeDriver: false,
      }),

      // Phase 3: Tagline fades in
      Animated.parallel([
        Animated.timing(taglineOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(taglineSlide, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),

      // Phase 4: Hold
      Animated.delay(800),

      // Phase 5: Fade out everything
      Animated.timing(containerOpacity, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onFinish && onFinish();
    });
  };

  return (
    <Animated.View style={[styles.container, { opacity: containerOpacity }]}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0F" />

      {/* Background glow effect */}
      <Animated.View style={[styles.glow, { opacity: glowOpacity }]} />

      {/* Logo */}
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: logoOpacity,
            transform: [{ scale: logoScale }],
          },
        ]}
      >
        <Text style={styles.logoText}>Advxm</Text>
      </Animated.View>

      {/* Animated line */}
      <Animated.View
        style={[
          styles.line,
          {
            width: lineWidth.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 120],
            }),
          },
        ]}
      />

      {/* Tagline */}
      <Animated.View
        style={{
          opacity: taglineOpacity,
          transform: [{ translateY: taglineSlide }],
        }}
      >
        <Text style={styles.tagline}>D E V E L O P E R</Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  glow: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#6C5CE7',
    opacity: 0.08,
  },
  logoContainer: {
    marginBottom: 16,
  },
  logoText: {
    fontSize: 48,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 8,
  },
  line: {
    height: 2,
    backgroundColor: '#6C5CE7',
    marginBottom: 16,
    borderRadius: 1,
  },
  tagline: {
    fontSize: 12,
    color: '#c7ccd4ff',
    letterSpacing: 6,
    fontWeight: '500',
  },
});
