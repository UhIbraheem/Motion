import React from 'react';
import { Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  return (
    <View className="flex-1 items-center justify-center bg-brand-cream">
      <Text className="text-brand-sage text-2xl font-bold">Motion</Text>
      <Text className="text-brand-teal mt-2">Your adventure starts here</Text>
      <StatusBar style="auto" />
    </View>
  );
}