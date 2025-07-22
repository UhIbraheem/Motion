// src/screens/WelcomeScreen.tsx - Onboarding screen with logo
import React from 'react';
import { View, Text, ScrollView, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MotionLogo from '../components/shared/MotionLogo';
import Button from '../components/Button';

interface WelcomeScreenProps {
  onGetStarted: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onGetStarted }) => {
  return (
    <SafeAreaView className="flex-1 bg-brand-cream">
      <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 justify-center px-6">
          {/* Hero Section */}
          <View className="items-center mb-12">
            <MotionLogo size="xl" variant="full" theme="light" />
            
            <Text className="text-3xl font-bold text-brand-sage text-center mt-8 mb-4">
              Discover Life in Motion
            </Text>
            
            <Text className="text-lg text-brand-teal text-center leading-7">
              Your personal AI guide for curated local adventures that flow with your vibe and energy.
            </Text>
          </View>

          {/* Feature Preview */}
          <View className="bg-white rounded-2xl p-6 shadow-lg border border-brand-light mb-8">
            <View className="flex-row items-center mb-4">
              <View className="w-12 h-12 bg-brand-light rounded-full items-center justify-center mr-4">
                <Ionicons name="sparkles" size={24} color="#D4AF37" />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-semibold text-brand-sage">
                  AI-Powered Curation
                </Text>
                <Text className="text-brand-teal">
                  Personalized adventures just for you
                </Text>
              </View>
            </View>

            <View className="flex-row items-center mb-4">
              <View className="w-12 h-12 bg-brand-light rounded-full items-center justify-center mr-4">
                <Text className="text-2xl">🌊</Text>
              </View>
              <View className="flex-1">
                <Text className="text-lg font-semibold text-brand-sage">
                  Flow with Your Mood
                </Text>
                <Text className="text-brand-teal">
                  Adventures that match your energy
                </Text>
              </View>
            </View>

            <View className="flex-row items-center">
              <View className="w-12 h-12 bg-brand-light rounded-full items-center justify-center mr-4">
                <Ionicons name="compass" size={24} color="#2F4F4F" />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-semibold text-brand-sage">
                  Mindful Discovery
                </Text>
                <Text className="text-brand-teal">
                  Every experience is intentional
                </Text>
              </View>
            </View>
          </View>

          {/* CTA */}
          <Button
            title="Begin Your Journey"
            onPress={onGetStarted}
            variant="primary"
            size="lg"
          />

          <Text className="text-center text-text-secondary mt-6 text-sm">
            Join thousands discovering their perfect local adventures
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default WelcomeScreen;