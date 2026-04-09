// ===================================================
// ThemeContext.js - Global theme (dark/light) context
// ===================================================

import React, { createContext, useState, useEffect, useContext } from 'react';
import { getTheme } from '../utils/theme';
import { getDarkMode, saveDarkMode } from '../services/storageService';

// Create the context
const ThemeContext = createContext();

/**
 * ThemeProvider wraps the app and provides:
 * - theme: current color palette
 * - isDark: boolean dark mode state
 * - toggleTheme: function to switch modes
 */
export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(false);

  // Load saved preference on mount
  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    const savedDark = await getDarkMode();
    setIsDark(savedDark);
  };

  const toggleTheme = async () => {
    const newValue = !isDark;
    setIsDark(newValue);
    await saveDarkMode(newValue);
  };

  const theme = getTheme(isDark);

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Custom hook to access the theme context
 * @returns {{ theme: Object, isDark: boolean, toggleTheme: Function }}
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
