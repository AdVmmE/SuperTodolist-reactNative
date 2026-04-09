// ===================================================
// storageService.js - AsyncStorage wrapper for Smart ToDo
// ===================================================

import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../utils/constants';

// ─── User Authentication ────────────────────────

/** Save user to storage (register) */
export const saveUser = async (user) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
  } catch (e) {
    console.error('Error saving user:', e);
  }
};

/** Get stored user */
export const getUser = async () => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    return null;
  }
};

/** Set login token */
export const setToken = async (token) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.USER_TOKEN, token);
  } catch (e) {
    console.error('Error setting token:', e);
  }
};

/** Get login token */
export const getToken = async () => {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.USER_TOKEN);
  } catch (e) {
    return null;
  }
};

/** Remove token (logout) */
export const removeToken = async () => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.USER_TOKEN);
  } catch (e) {
    console.error('Error removing token:', e);
  }
};

// ─── Task CRUD ──────────────────────────────────

/** Get all tasks */
export const getTasks = async () => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.TASKS);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Error getting tasks:', e);
    return [];
  }
};

/** Save all tasks */
export const saveTasks = async (tasks) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  } catch (e) {
    console.error('Error saving tasks:', e);
  }
};

/** Add a single task (inserts at beginning) */
export const addTask = async (task) => {
  const tasks = await getTasks();
  tasks.unshift(task);
  await saveTasks(tasks);
  return tasks;
};

/** Update a task by ID */
export const updateTask = async (id, updates) => {
  const tasks = await getTasks();
  const index = tasks.findIndex((t) => t.id === id);
  if (index !== -1) {
    tasks[index] = { ...tasks[index], ...updates };
  }
  await saveTasks(tasks);
  return tasks;
};

/** Delete a task by ID */
export const deleteTask = async (id) => {
  const tasks = await getTasks();
  const filtered = tasks.filter((t) => t.id !== id);
  await saveTasks(filtered);
  return filtered;
};

// ─── Gamification Data ──────────────────────────

/** Default gamification state */
const DEFAULT_GAMIFICATION = {
  totalXP: 0,
  tasksCompleted: 0,
  dailyStreak: 0,
  lastActiveDate: null,
  unlockedAchievements: [],
  completionHistory: {}, // { "2026-04-08": 5, ... }
};

/** Get gamification data */
export const getGamification = async () => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.GAMIFICATION);
    return data ? JSON.parse(data) : { ...DEFAULT_GAMIFICATION };
  } catch (e) {
    return { ...DEFAULT_GAMIFICATION };
  }
};

/** Save gamification data */
export const saveGamification = async (data) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.GAMIFICATION, JSON.stringify(data));
  } catch (e) {
    console.error('Error saving gamification:', e);
  }
};

// ─── Dark Mode ──────────────────────────────────

/** Get dark mode preference */
export const getDarkMode = async () => {
  try {
    const val = await AsyncStorage.getItem(STORAGE_KEYS.DARK_MODE);
    return val === 'true';
  } catch (e) {
    return false;
  }
};

/** Save dark mode preference */
export const saveDarkMode = async (isDark) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.DARK_MODE, isDark.toString());
  } catch (e) {
    console.error('Error saving dark mode:', e);
  }
};

// ─── Clear All ──────────────────────────────────

/** Reset all app data */
export const clearAllData = async () => {
  try {
    await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
  } catch (e) {
    console.error('Error clearing data:', e);
  }
};
