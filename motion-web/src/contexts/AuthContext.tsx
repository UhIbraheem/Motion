'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface User {
  id: string;
  email: string;
  fullName?: string;
  subscriptionTier: 'free' | 'explorer' | 'pro';
  generationsUsed: number;
  editsUsed: number;
  generationsLimit: number;
  editsLimit: number;
  subscriptionStatus: 'active' | 'inactive' | 'canceled';
  subscriptionExpiresAt?: string;
  lastResetDate?: string;
  name?: string; // For compatibility with Navigation component
  profilePictureUrl?: string; // Add profile picture URL
  firstName?: string;
  lastName?: string;
}

export interface SignUpData {
  email: string;
  password: string;
  fullName: string;
  name?: string; // For compatibility
}

export interface SignInData {
  email: string;
  password: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (data: SignInData) => Promise<{ success: boolean; error?: string }>;
  signUp: (data: SignUpData) => Promise<{ success: boolean; error?: string }>;
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  linkGoogle: () => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  hasPermission: (feature: string) => boolean;
  refreshUser: () => Promise<void>;
  canGenerate: () => boolean;
  canEdit: () => boolean;
  decrementGeneration: () => Promise<void>;
  decrementEdit: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);

  // Handle hydration
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Initialize auth state on mount
  useEffect(() => {
    if (isHydrated) {
  // Safety timeout to avoid indefinite loading if callbacks stall
  const failSafe = setTimeout(() => setLoading(false), 4000);
      initializeAuth();
      
      // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('🔐 Auth state change:', event, session?.user?.email);
        
        if (event === 'SIGNED_IN' && session) {
          console.log('🔐 User signed in, fetching profile...');
      await fetchUserProfile(session.user.id);
      setLoading(false);
        } else if (event === 'SIGNED_OUT') {
          console.log('🔐 User signed out');
          setUser(null);
          setLoading(false);
        } else if (event === 'TOKEN_REFRESHED' && session) {
          console.log('🔐 Token refreshed, updating profile...');
      await fetchUserProfile(session.user.id);
      setLoading(false);
        } else if (event === 'INITIAL_SESSION' && session) {
          console.log('🔐 Initial session found, fetching profile...');
      await fetchUserProfile(session.user.id);
      setLoading(false);
        }
      });

      return () => {
        clearTimeout(failSafe);
        subscription.unsubscribe();
      };
    }
  }, [isHydrated]);

  const initializeAuth = async () => {
    try {
      setLoading(true);
      
      // Check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        await fetchUserProfile(session.user.id);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('👤 Fetching user profile for:', userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      console.log('👤 Profile query result:', { 
        data: data ? 'Profile found' : 'No profile', 
        error: error?.message 
      });

      if (error) {
        console.error('Error fetching user profile:', error);
        // If profile doesn't exist, create a basic one
        if (error.code === 'PGRST116') {
          console.log('👤 Profile not found, creating basic profile...');
          
          // Get user email from auth
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            await createUserProfile(user, user.user_metadata?.full_name || user.email?.split('@')[0] || 'User');
            // Try fetching again
            const { data: newData, error: newError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', userId)
              .single();
            
            if (newData && !newError) {
              setUser({
                id: newData.id,
                email: user.email || '',
                fullName: newData.display_name || `${newData.first_name || ''} ${newData.last_name || ''}`.trim(),
                name: newData.display_name || `${newData.first_name || ''} ${newData.last_name || ''}`.trim(),
                firstName: newData.first_name,
                lastName: newData.last_name,
                profilePictureUrl: newData.profile_picture_url,
                subscriptionTier: newData.membership_tier || 'free',
                generationsUsed: newData.monthly_generations || 0,
                editsUsed: newData.monthly_edits || 0,
                generationsLimit: newData.generations_limit || 10,
                editsLimit: newData.edits_limit || 3,
                subscriptionStatus: newData.subscription_status || 'active',
                subscriptionExpiresAt: newData.subscription_period_end,
                lastResetDate: newData.last_reset_date,
              });
            }
          }
        }
        return;
      }

      if (data) {
        console.log('👤 Setting user profile');
        
        // Get user email from auth since it might not be in profiles table
        const { data: { user } } = await supabase.auth.getUser();
        
        setUser({
          id: data.id,
          email: user?.email || data.email || '',
          fullName: data.display_name || `${data.first_name || ''} ${data.last_name || ''}`.trim(),
          name: data.display_name || `${data.first_name || ''} ${data.last_name || ''}`.trim(),
          firstName: data.first_name,
          lastName: data.last_name,
          profilePictureUrl: data.profile_picture_url,
          subscriptionTier: data.membership_tier || 'free',
          generationsUsed: data.monthly_generations || 0,
          editsUsed: data.monthly_edits || 0,
          generationsLimit: data.generations_limit || 10,
          editsLimit: data.edits_limit || 3,
          subscriptionStatus: data.subscription_status || 'active',
          subscriptionExpiresAt: data.subscription_period_end,
          lastResetDate: data.last_reset_date,
        });
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const createUserProfile = async (authUser: any, fullName?: string) => {
    try {
      // Extract name from Google metadata if available
      const googleName = authUser.user_metadata?.full_name || authUser.user_metadata?.name;
      const googleFirstName = authUser.user_metadata?.given_name;
      const googleLastName = authUser.user_metadata?.family_name;
      const profilePicture = authUser.user_metadata?.avatar_url || authUser.user_metadata?.picture;
      
      const displayName = fullName || googleName || authUser.email?.split('@')[0] || 'User';
      const firstName = googleFirstName || fullName?.split(' ')[0] || displayName.split(' ')[0] || '';
      const lastName = googleLastName || fullName?.split(' ').slice(1).join(' ') || displayName.split(' ').slice(1).join(' ') || '';

      console.log('👤 Creating profile with Google data:', {
        displayName,
        firstName,
        lastName,
        profilePicture,
        email: authUser.email
      });

      const { data, error } = await supabase
        .from('profiles')
        .insert([
          {
            id: authUser.id,
            first_name: firstName,
            last_name: lastName,
            display_name: displayName,
            profile_picture_url: profilePicture,
            membership_tier: 'free',
            monthly_generations: 0,
            monthly_edits: 0,
            generations_limit: 10,
            edits_limit: 3,
            subscription_status: 'active',
            last_reset_date: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) throw error;
      console.log('✅ Profile created successfully');
      return data;
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
  };

  const signIn = async (data: SignInData): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    try {
      console.log('🔐 Attempting sign in with:', { email: data.email });
      
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      console.log('🔐 Supabase auth response:', { 
        user: authData.user?.email, 
        session: !!authData.session,
        error: error?.message 
      });

      if (error) {
        console.error('Supabase sign in error:', error);
        // Map common Supabase errors to user-friendly messages
        let errorMessage = error.message;
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Invalid email or password. Please check your credentials and try again.';
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Please check your email and click the confirmation link before signing in.';
        } else if (error.message.includes('Too many requests')) {
          errorMessage = 'Too many failed attempts. Please wait a moment before trying again.';
        }
        return { success: false, error: errorMessage };
      }

      if (authData.user) {
        console.log('🔐 User authenticated, fetching profile...');
        await fetchUserProfile(authData.user.id);
        console.log('🔐 Sign in complete');
        return { success: true };
      }

      return { success: false, error: 'Sign in failed - no user returned' };
    } catch (error: any) {
      console.error('Unexpected sign in error:', error);
      return { 
        success: false, 
        error: error.message || 'An unexpected error occurred. Please try again.' 
      };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (data: SignUpData): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    try {
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      });

      if (error) throw error;

      if (authData.user) {
        // Create user profile
        await createUserProfile(authData.user, data.fullName);
        await fetchUserProfile(authData.user.id);
        return { success: true };
      }

      return { success: false, error: 'Sign up failed' };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message || 'Sign up failed' 
      };
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('🔐 Starting Google OAuth...');

      // Always use our same-origin callback to avoid prod redirect
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || (typeof window !== 'undefined' ? window.location.origin : '');
  const redirectTo = `${siteUrl}/auth/callback`;
      
      console.log('🔐 OAuth redirect URL:', redirectTo);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account',
            response_type: 'code'
          },
          skipBrowserRedirect: false,
        },
      });

      if (error) {
        console.error('Google OAuth error:', error);
        setLoading(false);
        throw error;
      }

      return { success: true };
    } catch (error: any) {
      setLoading(false);
      return {
        success: false,
        error: error.message || 'Google sign in failed',
      };
    }
  };

  const linkGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    try {
  const siteUrl2 = process.env.NEXT_PUBLIC_SITE_URL || (typeof window !== 'undefined' ? window.location.origin : '');
  const redirectTo = `${siteUrl2}/auth/callback`;
      // linkIdentity is available in newer supabase-js; cast to any to call
      const { data, error } = await (supabase.auth as any).linkIdentity({
        provider: 'google',
        options: { redirectTo },
      });

      if (error) return { success: false, error: error.message };

      if (data?.url) {
        window.location.href = data.url;
      }

      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Failed to link Google' };
    }
  };

  const signOut = async (): Promise<void> => {
    setLoading(true);

    try {
      console.log('🔐 [Sign Out] ═══════════════════════════════════');
      console.log('🔐 [Sign Out] Starting sign out process...');

      // Step 1: Call Supabase signOut
      console.log('🔐 [Sign Out] Step 1: Calling supabase.auth.signOut()');
      const { error: signOutError } = await supabase.auth.signOut();

      if (signOutError) {
        console.error('🔐 [Sign Out] ❌ Sign out error:', signOutError);
        // Continue with cleanup even if signOut fails
      } else {
        console.log('🔐 [Sign Out] ✅ Supabase signOut successful');
      }

      // Step 2: Aggressively clear ALL storage
      console.log('🔐 [Sign Out] Step 2: Clearing all storage...');
      if (typeof window !== 'undefined') {
        try {
          // Clear all localStorage items related to auth and supabase
          const keysToRemove = [];
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key) keysToRemove.push(key);
          }

          // Remove all keys (or selectively remove supabase/auth keys)
          const authRelatedKeys = keysToRemove.filter(key =>
            key.includes('supabase') ||
            key.includes('auth') ||
            key.includes('token') ||
            key.includes('session') ||
            key === 'motion_auth_complete'
          );

          authRelatedKeys.forEach(key => {
            localStorage.removeItem(key);
            console.log(`🔐 [Sign Out] Removed localStorage key: ${key}`);
          });

          // Clear all sessionStorage
          sessionStorage.clear();
          console.log('🔐 [Sign Out] ✅ Storage cleared');
        } catch (storageError) {
          console.error('🔐 [Sign Out] ⚠️ Storage clearing error:', storageError);
        }
      }

      // Step 3: Verify session is null with retry logic
      console.log('🔐 [Sign Out] Step 3: Verifying session cleared...');
      let sessionCleared = false;
      const maxAttempts = 3;

      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        console.log(`🔐 [Sign Out] Verification attempt ${attempt}/${maxAttempts}`);

        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error(`🔐 [Sign Out] Session check error (attempt ${attempt}):`, error);
        }

        if (!session) {
          console.log('🔐 [Sign Out] ✅ Session confirmed as cleared');
          sessionCleared = true;
          break;
        }

        console.warn(`🔐 [Sign Out] ⚠️ Session still present after attempt ${attempt}`);

        // If session still exists, try signing out again
        if (attempt < maxAttempts) {
          console.log('🔐 [Sign Out] Retrying signOut...');
          await supabase.auth.signOut();

          // Wait before next verification
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      if (!sessionCleared) {
        console.error('🔐 [Sign Out] ❌ Session verification failed after all attempts');
        console.warn('🔐 [Sign Out] Forcing client-side state reset anyway');
      }

      // Step 4: Clear user state
      console.log('🔐 [Sign Out] Step 4: Clearing user state');
      setUser(null);

      console.log('🔐 [Sign Out] ✅ Sign out complete');
      console.log('🔐 [Sign Out] ═══════════════════════════════════');

      // Step 5: Force hard reload to clear any in-memory state
      // Using window.location.href ensures a complete page reload
      if (typeof window !== 'undefined') {
        console.log('🔐 [Sign Out] Redirecting to signin page...');
        // Small delay to ensure console logs are visible
        setTimeout(() => {
          window.location.href = '/auth/signin';
        }, 100);
      }

    } catch (error) {
      console.error('🔐 [Sign Out] ❌ Unexpected sign out error:', {
        message: (error as Error)?.message,
        name: (error as Error)?.name,
        stack: (error as Error)?.stack
      });

      // Emergency cleanup - force everything
      console.log('🔐 [Sign Out] Performing emergency cleanup...');

      if (typeof window !== 'undefined') {
        try {
          // Nuclear option: clear everything
          localStorage.clear();
          sessionStorage.clear();
          console.log('🔐 [Sign Out] ✅ Emergency cleanup complete');
        } catch (e) {
          console.error('🔐 [Sign Out] ❌ Emergency cleanup failed:', e);
        }
      }

      setUser(null);

      // Still redirect even if there was an error
      if (typeof window !== 'undefined') {
        setTimeout(() => {
          window.location.href = '/auth/signin';
        }, 100);
      }

      throw error; // Re-throw so calling code knows there was an error
    } finally {
      setLoading(false);
    }
  };

  const hasPermission = (feature: string): boolean => {
    if (!user) return false;

    switch (feature) {
      case 'generate_adventure':
        return canGenerate();
      case 'edit_adventure':
        return canEdit();
      case 'premium_features':
        return user.subscriptionTier === 'pro';
      case 'unlimited_generations':
        return user.subscriptionTier === 'explorer' || user.subscriptionTier === 'pro';
      default:
        return false;
    }
  };

  const canGenerate = (): boolean => {
    if (!user) return false;
    
    // Pro and Explorer have unlimited generations
    if (user.subscriptionTier === 'pro' || user.subscriptionTier === 'explorer') {
      return true;
    }
    
    // Free tier has monthly limits
    return user.generationsUsed < user.generationsLimit;
  };

  const canEdit = (): boolean => {
    if (!user) return false;
    
    // Pro and Explorer have unlimited edits
    if (user.subscriptionTier === 'pro' || user.subscriptionTier === 'explorer') {
      return true;
    }
    
    // Free tier has monthly limits
    return user.editsUsed < user.editsLimit;
  };

  const decrementGeneration = async (): Promise<void> => {
    if (!user) return;
    
    // Only decrement for free tier users
    if (user.subscriptionTier === 'free') {
      try {
        const { error } = await supabase
          .from('profiles')
          .update({ monthly_generations: user.generationsUsed + 1 })
          .eq('id', user.id);

        if (error) throw error;

        setUser(prev => prev ? { ...prev, generationsUsed: prev.generationsUsed + 1 } : null);
      } catch (error) {
        console.error('Error updating generations used:', error);
      }
    }
  };

  const decrementEdit = async (): Promise<void> => {
    if (!user) return;
    
    // Only decrement for free tier users
    if (user.subscriptionTier === 'free') {
      try {
        const { error } = await supabase
          .from('profiles')
          .update({ monthly_edits: user.editsUsed + 1 })
          .eq('id', user.id);

        if (error) throw error;

        setUser(prev => prev ? { ...prev, editsUsed: prev.editsUsed + 1 } : null);
      } catch (error) {
        console.error('Error updating edits used:', error);
      }
    }
  };

  const refreshUser = async (): Promise<void> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await fetchUserProfile(session.user.id);
      }
    } catch (error) {
      console.error('Refresh user error:', error);
      await signOut();
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
  linkGoogle,
    signOut,
    hasPermission,
    refreshUser,
    canGenerate,
    canEdit,
    decrementGeneration,
    decrementEdit,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
