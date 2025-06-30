import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, SafeAreaView, Alert, TouchableOpacity } from 'react-native';
import Button from '../components/Button';
import Card from '../components/Card';
import { useAuth } from '../context/AuthContext';
import { aiService } from '../services/aiService';

interface UserStats {
  totalAdventures: number;
  completedAdventures: number;
  plannedAdventures: number;
  joinedDate: string;
}

const ProfileScreen: React.FC = () => {
  const { user, signOut } = useAuth();
  const [userStats, setUserStats] = useState<UserStats>({
    totalAdventures: 0,
    completedAdventures: 0,
    plannedAdventures: 0,
    joinedDate: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    loadUserStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadUserStats = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Get user's adventures to calculate stats
      const { data: adventures, error } = await aiService.getUserAdventures(user.id);

      if (error) {
        console.error('Error loading user stats:', error);
      } else {
        const totalAdventures = adventures?.length || 0;
        const completedAdventures = adventures?.filter((a: any) => a.is_completed).length || 0;
        const plannedAdventures = totalAdventures - completedAdventures;

        setUserStats({
          totalAdventures,
          completedAdventures,
          plannedAdventures,
          joinedDate: user.created_at || new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Unexpected error loading stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatJoinDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });
  };

  const getInitials = (email: string) => {
    const parts = email.split('@')[0].split('.');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return email.substring(0, 2).toUpperCase();
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out of your Motion account?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            setIsSigningOut(true);
            try {
              await signOut();
              console.log('✅ Successfully signed out');
            } catch (error) {
              console.error('❌ Sign out error:', error);
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            } finally {
              setIsSigningOut(false);
            }
          }
        }
      ]
    );
  };

  if (!user) {
    return (
      <SafeAreaView className="flex-1 bg-background-light">
        <View className="flex-1 justify-center items-center p-6">
          <Text className="text-xl mb-4">🔐</Text>
          <Text className="text-brand-sage text-lg text-center">
            Please sign in to view your profile
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background-light">
      <ScrollView className="flex-1 p-4">
        {/* Profile Header */}
        <View className="items-center mb-6">
          <View className="w-20 h-20 rounded-full bg-brand-sage items-center justify-center mb-4">
            <Text className="text-brand-cream text-2xl font-bold">
              {getInitials(user.email || 'U')}
            </Text>
          </View>

          {/* User Info */}
          <View className="items-center">
            <Text className="text-xl font-bold text-text-primary mb-1">
              {user.user_metadata?.first_name || user.user_metadata?.full_name || 'Motion User'}
            </Text>
            <Text className="text-text-secondary text-base mb-2">
              {user.email}
            </Text>
            <Text className="text-text-secondary text-sm">
              Member since {formatJoinDate(userStats.joinedDate)}
            </Text>
          </View>
        </View>

        {/* Stats Cards */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-text-primary mb-3">📊 Your Journey</Text>
          <View className="flex-row justify-between">
            <View className="bg-white rounded-xl shadow-sm p-4 w-[31%] items-center border border-brand-light">
              <Text className="text-2xl font-bold text-brand-gold mb-1">
                {isLoading ? '...' : userStats.totalAdventures}
              </Text>
              <Text className="text-text-secondary text-xs text-center leading-tight">
                Total{'\n'}Adventures
              </Text>
            </View>
            <View className="bg-white rounded-xl shadow-sm p-4 w-[31%] items-center border border-brand-light">
              <Text className="text-2xl font-bold text-brand-teal mb-1">
                {isLoading ? '...' : userStats.completedAdventures}
              </Text>
              <Text className="text-text-secondary text-xs text-center leading-tight">
                Completed{'\n'}Adventures
              </Text>
            </View>
            <View className="bg-white rounded-xl shadow-sm p-4 w-[31%] items-center border border-brand-light">
              <Text className="text-2xl font-bold text-brand-sage mb-1">
                {isLoading ? '...' : userStats.plannedAdventures}
              </Text>
              <Text className="text-text-secondary text-xs text-center leading-tight">
                Planned{'\n'}Adventures
              </Text>
            </View>
          </View>
        </View>

        {/* Account Settings */}
        <Card title="Account Settings" elevated={true}>
          <View className="space-y-3">
            <TouchableOpacity className="flex-row justify-between items-center py-3 px-2 rounded-lg bg-background-subtle">
              <View className="flex-row items-center">
                <Text className="text-lg mr-3">👤</Text>
                <Text className="text-base font-medium text-text-primary">Edit Profile</Text>
              </View>
              <Text className="text-text-secondary">{'>'}</Text>
            </TouchableOpacity>

            <TouchableOpacity className="flex-row justify-between items-center py-3 px-2 rounded-lg bg-background-subtle">
              <View className="flex-row items-center">
                <Text className="text-lg mr-3">🎯</Text>
                <Text className="text-base font-medium text-text-primary">Preferences</Text>
              </View>
              <Text className="text-text-secondary">{'>'}</Text>
            </TouchableOpacity>

            <TouchableOpacity className="flex-row justify-between items-center py-3 px-2 rounded-lg bg-background-subtle">
              <View className="flex-row items-center">
                <Text className="text-lg mr-3">🔔</Text>
                <Text className="text-base font-medium text-text-primary">Notifications</Text>
              </View>
              <Text className="text-text-secondary">{'>'}</Text>
            </TouchableOpacity>

            <TouchableOpacity className="flex-row justify-between items-center py-3 px-2 rounded-lg bg-background-subtle">
              <View className="flex-row items-center">
                <Text className="text-lg mr-3">🛡️</Text>
                <Text className="text-base font-medium text-text-primary">Privacy & Security</Text>
              </View>
              <Text className="text-text-secondary">{'>'}</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* App Info */}
        <Card title="About Motion" elevated={true}>
          <View className="space-y-3">
            <TouchableOpacity className="flex-row justify-between items-center py-3 px-2 rounded-lg bg-background-subtle">
              <View className="flex-row items-center">
                <Text className="text-lg mr-3">💬</Text>
                <Text className="text-base font-medium text-text-primary">Send Feedback</Text>
              </View>
              <Text className="text-text-secondary">{'>'}</Text>
            </TouchableOpacity>

            <TouchableOpacity className="flex-row justify-between items-center py-3 px-2 rounded-lg bg-background-subtle">
              <View className="flex-row items-center">
                <Text className="text-lg mr-3">📋</Text>
                <Text className="text-base font-medium text-text-primary">Terms & Privacy</Text>
              </View>
              <Text className="text-text-secondary">{'>'}</Text>
            </TouchableOpacity>

            <View className="py-3 px-2">
              <Text className="text-text-secondary text-sm">
                Motion v1.0.0 • AI-Powered Adventures
              </Text>
            </View>
          </View>
        </Card>

        {/* Sign Out Button */}
        <View className="mt-6 mb-8">
          <Button
            title={isSigningOut ? "Signing Out..." : "Sign Out"}
            onPress={handleSignOut}
            variant="outline"
            size="lg"
            isLoading={isSigningOut}
            leftIcon={!isSigningOut ? <Text className="text-lg">🚪</Text> : undefined}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;