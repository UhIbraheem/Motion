// src/services/supabase.ts - FIXED SUPABASE INTEGRATION
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

// Get environment variables from Expo config
const supabaseUrl = Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_URL || 'https://example.supabase.co';
const supabaseAnonKey = Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';

// Log the values for debugging
console.log('🔧 Supabase Config:', {
  url: supabaseUrl,
  hasKey: !!supabaseAnonKey && supabaseAnonKey !== 'your-anon-key'
});

// Create Supabase client
export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);

// Database type definitions
export interface Profile {
  id: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  dietary_restrictions?: string[];
  favorite_categories?: string[];
  budget_preference?: 'budget' | 'moderate' | 'premium';
  energy_preference?: 'low' | 'moderate' | 'high' | 'flexible';
  created_at?: string;
  updated_at?: string;
}

export interface Adventure {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  duration_hours?: number;
  estimated_cost?: number;
  difficulty_level?: 'easy' | 'moderate' | 'challenging';
  steps?: any[];
  filters_used?: any;
  is_completed?: boolean;
  is_favorite?: boolean;
  ai_confidence_score?: number;
  created_at?: string;
  updated_at?: string;
}

// Helper functions
export const signUp = async (email: string, password: string, firstName?: string, lastName?: string) => {
  console.log('🔐 Attempting signup:', email);
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName,
      },
    },
  });
  
  if (error) {
    console.error('❌ Signup error:', error);
  } else {
    console.log('✅ Signup success:', data.user?.email);
  }
  
  return { data, error };
};

export const signIn = async (email: string, password: string) => {
  console.log('🔐 Attempting signin:', email);
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) {
    console.error('❌ Signin error:', error);
  } else {
    console.log('✅ Signin success:', data.user?.email);
  }
  
  return { data, error };
};

export const signOut = async () => {
  console.log('🔐 Attempting signout');
  
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    console.error('❌ Signout error:', error);
  } else {
    console.log('✅ Signout success');
  }
  
  return { error };
};

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error };
};

export const getCurrentSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  return { session, error };
};

// Profile functions
export const getProfile = async (userId: string): Promise<{ data: Profile | null; error: any }> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  return { data, error };
};

export const updateProfile = async (userId: string, updates: Partial<Profile>) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
  
  return { data, error };
};

// Adventure functions
export const getUserAdventures = async (userId: string) => {
  const { data, error } = await supabase
    .from('adventures')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  return { data, error };
};

export const createAdventure = async (adventure: Omit<Adventure, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('adventures')
    .insert([adventure])
    .select()
    .single();
  
  return { data, error };
};

export const updateAdventure = async (adventureId: string, updates: Partial<Adventure>) => {
  const { data, error } = await supabase
    .from('adventures')
    .update(updates)
    .eq('id', adventureId)
    .select()
    .single();
  
  return { data, error };
};

export const deleteAdventure = async (adventureId: string) => {
  const { error } = await supabase
    .from('adventures')
    .delete()
    .eq('id', adventureId);
  
  return { error };
};