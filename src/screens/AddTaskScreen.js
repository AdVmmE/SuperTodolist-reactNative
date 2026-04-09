// ===================================================
// AddTaskScreen.js - Add task with smart parsing (clean UI)
// ===================================================

import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Animated, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { addTask } from '../services/storageService';
import { parseTaskInput, generateId, getTodayString } from '../utils/helpers';
import { PRIORITIES } from '../utils/constants';
import Card from '../components/Card';

export default function AddTaskScreen({ navigation }) {
  const { theme } = useTheme();
  const [input, setInput] = useState('');
  const [parsedTitle, setParsedTitle] = useState('');
  const [parsedDuration, setParsedDuration] = useState(null);
  const [parsedMinutes, setParsedMinutes] = useState(null);
  const [priority, setPriority] = useState('medium');
  const [date, setDate] = useState(getTodayString());

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const successScale = useRef(new Animated.Value(0)).current;
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  const handleInputChange = (text) => {
    setInput(text);
    const parsed = parseTaskInput(text);
    setParsedTitle(parsed.title);
    setParsedDuration(parsed.duration);
    setParsedMinutes(parsed.durationMinutes);
  };

  const handleSubmit = async () => {
    if (!parsedTitle.trim()) return;

    const priorityData = PRIORITIES.find((p) => p.id === priority);
    const task = {
      id: generateId(),
      title: parsedTitle.trim(),
      priority,
      duration: parsedDuration,
      durationMinutes: parsedMinutes,
      date,
      completed: false,
      completedDate: null,
      completedAt: null,
      createdAt: new Date().toISOString(),
      xpReward: priorityData ? priorityData.xp : 10,
    };

    await addTask(task);

    setShowSuccess(true);
    Animated.sequence([
      Animated.spring(successScale, { toValue: 1, friction: 4, useNativeDriver: true }),
      Animated.delay(700),
      Animated.timing(successScale, { toValue: 0, duration: 250, useNativeDriver: true }),
    ]).start(() => {
      setShowSuccess(false);
      setInput(''); setParsedTitle(''); setParsedDuration(null); setParsedMinutes(null);
      setPriority('medium');
      navigation.navigate('Home');
    });
  };

  const selectedPriority = PRIORITIES.find((p) => p.id === priority);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <Animated.View style={{ opacity: fadeAnim }}>

            <Text style={[styles.headerTitle, { color: theme.text }]}>New Task</Text>
            <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
              Type naturally — we'll extract the duration automatically.
            </Text>

            {/* Smart Input */}
            <Card>
              <Text style={[styles.label, { color: theme.text }]}>What do you need to do?</Text>
              <TextInput
                style={[styles.smartInput, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }]}
                placeholder='e.g. "Study ML 2h" or "Read book 30m"'
                placeholderTextColor={theme.placeholder}
                value={input}
                onChangeText={handleInputChange}
                multiline
                autoFocus
              />

              {input.length > 0 && (
                <View style={[styles.parsePreview, { backgroundColor: theme.surfaceSecondary, borderColor: theme.border }]}>
                  <Text style={[styles.parseLabel, { color: theme.textMuted }]}>SMART PARSE</Text>
                  <View style={styles.parseRow}>
                    <Text style={[styles.parseKey, { color: theme.textSecondary }]}>Title</Text>
                    <Text style={[styles.parseValue, { color: theme.primary }]}>{parsedTitle || '—'}</Text>
                  </View>
                  <View style={styles.parseRow}>
                    <Text style={[styles.parseKey, { color: theme.textSecondary }]}>Duration</Text>
                    <Text style={[styles.parseValue, { color: parsedDuration ? theme.success : theme.textMuted }]}>
                      {parsedDuration || 'Not detected'}
                    </Text>
                  </View>
                </View>
              )}
            </Card>

            {/* Priority */}
            <Card>
              <Text style={[styles.label, { color: theme.text }]}>Priority</Text>
              <View style={styles.priorityGrid}>
                {PRIORITIES.map((p) => (
                  <TouchableOpacity
                    key={p.id}
                    style={[
                      styles.priorityBtn,
                      {
                        backgroundColor: priority === p.id ? p.color : theme.surfaceSecondary,
                        borderColor: priority === p.id ? p.color : theme.border,
                      },
                    ]}
                    onPress={() => setPriority(p.id)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.priorityDot, { backgroundColor: priority === p.id ? '#FFF' : p.color }]} />
                    <Text style={[styles.priorityLabel, { color: priority === p.id ? '#FFF' : theme.text }]}>
                      {p.label}
                    </Text>
                    <Text style={[styles.priorityXP, { color: priority === p.id ? 'rgba(255,255,255,0.7)' : theme.textMuted }]}>
                      +{p.xp} XP
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Card>

            {/* Date */}
            <Card>
              <Text style={[styles.label, { color: theme.text }]}>Date</Text>
              <TextInput
                style={[styles.dateInput, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder, color: theme.text }]}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={theme.placeholder}
                value={date}
                onChangeText={setDate}
              />
              <TouchableOpacity onPress={() => setDate(getTodayString())}>
                <Text style={[styles.todayLink, { color: theme.primary }]}>Set to today</Text>
              </TouchableOpacity>
            </Card>

            {/* XP Preview */}
            <Card style={{ alignItems: 'center' }}>
              <Text style={[styles.xpPreviewLabel, { color: theme.textSecondary }]}>Reward</Text>
              <Text style={[styles.xpPreviewValue, { color: theme.primary }]}>+{selectedPriority?.xp || 10} XP</Text>
            </Card>

            {/* Submit */}
            <TouchableOpacity
              style={[styles.submitBtn, { backgroundColor: parsedTitle.trim() ? theme.primary : theme.textMuted }]}
              onPress={handleSubmit}
              disabled={!parsedTitle.trim()}
              activeOpacity={0.8}
            >
              <Text style={styles.submitBtnText}>Add Task</Text>
            </TouchableOpacity>

            <View style={{ height: 30 }} />
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      {showSuccess && (
        <View style={styles.successOverlay}>
          <Animated.View style={[styles.successCircle, { transform: [{ scale: successScale }] }]}>
            <Text style={styles.successIcon}>✓</Text>
          </Animated.View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20, paddingTop: 50 },
  headerTitle: { fontSize: 28, fontWeight: '800', marginBottom: 4 },
  headerSubtitle: { fontSize: 14, marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '700', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
  smartInput: {
    borderRadius: 12, borderWidth: 1.5, padding: 16, fontSize: 16, fontWeight: '500', minHeight: 56, textAlignVertical: 'top',
  },
  parsePreview: { marginTop: 12, padding: 12, borderRadius: 10, borderWidth: 1 },
  parseLabel: { fontSize: 10, fontWeight: '700', marginBottom: 6, letterSpacing: 1.5 },
  parseRow: { flexDirection: 'row', marginBottom: 3 },
  parseKey: { fontSize: 13, fontWeight: '500', width: 65 },
  parseValue: { fontSize: 13, fontWeight: '700', flex: 1 },
  priorityGrid: { flexDirection: 'row', gap: 8 },
  priorityBtn: { flex: 1, alignItems: 'center', paddingVertical: 14, borderRadius: 12, borderWidth: 1.5 },
  priorityDot: { width: 10, height: 10, borderRadius: 5, marginBottom: 6 },
  priorityLabel: { fontSize: 13, fontWeight: '700' },
  priorityXP: { fontSize: 11, marginTop: 2 },
  dateInput: { borderRadius: 12, borderWidth: 1.5, padding: 14, fontSize: 15 },
  todayLink: { fontSize: 13, fontWeight: '600', marginTop: 8 },
  xpPreviewLabel: { fontSize: 12, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 },
  xpPreviewValue: { fontSize: 28, fontWeight: '800' },
  submitBtn: {
    borderRadius: 14, paddingVertical: 18, alignItems: 'center', marginTop: 8,
    shadowOpacity: 0.3, shadowOffset: { width: 0, height: 4 }, shadowRadius: 10, elevation: 4,
  },
  submitBtnText: { color: '#FFF', fontSize: 17, fontWeight: '700' },
  successOverlay: {
    ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center', alignItems: 'center', zIndex: 999,
  },
  successCircle: {
    width: 100, height: 100, borderRadius: 50, backgroundColor: '#6C5CE7',
    justifyContent: 'center', alignItems: 'center',
  },
  successIcon: { fontSize: 40, color: '#FFF', fontWeight: '800' },
});
