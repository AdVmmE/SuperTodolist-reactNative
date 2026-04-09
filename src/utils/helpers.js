// ===================================================
// helpers.js - Utility functions for Smart ToDo
// ===================================================

import { DAY_NAMES, MONTH_NAMES, XP_PER_LEVEL } from './constants';

// ─── Unique ID Generator ────────────────────────
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
};

// ─── Date Helpers ───────────────────────────────

/** Get today as YYYY-MM-DD */
export const getTodayString = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

/** Format date string to "Apr 8, 2026" */
export const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  return `${MONTH_NAMES[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
};

/** Get greeting based on time of day */
export const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
};

/** Get current time period for insights */
export const getTimePeriod = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
};

/** Check if date string is today */
export const isToday = (dateStr) => dateStr === getTodayString();

/** Get day name from date string */
export const getDayName = (dateStr) => DAY_NAMES[new Date(dateStr).getDay()];

// ─── Smart Task Parsing ─────────────────────────
/**
 * Parse natural language input like:
 *   "Study ML 2h"       → { title: "Study ML", duration: "2h" }
 *   "Read book 30m"     → { title: "Read book", duration: "30m" }
 *   "Workout 1.5h"      → { title: "Workout", duration: "1.5h" }
 *   "Buy groceries"     → { title: "Buy groceries", duration: null }
 * 
 * @param {string} input - raw user input
 * @returns {{ title: string, duration: string|null, durationMinutes: number|null }}
 */
export const parseTaskInput = (input) => {
  const trimmed = input.trim();

  // Regex: match a duration pattern at the end (e.g. 2h, 30m, 1.5h, 1h30m)
  const durationRegex = /\s+(\d+(?:\.\d+)?)\s*(h|hr|hrs|hour|hours|m|min|mins|minute|minutes)$/i;
  const compoundRegex = /\s+(\d+)\s*h\s*(\d+)\s*m$/i;

  // Try compound format first: "1h30m"
  const compoundMatch = trimmed.match(compoundRegex);
  if (compoundMatch) {
    const hours = parseInt(compoundMatch[1], 10);
    const mins = parseInt(compoundMatch[2], 10);
    const totalMinutes = hours * 60 + mins;
    const title = trimmed.replace(compoundRegex, '').trim();
    return {
      title: title || trimmed,
      duration: `${hours}h${mins}m`,
      durationMinutes: totalMinutes,
    };
  }

  // Try simple format: "2h" or "30m"
  const simpleMatch = trimmed.match(durationRegex);
  if (simpleMatch) {
    const value = parseFloat(simpleMatch[1]);
    const unit = simpleMatch[2].toLowerCase();
    const isHours = unit.startsWith('h');
    const durationMinutes = isHours ? Math.round(value * 60) : Math.round(value);
    const durationStr = isHours ? `${value}h` : `${Math.round(value)}m`;
    const title = trimmed.replace(durationRegex, '').trim();
    return {
      title: title || trimmed,
      duration: durationStr,
      durationMinutes,
    };
  }

  // No duration found
  return {
    title: trimmed,
    duration: null,
    durationMinutes: null,
  };
};

// ─── XP & Level Calculations ────────────────────

/** Calculate level from total XP */
export const calculateLevel = (totalXP) => {
  return Math.floor(totalXP / XP_PER_LEVEL) + 1;
};

/** Calculate XP within current level (progress to next) */
export const getXPInCurrentLevel = (totalXP) => {
  return totalXP % XP_PER_LEVEL;
};

/** Calculate XP needed for next level */
export const getXPToNextLevel = (totalXP) => {
  return XP_PER_LEVEL - (totalXP % XP_PER_LEVEL);
};

/** Get level progress as percentage (0-100) */
export const getLevelProgress = (totalXP) => {
  return ((totalXP % XP_PER_LEVEL) / XP_PER_LEVEL) * 100;
};

// ─── Task Statistics ────────────────────────────

/** Calculate completion percentage */
export const getCompletionRate = (tasks) => {
  if (tasks.length === 0) return 0;
  const completed = tasks.filter((t) => t.completed).length;
  return Math.round((completed / tasks.length) * 100);
};

/** Count tasks completed today */
export const getCompletedToday = (tasks) => {
  const today = getTodayString();
  return tasks.filter((t) => t.completed && t.completedDate === today).length;
};

/** Get tasks due today (not completed) */
export const getTodayTasks = (tasks) => {
  const today = getTodayString();
  return tasks.filter((t) => t.date === today);
};

/** Get total duration of tasks in minutes */
export const getTotalDuration = (tasks) => {
  return tasks.reduce((sum, t) => sum + (t.durationMinutes || 0), 0);
};

/** Format minutes to "Xh Ym" */
export const formatDuration = (minutes) => {
  if (!minutes || minutes === 0) return '—';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
};

/** Get weekly completion data for chart */
export const getWeeklyData = (tasks) => {
  const data = [0, 0, 0, 0, 0, 0, 0]; // Sun-Sat
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);

  tasks.forEach((t) => {
    if (t.completed && t.completedDate) {
      const d = new Date(t.completedDate);
      if (d >= weekStart) {
        data[d.getDay()]++;
      }
    }
  });

  return data;
};
