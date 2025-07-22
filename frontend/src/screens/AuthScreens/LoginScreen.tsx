// src/screens/AuthScreens/LoginScreen.tsx - Simple Email Auth
import React, { useState } from 'react';
import { View, Text, ScrollView, SafeAreaView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import MotionLogo from '../../components/shared/MotionLogo';
import Button from '../../components/Button';
import Input from '../../components/Input';

interface LoginScreenProps {
  navigation: any;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await signIn(email, password);
      if (error) {
        Alert.alert('Login Failed', error.message);
      }
      // Success - AuthContext will handle navigation
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-brand-cream">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1 }}>
          <View className="flex-1 justify-center px-6">
            {/* Logo Section */}
            <View className="items-center mb-12">
              <MotionLogo size="xl" variant="full" theme="light" useFullLogo={true} />
            </View>

            {/* Login Form */}
            <View className="bg-white rounded-2xl p-6 shadow-lg border border-brand-light">
              <Text className="text-2xl font-bold text-brand-sage mb-6 text-center">
                Welcome Back
              </Text>
              
              <Input
                label="Email"
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              
              <Input
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
              
              <Button
                title="Sign In"
                onPress={handleLogin}
                variant="primary"
                size="lg"
                isLoading={isLoading}
                className="mt-4"
              />

              {/* Forgot Password */}
              <Text className="text-center text-brand-teal mt-4 font-medium">
                Forgot your password?
              </Text>
            </View>

            {/* Sign Up Link */}
            <View className="flex-row justify-center items-center mt-8">
              <Text className="text-text-secondary">Don't have an account? </Text>
              <Button
                title="Sign Up"
                onPress={() => navigation.navigate('Register')}
                variant="outline"
                size="sm"
              />
            </View>

            {/* Dev Info */}
            {__DEV__ && (
              <View className="mt-8 bg-brand-light rounded-xl p-4">
                <Text className="text-brand-sage text-center text-sm font-medium">
                  <Ionicons name="compass" size={16} color="#2F4F4F" /> Real Supabase Auth Active!
                </Text>
                <Text className="text-brand-sage text-center text-xs mt-1">
                  Create a real account to test
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;