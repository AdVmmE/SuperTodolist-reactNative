// ===================================================
// App.jsx - Root with splash → auth → tabs + focus timer
// ===================================================

import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator, StatusBar } from 'react-native';

import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { getToken } from './src/services/storageService';
import { checkStreak } from './src/services/gamificationService';
import { requestPermissions, scheduleDailyReminder } from './src/services/notificationService';

import SplashScreen from './src/screens/SplashScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import TabNavigator from './src/navigation/TabNavigator';
import FocusTimerScreen from './src/screens/FocusTimerScreen';

const Stack = createNativeStackNavigator();

function AppContent() {
  const { theme, isDark } = useTheme();
  const [showSplash, setShowSplash] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [initialRoute, setInitialRoute] = useState('Login');

  useEffect(() => {
    initApp();
  }, []);

  const initApp = async () => {
    try {
      // Request notification permissions on first launch
      await requestPermissions();

      const token = await getToken();
      if (token) {
        setInitialRoute('MainTabs');
        await checkStreak();
        // Schedule daily reminder
        await scheduleDailyReminder();
      }
    } catch (e) {
      console.log('Init error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background }}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={theme.background} />
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName={initialRoute}
          screenOptions={{ headerShown: false, animation: 'fade', contentStyle: { backgroundColor: theme.background } }}
        >
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="MainTabs" component={TabNavigator} />
          <Stack.Screen
            name="FocusTimer"
            component={FocusTimerScreen}
            options={{ animation: 'slide_from_bottom' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}