// ===================================================
// TaskItem.js - Task row with focus button
// ===================================================

import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { PRIORITIES } from '../utils/constants';

/**
 * @param {Object} props
 * @param {Object} props.task
 * @param {Function} props.onToggle
 * @param {Function} props.onDelete
 * @param {Function} props.onFocus - Called with the task to start focus timer
 */
export default function TaskItem({ task, onToggle, onDelete, onFocus }) {
  const { theme } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const priority = PRIORITIES.find((p) => p.id === task.priority) || PRIORITIES[2];

  const handleToggle = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.96, duration: 80, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start();
    onToggle && onToggle(task.id);
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: theme.card,
          borderColor: task.completed ? theme.success + '30' : theme.border,
          transform: [{ scale: scaleAnim }],
          opacity: task.completed ? 0.65 : 1,
        },
      ]}
    >
      {/* Priority indicator line */}
      <View style={[styles.priorityLine, { backgroundColor: priority.color }]} />

      {/* Checkbox */}
      <TouchableOpacity onPress={handleToggle} style={styles.checkboxArea} activeOpacity={0.6}>
        <View
          style={[
            styles.checkbox,
            {
              borderColor: task.completed ? theme.success : theme.border,
              backgroundColor: task.completed ? theme.success : 'transparent',
            },
          ]}
        >
          {task.completed && <Text style={styles.checkmark}>✓</Text>}
        </View>
      </TouchableOpacity>

      {/* Content */}
      <View style={styles.content}>
        <Text
          style={[
            styles.title,
            { color: theme.text },
            task.completed && { textDecorationLine: 'line-through', color: theme.textMuted },
          ]}
          numberOfLines={2}
        >
          {task.title}
        </Text>

        <View style={styles.meta}>
          <Text style={[styles.priorityText, { color: priority.color }]}>{priority.label}</Text>

          {task.duration && (
            <View style={[styles.durationBadge, { backgroundColor: theme.surfaceSecondary }]}>
              <Text style={[styles.durationText, { color: theme.textSecondary }]}>{task.duration}</Text>
            </View>
          )}

          {!task.completed && (
            <Text style={[styles.xpText, { color: theme.primary }]}>+{priority.xp}</Text>
          )}
        </View>
      </View>

      {/* Focus button — only show for uncompleted tasks */}
      {!task.completed && onFocus && (
        <TouchableOpacity
          onPress={() => onFocus(task)}
          style={[styles.focusBtn, { backgroundColor: theme.primary + '12', borderColor: theme.primary + '30' }]}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        >
          <Text style={[styles.focusBtnText, { color: theme.primary }]}>Focus</Text>
        </TouchableOpacity>
      )}

      {/* Delete */}
      {onDelete && (
        <TouchableOpacity onPress={() => onDelete(task.id)} style={styles.deleteBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={[styles.deleteText, { color: theme.textMuted }]}>×</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 14, paddingHorizontal: 14,
    borderRadius: 14, marginBottom: 8, borderWidth: 1, overflow: 'hidden',
  },
  priorityLine: {
    position: 'absolute', left: 0, top: 0, bottom: 0, width: 3,
    borderTopLeftRadius: 14, borderBottomLeftRadius: 14,
  },
  checkboxArea: { paddingRight: 12, paddingLeft: 4 },
  checkbox: { width: 24, height: 24, borderRadius: 7, borderWidth: 2, justifyContent: 'center', alignItems: 'center' },
  checkmark: { color: '#FFF', fontSize: 13, fontWeight: '800' },
  content: { flex: 1 },
  title: { fontSize: 15, fontWeight: '600', marginBottom: 5, lineHeight: 20 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  priorityText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  durationBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  durationText: { fontSize: 11, fontWeight: '600' },
  xpText: { fontSize: 11, fontWeight: '700' },
  // Focus button
  focusBtn: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8,
    borderWidth: 1, marginLeft: 6,
  },
  focusBtnText: { fontSize: 12, fontWeight: '700' },
  // Delete
  deleteBtn: { padding: 6, marginLeft: 4 },
  deleteText: { fontSize: 18, fontWeight: '400' },
});
