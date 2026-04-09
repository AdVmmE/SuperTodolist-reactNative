// ===================================================
// ProfileScreen.js - Clean profile with no emoji clutter
// ===================================================

import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, Switch, RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { getUser, getTasks, removeToken, clearAllData } from '../services/storageService';
import { getGamificationProfile } from '../services/gamificationService';
import { getNotifSettings, saveNotifSettings, cancelAllNotifications } from '../services/notificationService';
import {
  getCompletionRate, calculateLevel, getLevelProgress,
  formatDuration, getTotalDuration,
} from '../utils/helpers';
import { ACHIEVEMENTS } from '../utils/constants';
import Card from '../components/Card';
import ProgressBar from '../components/ProgressBar';

export default function ProfileScreen({ navigation }) {
  const { theme, isDark, toggleTheme } = useTheme();
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [gamification, setGamification] = useState({});
  const [notifSettings, setNotifSettings] = useState({});
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(useCallback(() => { loadData(); }, []));

  const loadData = async () => {
    setUser(await getUser());
    setTasks(await getTasks());
    setGamification(await getGamificationProfile());
    setNotifSettings(await getNotifSettings());
  };

  const onRefresh = async () => { setRefreshing(true); await loadData(); setRefreshing(false); };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: async () => { await removeToken(); navigation.replace('Login'); } },
    ]);
  };

  const handleClearData = () => {
    Alert.alert('Clear All Data', 'This will reset everything. Continue?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: async () => { await clearAllData(); await cancelAllNotifications(); await loadData(); } },
    ]);
  };

  // Toggle a notification setting
  const handleNotifToggle = async (key) => {
    const updated = { ...notifSettings, [key]: !notifSettings[key] };
    setNotifSettings(updated);
    await saveNotifSettings(updated);
  };

  const level = calculateLevel(gamification.totalXP || 0);
  const levelProgress = getLevelProgress(gamification.totalXP || 0);
  const completionRate = getCompletionRate(tasks);
  const totalDuration = getTotalDuration(tasks.filter((t) => t.completed));
  const unlockedCount = (gamification.unlockedAchievements || []).length;

  const summaryItems = [
    { label: 'Tasks Completed', value: gamification.tasksCompleted || 0 },
    { label: 'Total Tasks', value: tasks.length },
    { label: 'Completion Rate', value: `${completionRate}%` },
    { label: 'Daily Streak', value: `${gamification.dailyStreak || 0} days` },
    { label: 'Time Invested', value: formatDuration(totalDuration) },
    { label: 'Achievements', value: `${unlockedCount}/${ACHIEVEMENTS.length}` },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />}
      >
        <Text style={[styles.headerTitle, { color: theme.text }]}>Profile</Text>

        {/* User Card */}
        <Card>
          <View style={styles.userSection}>
            <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
              <Text style={styles.avatarLetter}>{user?.name ? user.name.charAt(0).toUpperCase() : '?'}</Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={[styles.userName, { color: theme.text }]}>{user?.name || 'Student'}</Text>
              <Text style={[styles.userEmail, { color: theme.textSecondary }]}>{user?.email || '—'}</Text>
              <View style={[styles.levelTag, { backgroundColor: theme.primary + '18' }]}>
                <Text style={[styles.levelTagText, { color: theme.primary }]}>Level {level}</Text>
              </View>
            </View>
          </View>
        </Card>

        {/* XP Progress */}
        <Card>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>XP Progress</Text>
          <ProgressBar percentage={levelProgress} label={`Level ${level} → ${level + 1}`} color={theme.primary} />
          <Text style={[styles.xpStat, { color: theme.textSecondary }]}>{gamification.totalXP || 0} XP total</Text>
        </Card>

        {/* Summary */}
        <Card>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Summary</Text>
          {summaryItems.map((item, i) => (
            <View key={i} style={[styles.summaryRow, i > 0 && { borderTopWidth: 1, borderTopColor: theme.border }]}>
              <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>{item.label}</Text>
              <Text style={[styles.summaryValue, { color: theme.text }]}>{item.value}</Text>
            </View>
          ))}
        </Card>

        {/* Settings */}
        <Card>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Settings</Text>
          <View style={styles.settingRow}>
            <Text style={[styles.settingLabel, { color: theme.text }]}>Dark Mode</Text>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: '#D1D5DB', true: theme.primary + '80' }}
              thumbColor={isDark ? theme.primary : '#F9FAFB'}
            />
          </View>
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <TouchableOpacity style={styles.settingRow} onPress={handleClearData}>
            <Text style={[styles.settingLabel, { color: theme.danger }]}>Clear All Data</Text>
            <Text style={[styles.arrow, { color: theme.textMuted }]}>→</Text>
          </TouchableOpacity>
        </Card>

        {/* Notifications */}
        <Card>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Notifications</Text>
          {[
            { key: 'enabled', label: 'Enable Notifications' },
            { key: 'dailyReminder', label: 'Daily Task Reminder' },
            { key: 'streakReminder', label: 'Streak Alerts' },
            { key: 'achievementAlerts', label: 'Achievement Alerts' },
            { key: 'focusReminder', label: 'Focus Reminders' },
          ].map((item, i) => (
            <React.Fragment key={item.key}>
              {i > 0 && <View style={[styles.divider, { backgroundColor: theme.border }]} />}
              <View style={styles.settingRow}>
                <Text style={[styles.settingLabel, { color: item.key === 'enabled' ? theme.text : theme.textSecondary }]}>
                  {item.label}
                </Text>
                <Switch
                  value={!!notifSettings[item.key]}
                  onValueChange={() => handleNotifToggle(item.key)}
                  trackColor={{ false: '#D1D5DB', true: theme.primary + '80' }}
                  thumbColor={notifSettings[item.key] ? theme.primary : '#F9FAFB'}
                  disabled={item.key !== 'enabled' && !notifSettings.enabled}
                />
              </View>
            </React.Fragment>
          ))}
        </Card>

        {/* Logout */}
        <TouchableOpacity style={[styles.logoutBtn, { backgroundColor: theme.danger }]} onPress={handleLogout} activeOpacity={0.8}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20, paddingTop: 50 },
  headerTitle: { fontSize: 28, fontWeight: '800', marginBottom: 20 },
  sectionTitle: { fontSize: 14, fontWeight: '700', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  userSection: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 56, height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  avatarLetter: { fontSize: 24, fontWeight: '800', color: '#FFF' },
  userInfo: { flex: 1 },
  userName: { fontSize: 20, fontWeight: '700', marginBottom: 2 },
  userEmail: { fontSize: 13, marginBottom: 6 },
  levelTag: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  levelTagText: { fontSize: 12, fontWeight: '700' },
  xpStat: { fontSize: 12, marginTop: 4, textAlign: 'right' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
  summaryLabel: { fontSize: 14, fontWeight: '500' },
  summaryValue: { fontSize: 15, fontWeight: '700' },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
  settingLabel: { fontSize: 15, fontWeight: '600' },
  arrow: { fontSize: 18 },
  divider: { height: 1, marginVertical: 4 },
  logoutBtn: {
    borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 12,
    shadowOpacity: 0.3, shadowOffset: { width: 0, height: 4 }, shadowRadius: 10, elevation: 4,
  },
  logoutText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});
