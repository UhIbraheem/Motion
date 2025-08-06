import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  RefreshControl, 
  TouchableOpacity,
  Alert,
  FlatList,
  SafeAreaView,
  Image,
  ImageBackground 
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { aiService } from '../services/aiService';
import { adventureInteractionService } from '../services/adventureInteractionService';
import { useAuth } from '../context/AuthContext';
import { usePreferences } from '../context/PreferencesContext';
import { experienceTypes } from '../data/experienceTypes';
import { formatBudget, formatDistance, formatDuration } from '../utils/formatters';
import CommunityAdventureReviewModal from '../components/modals/CommunityAdventureReviewModal';

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
    profile_picture_url?: string | null;
  };
}

const DiscoverScreen: React.FC<{ navigation?: any }> = ({ navigation }) => {
  const { user } = useAuth();
  const { preferences, updatePreferences } = usePreferences();
  const [communityAdventures, setCommunityAdventures] = useState<CommunityAdventure[]>([]);
  const [filteredAdventures, setFilteredAdventures] = useState<CommunityAdventure[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [userInteractions, setUserInteractions] = useState<{[key: string]: {liked: boolean, saved: boolean}}>({});
  const [selectedAdventure, setSelectedAdventure] = useState<CommunityAdventure | null>(null);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadCommunityAdventures();
  }, []);

  // Filter adventures based on selected categories
  useEffect(() => {
    if (selectedCategories.length === 0) {
      setFilteredAdventures(communityAdventures);
    } else {
      const filtered = communityAdventures.filter(adventure => {
        // Check if adventure title, description, or steps contain any selected category keywords
        const searchText = `${adventure.custom_title} ${adventure.custom_description} ${JSON.stringify(adventure.steps)}`.toLowerCase();
        
        return selectedCategories.some(category => {
          const categoryKeywords = getCategoryKeywords(category);
          return categoryKeywords.some(keyword => searchText.includes(keyword.toLowerCase()));
        });
      });
      setFilteredAdventures(filtered);
    }
  }, [communityAdventures, selectedCategories]);

  // Get keywords for each category
  const getCategoryKeywords = (categoryId: string): string[] => {
    const keywordMap: { [key: string]: string[] } = {
      'cultural-explorer': ['museum', 'gallery', 'art', 'culture', 'history', 'heritage', 'historic'],
      'foodie-adventure': ['restaurant', 'food', 'dining', 'cafe', 'coffee', 'eat', 'cuisine', 'bar', 'drink'],
      'outdoor-enthusiast': ['park', 'outdoor', 'nature', 'hiking', 'walking', 'garden', 'beach', 'scenic'],
      'nightlife-seeker': ['bar', 'club', 'nightlife', 'drinks', 'music', 'party', 'evening', 'cocktail'],
      'wellness-focused': ['spa', 'wellness', 'yoga', 'meditation', 'relaxation', 'fitness', 'health'],
      'adventure-sports': ['adventure', 'sports', 'active', 'thrill', 'extreme', 'adrenaline'],
      'solo-freestyle': ['solo', 'independent', 'flexible', 'explore', 'discover'],
      'academic-weapon': ['library', 'study', 'academic', 'learning', 'educational', 'intellectual']
    };
    return keywordMap[categoryId] || [categoryId];
  };

  // Reload adventures when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadCommunityAdventures();
    }, [])
  );

  const loadCommunityAdventures = async (isRefresh: boolean = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const { data, error } = await aiService.getCommunityAdventures();

      if (error) {
        console.error('❌ Error loading community adventures:', error);
        Alert.alert('Error', 'Failed to load community adventures');
        setCommunityAdventures([]);
        return;
      }

      setCommunityAdventures(data || []);
      console.log('🌍 Community adventures loaded:', data?.length || 0);
      if (data && data.length > 0) {
        console.log('🖼️ First adventure profile data:', data[0]?.profiles);
      }

      // Load user interactions for these adventures
      if (user && data) {
        loadUserInteractions(data.map(adventure => adventure.id));
      }
    } catch (error) {
      console.error('❌ Unexpected error loading community adventures:', error);
      setCommunityAdventures([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const loadUserInteractions = async (adventureIds: string[]) => {
    try {
      const interactionMap: {[key: string]: {liked: boolean, saved: boolean}} = {};
      
      // Load interactions for each adventure
      for (const id of adventureIds) {
        const result = await adventureInteractionService.getUserInteractions(id);
        interactionMap[id] = {
          liked: result.hasLiked,
          saved: result.hasSaved
        };
      }
      
      setUserInteractions(interactionMap);
    } catch (error) {
      console.error('Error loading user interactions:', error);
    }
  };

  const handleInteraction = async (adventureId: string, type: 'heart' | 'save') => {
    if (!user) {
      Alert.alert('Sign In Required', 'Please sign in to save or like adventures');
      return;
    }

    // Optimistic update - update UI immediately
    const currentState = userInteractions[adventureId];
    const newState = {
      ...currentState,
      [type === 'heart' ? 'liked' : 'saved']: !currentState?.[type === 'heart' ? 'liked' : 'saved']
    };
    
    setUserInteractions(prev => ({
      ...prev,
      [adventureId]: newState
    }));

    // Then update backend in background
    try {
      const result = await adventureInteractionService.toggleInteraction(adventureId, type);
      
      if (!result.success) {
        // Revert optimistic update if backend failed
        setUserInteractions(prev => ({
          ...prev,
          [adventureId]: currentState
        }));
        Alert.alert('Error', result.error || 'Failed to update interaction');
      }
    } catch (error) {
      // Revert optimistic update on error
      setUserInteractions(prev => ({
        ...prev,
        [adventureId]: currentState
      }));
      console.error('Error handling interaction:', error);
      Alert.alert('Error', 'Something went wrong');
    }
  };

  // Helper functions
  const getUserInitials = (firstName: string | null, lastName: string | null): string => {
    const firstInitial = firstName?.charAt(0)?.toUpperCase() || '';
    const lastInitial = lastName?.charAt(0)?.toUpperCase() || '';
    return firstInitial + lastInitial || '?';
  };

  const getDisplayName = (firstName: string | null, lastName: string | null): string => {
    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    } else if (firstName) {
      return firstName;
    } else if (lastName) {
      return lastName;
    }
    return 'Anonymous User';
  };

  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return `${Math.floor(diffInSeconds / 604800)}w ago`;
  };

  const formatCost = (cost: number | string): string => {
    if (typeof cost === 'string') {
      // Try to extract numeric value from string
      const numericCost = parseFloat(cost.replace(/[^0-9.]/g, ''));
      if (!isNaN(numericCost)) {
        return formatBudget(numericCost, preferences);
      }
      return cost;
    }
    return formatBudget(cost, preferences);
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= rating ? 'star' : 'star-outline'}
          size={12}
          color={i <= rating ? '#FCD34D' : '#D1D5DB'}
        />
      );
    }
    return stars;
  };

  // Handle category selection
  const handleCategoryPress = (experience: any) => {
    setSelectedCategories(prev => {
      if (prev.includes(experience.id)) {
        // Remove category if already selected
        return prev.filter(id => id !== experience.id);
      } else {
        // Add category to selection
        return [...prev, experience.id];
      }
    });
  };

  const handleAdventurePress = (adventure: CommunityAdventure) => {
    // Record view interaction
    if (user) {
      adventureInteractionService.recordView(adventure.id);
    }
    
    // Open review modal instead of system alert
    setSelectedAdventure(adventure);
    setReviewModalVisible(true);
  };

  const CategoryCard = ({ experience }: { experience: any }) => {
    const isSelected = selectedCategories.includes(experience.id);
    
    return (
      <TouchableOpacity
        className="bg-white rounded-2xl mr-4 shadow-sm border items-center justify-center relative"
        style={{ 
          width: 140, 
          height: 100,
          borderColor: isSelected ? '#D4AF37' : '#f3f4f6',
          borderWidth: isSelected ? 2 : 1,
        }}
        onPress={() => handleCategoryPress(experience)}
      >
        <Ionicons 
          name={experience.icon} 
          size={32} 
          color={isSelected ? '#D4AF37' : '#3c7660'} 
        />
        <Text 
          className={`font-semibold mt-2 text-sm text-center ${
            isSelected ? 'text-yellow-600' : 'text-gray-800'
          }`}
        >
          {experience.name}
        </Text>
        {/* Selection indicator dot */}
        {isSelected && (
          <View 
            className="absolute bottom-2 w-2 h-2 rounded-full"
            style={{ backgroundColor: '#D4AF37' }}
          />
        )}
      </TouchableOpacity>
    );
  };

  const CommunityAdventureCard = ({ adventure }: { adventure: CommunityAdventure }) => {
    const isLiked = userInteractions[adventure.id]?.liked || false;
    const isSaved = userInteractions[adventure.id]?.saved || false;

    return (
      <TouchableOpacity
        className="bg-white rounded-2xl mr-4 shadow-sm border border-gray-100"
        style={{ width: 280 }}
        onPress={() => handleAdventurePress(adventure)}
        activeOpacity={0.7}
      >
        {/* Adventure Photo with overlay buttons */}
        <View className="relative">
          {adventure.adventure_photos && adventure.adventure_photos.length > 0 ? (
            <Image 
              source={{ uri: adventure.adventure_photos.find(photo => photo.is_cover_photo)?.photo_url || adventure.adventure_photos[0].photo_url }}
              className="h-40 rounded-t-2xl"
              style={{
                backgroundColor: '#e5e7eb' // fallback background
              }}
              resizeMode="cover"
            />
          ) : (
            <View className="h-40 bg-green-500 rounded-t-2xl items-center justify-center">
              <Ionicons name="image-outline" size={40} color="white" />
              <Text className="text-white text-sm mt-2">Adventure Photo</Text>
            </View>
          )}
          
          {/* Like and Save overlay buttons */}
          <View className="absolute top-3 right-3 flex-row space-x-2">
            <TouchableOpacity
              className="w-10 h-10 rounded-full items-center justify-center"
              style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.2,
                shadowRadius: 2,
                elevation: 2
              }}
              onPress={(e) => {
                e.stopPropagation();
                handleInteraction(adventure.id, 'heart');
              }}
              activeOpacity={0.7}
            >
              <Ionicons 
                name={isLiked ? "heart" : "heart-outline"} 
                size={20} 
                color={isLiked ? "#ef4444" : "#6B7280"} 
              />
            </TouchableOpacity>
            
            <TouchableOpacity
              className="w-10 h-10 rounded-full items-center justify-center"
              style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.2,
                shadowRadius: 2,
                elevation: 2
              }}
              onPress={(e) => {
                e.stopPropagation();
                handleInteraction(adventure.id, 'save');
              }}
              activeOpacity={0.7}
            >
              <Ionicons 
                name={isSaved ? "bookmark" : "bookmark-outline"} 
                size={20} 
                color={isSaved ? "#D4AF37" : "#6B7280"} 
              />
            </TouchableOpacity>
          </View>
        </View>

      <View className="p-4">
        {/* Header with user info */}
        <View className="flex-row items-center mb-3">
          {adventure.profiles.profile_picture_url && adventure.profiles.profile_picture_url.trim() !== '' ? (
            <Image 
              source={{ uri: adventure.profiles.profile_picture_url }}
              className="w-8 h-8 rounded-full mr-3"
              style={{
                backgroundColor: '#e5e7eb' // fallback background
              }}
              onError={(error) => {
                console.error('Discover profile image failed to load:', error.nativeEvent.error);
                console.log('Profile picture URL:', adventure.profiles.profile_picture_url);
              }}
              onLoad={() => {
                console.log('Discover profile image loaded successfully');
              }}
            />
          ) : (
            <View className="w-8 h-8 bg-green-600 rounded-full items-center justify-center mr-3">
              <Text className="text-white text-xs font-semibold">
                {getUserInitials(adventure.profiles.first_name, adventure.profiles.last_name)}
              </Text>
            </View>
          )}
          <View className="flex-1">
            <Text className="text-sm font-medium text-gray-900">
              {getDisplayName(adventure.profiles.first_name, adventure.profiles.last_name)}
            </Text>
            <Text className="text-xs text-gray-500">
              {formatTimeAgo(adventure.created_at)}
            </Text>
          </View>
        </View>

        {/* Adventure Info */}
        <Text className="text-lg font-bold text-gray-900 mb-2">
          {adventure.custom_title}
        </Text>
        <Text className="text-sm text-gray-600 mb-3 leading-relaxed" numberOfLines={2}>
          {adventure.custom_description}
        </Text>

        {/* Adventure Details */}
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
                {adventure.steps.length} steps
              </Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
    );
  };

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
          {/* Category Filter Status */}
          {selectedCategories.length > 0 && (
            <View className="flex-row items-center mt-2">
              <Text className="text-sm text-gray-500">
                Filtered by {selectedCategories.length} {selectedCategories.length === 1 ? 'category' : 'categories'}
              </Text>
              <TouchableOpacity 
                onPress={() => setSelectedCategories([])}
                className="ml-2 px-2 py-1 bg-gray-200 rounded-full"
              >
                <Text className="text-xs text-gray-600">Clear</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Adventure Curation Button - Enhanced Brand Design */}
        <View className="px-6 mb-6">
          <TouchableOpacity
            className="rounded-2xl shadow-lg overflow-hidden"
            style={{
              borderRadius: 16,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 8,
              elevation: 6,
            }}
            onPress={() => navigation?.navigate?.('Curate')}
          >
            <LinearGradient
              colors={['#3c7660', '#f2cc6c']} // Sage to Gold gradient
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                padding: 24,
                position: 'relative',
              }}
            >
              {/* Logo Swirl Overlay */}
              <View 
                style={{
                  position: 'absolute',
                  right: -20,
                  top: -10,
                  opacity: 0.15,
                  transform: [{ scale: 1.5 }]
                }}
              >
                <Image 
                  source={require('../../assets/logo-swirl.png')}
                  style={{
                    width: 100,
                    height: 100,
                    tintColor: 'white'
                  }}
                  resizeMode="contain"
                />
              </View>

              <View className="flex-row items-center justify-between relative z-10">
                <View className="flex-1">
                  <Text className="text-white text-xl font-bold mb-1">
                    Curate Your Next Adventure
                  </Text>
                  <Text className="text-white/90 text-xs font-medium mb-3 tracking-wide">
                    Let us do the planning
                  </Text>
                  <Text className="text-white/85 text-sm leading-relaxed">
                    Tell us what you're in the mood for and we'll create a personalized adventure just for you
                  </Text>
                </View>
                <View className="ml-4">
                  <View 
                    className="w-12 h-12 rounded-full items-center justify-center"
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                  >
                    <Ionicons name="arrow-forward" size={24} color="white" />
                  </View>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Categories Section */}
        <View className="px-6 mb-6">
          <Text className="text-xl font-bold text-gray-900 mb-4">Explore by Category</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            className="mb-4"
            contentContainerStyle={{ paddingHorizontal: 24 }}
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
        <View className="mb-8">
          <View className="flex-row items-center justify-between mb-4 px-6">
            <Text className="text-xl font-bold text-gray-900">
              Community Adventures
              {selectedCategories.length > 0 && (
                <Text className="text-sm font-normal text-gray-500">
                  {' '}({filteredAdventures.length} found)
                </Text>
              )}
            </Text>
            <TouchableOpacity>
              <Text className="text-green-600 font-medium">View All</Text>
            </TouchableOpacity>
          </View>

          {/* Community Adventures List */}
          {filteredAdventures.length === 0 ? (
            <View className="h-40 items-center justify-center bg-gray-100 rounded-xl mx-6">
              <Ionicons name="compass" size={32} color="#9CA3AF" />
              <Text className="text-gray-500 text-center mt-2">
                {selectedCategories.length > 0 ? 'No adventures found for selected categories' : 'No community adventures yet'}
              </Text>
              <Text className="text-gray-400 text-sm text-center mt-1">
                {selectedCategories.length > 0 ? 'Try selecting different categories' : 'Be the first to share an adventure!'}
              </Text>
            </View>
          ) : (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              className="pb-4"
              contentContainerStyle={{ paddingHorizontal: 24 }}
            >
              {filteredAdventures.map((adventure) => (
                <CommunityAdventureCard key={adventure.id} adventure={adventure} />
              ))}
            </ScrollView>
          )}
        </View>

        {/* Footer spacing */}
        <View className="h-20" />
      </ScrollView>

      {/* Community Adventure Review Modal */}
      <CommunityAdventureReviewModal
        visible={reviewModalVisible}
        onClose={() => {
          setReviewModalVisible(false);
          setSelectedAdventure(null);
        }}
        adventure={selectedAdventure}
        formatDuration={(hours: number) => formatDuration(hours, preferences)}
        formatCost={(cost: number) => formatBudget(cost, preferences)}
      />
    </SafeAreaView>
  );
};

export default DiscoverScreen;
