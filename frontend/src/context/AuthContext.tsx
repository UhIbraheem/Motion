// src/context/AuthContext.tsx - Universal Deep Linking
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { Alert, Linking, Platform } from 'react-native';
import { supabase, signIn as supabaseSignIn, signUp as supabaseSignUp, signOut as supabaseSignOut } from '../services/supabase';
import type { User, Session } from '@supabase/supabase-js';
import Constants from 'expo-constants';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, firstName?: string, lastName?: string) => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  requestAuth: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Ensure the auth session completes on app resume (prevents stuck Safari/WebView)
WebBrowser.maybeCompleteAuthSession();

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Detect if we're in Expo Go or standalone app
  const isExpoGo = Constants.appOwnership === 'expo';

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔐 Auth event:', event, session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      if (event === 'SIGNED_IN') {
        Alert.alert('Welcome to Motion! 🌊', `Signed in as ${session?.user?.email}`);
      }
    });

    // Universal deep link handler
    const handleDeepLink = async (url: string) => {
      console.log('🔗 Deep link received:', url);
      console.log('📱 Platform:', Platform.OS, isExpoGo ? '(Expo Go)' : '(Standalone)');
      
      // Handle different URL schemes
  const isAuthLink = url.includes('auth/confirm') || 
        url.includes('token_hash') ||
        url.includes('/--/auth/confirm') ||
        url.includes('code='); // OAuth code callback
      
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
          const authCode = params.get('code');
          
          console.log('🔑 Processing confirmation:', { 
            tokenHash: !!tokenHash, 
            type,
            platform: Platform.OS,
            isExpoGo 
          });
          
          // Handle OAuth code exchange
          if (authCode) {
            console.log('🔄 Exchanging OAuth code for session...');
            const { data, error } = await supabase.auth.exchangeCodeForSession(authCode);
            if (error) {
              console.error('❌ OAuth exchange error:', error.message);
              Alert.alert('Google Sign In Failed', error.message);
            } else {
              console.log('✅ OAuth exchange success for', data.user?.email);
            }
            return;
          }

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

  // Resolve the correct OAuth redirect for current runtime
  const getOAuthRedirectUrl = () => {
    const useLegacy = (Constants.expoConfig?.extra as any)?.EXPO_PUBLIC_USE_LEGACY_EXPO_AUTH === 'true';
    const expoProxyRedirect = useLegacy
      ? 'https://auth.expo.io/@uh_ibraheem/motion-app'
      : 'https://auth.expo.dev/@uh_ibraheem/motion-app';
    // In Expo Go/dev, AuthSession.makeRedirectUri() returns an Expo proxy URL
    if (Constants.appOwnership === 'expo') {
      // Prefer explicit Expo proxy URL now that account is known
      return expoProxyRedirect;
    }
    // In standalone/bare apps, use your custom scheme
    return AuthSession.makeRedirectUri({ scheme: 'motionapp', path: 'auth' });
  };

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

  const signInWithGoogle = async () => {
    try {
      // Use Expo proxy in dev (Expo Go), custom scheme in standalone
      const redirectUrl = getOAuthRedirectUrl();
      console.log('🔗 Redirect URL:', redirectUrl);

      // Request the auth URL without automatic redirect
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
          skipBrowserRedirect: true,
        },
      });

      if (error) {
        console.error('❌ Google OAuth error:', error.message);
        Alert.alert('Google Sign In Failed', error.message);
        return { error };
      }

      // Open the auth session manually (more reliable on Expo Go/iOS)
      if (data?.url) {
        const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);
        // The deep link handler and onAuthStateChange will finalize the session
        console.log('🌐 AuthSession result:', result.type);
      }

      return { error: null };
    } catch (error) {
      console.error('❌ Unexpected Google OAuth error:', error);
      Alert.alert('Error', 'Failed to sign in with Google');
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
        signInWithGoogle,
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