// ===================================================
// notificationService.js - Smart notification system
// ===================================================

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NOTIF_SETTINGS_KEY = 'notificationSettings';

// ─── Default notification settings ──────────────
const DEFAULT_SETTINGS = {
  enabled: true,
  dailyReminder: true,       // "You have X tasks today"
  streakReminder: true,       // "Don't break your streak!"
  achievementAlerts: true,    // "Achievement unlocked!"
  focusReminder: true,        // Remind to focus after idle
  dailyReminderHour: 9,       // 9 AM
  dailyReminderMinute: 0,
};

// ─── Configure notification behavior ────────────
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// ─── Permission ─────────────────────────────────

/**
 * Request notification permissions (Android + iOS).
 * @returns {boolean} Whether permission was granted
 */
export const requestPermissions = async () => {
  if (!Device.isDevice) {
    // Emulator — permissions not fully supported but won't crash
    return true;
  }

  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;

  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Smart ToDo',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      sound: true,
    });
  }

  return finalStatus === 'granted';
};

// ─── Settings ───────────────────────────────────

/** Get notification settings */
export const getNotifSettings = async () => {
  try {
    const data = await AsyncStorage.getItem(NOTIF_SETTINGS_KEY);
    return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : { ...DEFAULT_SETTINGS };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
};

/** Save notification settings */
export const saveNotifSettings = async (settings) => {
  try {
    await AsyncStorage.setItem(NOTIF_SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save notification settings:', e);
  }
};

// ─── Schedule Notifications ─────────────────────

/**
 * Schedule the daily task reminder.
 * Fires every day at the configured hour.
 */
export const scheduleDailyReminder = async (taskCount = 0) => {
  const settings = await getNotifSettings();
  if (!settings.enabled || !settings.dailyReminder) return;

  // Cancel existing daily reminders first
  await cancelNotificationsByTag('daily-reminder');

  const message = taskCount > 0
    ? `You have ${taskCount} tasks today. Let's get productive!`
    : 'Start your day right — add some tasks and earn XP!';

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Smart ToDo',
      body: message,
      data: { type: 'daily-reminder' },
      sound: true,
    },
    trigger: {
      hour: settings.dailyReminderHour,
      minute: settings.dailyReminderMinute,
      repeats: true,
    },
  });
};

/**
 * Schedule a streak reminder for the evening
 * if the user hasn't completed any tasks today.
 */
export const scheduleStreakReminder = async (streak) => {
  const settings = await getNotifSettings();
  if (!settings.enabled || !settings.streakReminder || streak < 1) return;

  await cancelNotificationsByTag('streak-reminder');

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Don\'t break your streak!',
      body: `You're on a ${streak}-day streak. Complete at least one task today!`,
      data: { type: 'streak-reminder' },
      sound: true,
    },
    trigger: {
      seconds: 6 * 60 * 60, // 6 hours from now
    },
  });
};

/**
 * Send an immediate notification for achievement unlock.
 */
export const notifyAchievement = async (achievementTitle) => {
  const settings = await getNotifSettings();
  if (!settings.enabled || !settings.achievementAlerts) return;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Achievement Unlocked!',
      body: `${achievementTitle} — Keep up the great work!`,
      data: { type: 'achievement' },
      sound: true,
    },
    trigger: null, // Immediate
  });
};

/**
 * Schedule a focus reminder after a period of inactivity.
 */
export const scheduleFocusReminder = async () => {
  const settings = await getNotifSettings();
  if (!settings.enabled || !settings.focusReminder) return;

  await cancelNotificationsByTag('focus-reminder');

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Time to focus!',
      body: 'You haven\'t completed a task in a while. Open the app and crush it!',
      data: { type: 'focus-reminder' },
      sound: true,
    },
    trigger: {
      seconds: 3 * 60 * 60, // 3 hours from now
    },
  });
};

/**
 * Send a focus session completion notification.
 */
export const notifyFocusComplete = async (taskTitle, bonusXP) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Focus session complete!',
      body: `"${taskTitle}" — ${bonusXP} bonus XP earned. Great focus!`,
      data: { type: 'focus-complete' },
      sound: true,
    },
    trigger: null,
  });
};

// ─── Cancel helpers ─────────────────────────────

/** Cancel all notifications with a specific type tag */
const cancelNotificationsByTag = async (tag) => {
  const all = await Notifications.getAllScheduledNotificationsAsync();
  for (const notif of all) {
    if (notif.content.data?.type === tag) {
      await Notifications.cancelScheduledNotificationAsync(notif.identifier);
    }
  }
};

/** Cancel all scheduled notifications */
export const cancelAllNotifications = async () => {
  await Notifications.cancelAllScheduledNotificationsAsync();
};
