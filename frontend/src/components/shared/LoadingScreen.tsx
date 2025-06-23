// src/components/shared/LoadingScreen.tsx - Branded loading screen
import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import MotionLogo from './MotionLogo';

interface LoadingScreenProps {
  message?: string;
  theme?: 'light' | 'dark';
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = 'Loading your adventure...', 
  theme = 'light' 
}) => {
  const bgColor = theme === 'light' ? 'bg-brand-cream' : 'bg-brand-sage-dark';
  const textColor = theme === 'light' ? 'text-brand-sage' : 'text-brand-cream';

  return (
    <View className={`flex-1 justify-center items-center ${bgColor} px-6`}>
      <MotionLogo size="lg" variant="full" theme={theme} animated />
      
      <ActivityIndicator 
        size="large" 
        color={theme === 'light' ? '#3c7660' : '#f2cc6c'} 
        style={{ marginTop: 24, marginBottom: 16 }}
      />
      
      <Text className={`${textColor} text-lg font-medium text-center`}>
        {message}
      </Text>
    </View>
  );
};

export default LoadingScreen;