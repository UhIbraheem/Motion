// src/components/shared/SplashScreen.tsx - Custom splash screen component
import React, { useEffect } from 'react';
import { View, Animated, Easing } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import MotionLogo from './MotionLogo';

interface CustomSplashScreenProps {
  onFinish: () => void;
}

const CustomSplashScreen: React.FC<CustomSplashScreenProps> = ({ onFinish }) => {
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.3);

  useEffect(() => {
    const showSplash = async () => {
      try {
        await SplashScreen.preventAutoHideAsync();
        
        // Start animations
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnim, {
            toValue: 1,
            tension: 50,
            friction: 7,
            useNativeDriver: true,
          }),
        ]).start();

        // Hide splash after animation
        setTimeout(async () => {
          await SplashScreen.hideAsync();
          onFinish();
        }, 2000);
        
      } catch (error) {
        console.warn('Splash screen error:', error);
        onFinish();
      }
    };

    showSplash();
  }, []);

  return (
    <View className="flex-1 bg-brand-cream justify-center items-center">
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        }}
      >
        <MotionLogo size="xl" variant="full" theme="light" animated />
      </Animated.View>
    </View>
  );
};

export default CustomSplashScreen;