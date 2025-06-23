import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';

// Mock types to match Supabase
type User = {
  id: string;
  email: string;
} | null;

type Session = {
  access_token: string;
  expires_at: number;
} | null;

type AuthContextType = {
  session: Session;
  user: User;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{
    error: Error | null;
  }>;
  signUp: (email: string, password: string) => Promise<{
    error: Error | null;
  }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Simple storage key
const AUTH_STORAGE_KEY = 'motion_auth_state';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session>(null);
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);

  // Load saved state on startup
  useEffect(() => {
    const loadAuthState = async () => {
      try {
        // In a real app, use AsyncStorage here
        const savedUser = { id: 'temp-user-123', email: 'demo@example.com' };
        const savedSession = null; // Start logged out for testing
        
        setUser(savedSession ? savedUser : null);
        setSession(savedSession);
      } catch (error) {
        console.error('Failed to load auth state', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadAuthState();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Development mode sign in:', email, password);
      
      // Simulate successful login
      const mockUser = { id: 'user-123', email };
      const mockSession = { 
        access_token: 'mock-token-' + Date.now(), 
        expires_at: Date.now() + 3600000 
      };
      
      setUser(mockUser);
      setSession(mockSession);
      
      // In a real app, save to AsyncStorage here
      
      return { error: null };
    } catch (error) {
      console.error('Sign in error:', error);
      return { error: error as Error };
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      console.log('Development mode sign up:', email, password);
      
      // Simulate successful registration
      // In this simplified version, we don't auto-login after signup
      
      return { error: null };
    } catch (error) {
      console.error('Sign up error:', error);
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    setUser(null);
    setSession(null);
    // In a real app, clear AsyncStorage here
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