// ===================================================
// insightsService.js - Clean smart insights (no emojis)
// ===================================================

import { getTodayString, getCompletionRate, calculateLevel, getXPToNextLevel } from '../utils/helpers';

/**
 * Generate smart productivity insights — clean text, no emoji.
 */
export const generateInsights = (tasks, gamification) => {
  const insights = [];
  let id = 0;
  const today = getTodayString();

  const todayTasks = tasks.filter((t) => t.date === today);
  const todayCompleted = todayTasks.filter((t) => t.completed).length;
  const todayTotal = todayTasks.length;

  // Today's overview
  if (todayTotal === 0) {
    insights.push({
      id: id++, icon: '', title: 'No Tasks Today',
      message: 'Add some tasks to stay productive and start earning XP.',
      severity: 'info',
    });
  } else if (todayCompleted === todayTotal) {
    insights.push({
      id: id++, icon: '', title: 'All Done',
      message: `You completed all ${todayTotal} tasks today. Great work!`,
      severity: 'success',
    });
  } else {
    const remaining = todayTotal - todayCompleted;
    insights.push({
      id: id++, icon: '', title: `${remaining} Tasks Remaining`,
      message: `${todayCompleted}/${todayTotal} tasks completed today. Keep going.`,
      severity: 'info',
    });
  }

  // Completion rate
  const completedTasks = tasks.filter((t) => t.completed);
  const completionRate = getCompletionRate(tasks);

  if (tasks.length >= 5) {
    if (completionRate >= 80) {
      insights.push({
        id: id++, icon: '', title: 'High Achiever',
        message: `You complete ${completionRate}% of your tasks. Outstanding focus and discipline.`,
        severity: 'success',
      });
    } else if (completionRate >= 50) {
      insights.push({
        id: id++, icon: '', title: 'Good Progress',
        message: `${completionRate}% completion rate. Push above 80% for peak productivity.`,
        severity: 'info',
      });
    } else {
      insights.push({
        id: id++, icon: '', title: 'Room to Improve',
        message: `Only ${completionRate}% completion. Break tasks into smaller, manageable pieces.`,
        severity: 'warning',
      });
    }
  }

  // Time productivity
  if (completedTasks.length >= 3) {
    const periods = { morning: 0, afternoon: 0, evening: 0 };
    completedTasks.forEach((t) => {
      if (t.completedAt) {
        const hour = new Date(t.completedAt).getHours();
        if (hour < 12) periods.morning++;
        else if (hour < 17) periods.afternoon++;
        else periods.evening++;
      }
    });
    const bestPeriod = Object.entries(periods).sort((a, b) => b[1] - a[1])[0];
    if (bestPeriod[1] > 0) {
      insights.push({
        id: id++, icon: '', title: `${bestPeriod[0].charAt(0).toUpperCase() + bestPeriod[0].slice(1)} Peak`,
        message: `You're most productive in the ${bestPeriod[0]}. Schedule hard tasks then.`,
        severity: 'info',
      });
    }
  }

  // Streak
  if (gamification.dailyStreak >= 3) {
    insights.push({
      id: id++, icon: '', title: `${gamification.dailyStreak}-Day Streak`,
      message: `Active for ${gamification.dailyStreak} consecutive days. Don't break the chain.`,
      severity: 'success',
    });
  } else if (gamification.dailyStreak === 0 && gamification.tasksCompleted > 0) {
    insights.push({
      id: id++, icon: '', title: 'Streak Broken',
      message: 'Your streak was reset. Complete a task today to start a new one.',
      severity: 'warning',
    });
  }

  // Level progress
  const xpToNext = getXPToNextLevel(gamification.totalXP);
  const nextLevel = calculateLevel(gamification.totalXP) + 1;
  if (xpToNext <= 30 && gamification.totalXP > 0) {
    insights.push({
      id: id++, icon: '', title: 'Almost There',
      message: `Just ${xpToNext} XP away from Level ${nextLevel}. A few more tasks will do it.`,
      severity: 'info',
    });
  }

  // Priority focus
  if (completedTasks.length >= 5) {
    const highCount = completedTasks.filter((t) => t.priority === 'high').length;
    const highPercent = Math.round((highCount / completedTasks.length) * 100);
    if (highPercent > 40) {
      insights.push({
        id: id++, icon: '', title: 'Priority Focused',
        message: `${highPercent}% of completed tasks are high-priority. Great focus on what matters.`,
        severity: 'success',
      });
    }
  }

  if (insights.length === 0) {
    insights.push({
      id: id++, icon: '', title: 'Get Started',
      message: 'Add and complete tasks to receive personalized productivity insights.',
      severity: 'info',
    });
  }

  return insights;
};
