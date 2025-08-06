// src/context/AuthContext.tsx - Unified Motion Authentication
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MobileAuthService } from '../../../shared/services/AuthServiceNew';

// Use the server IP from backend
const AUTH_SERVICE_URL = 'http://192.168.4.30:5000';

interface User {
  id: string;
  name: string;
  email: string;
  membershipTier: 'explorer' | 'adventurer' | 'curator';
  joinedDate: string;
  avatar?: string;
}

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, name: string, membershipTier?: 'explorer' | 'adventurer' | 'curator') => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  hasPermission: (feature: string) => boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Initialize the mobile auth service
const authService = new MobileAuthService(AUTH_SERVICE_URL, AsyncStorage);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize auth state
    const initializeAuth = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    
    try {
      const result = await authService.signIn(email, password);
      if (result.success && result.user) {
        setUser(result.user);
        Alert.alert('Welcome back! 🌊', `Signed in as ${result.user.name}`);
      }
      setLoading(false);
      return result;
    } catch (error) {
      setLoading(false);
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  const signUp = async (email: string, password: string, name: string, membershipTier: 'explorer' | 'adventurer' | 'curator' = 'explorer') => {
    setLoading(true);
    
    try {
      const result = await authService.signUp({
        name,
        email,
        password,
        membershipTier
      });
      
      if (result.success && result.user) {
        setUser(result.user);
        Alert.alert('Welcome to Motion! 🌊', `Account created for ${result.user.name}`);
      }
      setLoading(false);
      return result;
    } catch (error) {
      setLoading(false);
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  const signOut = async () => {
    try {
      await authService.signOut();
      setUser(null);
      Alert.alert('See you later! 👋', 'You have been signed out');
    } catch (error) {
      console.error('Sign out error:', error);
      setUser(null);
    }
  };

  const hasPermission = (feature: string): boolean => {
    return authService.hasPermission(user, feature);
  };
    const handleDeepLink = async (url: string) => {
      console.log('🔗 Deep link received:', url);
      console.log('📱 Platform:', Platform.OS, isExpoGo ? '(Expo Go)' : '(Standalone)');
      
      // Handle different URL schemes
      const isAuthLink = url.includes('auth/confirm') || 
                        url.includes('token_hash') ||
                        url.includes('/--/auth/confirm');
      
      if (isAuthLink) {
        try {
          // Extract parameters from any URL format
          let params: URLSearchParams;
          
          if (url.includes('?')) {
            const queryString = url.split('?')[1];
            params = new URLSearchParams(queryString);
          } else {
            // Handle malformed URLs
            console.log('⚠️ No query parameters found in URL');
            return;
          }
          
          const tokenHash = params.get('token_hash');
          const type = params.get('type');
          
          console.log('🔑 Processing confirmation:', { 
            tokenHash: !!tokenHash, 
            type,
            platform: Platform.OS,
            isExpoGo 
          });
          
          if (tokenHash && type === 'signup') {
            // Let Supabase handle the confirmation automatically
            Alert.alert(
              'Email Confirmed! ✅', 
              'Your email has been verified. You can now sign in to Motion!',
              [{ text: 'Great!' }]
            );
          }
        } catch (error) {
          console.error('❌ Error processing deep link:', error);
          Alert.alert(
            'Confirmation Error',
            'There was an issue processing your email confirmation. Please try signing in.',
            [{ text: 'OK' }]
          );
        }
      }
    };

    // Listen for incoming links
    const linkingSubscription = Linking.addEventListener('url', ({ url }) => {
      handleDeepLink(url);
    });

    // Check if app was opened with a link
    Linking.getInitialURL().then((url) => {
      if (url) {
        console.log('🚀 App opened with URL:', url);
        handleDeepLink(url);
      }
    });

    return () => {
      subscription.unsubscribe();
      linkingSubscription?.remove();
    };
  }, [isExpoGo]);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabaseSignIn(email, password);
      
      if (error) {
        console.error('❌ Sign in error:', error.message);
        
        // Handle common errors with helpful messages
        if (error.message.includes('Email not confirmed')) {
          Alert.alert(
            'Email Not Confirmed', 
            'Please check your email and click the confirmation link. If you\'re in development, use the Expo Go link in the email.',
            [{ text: 'OK' }]
          );
        } else if (error.message.includes('Invalid login credentials')) {
          Alert.alert(
            'Login Failed', 
            'Invalid email or password. Please check your credentials and try again.',
            [{ text: 'OK' }]
          );
        } else {
          Alert.alert('Login Failed', error.message);
        }
        
        return { error };
      }

      console.log('✅ Sign in successful:', data.user?.email);
      return { error: null };
    } catch (error) {
      console.error('❌ Unexpected sign in error:', error);
      return { error };
    }
  };

  const signUp = async (email: string, password: string, firstName?: string, lastName?: string) => {
    try {
      const { data, error } = await supabaseSignUp(email, password, firstName, lastName);
      
      if (error) {
        console.error('❌ Sign up error:', error.message);
        Alert.alert('Registration Failed', error.message);
        return { error };
      }

      console.log('✅ Sign up successful:', data.user?.email);
      
      // Provide context-specific instructions
      const message = isExpoGo 
        ? 'Please check your email and tap the "Expo Go" confirmation link to verify your account!'
        : 'Please check your email and tap the confirmation link to verify your account!';
      
      Alert.alert(
        'Account Created! 🎉', 
        message,
        [{ text: 'Got it!' }]
      );
      
      return { error: null };
    } catch (error) {
      console.error('❌ Unexpected sign up error:', error);
      return { error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabaseSignOut();
      if (error) {
        console.error('❌ Sign out error:', error);
        Alert.alert('Error', 'Failed to sign out');
      } else {
        console.log('✅ Signed out successfully');
      }
    } catch (error) {
      console.error('❌ Unexpected sign out error:', error);
      Alert.alert('Error', 'Failed to sign out');
    }
  };

  const requestAuth = () => {
    // This function triggers the auth flow by effectively "signing out"
    // which will cause the RootNavigator to show the AuthNavigator
    console.log('🔐 Requesting authentication...');
    setSession(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        loading,
        signIn,
        signUp,
        signOut,
        requestAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};