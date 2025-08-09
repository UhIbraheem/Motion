// app.config.js - Universal Deep Linking
import 'dotenv/config';

export default {
  expo: {
    name: "Motion",
    slug: "motion-app",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "automatic",
    scheme: "motionapp", // Custom scheme for production
    splash: {
      image: "./assets/icon.png",
      resizeMode: "contain",
      backgroundColor: "#f8f2d5"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.motion.app" // Required for deep linking
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/icon.png",
        backgroundColor: "#f8f2d5"
      },
      package: "com.motion.app" // Required for deep linking
    },
    web: {
      favicon: "./assets/favicon.ico"
    },
    extra: {
      EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
      EXPO_PUBLIC_SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL,
  EXPO_PUBLIC_SKIP_STORAGE_SETUP: process.env.EXPO_PUBLIC_SKIP_STORAGE_SETUP,
  EXPO_PUBLIC_USE_LEGACY_EXPO_AUTH: process.env.EXPO_PUBLIC_USE_LEGACY_EXPO_AUTH,
    }
  }
};