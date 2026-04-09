// ===================================================
// StatsScreen.js - Clean productivity dashboard
// ===================================================

import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, RefreshControl, Dimensions,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LineChart } from 'react-native-chart-kit';
import { useTheme } from '../context/ThemeContext';
import { getTasks } from '../services/storageService';
import { getGamificationProfile } from '../services/gamificationService';
import { generateInsights } from '../services/insightsService';
import { getCompletionRate, getWeeklyData, calculateLevel, getLevelProgress } from '../utils/helpers';
import { DAY_NAMES, ACHIEVEMENTS, PRIORITIES } from '../utils/constants';

import Card from '../components/Card';
import StatCard from '../components/StatCard';
import InsightCard from '../components/InsightCard';
import ProgressBar from '../components/ProgressBar';
import AchievementBadge from '../components/AchievementBadge';

const screenWidth = Dimensions.get('window').width;

export default function StatsScreen() {
  const { theme, isDark } = useTheme();
  const [tasks, setTasks] = useState([]);
  const [gamification, setGamification] = useState({});
  const [insights, setInsights] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(useCallback(() => { loadData(); }, []));

  const loadData = async () => {
    const taskData = await getTasks();
    const gamData = await getGamificationProfile();
    setTasks(taskData);
    setGamification(gamData);
    setInsights(generateInsights(taskData, gamData));
  };

  const onRefresh = async () => { setRefreshing(true); await loadData(); setRefreshing(false); };

  const completionRate = getCompletionRate(tasks);
  const weeklyData = getWeeklyData(tasks);
  const totalCompleted = tasks.filter((t) => t.completed).length;
  const level = calculateLevel(gamification.totalXP || 0);
  const levelProgress = getLevelProgress(gamification.totalXP || 0);

  const priorityBreakdown = PRIORITIES.map((p) => ({
    ...p, count: tasks.filter((t) => t.completed && t.priority === p.id).length,
  }));

  const chartConfig = {
    backgroundGradientFrom: theme.card,
    backgroundGradientTo: theme.card,
    color: (o = 1) => isDark ? `rgba(162, 155, 254, ${o})` : `rgba(108, 92, 231, ${o})`,
    labelColor: () => theme.textSecondary,
    strokeWidth: 2.5,
    propsForDots: { r: '5', strokeWidth: '2', stroke: theme.primary },
    propsForBackgroundLines: { strokeDasharray: '', stroke: theme.border, strokeWidth: 1 },
    decimalPlaces: 0,
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />}
      >
        <Text style={[styles.headerTitle, { color: theme.text }]}>Statistics</Text>
        <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>Your productivity at a glance</Text>

        {/* Key Metrics */}
        <View style={styles.statsRow}>
          <StatCard icon="▲" label="Completion" value={`${completionRate}%`} color={theme.success} />
          <StatCard icon="◇" label="Total XP" value={gamification.totalXP || 0} color={theme.primary} />
          <StatCard icon="◆" label="Streak" value={`${gamification.dailyStreak || 0}d`} color={theme.warning} />
        </View>

        {/* Level */}
        <Card>
          <View style={styles.levelHeader}>
            <View style={[styles.levelCircle, { backgroundColor: theme.primary }]}>
              <Text style={styles.levelNumber}>{level}</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={[styles.levelTitle, { color: theme.text }]}>Level {level}</Text>
              <ProgressBar percentage={levelProgress} showPercentage height={8} color={theme.primary} />
            </View>
          </View>
        </Card>

        {/* Weekly Chart */}
        <Card>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Weekly Activity</Text>
          <LineChart
            data={{ labels: DAY_NAMES, datasets: [{ data: weeklyData.map((d) => d || 0.1) }] }}
            width={screenWidth - 72}
            height={180}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
            withInnerLines
            withOuterLines={false}
            withVerticalLines={false}
            fromZero
            yAxisSuffix=""
          />
        </Card>

        {/* Priority Breakdown */}
        <Card>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Priority Breakdown</Text>
          {priorityBreakdown.map((p) => (
            <View key={p.id} style={styles.breakdownRow}>
              <View style={styles.breakdownLeft}>
                <View style={[styles.dot, { backgroundColor: p.color }]} />
                <Text style={[styles.breakdownLabel, { color: theme.text }]}>{p.label}</Text>
              </View>
              <View style={styles.breakdownRight}>
                <View style={[styles.breakdownBar, { backgroundColor: theme.surfaceSecondary }]}>
                  <View style={[styles.breakdownFill, { backgroundColor: p.color, width: totalCompleted > 0 ? `${(p.count / totalCompleted) * 100}%` : '0%' }]} />
                </View>
                <Text style={[styles.breakdownCount, { color: theme.textSecondary }]}>{p.count}</Text>
              </View>
            </View>
          ))}
        </Card>

        {/* Insights */}
        <Text style={[styles.sectionTitle, { color: theme.text, marginTop: 8 }]}>Smart Insights</Text>
        {insights.map((insight, i) => (
          <InsightCard key={insight.id} insight={insight} index={i} />
        ))}

        {/* Achievements */}
        <Text style={[styles.sectionTitle, { color: theme.text, marginTop: 8 }]}>
          Achievements · {gamification.unlockedCount || 0}/{ACHIEVEMENTS.length}
        </Text>
        <View style={styles.achievementsGrid}>
          {ACHIEVEMENTS.map((ach) => (
            <AchievementBadge
              key={ach.id}
              achievement={ach}
              unlocked={(gamification.unlockedAchievements || []).includes(ach.id)}
            />
          ))}
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20, paddingTop: 50 },
  headerTitle: { fontSize: 28, fontWeight: '800', marginBottom: 4 },
  headerSubtitle: { fontSize: 14, marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  statsRow: { flexDirection: 'row', marginBottom: 4 },
  levelHeader: { flexDirection: 'row', alignItems: 'center' },
  levelCircle: { width: 52, height: 52, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  levelNumber: { color: '#FFF', fontSize: 22, fontWeight: '800' },
  levelTitle: { fontSize: 16, fontWeight: '700', marginBottom: 6 },
  chart: { borderRadius: 12, marginLeft: -12 },
  breakdownRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  breakdownLeft: { flexDirection: 'row', alignItems: 'center', width: 90 },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  breakdownLabel: { fontSize: 13, fontWeight: '600' },
  breakdownRight: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  breakdownBar: { flex: 1, height: 8, borderRadius: 4, overflow: 'hidden', marginRight: 10 },
  breakdownFill: { height: '100%', borderRadius: 4 },
  breakdownCount: { fontSize: 13, fontWeight: '700', width: 30, textAlign: 'right' },
  achievementsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
});
