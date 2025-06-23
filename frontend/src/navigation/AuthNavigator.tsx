// src/navigation/AuthNavigator.tsx - Improved with Welcome Screen
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, SafeAreaView } from 'react-native';
import LoginScreen from '../screens/AuthScreens/LoginScreen';
import RegisterScreen from '../screens/AuthScreens/RegisterScreen';
import MotionLogo from '../components/shared/MotionLogo';
import Button from '../components/Button';

type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
};

const Stack = createStackNavigator<AuthStackParamList>();

// Welcome screen to choose between Login and Register
const WelcomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  return (
    <SafeAreaView className="flex-1 bg-gradient-to-br from-brand-cream via-brand-light to-brand-gold/20">
      {/* Background decorations */}
      <View className="absolute inset-0 opacity-10">
        <View className="absolute top-32 left-8 w-24 h-24 bg-brand-gold rounded-full" />
        <View className="absolute bottom-48 right-12 w-32 h-32 bg-brand-teal rounded-full" />
        <View className="absolute top-96 right-6 w-16 h-16 bg-brand-sage rounded-full" />
      </View>

      <View className="flex-1 justify-center px-8">
        {/* Logo Section */}
        <View className="items-center mb-16">
          <MotionLogo size="xl" variant="full" theme="light" useFullLogo={true} />
          <Text className="text-xl text-brand-teal text-center mt-6 font-medium leading-7">
            Your personal AI guide for curated local adventures
          </Text>
        </View>

        {/* Action Buttons */}
        <View className="space-y-6 px-4">
          <Button
            title="Sign In to Your Account"
            onPress={() => navigation.navigate('Login')}
            variant="primary"
            size="md"
            leftIcon={<Text className="text-lg">👋</Text>}
          />
          
          <Button
            title="Create New Account"
            onPress={() => navigation.navigate('Register')}
            variant="secondary"
            size="md"
            leftIcon={<Text className="text-lg">✨</Text>}
          />
        </View>

        {/* Features Preview */}
        <View className="mt-12 bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-brand-light/50">
          <Text className="text-center text-brand-sage font-semibold mb-4">
            Ready to discover life in motion?
          </Text>
          <View className="flex-row justify-center space-x-8">
            <View className="items-center">
              <Text className="text-2xl mb-1">🤖</Text>
              <Text className="text-xs text-brand-sage font-medium">AI Powered</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl mb-1">🎯</Text>
              <Text className="text-xs text-brand-sage font-medium">Personalized</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl mb-1">🌊</Text>
              <Text className="text-xs text-brand-sage font-medium">Flow State</Text>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const AuthNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="Welcome"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
};

export default AuthNavigator;