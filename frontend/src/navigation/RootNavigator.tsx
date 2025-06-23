// src/navigation/RootNavigator.tsx - WORKING Navigation Logic
import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';
import { ActivityIndicator, View, Text, Alert } from 'react-native';
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
  const { user, loading, signOut } = useAuth();
  const [bypassAuth, setBypassAuth] = useState(false);
  const [showDevScreen, setShowDevScreen] = useState(__DEV__); // Control dev screen visibility

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
              setShowDevScreen(false); // Hide dev screen, show auth
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

  // If user is logged in OR bypassing auth, show main app
  if (user || bypassAuth) {
    return (
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="App">
            {() => (
              <View className="flex-1">
                <AppNavigator />
                {/* Development controls */}
                {__DEV__ && (
                  <View className="absolute top-12 right-4 z-50 space-y-2">
                    {user && (
                      <Button
                        title="Sign Out"
                        onPress={async () => {
                          Alert.alert(
                            'Sign Out',
                            'Are you sure you want to sign out?',
                            [
                              { text: 'Cancel', style: 'cancel' },
                              { 
                                text: 'Sign Out', 
                                style: 'destructive',
                                onPress: async () => {
                                  try {
                                    await signOut();
                                    console.log('✅ Signed out successfully');
                                    setShowDevScreen(true); // Show dev screen again
                                  } catch (error) {
                                    console.error('❌ Sign out failed:', error);
                                    Alert.alert('Error', 'Failed to sign out');
                                  }
                                }
                              }
                            ]
                          );
                        }}
                        variant="outline"
                        size="sm"
                      />
                    )}
                    {bypassAuth && (
                      <Button
                        title="Enable Auth"
                        onPress={() => {
                          setBypassAuth(false);
                          setShowDevScreen(true);
                        }}
                        variant="secondary"
                        size="sm"
                      />
                    )}
                  </View>
                )}
              </View>
            )}
          </Stack.Screen>
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