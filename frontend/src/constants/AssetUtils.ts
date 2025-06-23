// src/utils/AssetUtils.ts - Utility functions for assets
import { Platform } from 'react-native';
import { LOGO_ASSETS, BRAND_COLORS } from '../constants/Assets';

export const getLogoAsset = (variant: 'icon' | 'splash' | 'adaptive' | 'favicon', theme: 'light' | 'dark' = 'light') => {
  const assetMap = {
    icon: theme === 'dark' ? LOGO_ASSETS.iconDark : LOGO_ASSETS.icon,
    splash: theme === 'dark' ? LOGO_ASSETS.splashDark : LOGO_ASSETS.splash,
    adaptive: LOGO_ASSETS.adaptiveIcon,
    favicon: LOGO_ASSETS.favicon,
  };
  
  return assetMap[variant];
};

export const getBrandColor = (colorName: keyof typeof BRAND_COLORS, opacity?: number) => {
  const color = BRAND_COLORS[colorName];
  if (opacity && opacity < 1) {
    // Convert hex to rgba if opacity is provided
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  return color;
};

export const getResponsiveSize = (baseSize: number) => {
  // Adjust sizes based on platform and screen size
  if (Platform.OS === 'ios') {
    return baseSize;
  } else if (Platform.OS === 'android') {
    return baseSize * 0.95; // Slightly smaller on Android
  }
  return baseSize;
};