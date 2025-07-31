// Updated App.tsx to include SafeAreaProvider for floating glass navigation
import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
import * as Font from 'expo-font';
import { SafeAreaProvider } from 'react-native-safe-area-context'; // ADD this import
import { AuthProvider } from './src/context/AuthContext';
import { ThemeProvider } from './src/context/ThemeContext';
import { PreferencesProvider } from './src/context/PreferencesContext';
import RootNavigator from './src/navigation/RootNavigator';
import CustomSplashScreen from './src/components/shared/SplashScreen';
import { setupSupabaseStorage } from './src/utils/setupStorage';

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const loadResources = async () => {
      try {
        await Font.loadAsync({
          // Add any custom fonts here if needed
        });
        
        // Setup Supabase Storage
        await setupSupabaseStorage();
        
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsReady(true);
      } catch (error) {
        console.warn('Resource loading error:', error);
        setIsReady(true);
      }
    };

    loadResources();
  }, []);

  const handleSplashFinish = () => {
    setShowSplash(false);
  };

  if (!isReady || showSplash) {
    return <CustomSplashScreen onFinish={handleSplashFinish} />;
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <PreferencesProvider>
            <StatusBar 
              style="dark" 
              backgroundColor="#f8f2d5" 
              translucent={Platform.OS === 'android'}
            />
            <RootNavigator />
          </PreferencesProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}