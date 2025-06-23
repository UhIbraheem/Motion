// Updated App.tsx to include ThemeProvider
import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
import * as Font from 'expo-font';
import { AuthProvider } from './src/context/AuthContext';
import { ThemeProvider } from './src/context/ThemeContext';
import RootNavigator from './src/navigation/RootNavigator';
import CustomSplashScreen from './src/components/shared/SplashScreen';

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const loadResources = async () => {
      try {
        await Font.loadAsync({
          // Add any custom fonts here if needed
        });
        
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
    <ThemeProvider>
      <AuthProvider>
        <StatusBar 
          style="dark" 
          backgroundColor="#f8f2d5" 
          translucent={Platform.OS === 'android'}
        />
        <RootNavigator />
      </AuthProvider>
    </ThemeProvider>
  );
}

// Add ThemeToggle to ProfileScreen.tsx
