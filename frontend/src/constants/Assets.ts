// src/constants/Assets.ts - Asset management
export const LOGO_ASSETS = {
  // For Expo/React Native Image components
  icon: require('../../assets/icon.png'),
  splash: require('../../assets/splash.png'),
  adaptiveIcon: require('../../assets/adaptive-icon.png'),
  favicon: require('../../assets/favicon.png'),
  
  // For dark mode variants
  iconDark: require('../../assets/icon-dark.png'),
  splashDark: require('../../assets/splash-dark.png'),
} as const;

// Brand colors for consistency
export const BRAND_COLORS = {
  sage: '#3c7660',      // Primary buttons, headers
  gold: '#f2cc6c',      // Accents, CTAs, highlights  
  cream: '#f8f2d5',     // Background, light sections
  light: '#f6dc9b',     // Subtle backgrounds
  teal: '#4d987b',      // Secondary actions, links
  
  // Dark mode variants
  sageDark: '#2a5245',
  tealDark: '#3a7361',
  
  // Text colors
  textPrimary: '#333333',
  textSecondary: '#666666',
  textLight: '#FFFFFF',
} as const;

// Typography scale
export const TYPOGRAPHY = {
  fontSizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
  },
  fontWeights: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
  lineHeights: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const;