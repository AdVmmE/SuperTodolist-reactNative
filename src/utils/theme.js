// ===================================================
// theme.js - Light & Dark theme definitions
// ===================================================

export const lightTheme = {
  background: '#F0F2F5',
  surface: '#FFFFFF',
  surfaceSecondary: '#F8FAFC',
  card: '#FFFFFF',
  text: '#1A1D26',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  primary: '#6C5CE7',       // Purple
  primaryLight: '#A29BFE',
  primaryDark: '#5A4BD1',
  accent: '#00CEC9',        // Teal
  success: '#00B894',
  warning: '#FDCB6E',
  danger: '#FF6B6B',
  info: '#74B9FF',
  border: '#E5E7EB',
  divider: '#F1F5F9',
  shadow: '#000',
  tabBar: '#FFFFFF',
  tabInactive: '#9CA3AF',
  gradientStart: '#6C5CE7',
  gradientEnd: '#A29BFE',
  inputBg: '#F3F4F6',
  inputBorder: '#E5E7EB',
  placeholder: '#9CA3AF',
  overlay: 'rgba(0,0,0,0.05)',
  xpBar: '#6C5CE7',
  xpBarBg: '#E5E7EB',
};

export const darkTheme = {
  background: '#0D1117',
  surface: '#161B22',
  surfaceSecondary: '#1C2333',
  card: '#161B22',
  text: '#E6EDF3',
  textSecondary: '#8B949E',
  textMuted: '#6E7681',
  primary: '#A29BFE',        // Brighter purple for dark
  primaryLight: '#C4B5FD',
  primaryDark: '#6C5CE7',
  accent: '#00CEC9',
  success: '#55EFC4',
  warning: '#FFEAA7',
  danger: '#FF7979',
  info: '#74B9FF',
  border: '#30363D',
  divider: '#21262D',
  shadow: '#000',
  tabBar: '#161B22',
  tabInactive: '#6E7681',
  gradientStart: '#6C5CE7',
  gradientEnd: '#A29BFE',
  inputBg: '#1C2333',
  inputBorder: '#30363D',
  placeholder: '#6E7681',
  overlay: 'rgba(255,255,255,0.03)',
  xpBar: '#A29BFE',
  xpBarBg: '#30363D',
};

export const getTheme = (isDark) => isDark ? darkTheme : lightTheme;
