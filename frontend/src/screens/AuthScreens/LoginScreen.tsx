// src/screens/AuthScreens/LoginScreen.tsx - Beautiful Modern Login
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  SafeAreaView, 
  Alert, 
  KeyboardAvoidingView, 
  Platform,
  Dimensions,
  TouchableOpacity,
  TextInput,
  StyleSheet
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import MotionLogo from '../../components/shared/MotionLogo';

interface LoginScreenProps {
  navigation: any;
}

const { width, height } = Dimensions.get('window');

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { signIn, signInWithGoogle } = useAuth();

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

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        console.error('Google sign in error:', error);
        // Don't show alert for user cancellation
        if (!error.message?.includes('cancelled')) {
          Alert.alert('Google Sign In Failed', error.message || 'An error occurred');
        }
      }
      // Success - AuthContext will handle navigation
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred with Google sign in');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#D4AF37', '#E8D5A3', '#F0E6C8']}
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
                  Welcome Back
                </Text>
                <Text className="text-white/90 text-lg text-center font-medium drop-shadow-sm">
                  Continue your golden adventure
                </Text>
              </View>

              {/* Login Form */}
              <View className="space-y-6">
                {/* Email Input */}
                <View>
                  <Text className="text-white/90 text-sm font-semibold mb-2 ml-1">
                    Email Address
                  </Text>
                  <View className="bg-gray-200/20 backdrop-blur-md rounded-2xl border border-gray-300/30">
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
                  <View className="bg-gray-200/20 backdrop-blur-md rounded-2xl border border-gray-300/30 flex-row items-center">
                    <TextInput
                      placeholder="Enter your password"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                      style={{
                        backgroundColor: 'transparent',
                        borderWidth: 0,
                        color: 'white',
                        fontSize: 16,
                        paddingHorizontal: 20,
                        paddingVertical: 18,
                        flex: 1,
                      }}
                      placeholderTextColor="rgba(255,255,255,0.6)"
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      className="pr-5"
                    >
                      <Ionicons 
                        name={showPassword ? 'eye-off' : 'eye'} 
                        size={20} 
                        color="rgba(255,255,255,0.7)" 
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Forgot Password */}
                <TouchableOpacity className="self-end">
                  <Text className="text-white/90 font-semibold text-sm">
                    Forgot Password?
                  </Text>
                </TouchableOpacity>

                {/* Sign In Button */}
                <View className="mt-8">
                  <TouchableOpacity
                    onPress={handleLogin}
                    disabled={isLoading}
                    className="bg-gray-700/30 backdrop-blur-md rounded-2xl py-5 px-6 border border-gray-500/40 shadow-lg"
                  >
                    <Text className="text-white text-center text-lg font-bold drop-shadow-sm">
                      {isLoading ? 'Signing In...' : 'Sign In'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Google Sign In Button */}
                <View className="mt-4">
                  <TouchableOpacity
                    onPress={handleGoogleSignIn}
                    disabled={isGoogleLoading}
                    className="bg-gray-700/30 backdrop-blur-md rounded-2xl py-5 px-6 border border-gray-500/40 shadow-lg flex-row items-center justify-center"
                  >
                    <Ionicons name="logo-google" size={20} color="white" style={{ marginRight: 12 }} />
                    <Text className="text-white text-center text-lg font-bold drop-shadow-sm">
                      {isGoogleLoading ? 'Signing In...' : 'Continue with Google'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Bottom Section */}
              <View className="mt-12 space-y-6">
                {/* Divider */}
                <View className="flex-row items-center">
                  <View className="flex-1 h-px bg-white/20" />
                  <Text className="text-white/60 px-4 text-sm font-medium">
                    New to Motion?
                  </Text>
                  <View className="flex-1 h-px bg-white/20" />
                </View>

                {/* Sign Up Link */}
                <TouchableOpacity
                  onPress={() => navigation.navigate('Register')}
                  className="bg-gray-700/30 backdrop-blur-md border border-gray-500/40 rounded-2xl py-4"
                >
                  <Text className="text-white text-center text-lg font-semibold drop-shadow-sm">
                    Create Account
                  </Text>
                </TouchableOpacity>

                {/* Dev Info */}
                {__DEV__ && (
                  <View className="bg-black/20 rounded-xl p-4 mt-6">
                    <View className="flex-row items-center justify-center">
                      <Ionicons name="flash" size={16} color="#fbbf24" />
                      <Text className="text-white/90 text-center text-sm font-medium ml-2">
                        Development Mode Active
                      </Text>
                    </View>
                    <Text className="text-white/70 text-center text-xs mt-1">
                      Real Supabase authentication enabled
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default LoginScreen;