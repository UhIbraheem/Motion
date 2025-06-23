// src/navigation/RootNavigator.tsx - Updated with Logo
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
  const { user, loading } = useAuth();
  
  // For development: mock login option
  const [bypassAuth, setBypassAuth] = useState(false);

  // Show a loading screen while checking auth state
  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-brand-cream">
        <MotionLogo size="lg" variant="full" theme="light" animated />
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

  // Development mode toggle with branded styling
  if (!user && !bypassAuth && __DEV__) {
    return (
      <View className="flex-1 justify-center items-center bg-brand-cream p-6">
        <MotionLogo size="xl" variant="full" theme="light" />
        
        <Text className="text-2xl font-bold mb-2 text-brand-sage mt-8">
          Motion Development
        </Text>
        <Text className="text-brand-teal text-center mb-8 leading-6">
          Choose how you'd like to explore the app during development
        </Text>
        
        <View className="w-full max-w-sm space-y-4">
          <Button 
            title="Sign In Normally" 
            onPress={() => setBypassAuth(false)}
            variant="primary"
            size="lg"
          />
          
          <Button 
            title="Bypass Authentication (Dev Only)" 
            onPress={() => setBypassAuth(true)}
            variant="outline"
            size="lg"
          />
        </View>
        
        <Text className="mt-8 text-text-secondary text-center text-sm leading-5">
          This screen only appears during development to let you test different parts of the app.
        </Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user || bypassAuth ? (
          <Stack.Screen name="App" component={AppNavigator} />
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;