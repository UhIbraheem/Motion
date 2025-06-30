// frontend/src/utils/env.ts - SIMPLE VERSION
import Constants from 'expo-constants';

// Simple, reliable environment setup
export const ENV = {
  supabaseUrl: Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_URL || 'https://example.supabase.co',
  supabaseAnonKey: Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'key',
};

// For development debugging
if (__DEV__) {
  console.log('🔧 Simple env loaded');
  console.log('🔧 Supabase URL:', ENV.supabaseUrl.substring(0, 30) + '...');
}