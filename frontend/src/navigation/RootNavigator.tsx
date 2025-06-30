// src/navigation/RootNavigator.tsx - Clean Version (No Sign Out Buttons)
import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';
import { ActivityIndicator, View, Text } from 'react-native';
import MotionLogo from '../components/shared/MotionLogo';
import Button from '../components/Button';

import AuthNavigator from './AuthNavigator';
import AppNavigator from './AppNavigator';

type RootStackParamList = {
  Auth: undefined;
  App: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const RootNavigator: React.FC = () => {
  const { user, loading } = useAuth(); // Removed signOut since we're not using it here
  const [bypassAuth, setBypassAuth] = useState(false);
  const [showDevScreen, setShowDevScreen] = useState(__DEV__);

  // Show a loading screen while checking auth state
  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-brand-cream">
        <MotionLogo size="lg" variant="full" theme="light" />
        <ActivityIndicator 
          size="large" 
          color="#3c7660" 
          style={{ marginTop: 20 }}
        />
        <Text className="text-brand-sage mt-4 text-lg font-medium">
          Loading your adventure...
        </Text>
      </View>
    );
  }

  // Development screen - only show if explicitly requested
  if (!user && !bypassAuth && showDevScreen && __DEV__) {
    return (
      <View className="flex-1 bg-brand-cream px-8 justify-center">
        {/* Logo Section */}
        <View className="items-center mb-12">
          <MotionLogo size="xl" variant="full" theme="light" useFullLogo={true} />
          <Text className="text-2xl font-bold text-brand-sage mt-6 text-center">
            Development Mode
          </Text>
          <Text className="text-brand-teal text-center mt-2 text-base leading-6">
            Choose how you'd like to explore Motion
          </Text>
        </View>

        {/* Main Actions */}
        <View className="space-y-4 mb-8">
          <Button 
            title="Test with Real Authentication" 
            onPress={() => {
              console.log('🔐 Navigating to real auth...');
              setShowDevScreen(false);
              setBypassAuth(false);
            }}
            variant="primary"
            size="lg"
            leftIcon={<Text className="text-xl">🔐</Text>}
          />
          
          <Button 
            title="Skip Auth (Browse App Only)" 
            onPress={() => {
              console.log('🔧 Bypassing auth...');
              setBypassAuth(true);
              setShowDevScreen(false);
            }}
            variant="outline"
            size="lg"
            leftIcon={<Text className="text-xl">🔧</Text>}
          />
        </View>

        {/* Dev Info */}
        <View className="bg-brand-light rounded-xl p-4">
          <Text className="text-brand-sage text-center text-sm font-medium">
            💡 Development Mode
          </Text>
          <Text className="text-brand-sage/80 text-center text-xs mt-1 leading-4">
            Real auth will create actual Supabase accounts
          </Text>
        </View>
      </View>
    );
  }

  // If user is logged in OR bypassing auth, show main app (CLEAN - no dev buttons)
  if (user || bypassAuth) {
    return (
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="App" component={AppNavigator} />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }

  // Show auth navigator (login/register screens)
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Auth" component={AuthNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;