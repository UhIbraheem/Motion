// src/screens/ProfileScreen.tsx - Updated with Dark Mode Toggle
import React from 'react';
import { View, Text, ScrollView, SafeAreaView } from 'react-native';
import Button from '../components/Button';
import Card from '../components/Card';
import ThemeToggle from '../components/ThemeToggle';

const ProfileScreen: React.FC = () => {
  return (
    <SafeAreaView className="flex-1 bg-background-light">
      <ScrollView className="flex-1 p-4">
        <View className="items-center mb-6">
          <View className="w-24 h-24 rounded-full bg-brand-light items-center justify-center mb-4">
            {/* Placeholder for profile image */}
            <Text className="text-4xl">👤</Text>
          </View>
          <Text className="text-2xl font-bold text-text-primary">Alex Johnson</Text>
          <Text className="text-text-secondary">Adventure Seeker</Text>
        </View>

        {/* Preferences */}
        <Card title="My Preferences" elevated={true}>
          <View className="mb-4">
            <Text className="text-text-primary text-sm font-medium mb-1.5">
              Dietary Restrictions
            </Text>
            <View className="flex-row flex-wrap">
              {['Vegetarian', 'Gluten-Free'].map((pref) => (
                <View 
                  key={pref} 
                  className="bg-brand-cream rounded-full px-3 py-1 mr-2 mb-2"
                >
                  <Text className="text-brand-sage text-sm">{pref}</Text>
                </View>
              ))}
            </View>
          </View>
          
          <View className="mb-4">
            <Text className="text-text-primary text-sm font-medium mb-1.5">
              Favorite Categories
            </Text>
            <View className="flex-row flex-wrap">
              {['Food & Drink', 'Cultural', 'Outdoor'].map((cat) => (
                <View 
                  key={cat} 
                  className="bg-brand-light rounded-full px-3 py-1 mr-2 mb-2"
                >
                  <Text className="text-brand-sage text-sm">{cat}</Text>
                </View>
              ))}
            </View>
          </View>
          
          <Button 
            title="Edit Preferences" 
            onPress={() => alert('Edit preferences')} 
            variant="outline"
          />
        </Card>
        
        {/* Stats */}
        <View className="my-6">
          <Text className="text-lg font-semibold text-text-primary mb-2">Stats</Text>
          <View className="flex-row justify-between">
            <View className="bg-white rounded-lg shadow-sm p-4 w-[32%] items-center">
              <Text className="text-2xl font-bold text-brand-gold">12</Text>
              <Text className="text-text-secondary text-sm">Adventures</Text>
            </View>
            <View className="bg-white rounded-lg shadow-sm p-4 w-[32%] items-center">
              <Text className="text-2xl font-bold text-brand-gold">8</Text>
              <Text className="text-text-secondary text-sm">Reviews</Text>
            </View>
            <View className="bg-white rounded-lg shadow-sm p-4 w-[32%] items-center">
              <Text className="text-2xl font-bold text-brand-gold">3</Text>
              <Text className="text-text-secondary text-sm">Badges</Text>
            </View>
          </View>
        </View>

        {/* Settings Section */}
        <View className="mb-4">
          <Text className="text-lg font-semibold text-text-primary mb-3">Settings</Text>
          
          {/* Dark Mode Toggle */}
          <View className="flex-row justify-between items-center mb-4 p-4 bg-white rounded-lg">
            <Text className="text-lg font-semibold text-brand-sage">Dark Mode</Text>
            <ThemeToggle />
          </View>
          
          {/* Other Settings Buttons */}
          <Button 
            title="Account Settings" 
            onPress={() => alert('Account settings')} 
            variant="secondary"
            className="mb-2"
          />
          <Button 
            title="Sign Out" 
            onPress={() => alert('Sign out')} 
            variant="outline"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;