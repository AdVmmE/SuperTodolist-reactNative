// ===================================================
// FocusTimerScreen.js - Pomodoro-style focus timer
// ===================================================

import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated, Vibration, Alert,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { updateTask, saveGamification, getGamification } from '../services/storageService';
import { notifyFocusComplete } from '../services/notificationService';

const BONUS_XP = 15; // Bonus XP for completing a focus session

export default function FocusTimerScreen({ route, navigation }) {
  const { theme } = useTheme();
  const { task } = route.params;

  // Total seconds from task duration (default 25 min if no duration)
  const totalSeconds = task.durationMinutes ? task.durationMinutes * 60 : 25 * 60;

  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  // Animations
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const completeScale = useRef(new Animated.Value(0)).current;

  const intervalRef = useRef(null);

  // ─── Pulse animation while running ────────────
  useEffect(() => {
    if (isRunning) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.05, duration: 1000, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }
  }, [isRunning]);

  // ─── Timer countdown ──────────────────────────
  useEffect(() => {
    if (isRunning && secondsLeft > 0) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          const next = prev - 1;
          // Update progress
          const progress = ((totalSeconds - next) / totalSeconds) * 100;
          progressAnim.setValue(progress);
          return next;
        });
      }, 1000);
    } else if (secondsLeft === 0 && isRunning) {
      // Timer done
      setIsRunning(false);
      handleComplete();
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, secondsLeft]);

  // ─── Timer complete ───────────────────────────
  const handleComplete = async () => {
    setIsComplete(true);
    Vibration.vibrate([0, 300, 200, 300]); // Celebration vibration

    // Animate completion
    Animated.spring(completeScale, { toValue: 1, friction: 4, useNativeDriver: true }).start();

    // Award bonus XP
    try {
      const gam = await getGamification();
      gam.totalXP += BONUS_XP;
      await saveGamification(gam);

      // Send notification
      await notifyFocusComplete(task.title, BONUS_XP);
    } catch (e) {
      console.log('Focus XP error:', e);
    }
  };

  // ─── Controls ─────────────────────────────────
  const handleStart = () => setIsRunning(true);
  const handlePause = () => setIsRunning(false);
  const handleReset = () => {
    setIsRunning(false);
    setSecondsLeft(totalSeconds);
    setIsComplete(false);
    progressAnim.setValue(0);
    completeScale.setValue(0);
  };

  const handleDone = () => navigation.goBack();

  // ─── Format time ──────────────────────────────
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const timeStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const progress = ((totalSeconds - secondsLeft) / totalSeconds) * 100;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={[styles.backText, { color: theme.textSecondary }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Focus Mode</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* Task info */}
      <View style={[styles.taskCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={[styles.taskTitle, { color: theme.text }]} numberOfLines={2}>{task.title}</Text>
        <Text style={[styles.taskDuration, { color: theme.textMuted }]}>
          {task.duration || '25m'} session · +{BONUS_XP} bonus XP
        </Text>
      </View>

      {/* Timer circle */}
      <View style={styles.timerSection}>
        <Animated.View
          style={[
            styles.timerCircle,
            {
              borderColor: isComplete ? theme.success : isRunning ? theme.primary : theme.border,
              transform: [{ scale: pulseAnim }],
            },
          ]}
        >
          {/* Progress ring background */}
          <View style={[styles.progressRing, { borderColor: theme.border }]} />

          {/* Colored progress arc (simplified as background tint) */}
          <View
            style={[
              styles.progressFill,
              {
                backgroundColor: isComplete
                  ? theme.success + '10'
                  : isRunning
                  ? theme.primary + '08'
                  : 'transparent',
              },
            ]}
          />

          {isComplete ? (
            <Animated.View style={{ transform: [{ scale: completeScale }], alignItems: 'center' }}>
              <Text style={[styles.completeIcon, { color: theme.success }]}>✓</Text>
              <Text style={[styles.completeText, { color: theme.success }]}>Done!</Text>
              <Text style={[styles.bonusText, { color: theme.primary }]}>+{BONUS_XP} XP</Text>
            </Animated.View>
          ) : (
            <>
              <Text style={[styles.timerText, { color: theme.text }]}>{timeStr}</Text>
              <Text style={[styles.timerPercent, { color: theme.textMuted }]}>
                {Math.round(progress)}%
              </Text>
            </>
          )}
        </Animated.View>
      </View>

      {/* Progress bar */}
      <View style={[styles.progressBar, { backgroundColor: theme.xpBarBg }]}>
        <Animated.View
          style={[
            styles.progressBarFill,
            {
              backgroundColor: isComplete ? theme.success : theme.primary,
              width: progressAnim.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        {isComplete ? (
          <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: theme.success }]} onPress={handleDone}>
            <Text style={styles.primaryBtnText}>Done</Text>
          </TouchableOpacity>
        ) : (
          <>
            {!isRunning ? (
              <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: theme.primary }]} onPress={handleStart}>
                <Text style={styles.primaryBtnText}>{secondsLeft === totalSeconds ? 'Start Focus' : 'Resume'}</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: theme.warning }]} onPress={handlePause}>
                <Text style={styles.primaryBtnText}>Pause</Text>
              </TouchableOpacity>
            )}

            {secondsLeft < totalSeconds && !isRunning && (
              <TouchableOpacity style={[styles.secondaryBtn, { borderColor: theme.border }]} onPress={handleReset}>
                <Text style={[styles.secondaryBtnText, { color: theme.textSecondary }]}>Reset</Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </View>

      {/* Tips */}
      <View style={[styles.tipCard, { backgroundColor: theme.surfaceSecondary, borderColor: theme.border }]}>
        <Text style={[styles.tipTitle, { color: theme.text }]}>Focus Tips</Text>
        <Text style={[styles.tipText, { color: theme.textMuted }]}>
          • Put your phone face-down{'\n'}
          • Close other apps{'\n'}
          • Take a 5-min break after each session
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  // Header
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 50, paddingBottom: 10 },
  backBtn: { width: 60 },
  backText: { fontSize: 15, fontWeight: '600' },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  // Task
  taskCard: {
    marginHorizontal: 20, padding: 16, borderRadius: 14, borderWidth: 1,
    alignItems: 'center', marginBottom: 20,
  },
  taskTitle: { fontSize: 16, fontWeight: '700', textAlign: 'center', marginBottom: 4 },
  taskDuration: { fontSize: 13, textAlign: 'center' },
  // Timer
  timerSection: { alignItems: 'center', marginVertical: 20 },
  timerCircle: {
    width: 220, height: 220, borderRadius: 110,
    borderWidth: 4, justifyContent: 'center', alignItems: 'center',
    overflow: 'hidden',
  },
  progressRing: { position: 'absolute', width: '100%', height: '100%', borderRadius: 110 },
  progressFill: { position: 'absolute', width: '100%', height: '100%', borderRadius: 110 },
  timerText: { fontSize: 48, fontWeight: '800', letterSpacing: 2 },
  timerPercent: { fontSize: 14, marginTop: 4, fontWeight: '600' },
  completeIcon: { fontSize: 48, fontWeight: '800' },
  completeText: { fontSize: 20, fontWeight: '700', marginTop: 4 },
  bonusText: { fontSize: 16, fontWeight: '700', marginTop: 4 },
  // Progress bar
  progressBar: { height: 6, borderRadius: 3, marginHorizontal: 40, marginBottom: 30, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 3 },
  // Controls
  controls: { alignItems: 'center', paddingHorizontal: 40, gap: 12 },
  primaryBtn: {
    width: '100%', paddingVertical: 16, borderRadius: 14, alignItems: 'center',
    shadowOpacity: 0.2, shadowOffset: { width: 0, height: 4 }, shadowRadius: 8, elevation: 3,
  },
  primaryBtnText: { color: '#FFF', fontSize: 17, fontWeight: '700' },
  secondaryBtn: { width: '100%', paddingVertical: 14, borderRadius: 14, alignItems: 'center', borderWidth: 1.5 },
  secondaryBtnText: { fontSize: 15, fontWeight: '600' },
  // Tips
  tipCard: {
    marginHorizontal: 20, marginTop: 24, padding: 16, borderRadius: 14, borderWidth: 1,
  },
  tipTitle: { fontSize: 13, fontWeight: '700', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  tipText: { fontSize: 13, lineHeight: 20 },
});
