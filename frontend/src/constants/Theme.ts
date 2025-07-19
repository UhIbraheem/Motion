// src/constants/Theme.ts - Centralized Theme System for Easy Dark Mode Implementation
export interface ThemeColors {
  // Background colors
  background: {
    primary: string;
    secondary: string;
    card: string;
    modal: string;
  };
  
  // Text colors
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    inverse: string;
  };
  
  // Brand colors
  brand: {
    sage: string;
    gold: string;
    sageDark: string;
    goldDark: string;
  };
  
  // Glass/Blur effects
  glass: {
    background: string;
    border: string;
    overlay: string;
    intensity: number;
    tint: 'light' | 'dark';
  };
  
  // Status colors
  status: {
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  
  // Shadow and elevation
  shadow: {
    color: string;
    opacity: number;
  };
}

// Light theme configuration
export const lightTheme: ThemeColors = {
  background: {
    primary: '#f8f9fa',
    secondary: '#ffffff',
    card: 'rgba(255, 255, 255, 0.1)',
    modal: 'rgba(248, 248, 248, 0.85)',
  },
  
  text: {
    primary: '#3c7660',
    secondary: '#666666',
    tertiary: '#999999',
    inverse: '#ffffff',
  },
  
  brand: {
    sage: '#3c7660',
    gold: '#f2cc6c',
    sageDark: '#2d5a47',
    goldDark: '#d4af37',
  },
  
  glass: {
    background: 'rgba(255, 255, 255, 0.1)',
    border: 'rgba(255, 255, 255, 0.2)',
    overlay: 'rgba(248, 248, 248, 0.85)',
    intensity: 15,
    tint: 'light',
  },
  
  status: {
    success: '#10b981',
    warning: '#f2cc6c',
    error: '#ef4444',
    info: '#3b82f6',
  },
  
  shadow: {
    color: '#000000',
    opacity: 0.15,
  },
};

// Dark theme configuration
export const darkTheme: ThemeColors = {
  background: {
    primary: '#000000',        // Pure black background
    secondary: '#1a1a1a',      // Slightly lighter black for cards
    card: 'rgba(255, 255, 255, 0.05)',  // Transparent cards with subtle white
    modal: 'rgba(20, 20, 20, 0.95)',    // Dark modal overlay
  },
  
  text: {
    primary: '#ffffff',        // Pure white text
    secondary: '#cccccc',      // Light gray for secondary text
    tertiary: '#999999',       // Medium gray for tertiary text
    inverse: '#000000',        // Black text for light backgrounds
  },
  
  brand: {
    sage: '#4d987b',          // Keep sage color
    gold: '#f2cc6c',          // Keep gold color
    sageDark: '#3c7660',      // Darker sage variant
    goldDark: '#d4af37',      // Darker gold variant
  },
  
  glass: {
    background: 'rgba(255, 255, 255, 0.08)',  // Subtle white with grey tint
    border: 'rgba(255, 255, 255, 0.15)',      // Slightly more visible border
    overlay: 'rgba(20, 20, 20, 0.95)',        // Dark overlay
    intensity: 25,             // Higher intensity for better blur
    tint: 'dark',
  },
  
  status: {
    success: '#22c55e',       // Keep status colors
    warning: '#f2cc6c',
    error: '#f87171',
    info: '#60a5fa',
  },
  
  shadow: {
    color: '#000000',
    opacity: 0.6,             // Stronger shadows for dark mode
  },
};

// Dynamic theme function - will be used with context
export const getCurrentTheme = (isDark: boolean = false): ThemeColors => {
  return isDark ? darkTheme : lightTheme;
};

// Current theme (fallback for components not using context)
export const currentTheme = lightTheme;

// Common glass styles for consistency - now dynamic
export const getGlassStyles = (theme: ThemeColors) => ({
  card: {
    backgroundColor: theme.glass.background,
    borderWidth: 1,
    borderColor: theme.glass.border,
    shadowColor: theme.shadow.color,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: theme.shadow.opacity,
    shadowRadius: 16,
    elevation: 8,
  },
  
  modal: {
    backgroundColor: theme.glass.overlay,
    borderWidth: 1,
    borderColor: theme.glass.border,
  },
  
  overlay: {
    backgroundColor: theme.glass.overlay,
  },
});

// Static glass styles (fallback)
export const glassStyles = getGlassStyles(currentTheme);

// Typography system
export const typography = {
  hero: {
    fontSize: 36,
    fontWeight: 'bold' as const,
    lineHeight: 44,
  },
  
  title: {
    fontSize: 28,
    fontWeight: 'bold' as const,
    lineHeight: 34,
  },
  
  heading: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    lineHeight: 30,
  },
  
  subheading: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 26,
  },
  
  body: {
    fontSize: 16,
    fontWeight: 'normal' as const,
    lineHeight: 24,
  },
  
  caption: {
    fontSize: 14,
    fontWeight: 'normal' as const,
    lineHeight: 20,
  },
  
  small: {
    fontSize: 12,
    fontWeight: 'normal' as const,
    lineHeight: 16,
  },
};

// Spacing system
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
};

// Border radius system
export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 25,
  round: 9999,
};
