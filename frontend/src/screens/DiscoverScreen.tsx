// src/screens/DiscoverScreen.tsx - WITH ADVENTURE DETAIL MODAL (NO ICONS CHANGED)
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  RefreshControl, 
  TouchableOpacity,
  Alert 
} from 'react-native';
import { aiService } from '../services/aiService';
import { useAuth } from '../context/AuthContext';
import { AdventureDetailModal } from '../components/modals/AdventureDetailModal';

interface CommunityAdventure {
  id: string;
  user_id: string;
  custom_title: string;
  custom_description: string;
  rating: number;
  location: string;
  duration_hours: number;
  estimated_cost: number;
  steps: any[];
  created_at: string;
  adventure_photos?: Array<{
    photo_url: string;
    is_cover_photo: boolean;
  }>;
  profiles: {
    first_name: string | null;
    last_name: string | null;
  };
}

const DiscoverScreen: React.FC = () => {
  const { user } = useAuth();
  const [communityAdventures, setCommunityAdventures] = useState<CommunityAdventure[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Modal state
  const [selectedAdventure, setSelectedAdventure] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    loadCommunityAdventures();
  }, []);

  const loadCommunityAdventures = async (showRefreshSpinner = false) => {
    if (showRefreshSpinner) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      console.log('🌊 Loading community adventures...');
      const { data, error } = await aiService.getCommunityAdventures();

      if (error) {
        console.error('❌ Error loading community adventures:', error);
        Alert.alert('Error', 'Failed to load community adventures');
        return;
      }

      console.log('✅ Loaded community adventures:', data?.length || 0);
      setCommunityAdventures(data || []);
    } catch (error) {
      console.error('❌ Unexpected error loading community adventures:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const formatCost = (cost: number) => {
    if (cost <= 25) return '$';
    if (cost <= 75) return '$$';
    return '$$$';
  };

  const formatDuration = (hours: number) => {
    if (hours <= 2) return `${hours} hour${hours === 1 ? '' : 's'}`;
    if (hours <= 6) return `${hours} hours`;
    return 'Full day';
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getUserInitials = (firstName: string | null, lastName: string | null) => {
    if (firstName && lastName) {
      return (firstName[0] + lastName[0]).toUpperCase();
    }
    if (firstName) {
      return firstName.substring(0, 2).toUpperCase();
    }
    return 'AN'; // Anonymous
  };

  const getDisplayName = (firstName: string | null, lastName: string | null) => {
    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    }
    if (firstName) {
      return firstName;
    }
    return 'Anonymous Explorer';
  };

  const renderStars = (rating: number) => {
    return '⭐'.repeat(Math.max(1, Math.min(5, rating)));
  };

  // Format functions for modal
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleAdventurePress = (adventure: CommunityAdventure) => {
    // Transform community adventure to match AdventureDetailModal format
    const transformedAdventure = {
      id: adventure.id,
      title: adventure.custom_title || 'Community Adventure',
      description: adventure.custom_description || 'A shared adventure from the community',
      duration_hours: adventure.duration_hours || 2,
      estimated_cost: typeof adventure.estimated_cost === 'string'
        ? parseInt((adventure.estimated_cost as string).replace(/\$/g, '')) || 25
        : typeof adventure.estimated_cost === 'number'
          ? adventure.estimated_cost
          : 25,
      steps: adventure.steps || [],
      is_completed: true, // Community adventures are already completed
      is_favorite: false,
      created_at: adventure.created_at || new Date().toISOString(),
      step_completions: {}
    };
    
    setSelectedAdventure(transformedAdventure);
    setModalVisible(true);
  };

  // Close modal
  const closeModal = () => {
    setModalVisible(false);
    setSelectedAdventure(null);
  };

  // Placeholder functions for AdventureDetailModal
  const handleMarkAdventureComplete = (adventureId: string) => {
    Alert.alert('Info', 'This adventure is already completed by the original creator!');
    closeModal();
  };

  const handleUpdateStepCompletion = (adventureId: string, stepIndex: number, completed: boolean) => {
    // No-op for community adventures - they're read-only
  };

  const handleSaveAdventure = (adventure: CommunityAdventure) => {
    // TODO: Implement saving community adventure to user's plans
    Alert.alert('Feature Coming Soon', 'Saving community adventures to your plans will be available soon!');
  };

  const handleHeartPress = (adventureId: string) => {
    // TODO: Implement liking adventures
    Alert.alert('Feature Coming Soon', 'Liking adventures will be available soon!');
  };

  const CommunityAdventureCard = ({ adventure }: { adventure: CommunityAdventure }) => (
    <TouchableOpacity
      className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-gray-100"
      onPress={() => handleAdventurePress(adventure)}
      activeOpacity={0.7}
    >
      {/* Header with user info */}
      <View className="flex-row items-center mb-3">
        <View className="w-8 h-8 bg-brand-sage rounded-full items-center justify-center mr-3">
          <Text className="text-white text-xs font-semibold">
            {getUserInitials(adventure.profiles.first_name, adventure.profiles.last_name)}
          </Text>
        </View>
        <View className="flex-1">
          <Text className="text-sm font-medium text-gray-900">
            {getDisplayName(adventure.profiles.first_name, adventure.profiles.last_name)}
          </Text>
          <Text className="text-xs text-gray-500">
            {formatTimeAgo(adventure.created_at)}
          </Text>
        </View>
        <View className="flex-row items-center">
          <Text className="text-sm mr-1">{renderStars(adventure.rating)}</Text>
          <Text className="text-xs text-gray-500">({adventure.rating}/5)</Text>
        </View>
      </View>

      {/* Adventure content */}
      <Text className="text-lg font-semibold text-gray-900 mb-2">
        {adventure.custom_title}
      </Text>
      <Text className="text-gray-600 mb-3 leading-5">
        {adventure.custom_description}
      </Text>

      {/* Location */}
      <Text className="text-sm text-brand-sage mb-3">
        📍 {adventure.location}
      </Text>

      {/* Adventure meta */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center space-x-4">
          <Text className="text-sm text-gray-500">
            {formatDuration(adventure.duration_hours)}
          </Text>
          <Text className="text-sm text-gray-500">
            {formatCost(adventure.estimated_cost)}
          </Text>
          <Text className="text-sm text-gray-500">
            {adventure.steps.length} steps
          </Text>
        </View>

        {/* Interaction buttons */}
        <View className="flex-row items-center space-x-3">
          <TouchableOpacity
            onPress={() => handleHeartPress(adventure.id)}
            className="flex-row items-center"
          >
            <Text className="text-lg mr-1">🤍</Text>
            <Text className="text-sm text-gray-500">0</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View className="flex-1 bg-background-light">
        <View className="flex-1 items-center justify-center">
          <Text className="text-4xl mb-4">🌊</Text>
          <Text className="text-gray-600 text-lg">Loading community adventures...</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background-light">
      <ScrollView 
        className="flex-1 p-4"
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => loadCommunityAdventures(true)}
            tintColor="#3c7660"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="mb-6">
          <Text className="text-2xl font-bold text-brand-sage">Community Adventures</Text>
          <Text className="text-text-secondary">
            {communityAdventures.length > 0 
              ? `${communityAdventures.length} adventures shared by fellow explorers`
              : 'Discover adventures shared by fellow explorers'
            }
          </Text>
        </View>

        {/* Community adventures feed */}
        {communityAdventures.length === 0 ? (
          <View className="items-center justify-center py-12">
            <Text className="text-4xl mb-4">🗺️</Text>
            <Text className="text-lg font-semibold text-gray-700 mb-2">
              No community adventures yet
            </Text>
            <Text className="text-gray-500 text-center px-8 leading-6">
              Be the first to share an adventure! Complete an adventure from your plans and tap "Share to Community" to inspire others.
            </Text>
          </View>
        ) : (
          <>
            {communityAdventures.map((adventure) => (
              <CommunityAdventureCard key={adventure.id} adventure={adventure} />
            ))}

            {/* Footer message */}
            <View className="items-center py-8">
              <Text className="text-gray-400 text-center">
                🎉 You've seen all community adventures!
              </Text>
              <Text className="text-gray-400 text-center mt-1">
                Pull down to refresh for new ones.
              </Text>
            </View>
          </>
        )}

        {/* Popular categories placeholder for future */}
        {communityAdventures.length > 3 && (
          <View className="mt-8 mb-6">
            <Text className="text-lg font-semibold text-text-primary mb-3">
              Explore by Category
            </Text>
            <View className="flex-row flex-wrap justify-between">
              {['Food & Drink', 'Outdoors', 'Cultural', 'Nightlife'].map((category) => (
                <TouchableOpacity
                  key={category}
                  className="bg-brand-cream rounded-lg w-[48%] h-20 mb-3 items-center justify-center"
                  onPress={() => Alert.alert('Coming Soon', `${category} filtering will be available soon!`)}
                >
                  <Text className="text-brand-sage font-semibold">{category}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Adventure Detail Modal */}
      <AdventureDetailModal
        visible={modalVisible}
        adventure={selectedAdventure}
        onClose={closeModal}
        onMarkComplete={handleMarkAdventureComplete}
        onUpdateStepCompletion={handleUpdateStepCompletion}
        formatDate={formatDate}
        formatDuration={formatDuration}
        formatCost={formatCost}
      />
    </View>
  );
};

export default DiscoverScreen;