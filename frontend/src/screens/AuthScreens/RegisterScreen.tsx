// src/screens/AuthScreens/RegisterScreen.tsx - Simple Email Auth
import React, { useState } from 'react';
import { View, Text, ScrollView, SafeAreaView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import MotionLogo from '../../components/shared/MotionLogo';
import Button from '../../components/Button';
import Input from '../../components/Input';

interface RegisterScreenProps {
  navigation: any;
}

const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuth();

  const handleRegister = async () => {
    if (!email || !password || !firstName || !lastName) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await signUp(email, password, firstName, lastName);
      if (error) {
        Alert.alert('Registration Failed', error.message);
      } else {
        Alert.alert(
          'Success!', 
          'Account created! Check your email to verify your account, then you can sign in.',
          [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
        );
      }
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
          <View className="flex-1 justify-center px-6 py-8">
            {/* Logo Section */}
            <View className="items-center mb-8">
              <MotionLogo size="lg" variant="full" theme="light" useFullLogo={true} />
            </View>

            {/* Registration Form */}
            <View className="bg-white rounded-2xl p-6 shadow-lg border border-brand-light">
              <Text className="text-2xl font-bold text-brand-sage mb-6 text-center">
                Join Motion
              </Text>
              
              <View className="flex-row space-x-3">
                <View className="flex-1">
                  <Input
                    label="First Name"
                    placeholder="First"
                    value={firstName}
                    onChangeText={setFirstName}
                  />
                </View>
                <View className="flex-1">
                  <Input
                    label="Last Name"
                    placeholder="Last"
                    value={lastName}
                    onChangeText={setLastName}
                  />
                </View>
              </View>
              
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
                placeholder="Create a password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                helperText="Must be at least 6 characters"
              />
              
              <Input
                label="Confirm Password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />
              
              <Button
                title="Create Account"
                onPress={handleRegister}
                variant="primary"
                size="lg"
                isLoading={isLoading}
                className="mt-4"
              />

              {/* Terms */}
              <Text className="text-center text-text-secondary text-xs mt-4 leading-4">
                By creating an account, you agree to our Terms of Service and Privacy Policy
              </Text>
            </View>

            {/* Sign In Link */}
            <View className="flex-row justify-center items-center mt-6">
              <Text className="text-text-secondary">Already have an account? </Text>
              <Button
                title="Sign In"
                onPress={() => navigation.navigate('Login')}
                variant="outline"
                size="sm"
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default RegisterScreen;