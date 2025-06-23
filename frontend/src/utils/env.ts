import Constants from 'expo-constants';

// Access environment variables with defaults
export const ENV = {
  apiUrl: Constants.expoConfig?.extra?.EXPO_PUBLIC_API_URL || 'https://api.example.com',
  supabaseUrl: Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_URL || 'https://example.supabase.co',
  supabaseAnonKey: Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.example',
};

// For development debugging
if (__DEV__) {
  console.log('Environment variables:', ENV);
}