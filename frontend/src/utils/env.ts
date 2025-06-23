// src/utils/env.ts - SIMPLIFIED Environment Utils
import Constants from 'expo-constants';

// Access environment variables with proper fallbacks
export const ENV = {
  apiUrl: Constants.expoConfig?.extra?.EXPO_PUBLIC_API_URL || 'http://localhost:3001',
  supabaseUrl: Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_URL || '',
  supabaseAnonKey: Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
};

// For development debugging
if (__DEV__) {
  console.log('📡 Environment variables loaded:', {
    apiUrl: ENV.apiUrl,
    supabaseUrl: ENV.supabaseUrl ? `${ENV.supabaseUrl.substring(0, 20)}...` : 'NOT SET',
    supabaseKey: ENV.supabaseAnonKey ? `${ENV.supabaseAnonKey.substring(0, 20)}...` : 'NOT SET',
  });
  
  // Warn if not configured
  if (!ENV.supabaseUrl || ENV.supabaseUrl === '') {
    console.warn('⚠️ SUPABASE_URL not configured! Auth will not work.');
  }
  if (!ENV.supabaseAnonKey || ENV.supabaseAnonKey === '') {
    console.warn('⚠️ SUPABASE_ANON_KEY not configured! Auth will not work.');
  }
}