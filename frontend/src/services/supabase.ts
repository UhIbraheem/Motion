import { createClient } from '@supabase/supabase-js';
import { ENV } from '../utils/env';

// Determine if we're using mock mode (no real Supabase)
const IS_MOCK_MODE = ENV.supabaseUrl.includes('example.supabase.co');

// Create the Supabase client
export const supabase = createClient(
  ENV.supabaseUrl,
  ENV.supabaseAnonKey
);

// Log mock mode status
if (__DEV__) {
  console.log('Supabase client initialized in', IS_MOCK_MODE ? 'MOCK MODE' : 'PRODUCTION MODE');
}

// Helper functions for auth with mock support
export const signUp = async (email: string, password: string) => {
  if (IS_MOCK_MODE) {
    console.log('MOCK: Sign up', { email, password });
    return { 
      data: { user: { id: 'mock-user-id', email }, session: null },
      error: null 
    };
  }
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  return { data, error };
};

export const signIn = async (email: string, password: string) => {
  if (IS_MOCK_MODE) {
    console.log('MOCK: Sign in', { email, password });
    return { 
      data: { 
        user: { id: 'mock-user-id', email },
        session: { access_token: 'mock-token', expires_at: Date.now() + 3600000 }
      },
      error: null 
    };
  }
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

export const signOut = async () => {
  if (IS_MOCK_MODE) {
    console.log('MOCK: Sign out');
    return { error: null };
  }
  
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async () => {
  if (IS_MOCK_MODE) {
    console.log('MOCK: Get current user');
    // Return null to simulate not logged in
    return { user: null, error: null };
  }
  
  const { data, error } = await supabase.auth.getUser();
  return { user: data.user, error };
};