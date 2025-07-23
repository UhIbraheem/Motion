import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  RefreshControl, 
  TouchableOpacity,
  Alert,
  FlatList,
  SafeAreaView 
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { aiService } from '../services/aiService';
import { useAuth } from '../context/AuthContext';
import { experienceTypes } from '../data/experienceTypes';

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
        setCommunityAdventures([]);
        return;
      }

      console.log('✅ Loaded community adventures:', data?.length || 0);
      setCommunityAdventures(data || []);
    } catch (error) {
      console.error('❌ Unexpected error loading community adventures:', error);
      setCommunityAdventures([]);
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

  const handleCategoryPress = (experience: any) => {
    Alert.alert('Coming Soon', `${experience.name} adventures will be available soon!`);
  };

  const handleAdventurePress = (adventure: CommunityAdventure) => {
    Alert.alert(
      adventure.custom_title,
      adventure.custom_description,
      [{ text: 'OK' }]
    );
  };

  const CategoryCard = ({ experience }: { experience: any }) => (
    <TouchableOpacity
      className="bg-white rounded-2xl mr-4 shadow-sm border border-gray-100 items-center justify-center"
      style={{ width: 140, height: 100 }}
      onPress={() => handleCategoryPress(experience)}
    >
      <Ionicons name={experience.icon} size={32} color="#3c7660" />
      <Text className="text-gray-800 font-semibold mt-2 text-sm text-center">
        {experience.name}
      </Text>
    </TouchableOpacity>
  );

  const CommunityAdventureCard = ({ adventure }: { adventure: CommunityAdventure }) => (
    <TouchableOpacity
      className="bg-white rounded-2xl mr-4 shadow-sm border border-gray-100"
      style={{ width: 280 }}
      onPress={() => handleAdventurePress(adventure)}
      activeOpacity={0.7}
    >
      {/* Photo placeholder */}
      <View className="h-40 bg-green-500 rounded-t-2xl items-center justify-center">
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
          <TouchableOpacity className="flex-row items-center">
            <Ionicons name="heart-outline" size={18} color="#9CA3AF" />
            <Text className="text-sm text-gray-500 ml-1">0</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 items-center justify-center">
          <Ionicons name="compass" size={48} color="#3c7660" />
          <Text className="text-gray-600 text-lg mt-4">Loading adventures...</Text>
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

        {/* Adventure Curation Button */}
        <View className="px-6 mb-6">
          <TouchableOpacity
            className="bg-green-500 rounded-2xl p-6 shadow-sm"
            style={{
              backgroundColor: '#10b981', // Fallback color
              borderRadius: 16,
              padding: 24,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}
            onPress={() => navigation?.navigate?.('Curate')}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-white text-xl font-bold mb-2">
                  Curate Your Next Adventure
                </Text>
                <Text className="text-green-100 text-sm leading-relaxed">
                  Tell us what you're in the mood for and we'll create a personalized adventure just for you
                </Text>
              </View>
              <View className="ml-4">
                <Ionicons name="add-circle" size={32} color="white" />
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Categories Section */}
        <View className="px-6 mb-6">
          <Text className="text-xl font-bold text-gray-900 mb-4">Explore by Category</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            className="mb-4"
          >
            {experienceTypes.map((experience) => (
              <CategoryCard 
                key={experience.id} 
                experience={experience} 
              />
            ))}
          </ScrollView>
        </View>

        {/* Community Adventures Section */}
        <View className="px-6 mb-8">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-xl font-bold text-gray-900">Community Adventures</Text>
            <TouchableOpacity>
              <Text className="text-green-600 font-medium">View All</Text>
            </TouchableOpacity>
          </View>

          {/* Community Adventures List */}
          {communityAdventures.length === 0 ? (
            <View className="h-40 items-center justify-center bg-gray-100 rounded-xl">
              <Ionicons name="compass" size={32} color="#9CA3AF" />
              <Text className="text-gray-500 text-center mt-2">No community adventures yet</Text>
              <Text className="text-gray-400 text-sm text-center mt-1">Be the first to share an adventure!</Text>
            </View>
          ) : (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              className="pb-4"
            >
              {communityAdventures.map((adventure) => (
                <CommunityAdventureCard key={adventure.id} adventure={adventure} />
              ))}
            </ScrollView>
          )}
        </View>

        {/* Footer spacing */}
        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
};

export default DiscoverScreen;