// src/navigation/AuthNavigator.tsx - Improved with Welcome Screen
import React from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, SafeAreaView, Image, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';
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
    <SafeAreaView style={{ flex: 1, backgroundColor: '#181C23' }}>
      <LinearGradient
        colors={["#181C23", "#232733", "#2A2F3A"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
        zIndex: 2,
      }}>
        {/* Official Motion Logo - Much Larger */}
        <Image
          source={require('../../assets/adaptive-icon.png')}
          style={{ 
            width: 180, 
            height: 180, 
            resizeMode: 'contain', 
            marginBottom: 40 
          }}
        />

        {/* Welcome Text */}
        <Text style={{ 
          color: '#F8F2D5', 
          fontSize: 32, 
          fontWeight: 'bold', 
          textAlign: 'center', 
          marginBottom: 16 
        }}>
          Welcome to Motion
        </Text>
        
        <Text style={{ 
          color: 'rgba(248, 242, 213, 0.8)', 
          fontSize: 16, 
          textAlign: 'center', 
          marginBottom: 36,
          lineHeight: 24 
        }}>
          Discover elegant adventures tailored to your mood and preferences
        </Text>

        {/* Button Container - Closer Together */}
        <View style={{ width: '100%', maxWidth: 320 }}>
          {/* Sign In Button */}
          <TouchableOpacity
            onPress={() => navigation.navigate('Login')}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.12)',
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.25)',
              borderRadius: 12,
              paddingVertical: 16,
              paddingHorizontal: 24,
              marginBottom: 12,
              alignItems: 'center',
            }}
          >
            <Text style={{ 
              color: '#FFFFFF', 
              fontSize: 16, 
              fontWeight: '600' 
            }}>
              Sign In
            </Text>
          </TouchableOpacity>

          {/* Create Account Button */}
          <TouchableOpacity
            onPress={() => navigation.navigate('Register')}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.12)',
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.25)',
              borderRadius: 12,
              paddingVertical: 16,
              paddingHorizontal: 24,
              marginBottom: 20,
              alignItems: 'center',
            }}
          >
            <Text style={{ 
              color: '#FFFFFF', 
              fontSize: 16, 
              fontWeight: '600' 
            }}>
              Create Account
            </Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={{ 
            flexDirection: 'row', 
            alignItems: 'center', 
            marginBottom: 20 
          }}>
            <View style={{ 
              flex: 1, 
              height: 1, 
              backgroundColor: 'rgba(255, 255, 255, 0.2)' 
            }} />
            <Text style={{ 
              color: 'rgba(248, 242, 213, 0.6)', 
              fontSize: 14, 
              marginHorizontal: 16 
            }}>
              or continue with
            </Text>
            <View style={{ 
              flex: 1, 
              height: 1, 
              backgroundColor: 'rgba(255, 255, 255, 0.2)' 
            }} />
          </View>

          {/* Continue with Google Button */}
          <TouchableOpacity
            onPress={() => {
              // Placeholder for Google auth
              console.log('Google sign-in pressed');
            }}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.12)',
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.25)',
              borderRadius: 12,
              paddingVertical: 16,
              paddingHorizontal: 24,
              marginBottom: 12,
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
            }}
          >
            <Text style={{ 
              color: '#D4AF37', 
              fontSize: 16, 
              fontWeight: '600' 
            }}>
              Continue with Google
            </Text>
          </TouchableOpacity>

          {/* Continue with Apple Button */}
          <TouchableOpacity
            onPress={() => {
              // Placeholder for Apple auth
              console.log('Apple sign-in pressed');
            }}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.12)',
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.25)',
              borderRadius: 12,
              paddingVertical: 16,
              paddingHorizontal: 24,
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
            }}
          >
            <Text style={{ 
              color: '#D4AF37', 
              fontSize: 16, 
              fontWeight: '600' 
            }}>
              Continue with Apple
            </Text>
          </TouchableOpacity>
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