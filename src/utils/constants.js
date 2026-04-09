// ===================================================
// constants.js - Smart ToDo app constants (clean)
// ===================================================

export const STORAGE_KEYS = {
  USER_TOKEN: 'userToken',
  USER_DATA: 'userData',
  TASKS: 'tasks',
  DARK_MODE: 'darkMode',
  GAMIFICATION: 'gamification',
  DAILY_STREAK: 'dailyStreak',
  LAST_ACTIVE: 'lastActive',
};

// Priority levels — using colored dots instead of emojis
export const PRIORITIES = [
  { id: 'high', label: 'High', icon: '●', color: '#EF4444', xp: 30 },
  { id: 'medium', label: 'Medium', icon: '●', color: '#F59E0B', xp: 20 },
  { id: 'low', label: 'Low', icon: '●', color: '#10B981', xp: 10 },
];

export const XP_PER_LEVEL = 100;
export const DAILY_FOCUS_COUNT = 3;

// Achievements — keeping minimal icons, mostly text-driven
export const ACHIEVEMENTS = [
  { id: 'first_task', title: 'First Step', desc: 'Complete your first task', icon: '★', requirement: 1 },
  { id: 'five_tasks', title: 'Getting Started', desc: 'Complete 5 tasks', icon: '★', requirement: 5 },
  { id: 'ten_tasks', title: 'Productive', desc: 'Complete 10 tasks', icon: '★', requirement: 10 },
  { id: 'twenty_five', title: 'On Fire', desc: 'Complete 25 tasks', icon: '★', requirement: 25 },
  { id: 'fifty_tasks', title: 'Task Master', desc: 'Complete 50 tasks', icon: '★', requirement: 50 },
  { id: 'hundred_tasks', title: 'Legend', desc: 'Complete 100 tasks', icon: '★', requirement: 100 },
  { id: 'streak_3', title: '3-Day Streak', desc: 'Stay active 3 days in a row', icon: '◆', requirement: 3, type: 'streak' },
  { id: 'streak_7', title: 'Week Warrior', desc: '7-day daily streak', icon: '◆', requirement: 7, type: 'streak' },
  { id: 'level_5', title: 'Rising Star', desc: 'Reach level 5', icon: '▲', requirement: 5, type: 'level' },
  { id: 'level_10', title: 'Superstar', desc: 'Reach level 10', icon: '▲', requirement: 10, type: 'level' },
];

export const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];
