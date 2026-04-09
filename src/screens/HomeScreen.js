// ===================================================
// HomeScreen.js - Clean modern dashboard
// ===================================================

import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, RefreshControl,
  TouchableOpacity, Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { getTasks, updateTask, deleteTask } from '../services/storageService';
import { awardTaskCompletion, getGamificationProfile } from '../services/gamificationService';
import { scheduleStreakReminder, scheduleFocusReminder, notifyAchievement } from '../services/notificationService';
import {
  getGreeting, getTodayString, getCompletionRate,
  calculateLevel, getLevelProgress, getXPToNextLevel,
  getCompletedToday,
} from '../utils/helpers';
import { DAILY_FOCUS_COUNT } from '../utils/constants';

import Card from '../components/Card';
import TaskItem from '../components/TaskItem';
import ProgressBar from '../components/ProgressBar';
import StatCard from '../components/StatCard';
import XPNotification from '../components/XPNotification';

export default function HomeScreen({ navigation }) {
  const { theme } = useTheme();
  const [tasks, setTasks] = useState([]);
  const [gamification, setGamification] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const [xpNotif, setXpNotif] = useState({ visible: false, xp: 0, message: '' });

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    const taskData = await getTasks();
    const gamData = await getGamificationProfile();
    setTasks(taskData);
    setGamification(gamData);

    // Schedule smart notifications
    if (gamData.dailyStreak > 0) scheduleStreakReminder(gamData.dailyStreak);
    scheduleFocusReminder();
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // ─── Task handlers ─────────────────────────────
  const handleToggle = async (id) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    if (!task.completed) {
      // Mark complete + flag xpAwarded so XP can't be farmed
      const updated = await updateTask(id, {
        completed: true,
        completedDate: getTodayString(),
        completedAt: new Date().toISOString(),
        xpAwarded: true,
      });
      setTasks(updated);

      // Only award XP on the FIRST completion
      if (!task.xpAwarded) {
        const result = await awardTaskCompletion(task);
        setGamification(await getGamificationProfile());

        let msg = '';
        if (result.leveledUp) msg = `Level ${result.newLevel} unlocked!`;
        else if (result.newAchievements.length > 0) {
          msg = result.newAchievements[0].title;
          // Push notification for achievement
          notifyAchievement(result.newAchievements[0].title);
        }
        setXpNotif({ visible: true, xp: result.xpReward, message: msg });
      }
    } else {
      // Uncheck — but keep xpAwarded: true so toggling back won't give XP again
      const updated = await updateTask(id, { completed: false, completedDate: null, completedAt: null });
      setTasks(updated);
    }
  };

  const handleDelete = (id) => {
    Alert.alert('Delete Task', 'Remove this task?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => setTasks(await deleteTask(id)) },
    ]);
  };

  // Navigate to Focus Timer with the selected task
  const handleFocus = (task) => {
    navigation.navigate('FocusTimer', { task });
  };

  // ─── Computed ──────────────────────────────────
  const today = getTodayString();
  const todayTasks = tasks.filter((t) => t.date === today);
  const todayCompleted = todayTasks.filter((t) => t.completed).length;
  const todayProgress = todayTasks.length > 0 ? (todayCompleted / todayTasks.length) * 100 : 0;

  const priorityOrder = { high: 0, medium: 1, low: 2 };
  const focusTasks = todayTasks
    .filter((t) => !t.completed)
    .sort((a, b) => (priorityOrder[a.priority] || 2) - (priorityOrder[b.priority] || 2))
    .slice(0, DAILY_FOCUS_COUNT);

  const otherTasks = todayTasks
    .filter((t) => !focusTasks.includes(t))
    .sort((a, b) => a.completed - b.completed);

  const level = calculateLevel(gamification.totalXP || 0);
  const levelProgress = getLevelProgress(gamification.totalXP || 0);
  const xpToNext = getXPToNextLevel(gamification.totalXP || 0);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <XPNotification
        visible={xpNotif.visible}
        xp={xpNotif.xp}
        message={xpNotif.message}
        onDismiss={() => setXpNotif({ visible: false, xp: 0, message: '' })}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: theme.textSecondary }]}>{getGreeting()}</Text>
            <Text style={[styles.headerTitle, { color: theme.text }]}>Smart ToDo</Text>
          </View>
          <View style={[styles.levelBadge, { backgroundColor: theme.primary }]}>
            <Text style={styles.levelText}>Lv.{level}</Text>
          </View>
        </View>

        {/* XP Progress */}
        <Card>
          <View style={styles.xpHeader}>
            <Text style={[styles.xpTitle, { color: theme.text }]}>Level {level}</Text>
            <Text style={[styles.xpSubtitle, { color: theme.textMuted }]}>{xpToNext} XP to next</Text>
          </View>
          <ProgressBar percentage={levelProgress} showPercentage={false} height={8} color={theme.primary} />
          <Text style={[styles.xpTotal, { color: theme.textSecondary }]}>{gamification.totalXP || 0} XP total</Text>
        </Card>

        {/* Quick Stats */}
        <View style={styles.statsRow}>
          <StatCard icon="✓" label="Done Today" value={todayCompleted} color={theme.success} />
          <StatCard icon="◆" label="Streak" value={`${gamification.dailyStreak || 0}d`} color={theme.warning} />
          <StatCard icon="★" label="Total" value={gamification.tasksCompleted || 0} color={theme.primary} />
        </View>

        {/* Today's Progress */}
        <Card>
          <View style={styles.progressHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Today's Progress</Text>
            <Text style={[styles.progressCount, { color: theme.primary }]}>{todayCompleted}/{todayTasks.length}</Text>
          </View>
          <ProgressBar
            percentage={todayProgress}
            showPercentage
            height={10}
            color={todayProgress === 100 ? theme.success : theme.primary}
          />
        </Card>

        {/* Daily Focus */}
        {focusTasks.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Daily Focus</Text>
              <View style={[styles.focusBadge, { backgroundColor: theme.danger + '15' }]}>
                <Text style={[styles.focusBadgeText, { color: theme.danger }]}>Top {focusTasks.length}</Text>
              </View>
            </View>
            {focusTasks.map((task) => (
              <TaskItem key={task.id} task={task} onToggle={handleToggle} onDelete={handleDelete} onFocus={handleFocus} />
            ))}
          </>
        )}

        {/* Other Tasks */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            {focusTasks.length > 0 ? 'Other Tasks' : "Today's Tasks"}
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('AddTask')}>
            <Text style={[styles.addLink, { color: theme.primary }]}>+ Add</Text>
          </TouchableOpacity>
        </View>

        {todayTasks.length === 0 ? (
          <Card>
            <View style={styles.emptyState}>
              <Text style={[styles.emptyTitle, { color: theme.text }]}>No tasks for today</Text>
              <Text style={[styles.emptyDesc, { color: theme.textMuted }]}>
                Tap "+ Add" to create your first task and start earning XP.
              </Text>
            </View>
          </Card>
        ) : otherTasks.length > 0 ? (
          otherTasks.map((task) => (
            <TaskItem key={task.id} task={task} onToggle={handleToggle} onDelete={handleDelete} onFocus={handleFocus} />
          ))
        ) : focusTasks.length > 0 ? (
          <Card>
            <Text style={[styles.allFocusText, { color: theme.textMuted }]}>
              All remaining tasks are in your Daily Focus above.
            </Text>
          </Card>
        ) : null}

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20, paddingTop: 50 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  greeting: { fontSize: 14, fontWeight: '500', marginBottom: 2 },
  headerTitle: { fontSize: 28, fontWeight: '800' },
  levelBadge: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12 },
  levelText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
  xpHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  xpTitle: { fontSize: 16, fontWeight: '700' },
  xpSubtitle: { fontSize: 12 },
  xpTotal: { fontSize: 12, marginTop: 4, textAlign: 'right' },
  statsRow: { flexDirection: 'row', marginBottom: 4 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  progressCount: { fontSize: 14, fontWeight: '700' },
  sectionTitle: { fontSize: 16, fontWeight: '700' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, marginTop: 4 },
  addLink: { fontSize: 14, fontWeight: '700' },
  focusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  focusBadgeText: { fontSize: 12, fontWeight: '700' },
  emptyState: { alignItems: 'center', paddingVertical: 28 },
  emptyTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  emptyDesc: { fontSize: 13, textAlign: 'center', lineHeight: 19 },
  allFocusText: { textAlign: 'center', fontSize: 13, paddingVertical: 8 },
});
