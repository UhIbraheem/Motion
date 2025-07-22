// src/screens/DiscoverScreen.tsx - WITH ADVENTURE DETAIL MODAL (NO ICONS CHANGED)
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  RefreshControl, 
  TouchableOpacity,
  Alert,
  FlatList 
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
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

const DiscoverScreen: React.FC<{ navigation?: any }> = ({ navigation }) => {
  const { user } = useAuth();
  const [communityAdventures, setCommunityAdventures] = useState<CommunityAdventure[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Modal state
  const [selectedAdventure, setSelectedAdventure] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Category data
  const categories = [
    { 
      id: 'food', 
      title: 'Food & Drink', 
      icon: 'restaurant', 
      color: '#FF6B6B',
      iconFamily: 'Ionicons' 
    },
    { 
      id: 'culture', 
      title: 'Culture', 
      icon: 'museum', 
      color: '#4ECDC4',
      iconFamily: 'MaterialIcons' 
    },
    { 
      id: 'outdoor', 
      title: 'Outdoors', 
      icon: 'tree', 
      color: '#45B7D1',
      iconFamily: 'FontAwesome5' 
    },
    { 
      id: 'party', 
      title: 'Nightlife', 
      icon: 'musical-notes', 
      color: '#96CEB4',
      iconFamily: 'Ionicons' 
    }
  ];

  useEffect(() => {
    loadCommunityAdventures();
  }, []);

  // Reload adventures when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadCommunityAdventures();
    }, [])
  );

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
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= rating ? 'star' : 'star-outline'}
          size={14}
          color={i <= rating ? '#FFD700' : '#D1D5DB'}
        />
      );
    }
    return stars;
  };

  const handleCategoryPress = (category: any) => {
    if (!navigation) {
      Alert.alert('Coming Soon', `${category.title} adventures will be available soon!`);
      return;
    }

    // Navigate to category-specific screens
    switch (category.id) {
      case 'food':
        navigation.navigate('FoodCategory');
        break;
      case 'culture':
        navigation.navigate('CultureCategory');
        break;
      case 'outdoor':
        navigation.navigate('OutdoorCategory');
        break;
      case 'party':
        navigation.navigate('NightlifeCategory');
        break;
      default:
        Alert.alert('Coming Soon', `${category.title} adventures will be available soon!`);
    }
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
      className="bg-white rounded-2xl mr-4 shadow-sm border border-gray-100"
      style={{ width: 280 }}
      onPress={() => handleAdventurePress(adventure)}
      activeOpacity={0.7}
    >
      {/* Photo placeholder - will show user photos when available */}
      <View className="h-40 bg-gradient-to-br from-green-200 to-green-600 rounded-t-2xl items-center justify-center">
        <Ionicons name="image-outline" size={40} color="white" />
        <Text className="text-white text-sm mt-2">Adventure Photo</Text>
      </View>

      <View className="p-4">
        {/* Header with user info */}
        <View className="flex-row items-center mb-3">
          <View className="w-8 h-8 bg-green-600 rounded-full items-center justify-center mr-3">
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
            <View className="flex-row mr-1">
              {renderStars(adventure.rating)}
            </View>
            <Text className="text-xs text-gray-500">({adventure.rating})</Text>
          </View>
        </View>

        {/* Adventure content */}
        <Text className="text-lg font-semibold text-gray-900 mb-2 leading-tight">
          {adventure.custom_title}
        </Text>
        <Text className="text-gray-600 mb-3 leading-5" numberOfLines={2}>
          {adventure.custom_description}
        </Text>

        {/* Location */}
        <View className="flex-row items-center mb-3">
          <Ionicons name="location" size={16} color="#3c7660" />
          <Text className="text-sm text-green-600 ml-1">
            {adventure.location}
          </Text>
        </View>

        {/* Adventure meta */}
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center space-x-4">
            <View className="flex-row items-center">
              <Ionicons name="time" size={14} color="#9CA3AF" />
              <Text className="text-sm text-gray-500 ml-1">
                {formatDuration(adventure.duration_hours)}
              </Text>
            </View>
            <View className="flex-row items-center">
              <Ionicons name="wallet" size={14} color="#9CA3AF" />
              <Text className="text-sm text-gray-500 ml-1">
                {formatCost(adventure.estimated_cost)}
              </Text>
            </View>
            <View className="flex-row items-center">
              <Ionicons name="list" size={14} color="#9CA3AF" />
              <Text className="text-sm text-gray-500 ml-1">
                {adventure.steps.length}
              </Text>
            </View>
          </View>

          {/* Heart button */}
          <TouchableOpacity
            onPress={() => handleHeartPress(adventure.id)}
            className="flex-row items-center"
          >
            <Ionicons name="heart-outline" size={18} color="#9CA3AF" />
            <Text className="text-sm text-gray-500 ml-1">0</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View className="flex-1 bg-gray-50">
        <View className="flex-1 items-center justify-center">
          <Ionicons name="compass" size={48} color="#3c7660" />
          <Text className="text-gray-600 text-lg mt-4">Loading adventures...</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
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
        <View className="p-4 pb-2">
          <Text className="text-2xl font-bold text-gray-800">Discover</Text>
          <Text className="text-gray-600">
            Explore adventures by category
          </Text>
        </View>

        {/* Categories Grid */}
        <View className="px-4 mb-6">
          <Text className="text-lg font-semibold text-gray-800 mb-3">Categories</Text>
          <View className="flex-row flex-wrap justify-between">
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 items-center justify-center mb-3"
                style={{ 
                  width: '48%', 
                  height: 100,
                  backgroundColor: `${category.color}15` 
                }}
                onPress={() => handleCategoryPress(category)}
              >
                <View className="items-center">
                  {category.iconFamily === 'Ionicons' ? (
                    <Ionicons name={category.icon as any} size={32} color={category.color} />
                  ) : category.iconFamily === 'MaterialIcons' ? (
                    <MaterialIcons name={category.icon as any} size={32} color={category.color} />
                  ) : (
                    <FontAwesome5 name={category.icon} size={28} color={category.color} />
                  )}
                  <Text className="text-gray-800 font-semibold mt-2 text-sm">
                    {category.title}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recently Shared Adventures */}
        <View className="mb-6">
          <View className="flex-row items-center justify-between px-4 mb-3">
            <Text className="text-lg font-semibold text-gray-800">Recent Adventures</Text>
            {communityAdventures.length > 3 && (
              <TouchableOpacity>
                <Text className="text-green-600 font-medium">See All</Text>
              </TouchableOpacity>
            )}
          </View>
          
          {communityAdventures.length === 0 ? (
            <View className="items-center justify-center py-12 mx-4">
              <Ionicons name="map-outline" size={48} color="#9CA3AF" />
              <Text className="text-lg font-semibold text-gray-700 mb-2 mt-4">
                No adventures shared yet
              </Text>
              <Text className="text-gray-500 text-center px-8 leading-6">
                Be the first to share an adventure! Complete one from your plans and share it with the community.
              </Text>
            </View>
          ) : (
            <FlatList
              data={communityAdventures}
              renderItem={({ item }) => <CommunityAdventureCard adventure={item} />}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingLeft: 16, paddingRight: 16 }}
            />
          )}
        </View>

        {/* Popular This Week - Placeholder for future */}
        {communityAdventures.length > 0 && (
          <View className="px-4 mb-6">
            <Text className="text-lg font-semibold text-gray-800 mb-3">Trending This Week</Text>
            <View className="bg-gradient-to-r from-green-100 to-green-200 rounded-2xl p-6 items-center">
              <Ionicons name="trending-up" size={32} color="#3c7660" />
              <Text className="text-green-600 font-semibold text-center mt-2">
                Coming Soon
              </Text>
              <Text className="text-gray-600 text-sm text-center mt-1">
                Discover what's trending in your area
              </Text>
            </View>
          </View>
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
        onUpdateScheduledDate={() => {}} // Empty function for community adventures
        formatDate={formatDate}
        formatDuration={formatDuration}
        formatCost={formatCost}
      />
    </View>
  );
};

export default DiscoverScreen;