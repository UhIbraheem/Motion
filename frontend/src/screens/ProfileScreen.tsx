// src/screens/ProfileScreen.tsx - Enhanced Profile with Image Upload & Editing
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  SafeAreaView, 
  Alert, 
  TouchableOpacity, 
  Image,
  Platform
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Button from '../components/Button';
import Card from '../components/Card';
import { useAuth } from '../context/AuthContext';
import { aiService } from '../services/aiService';
import { supabase } from '../services/supabase';
import { EditProfileModal, PreferencesModal, PrivacyModal } from '../components/modals';

interface UserStats {
  totalAdventures: number;
  completedAdventures: number;
  plannedAdventures: number;
  joinedDate: string;
}

interface UserProfile {
  first_name: string;
  last_name: string;
  bio: string;
  home_city: string;
  birthday: string;
  profile_picture_url: string;
}

const ProfileScreen: React.FC = () => {
  const { user, signOut } = useAuth();
  const [userStats, setUserStats] = useState<UserStats>({
    totalAdventures: 0,
    completedAdventures: 0,
    plannedAdventures: 0,
    joinedDate: ''
  });
  const [userProfile, setUserProfile] = useState<UserProfile>({
    first_name: '',
    last_name: '',
    bio: '',
    home_city: '',
    birthday: '',
    profile_picture_url: ''
  });

  // Modal states
  const [editProfileVisible, setEditProfileVisible] = useState(false);
  const [showPreferencesModal, setShowPreferencesModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [preferencesVisible, setPreferencesVisible] = useState(false);
  const [privacyVisible, setPrivacyVisible] = useState(false);

  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Form states
  const [editForm, setEditForm] = useState<UserProfile>({
    first_name: '',
    last_name: '',
    bio: '',
    home_city: '',
    birthday: '',
    profile_picture_url: ''
  });

  // Preferences states
  const [preferences, setPreferences] = useState({
    adventure_notifications: true,
    community_updates: true,
    weekly_suggestions: false,
    location_sharing: true,
    public_profile: false,
    adventure_sharing_default: true,
    default_adventure_privacy: 'public',
    distance_unit: 'miles',
    budget_display: 'symbols', // symbols ($$$) or numbers ($50-100)
    theme_preference: 'light'
  });

  useEffect(() => {
    loadUserData();
    requestImagePermissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Sync edit form with user profile
  useEffect(() => {
    setEditForm(userProfile);
  }, [userProfile, editProfileVisible]);

  const requestImagePermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Needed',
          'Motion needs access to your photos to set a profile picture.',
          [{ text: 'OK' }]
        );
      }
    }
  };

  const loadUserData = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Load user stats
      const { data: adventures, error: adventuresError } = await aiService.getUserAdventures(user.id);
      if (!adventuresError) {
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

      // Load user profile from Supabase
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (!profileError && profile) {
        const userProfileData = {
          first_name: profile.first_name || user.user_metadata?.first_name || '',
          last_name: profile.last_name || user.user_metadata?.last_name || '',
          bio: profile.bio || '',
          home_city: profile.home_city || '',
          birthday: profile.birthday || '',
          profile_picture_url: profile.profile_picture_url || ''
        };
        setUserProfile(userProfileData);
        setEditForm(userProfileData);
      }

    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const pickProfileImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: false,
      });

      if (!result.canceled && result.assets[0]) {
        setIsUploadingImage(true);
        
        // In a real app, you'd upload to Supabase Storage
        // For now, we'll use the local URI
        const imageUri = result.assets[0].uri;
        
        setEditForm(prev => ({
          ...prev,
          profile_picture_url: imageUri
        }));
        
        // Auto-save profile picture
        await updateUserProfile({ ...editForm, profile_picture_url: imageUri });
        
        Alert.alert('Success! 📸', 'Profile picture updated!');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile picture');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const updateUserProfile = async (updatedProfile?: UserProfile) => {
    if (!user) return;

    const profileToUpdate = updatedProfile || editForm;
    setIsUpdatingProfile(true);

    try {
      // Clean up empty strings for date fields - convert to null for PostgreSQL
      const cleanProfile = {
        id: user.id,
        first_name: profileToUpdate.first_name || null,
        last_name: profileToUpdate.last_name || null,
        bio: profileToUpdate.bio || null,
        home_city: profileToUpdate.home_city || null,
        birthday: profileToUpdate.birthday && profileToUpdate.birthday.trim() ? profileToUpdate.birthday : null,
        profile_picture_url: profileToUpdate.profile_picture_url || null,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('profiles')
        .upsert(cleanProfile);

      if (error) throw error;

      setUserProfile(profileToUpdate);
      if (!updatedProfile) {
        setEditProfileVisible(false);
        Alert.alert('Success! 🎉', 'Profile updated successfully!');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
      console.error('Profile update error:', error);
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const formatJoinDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });
  };

  const getInitials = (firstName: string, lastName: string, email: string) => {
    if (firstName && lastName) {
      return (firstName[0] + lastName[0]).toUpperCase();
    }
    if (firstName) {
      return firstName.substring(0, 2).toUpperCase();
    }
    const parts = email.split('@')[0].split('.');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return email.substring(0, 2).toUpperCase();
  };

  const getDisplayName = () => {
    const { first_name, last_name } = userProfile;
    if (first_name && last_name) {
      return `${first_name} ${last_name}`;
    }
    if (first_name) {
      return first_name;
    }
    return user?.user_metadata?.full_name || 'Motion User';
  };

  const handleUpdateProfile = async () => {
    if (!user) return;
    
    setIsUpdatingProfile(true);
    try {
      // Clean up empty strings for date fields - convert to null for PostgreSQL
      const cleanProfile = {
        id: user.id,
        first_name: editForm.first_name || null,
        last_name: editForm.last_name || null,
        bio: editForm.bio || null,
        home_city: editForm.home_city || null,
        birthday: editForm.birthday && editForm.birthday.trim() ? editForm.birthday : null,
        profile_picture_url: editForm.profile_picture_url || null,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('profiles')
        .upsert(cleanProfile);

      if (error) throw error;

      // Update local state
      setUserProfile(editForm);
      setEditProfileVisible(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsUpdatingProfile(false);
    }
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
    <View className="flex-1 bg-background-light">
      <ScrollView 
        className="flex-1 p-4"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="mb-6">
          <Text className="text-2xl font-bold text-brand-sage">Profile</Text>
        </View>
        {/* Profile Header */}
        <View className="items-center mb-6">
          <TouchableOpacity onPress={pickProfileImage} className="relative mb-4">
            {userProfile.profile_picture_url ? (
              <View className="w-24 h-24 rounded-full"
                style={{
                  shadowColor: '#3c7660',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.25,
                  shadowRadius: 4,
                  elevation: 4
                }}
              >
                <Image
                  source={{ uri: userProfile.profile_picture_url }}
                  className="w-24 h-24 rounded-full"
                />
              </View>
            ) : (
              <View className="w-24 h-24 rounded-full bg-brand-sage items-center justify-center"
                style={{
                  shadowColor: '#3c7660',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.25,
                  shadowRadius: 4,
                  elevation: 4
                }}
              >
                <Text className="text-brand-cream text-2xl font-bold">
                  {getInitials(userProfile.first_name, userProfile.last_name, user.email || 'U')}
                </Text>
              </View>
            )}
            
            {/* Camera Icon Overlay */}
            <View className="absolute bottom-0 right-0 bg-brand-gold rounded-full w-8 h-8 items-center justify-center border-2 border-white">
              <Text className="text-white text-sm">📷</Text>
            </View>
            
            {isUploadingImage && (
              <View className="absolute inset-0 bg-black bg-opacity-50 rounded-full items-center justify-center">
                <Text className="text-white text-xs">Uploading...</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* User Info */}
          <View className="items-center">
            <Text className="text-xl font-bold text-text-primary mb-1">
              {getDisplayName()}
            </Text>
            <Text className="text-text-secondary text-base mb-1">
              {user.email}
            </Text>
            {userProfile.home_city && (
              <Text className="text-brand-teal text-sm mb-1">
                📍 {userProfile.home_city}
              </Text>
            )}
            {userProfile.bio && (
              <Text className="text-text-secondary text-sm text-center mt-2 px-4 leading-5">
                {userProfile.bio}
              </Text>
            )}
            <Text className="text-text-secondary text-sm mt-2">
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
            <TouchableOpacity 
              className="flex-row justify-between items-center py-3 px-2 rounded-lg bg-background-subtle"
              onPress={() => setEditProfileVisible(true)}
            >
              <View className="flex-row items-center">
                <Text className="text-lg mr-3">👤</Text>
                <Text className="text-base font-medium text-text-primary">Edit Profile</Text>
              </View>
              <Text className="text-text-secondary">{'>'}</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              className="flex-row justify-between items-center py-3 px-2 rounded-lg bg-background-subtle"
              onPress={() => setShowPreferencesModal(true)}
            >
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

      {/* Modals */}
      <EditProfileModal
        visible={editProfileVisible}
        onClose={() => setEditProfileVisible(false)}
        userProfile={userProfile}
        editForm={editForm}
        setEditForm={setEditForm}
        onUpdateProfile={handleUpdateProfile}
        onPickImage={pickProfileImage}
        isUpdating={isUpdatingProfile}
        isUploadingImage={isUploadingImage}
        userEmail={user?.email || ''}
        getInitials={getInitials}
      />

      <PreferencesModal
        visible={showPreferencesModal}
        onClose={() => setShowPreferencesModal(false)}
        onOpenPrivacy={() => setShowPrivacyModal(true)}
      />

      <PrivacyModal
        visible={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
        onBackToPreferences={() => setShowPreferencesModal(true)}
      />
    </View>
  );
};

export default ProfileScreen;