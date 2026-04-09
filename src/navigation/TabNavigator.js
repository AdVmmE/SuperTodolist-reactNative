// ===================================================
// TabNavigator.js - Clean bottom tab navigation
// ===================================================

import React from 'react';
import { Text, StyleSheet, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme } from '../context/ThemeContext';

import HomeScreen from '../screens/HomeScreen';
import AddTaskScreen from '../screens/AddTaskScreen';
import StatsScreen from '../screens/StatsScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

// Clean text-based icons instead of emojis
const TAB_ICONS = {
  Home: '⌂',
  AddTask: '+',
  Stats: '◈',
  Profile: '○',
};

export default function TabNavigator() {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.tabBar,
          borderTopColor: theme.border,
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
          elevation: 0,
        },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.tabInactive,
        tabBarIcon: ({ focused, color }) => {
          const icon = TAB_ICONS[route.name];
          return (
            <View style={focused ? [styles.activeIcon, { backgroundColor: theme.primary + '12' }] : null}>
              <Text style={[styles.tabIcon, { color }]}>{icon}</Text>
            </View>
          );
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: 'Home' }} />
      <Tab.Screen name="AddTask" component={AddTaskScreen} options={{ tabBarLabel: 'Add' }} />
      <Tab.Screen name="Stats" component={StatsScreen} options={{ tabBarLabel: 'Stats' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: 'Profile' }} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabIcon: { fontSize: 22, fontWeight: '600' },
  activeIcon: { paddingHorizontal: 14, paddingVertical: 4, borderRadius: 10 },
});
