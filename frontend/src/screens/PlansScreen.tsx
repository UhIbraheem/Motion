// src/screens/PlansScreen.tsx - Clean Modern Design
import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  SafeAreaView, 
  RefreshControl, 
  Alert,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Image
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import Button from '../components/Button';
import { GradientAdventureCard } from '../components/GradientAdventureCard';
import { AdventureDetailModal } from '../components/modals/AdventureDetailModal';
import { ShareAdventureModal } from '../components/modals/ShareAdventureModal';
import { aiService } from '../services/aiService';
import { adventureInteractionService } from '../services/adventureInteractionService';
import { useAuth } from '../context/AuthContext';
import { usePreferences } from '../context/PreferencesContext';
import { formatBudget, formatDistance, formatDuration } from '../utils/formatters';
import { useFocusEffect } from '@react-navigation/native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');


// Updated interface to match GradientAdventureCard
interface SavedAdventure {
  id: string;
  title: string;
  description: string;
  duration_hours: number;
  estimated_cost: number;
  steps: any[];
  is_completed: boolean;
  is_favorite: boolean; // Required, not optional
  created_at: string;
  scheduled_for?: string; // Add scheduled date field
  filters_used?: any;
  step_completions?: { [stepIndex: number]: boolean }; // Add step completion tracking
}

const PlansScreen: React.FC = () => {
  const { user } = useAuth();
  const { preferences } = usePreferences();
  const [adventures, setAdventures] = useState<SavedAdventure[]>([]);
  const [savedCommunityAdventures, setSavedCommunityAdventures] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [adventureToShare, setAdventureToShare] = useState<SavedAdventure | null>(null);
  
  // Modal state
  const [selectedAdventure, setSelectedAdventure] = useState<SavedAdventure | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const loadAdventures = async (showRefreshSpinner = false) => {
    if (!user) return;

    if (showRefreshSpinner) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      // Load personal adventures
      const { data, error } = await aiService.getUserAdventures(user.id);

      if (error) {
        console.error('❌ Error loading adventures:', error);
        Alert.alert('Error', 'Failed to load your adventures');
        return;
      }
      
      // Ensure all adventures have required fields with defaults
      const processedAdventures = (data || []).map(adventure => ({
        ...adventure,
        is_favorite: adventure.is_favorite ?? false, // Default to false if undefined
        step_completions: adventure.step_completions ?? {} // Default to empty object
      }));
      
      setAdventures(processedAdventures);

      // Load saved community adventures
      await loadSavedCommunityAdventures();
    } catch (error) {
      console.error('❌ Unexpected error loading adventures:', error);
      Alert.alert('Error', 'Something went wrong loading your adventures');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const loadSavedCommunityAdventures = async () => {
    try {
      const { data, error } = await adventureInteractionService.getUserSavedAdventures();
      
      if (error) {
        console.error('❌ Error loading saved community adventures:', error);
        return;
      }

      setSavedCommunityAdventures(data || []);
    } catch (error) {
      console.error('❌ Unexpected error loading saved community adventures:', error);
    }
  };

  // Load adventures when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadAdventures();
    }, [user])
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatDurationLocal = (hours: number) => {
    return formatDuration(hours, preferences);
  };

  const formatCost = (cost: number) => {
    return formatBudget(cost, preferences);
  };

  const getUpcomingAdventures = () => {
    return adventures.filter(adventure => !adventure.is_completed);
  };

  const getCompletedAdventures = () => {
    return adventures.filter(adventure => adventure.is_completed);
  };

  // Open adventure detail modal
  const viewAdventureDetails = (adventure: SavedAdventure) => {
    setSelectedAdventure(adventure);
    setModalVisible(true);
  };

  // Close modal
  const closeModal = () => {
    setModalVisible(false);
    setSelectedAdventure(null);
  };

  // Handle step completion updates
  const handleUpdateStepCompletion = async (adventureId: string, stepIndex: number, completed: boolean) => {
    try {
      const { error } = await aiService.updateStepCompletion(adventureId, stepIndex, completed);
      
      if (error) {
        Alert.alert('Error', 'Failed to update step completion');
        return;
      }

      // Update local state
      setAdventures(prev => prev.map(adventure => {
        if (adventure.id === adventureId) {
          const updatedCompletions = {
            ...adventure.step_completions,
            [stepIndex]: completed
          };
          return {
            ...adventure,
            step_completions: updatedCompletions
          };
        }
        return adventure;
      }));

      // Also update selected adventure if it's the same one
      if (selectedAdventure?.id === adventureId) {
        setSelectedAdventure(prev => ({
          ...prev!,
          step_completions: {
            ...prev!.step_completions,
            [stepIndex]: completed
          }
        }));
      }

    } catch (error) {
      console.error('Error updating step completion:', error);
      Alert.alert('Error', 'Failed to update step completion');
    }
  };

  // Mark entire adventure as complete
  const handleMarkAdventureComplete = async (adventureId: string) => {
    try {
      const { error } = await aiService.markAdventureComplete(adventureId);
      
      if (error) {
        Alert.alert('Error', 'Failed to mark adventure as complete');
        return;
      }

      // Update local state
      setAdventures(prev => prev.map(adventure => {
        if (adventure.id === adventureId) {
          // Mark all steps as completed when adventure is completed
          const allStepsCompleted: { [stepIndex: number]: boolean } = {};
          adventure.steps.forEach((_, index) => {
            allStepsCompleted[index] = true;
          });

          return {
            ...adventure,
            is_completed: true,
            step_completions: allStepsCompleted
          };
        }
        return adventure;
      }));

      // Show success message
      Alert.alert(
        'Congratulations!', 
        'Adventure completed! Great job exploring.',
        [{ text: 'Awesome!', style: 'default' }]
      );

    } catch (error) {
      console.error('Error marking adventure complete:', error);
      Alert.alert('Error', 'Failed to mark adventure as complete');
    }
  };

  // Handle adventure deletion with confirmation
  const handleDeleteAdventure = async (adventureId: string) => {
    Alert.alert(
      'Delete Adventure',
      'Are you sure you want to delete this adventure? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await aiService.deleteAdventure(adventureId);
              
              if (error) {
                Alert.alert('Error', 'Failed to delete adventure');
                return;
              }

              // Remove from local state
              setAdventures(prev => prev.filter(a => a.id !== adventureId));
              
              // Close modal if this adventure was being viewed
              if (selectedAdventure?.id === adventureId) {
                closeModal();
              }
              
              Alert.alert('Success', 'Adventure deleted successfully');
            } catch (error) {
              console.error('Error deleting adventure:', error);
              Alert.alert('Error', 'Failed to delete adventure');
            }
          }
        }
      ]
    );
  };

  const handleShareAdventure = (adventure: SavedAdventure) => {
    setAdventureToShare(adventure);
    setShareModalVisible(true);
  };

  // Component for saved community adventures
  const SavedCommunityAdventureCard = ({ adventure }: { adventure: any }) => (
    <TouchableOpacity
      className="bg-white rounded-2xl mr-4 shadow-sm border border-gray-100 mb-3"
      style={{ width: 280 }}
      activeOpacity={0.7}
    >
      {/* Adventure Photo */}
      {adventure.adventure_photos && adventure.adventure_photos.length > 0 ? (
        <Image 
          source={{ uri: adventure.adventure_photos.find((photo: any) => photo.is_cover_photo)?.photo_url || adventure.adventure_photos[0].photo_url }}
          className="h-32 rounded-t-2xl"
          style={{
            backgroundColor: '#e5e7eb'
          }}
          resizeMode="cover"
        />
      ) : (
        <View className="h-32 bg-green-500 rounded-t-2xl items-center justify-center">
          <Ionicons name="image-outline" size={32} color="white" />
          <Text className="text-white text-sm mt-1">Adventure Photo</Text>
        </View>
      )}

      <View className="p-4">
        <Text className="text-lg font-bold text-gray-900 mb-1" numberOfLines={2}>
          {adventure.custom_title}
        </Text>
        <Text className="text-gray-600 mb-3" numberOfLines={2}>
          {adventure.custom_description}
        </Text>

        {/* Adventure details */}
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Ionicons name="time" size={14} color="#9CA3AF" />
            <Text className="text-sm text-gray-500 ml-1">
              {formatDurationLocal(adventure.duration_hours)}
            </Text>
          </View>
          <View className="flex-row items-center">
            <Ionicons name="wallet" size={14} color="#9CA3AF" />
            <Text className="text-sm text-gray-500 ml-1">
              {formatCost(adventure.estimated_cost)}
            </Text>
          </View>
          <View className="flex-row items-center">
            <Ionicons name="location" size={14} color="#9CA3AF" />
            <Text className="text-sm text-gray-500 ml-1" numberOfLines={1}>
              {adventure.location}
            </Text>
          </View>
        </View>
        
        <Text className="text-xs text-gray-400 mt-2">
          Saved on {formatDate(adventure.saved_at)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  // Handle scheduled date update
  const handleUpdateScheduledDate = async (adventureId: string, scheduledDate: string) => {
    try {
      // Update local state immediately for better UX
      setAdventures(prev => prev.map(adventure => {
        if (adventure.id === adventureId) {
          return {
            ...adventure,
            scheduled_for: scheduledDate
          };
        }
        return adventure;
      }));

      // Update in database
      const { error } = await aiService.updateAdventureSchedule(adventureId, scheduledDate);
      
      if (error) {
        console.error('Error updating scheduled date:', error);
        // Revert local state on error
        setAdventures(prev => prev.map(adventure => {
          if (adventure.id === adventureId) {
            return {
              ...adventure,
              scheduled_for: undefined
            };
          }
          return adventure;
        }));
        Alert.alert('Error', 'Failed to schedule adventure');
        return;
      }
    } catch (error) {
      console.error('Error scheduling adventure:', error);
      Alert.alert('Error', 'Failed to schedule adventure');
    }
  };

  // Render horizontal adventure list
  const renderHorizontalAdventureList = (adventures: SavedAdventure[], showShareButton: boolean = false) => {
    const cardWidth = SCREEN_WIDTH * 0.75; // 75% of screen width

    return (
      <FlatList
        data={adventures}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingVertical: 8,
        }}
        keyExtractor={(item) => item.id}
        renderItem={({ item: adventure }) => (
          <View>
            <GradientAdventureCard
              adventure={adventure}
              onPress={viewAdventureDetails}
              onDelete={handleDeleteAdventure}
              formatDuration={formatDurationLocal}
              formatCost={formatCost}
              formatDate={formatDate}
              cardWidth={cardWidth}
            />
            
            {/* Share button for completed adventures */}
            {showShareButton && (
              <TouchableOpacity
                onPress={() => handleShareAdventure(adventure)}
                style={{
                  backgroundColor: '#f2cc6c',
                  paddingVertical: 12,
                  paddingHorizontal: 20,
                  borderRadius: 20,
                  marginTop: 8,
                  marginHorizontal: 4,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: cardWidth - 8,
                }}
              >
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#3c7660', marginRight: 8 }}>
                  Share to Community
                </Text>
                <Ionicons name="sparkles" size={16} color="#f59e0b" />
              </TouchableOpacity>
            )}
          </View>
        )}
      />
    );
  };

  const upcomingAdventures = getUpcomingAdventures();
  const completedAdventures = getCompletedAdventures();

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 items-center justify-center">
          <Ionicons name="calendar" size={48} color="#3c7660" />
          <Text className="text-gray-600 text-lg mt-4">Loading your adventures...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => loadAdventures(true)}
            tintColor="#3c7660"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="p-4 pb-2">
          <Text className="text-2xl font-bold text-gray-800">My Adventures</Text>
          <Text className="text-gray-600">
            {adventures.length === 0 
              ? 'No adventures yet' 
              : `${adventures.length} adventure${adventures.length === 1 ? '' : 's'} saved`
            }
          </Text>
        </View>

        {/* Saved Community Adventures */}
        {savedCommunityAdventures.length > 0 && (
          <View className="px-6 mb-6">
            <View className="flex-row items-center mb-3">
              <Ionicons name="bookmark" size={18} color="#D4AF37" />
              <Text className="text-xl font-bold text-gray-900 ml-2">
                Saved from Community ({savedCommunityAdventures.length})
              </Text>
            </View>
            <FlatList
              data={savedCommunityAdventures}
              renderItem={({ item }) => <SavedCommunityAdventureCard adventure={item} />}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingLeft: 0 }}
            />
          </View>
        )}

        {/* Content */}
        {adventures.length === 0 ? (
          <View className="px-6 mb-8">
            <View className="h-60 items-center justify-center bg-gray-100 rounded-xl">
              <MaterialIcons name="explore" size={48} color="#9CA3AF" />
              <Text className="text-lg font-semibold text-gray-700 mb-2 mt-4">No Adventures Yet</Text>
              <Text className="text-gray-500 text-center px-8 leading-6 mb-6">
                Create your first AI-powered adventure in the Curate tab to see it here.
              </Text>
              <Button
                title="Create Your First Adventure"
                onPress={() => {
                  Alert.alert('Tip', 'Go to the Curate tab to create your first adventure!');
                }}
                variant="primary"
              />
            </View>
          </View>
        ) : (
          <>
            {/* Upcoming Adventures */}
            {upcomingAdventures.length > 0 && (
              <View className="px-6 mb-8">
                <View className="flex-row items-center mb-2">
                  <Ionicons name="time" size={18} color="#f59e0b" />
                  <Text className="text-xl font-bold text-gray-900 ml-2">
                    Upcoming Adventures ({upcomingAdventures.length})
                  </Text>
                </View>
                <Text className="text-gray-500 text-sm mb-4">
                  Swipe left/right to browse • Long press to delete
                </Text>
                
                {renderHorizontalAdventureList(upcomingAdventures, false)}
              </View>
            )}

            {/* Completed Adventures */}
            {completedAdventures.length > 0 && (
              <View className="px-6 mb-8">
                <View className="flex-row items-center mb-2">
                  <Ionicons name="checkmark-circle" size={18} color="#10b981" />
                  <Text className="text-xl font-bold text-gray-900 ml-2">
                    Completed Adventures ({completedAdventures.length})
                  </Text>
                </View>
                <Text className="text-gray-500 text-sm mb-4">
                  Swipe left/right to browse • Tap share button to inspire others
                </Text>
                
                {renderHorizontalAdventureList(completedAdventures, true)}
              </View>
            )}
          </>
        )}

        {/* Footer spacing */}
        <View className="h-20" />
      </ScrollView>

      {/* Adventure Detail Modal */}
      <AdventureDetailModal
        visible={modalVisible}
        adventure={selectedAdventure}
        onClose={closeModal}
        onMarkComplete={handleMarkAdventureComplete}
        onUpdateStepCompletion={handleUpdateStepCompletion}
        onUpdateScheduledDate={handleUpdateScheduledDate}
        formatDate={formatDate}
        formatDuration={formatDurationLocal}
        formatCost={formatCost}
      />

      {/* Share Adventure Modal */}
      <ShareAdventureModal
        visible={shareModalVisible}
        adventure={adventureToShare}
        onClose={() => {
          setShareModalVisible(false);
          setAdventureToShare(null);
        }}
        onSuccess={() => {
          loadAdventures(); // Refresh the list
        }}
      />
    </SafeAreaView>
  );
};

export default PlansScreen;