// ===================================================
// gamificationService.js - XP, Levels, Achievements
// ===================================================

import { ACHIEVEMENTS, PRIORITIES } from '../utils/constants';
import { calculateLevel, getTodayString } from '../utils/helpers';
import { getGamification, saveGamification } from './storageService';

/**
 * Award XP when a task is completed.
 * Updates streak, unlocks achievements, and returns the updated state.
 * 
 * @param {Object} task - The completed task
 * @returns {Object} { gamification, newAchievements, leveledUp }
 */
export const awardTaskCompletion = async (task) => {
  const gam = await getGamification();
  const today = getTodayString();

  // ─── Calculate XP reward ────────────────────
  const priority = PRIORITIES.find((p) => p.id === task.priority);
  const xpReward = priority ? priority.xp : 10;

  const oldLevel = calculateLevel(gam.totalXP);

  // ─── Update stats ───────────────────────────
  gam.totalXP += xpReward;
  gam.tasksCompleted += 1;

  // Update completion history
  gam.completionHistory[today] = (gam.completionHistory[today] || 0) + 1;

  // ─── Update daily streak ────────────────────
  if (gam.lastActiveDate !== today) {
    // Check if yesterday was active
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

    if (gam.lastActiveDate === yStr) {
      // Consecutive day → increment streak
      gam.dailyStreak += 1;
    } else if (gam.lastActiveDate !== today) {
      // Streak broken → reset to 1
      gam.dailyStreak = 1;
    }
    gam.lastActiveDate = today;
  }

  // ─── Check new achievements ─────────────────
  const newLevel = calculateLevel(gam.totalXP);
  const leveledUp = newLevel > oldLevel;
  const newAchievements = [];

  ACHIEVEMENTS.forEach((ach) => {
    // Skip already unlocked
    if (gam.unlockedAchievements.includes(ach.id)) return;

    let unlocked = false;

    if (ach.type === 'streak') {
      unlocked = gam.dailyStreak >= ach.requirement;
    } else if (ach.type === 'level') {
      unlocked = newLevel >= ach.requirement;
    } else {
      // Default: task count based
      unlocked = gam.tasksCompleted >= ach.requirement;
    }

    if (unlocked) {
      gam.unlockedAchievements.push(ach.id);
      newAchievements.push(ach);
    }
  });

  // ─── Save updated data ──────────────────────
  await saveGamification(gam);

  return {
    gamification: gam,
    xpReward,
    newAchievements,
    leveledUp,
    newLevel,
  };
};

/**
 * Get the full gamification profile for display.
 * @returns {Object}
 */
export const getGamificationProfile = async () => {
  const gam = await getGamification();
  const level = calculateLevel(gam.totalXP);

  return {
    ...gam,
    level,
    unlockedCount: gam.unlockedAchievements.length,
    totalAchievements: ACHIEVEMENTS.length,
  };
};

/**
 * Check and update daily streak on app open.
 * If user missed a day, reset streak.
 */
export const checkStreak = async () => {
  const gam = await getGamification();
  const today = getTodayString();

  if (gam.lastActiveDate && gam.lastActiveDate !== today) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

    if (gam.lastActiveDate !== yStr && gam.lastActiveDate !== today) {
      // Streak broken
      gam.dailyStreak = 0;
      await saveGamification(gam);
    }
  }

  return gam;
};
