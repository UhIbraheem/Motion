// src/screens/WelcomeScreen.tsx - Beautiful Onboarding Experience
import React from 'react';
import { View, Text, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import MotionLogo from '../components/shared/MotionLogo';
import Button from '../components/Button';

interface WelcomeScreenProps {
  onGetStarted: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onGetStarted }) => {
  return (
    <LinearGradient
      colors={['#a8edea', '#fed6e3', '#ffd89b']}
      style={{ flex: 1 }}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <SafeAreaView className="flex-1">
        <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
          <View className="flex-1 px-8 py-12">
            {/* Hero Section */}
            <View className="items-center mb-16">
              <View className="bg-white/30 backdrop-blur-lg rounded-3xl p-8 mb-8 shadow-2xl">
                <MotionLogo size="xl" variant="full" theme="light" />
              </View>
              
              <Text className="text-4xl font-bold text-white text-center mb-4 tracking-tight drop-shadow-lg">
                Welcome to Motion
              </Text>
              
              <Text className="text-xl text-white/90 text-center leading-8 max-w-sm font-medium drop-shadow-sm">
                Your personal AI guide for curated adventures that flow with your energy
              </Text>
            </View>

            {/* Feature Cards */}
            <View className="space-y-4 mb-12">
              <View className="bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl p-6 shadow-xl">
                <View className="flex-row items-center mb-3">
                  <View className="bg-white/30 rounded-full p-3 mr-4">
                    <Ionicons name="sparkles" size={24} color="#fbbf24" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-xl font-bold text-white mb-1">
                      AI-Powered Discovery
                    </Text>
                    <Text className="text-white/80 text-base">
                      Adventures curated just for your unique vibe
                    </Text>
                  </View>
                </View>
              </View>

              <View className="bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl p-6 shadow-xl">
                <View className="flex-row items-center mb-3">
                  <View className="bg-white/30 rounded-full p-3 mr-4">
                    <Ionicons name="heart" size={24} color="#ec4899" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-xl font-bold text-white mb-1">
                      Mood-Based Matching
                    </Text>
                    <Text className="text-white/80 text-base">
                      Experiences that align with your current energy
                    </Text>
                  </View>
                </View>
              </View>

              <View className="bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl p-6 shadow-xl">
                <View className="flex-row items-center mb-3">
                  <View className="bg-white/30 rounded-full p-3 mr-4">
                    <Ionicons name="compass" size={24} color="#10b981" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-xl font-bold text-white mb-1">
                      Elegant Exploration
                    </Text>
                    <Text className="text-white/80 text-base">
                      Every adventure is intentionally chosen for you
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* CTA Section */}
            <View className="space-y-6">
              <LinearGradient
                colors={['#ffffff', '#f0f9ff', '#dbeafe']}
                className="rounded-2xl shadow-2xl"
              >
                <TouchableOpacity
                  onPress={onGetStarted}
                  className="py-5 px-8 rounded-2xl"
                >
                  <Text className="text-gray-800 text-center text-xl font-bold">
                    Begin Your Journey
                  </Text>
                </TouchableOpacity>
              </LinearGradient>

              <View className="items-center">
                <Text className="text-white/90 text-center text-base font-medium">
                  ✨ Join thousands discovering their perfect local adventures
                </Text>
              </View>

              {/* Trust Indicators */}
              <View className="bg-white/10 backdrop-blur-lg rounded-2xl p-4">
                <View className="flex-row justify-center items-center space-x-6">
                  <View className="items-center">
                    <Text className="text-white font-bold text-lg">1000+</Text>
                    <Text className="text-white/70 text-xs">Adventures</Text>
                  </View>
                  <View className="w-px h-8 bg-white/30" />
                  <View className="items-center">
                    <Text className="text-white font-bold text-lg">5000+</Text>
                    <Text className="text-white/70 text-xs">Happy Users</Text>
                  </View>
                  <View className="w-px h-8 bg-white/30" />
                  <View className="items-center">
                    <Text className="text-white font-bold text-lg">4.9★</Text>
                    <Text className="text-white/70 text-xs">Rating</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default WelcomeScreen;