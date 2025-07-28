// src/screens/AuthScreens/RegisterScreen.tsx - Beautiful Sage + Teal Gradient
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  SafeAreaView, 
  Alert, 
  KeyboardAvoidingView, 
  Platform,
  TextInput,
  TouchableOpacity
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import MotionLogo from '../../components/shared/MotionLogo';

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
    <LinearGradient
      colors={['#3c7660', '#3b9b8e', '#c8ddd6']}
      style={{ flex: 1 }}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <SafeAreaView className="flex-1">
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          <ScrollView 
            className="flex-1" 
            contentContainerStyle={{ flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Header Section */}
            <View className="flex-1 justify-center px-8 py-12">
              {/* Logo & Welcome */}
              <View className="items-center mb-12">
                <View className="bg-black/30 backdrop-blur-lg rounded-full p-6 mb-6 shadow-2xl border border-white/20">
                  <MotionLogo size="lg" variant="icon" theme="light" />
                </View>
                <Text className="text-4xl font-bold text-white mb-2 tracking-tight drop-shadow-lg">
                  Join Motion
                </Text>
                <Text className="text-white/90 text-lg text-center font-medium drop-shadow-sm">
                  Start your adventure today
                </Text>
              </View>

              {/* Registration Form */}
              <View className="space-y-6">
                {/* Name Row */}
                <View className="flex-row space-x-4">
                  <View className="flex-1">
                    <Text className="text-white/90 text-sm font-semibold mb-2 ml-1">
                      First Name
                    </Text>
                    <View className="bg-white/15 backdrop-blur-sm rounded-2xl border border-white/20">
                      <TextInput
                        placeholder="First name"
                        value={firstName}
                        onChangeText={setFirstName}
                        style={{
                          backgroundColor: 'transparent',
                          borderWidth: 0,
                          color: 'white',
                          fontSize: 16,
                          paddingHorizontal: 20,
                          paddingVertical: 18,
                        }}
                        placeholderTextColor="rgba(255,255,255,0.6)"
                      />
                    </View>
                  </View>
                  
                  <View className="flex-1">
                    <Text className="text-white/90 text-sm font-semibold mb-2 ml-1">
                      Last Name
                    </Text>
                    <View className="bg-white/15 backdrop-blur-sm rounded-2xl border border-white/20">
                      <TextInput
                        placeholder="Last name"
                        value={lastName}
                        onChangeText={setLastName}
                        style={{
                          backgroundColor: 'transparent',
                          borderWidth: 0,
                          color: 'white',
                          fontSize: 16,
                          paddingHorizontal: 20,
                          paddingVertical: 18,
                        }}
                        placeholderTextColor="rgba(255,255,255,0.6)"
                      />
                    </View>
                  </View>
                </View>

                {/* Email Input */}
                <View>
                  <Text className="text-white/90 text-sm font-semibold mb-2 ml-1">
                    Email Address
                  </Text>
                  <View className="bg-white/15 backdrop-blur-sm rounded-2xl border border-white/20">
                    <TextInput
                      placeholder="Enter your email"
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      style={{
                        backgroundColor: 'transparent',
                        borderWidth: 0,
                        color: 'white',
                        fontSize: 16,
                        paddingHorizontal: 20,
                        paddingVertical: 18,
                      }}
                      placeholderTextColor="rgba(255,255,255,0.6)"
                    />
                  </View>
                </View>

                {/* Password Input */}
                <View>
                  <Text className="text-white/90 text-sm font-semibold mb-2 ml-1">
                    Password
                  </Text>
                  <View className="bg-white/15 backdrop-blur-sm rounded-2xl border border-white/20">
                    <TextInput
                      placeholder="Create a password"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry
                      style={{
                        backgroundColor: 'transparent',
                        borderWidth: 0,
                        color: 'white',
                        fontSize: 16,
                        paddingHorizontal: 20,
                        paddingVertical: 18,
                      }}
                      placeholderTextColor="rgba(255,255,255,0.6)"
                    />
                  </View>
                  <Text className="text-white/60 text-xs mt-1 ml-1">
                    Must be at least 6 characters
                  </Text>
                </View>

                {/* Confirm Password Input */}
                <View>
                  <Text className="text-white/90 text-sm font-semibold mb-2 ml-1">
                    Confirm Password
                  </Text>
                  <View className="bg-white/15 backdrop-blur-sm rounded-2xl border border-white/20">
                    <TextInput
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry
                      style={{
                        backgroundColor: 'transparent',
                        borderWidth: 0,
                        color: 'white',
                        fontSize: 16,
                        paddingHorizontal: 20,
                        paddingVertical: 18,
                      }}
                      placeholderTextColor="rgba(255,255,255,0.6)"
                    />
                  </View>
                </View>

                {/* Create Account Button */}
                <View className="bg-gray-200/20 backdrop-blur-md rounded-2xl border border-gray-300/30 overflow-hidden mt-6 shadow-lg">
                  <TouchableOpacity
                    onPress={handleRegister}
                    disabled={isLoading}
                    className="py-5 px-6"
                  >
                    <Text className="text-center text-white text-lg font-bold drop-shadow-sm">
                      {isLoading ? 'Creating Account...' : 'Create Account'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Terms */}
                <Text className="text-center text-white/70 text-sm mt-4 leading-5">
                  By creating an account, you agree to our Terms of Service and Privacy Policy
                </Text>

                {/* Sign In Link */}
                <TouchableOpacity
                  onPress={() => navigation.navigate('Login')}
                  className="bg-gray-200/15 backdrop-blur-md border border-gray-300/25 rounded-2xl py-4 mt-4"
                >
                  <Text className="text-white text-center text-lg font-semibold drop-shadow-sm">
                    Already have an account? Sign In
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default RegisterScreen;