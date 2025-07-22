import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { getCurrentTheme } from '../../constants/Theme';
import { Adventure } from '../../components/modals/types';

const OutdoorCategoryScreen = ({ navigation }: any) => {
  const { isDark } = useTheme();
  const themeColors = getCurrentTheme(isDark);
  const [adventures, setAdventures] = useState<Adventure[]>([]);
  const [filterType, setFilterType] = useState<string>('all');

  // Outdoor-specific filters
  const outdoorFilters = [
    { id: 'all', label: 'All Outdoor', icon: 'park' as const },
    { id: 'hiking', label: 'Hiking', icon: 'hiking' as const },
    { id: 'water', label: 'Water Sports', icon: 'pool' as const },
    { id: 'cycling', label: 'Cycling', icon: 'directions-bike' as const },
    { id: 'adventure', label: 'Adventure', icon: 'terrain' as const },
  ];

  // Mock outdoor adventures data
  const mockOutdoorAdventures: Adventure[] = [
    {
      id: '1',
      title: 'Sunrise Mountain Hike',
      description: 'Watch the sunrise from the city\'s highest peak with guided trail tour',
      location: 'Mountain Park',
      duration_hours: 4,
      category: 'Outdoor',
      subcategory: 'hiking',
      rating: 4.8,
      price_range: '$$',
      images: [],
      created_at: new Date().toISOString(),
      steps: [],
      is_completed: false,
      estimated_cost: 35,
    },
    {
      id: '2',
      title: 'Kayak River Adventure',
      description: 'Paddle through scenic waterways with equipment and guide included',
      location: 'Riverside Park',
      duration_hours: 3,
      category: 'Outdoor',
      subcategory: 'water',
      rating: 4.6,
      price_range: '$$$',
      images: [],
      created_at: new Date().toISOString(),
      steps: [],
      is_completed: false,
      estimated_cost: 65,
    },
    {
      id: '3',
      title: 'City Bike Tour',
      description: 'Explore hidden neighborhoods and scenic routes on two wheels',
      location: 'Downtown',
      duration_hours: 2.5,
      category: 'Outdoor',
      subcategory: 'cycling',
      rating: 4.4,
      price_range: '$',
      images: [],
      created_at: new Date().toISOString(),
      steps: [],
      is_completed: false,
      estimated_cost: 20,
    },
    {
      id: '4',
      title: 'Rock Climbing Experience',
      description: 'Beginner-friendly climbing with professional instruction and gear',
      location: 'Adventure Center',
      duration_hours: 4,
      category: 'Outdoor',
      subcategory: 'adventure',
      rating: 4.7,
      price_range: '$$$',
      images: [],
      created_at: new Date().toISOString(),
      steps: [],
      is_completed: false,
      estimated_cost: 80,
    },
  ];

  useEffect(() => {
    // Load outdoor adventures - in real app, this would fetch from API
    setAdventures(mockOutdoorAdventures);
  }, []);

  const filteredAdventures = filterType === 'all' 
    ? adventures 
    : adventures.filter(adventure => adventure.subcategory === filterType);

  const renderAdventureCard = ({ item }: { item: Adventure }) => (
    <TouchableOpacity
      className="bg-white rounded-2xl p-4 mb-4 mx-4 shadow-sm"
      activeOpacity={0.7}
      onPress={() => {
        // Navigate to adventure detail or open modal
        console.log('Open adventure:', item.id);
      }}
    >
      {/* Adventure Header */}
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-1 pr-3">
          <Text className="text-lg font-bold text-gray-800 mb-1">{item.title}</Text>
          <Text className="text-sm text-gray-600 mb-2">{item.description}</Text>
        </View>
        <View className="items-end">
          <View className="flex-row items-center bg-green-100 px-2 py-1 rounded-full mb-1">
            <Ionicons name="star" size={12} color="#10b981" />
            <Text className="text-xs font-medium text-green-700 ml-1">{item.rating}</Text>
          </View>
          <Text className="text-sm font-semibold text-green-600">{item.price_range}</Text>
        </View>
      </View>

      {/* Adventure Details */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <MaterialIcons name="location-on" size={16} color="#9CA3AF" />
          <Text className="text-sm text-gray-600 ml-1">{item.location}</Text>
        </View>
        
        <View className="flex-row items-center">
          <Ionicons name="time" size={16} color="#9CA3AF" />
          <Text className="text-sm text-gray-600 ml-1">{item.duration_hours}h</Text>
        </View>

        <TouchableOpacity className="bg-green-600 rounded-full px-4 py-2">
          <Text className="text-white font-medium text-sm">Adventure</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderFilterButton = (filter: typeof outdoorFilters[0]) => (
    <TouchableOpacity
      key={filter.id}
      className={`mr-3 px-4 py-2 rounded-full border ${
        filterType === filter.id
          ? 'bg-green-600 border-green-600'
          : 'bg-white border-gray-300'
      }`}
      onPress={() => setFilterType(filter.id)}
    >
      <View className="flex-row items-center">
        <MaterialIcons 
          name={filter.icon} 
          size={16} 
          color={filterType === filter.id ? '#ffffff' : '#6B7280'} 
        />
        <Text className={`ml-2 text-sm font-medium ${
          filterType === filter.id ? 'text-white' : 'text-gray-600'
        }`}>
          {filter.label}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="#f9fafb" />
      
      {/* Header */}
      <View className="bg-white px-4 py-4 border-b border-gray-100">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          <View className="flex-row items-center">
            <MaterialIcons name="park" size={24} color="#10b981" />
            <Text className="text-xl font-bold text-gray-800 ml-2">Outdoor Adventures</Text>
          </View>
          <TouchableOpacity>
            <Ionicons name="search" size={24} color="#9CA3AF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter Tabs */}
      <View className="bg-white py-4">
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          className="px-4"
        >
          {outdoorFilters.map(renderFilterButton)}
        </ScrollView>
      </View>

      {/* Adventures List */}
      <View className="flex-1">
        <FlatList
          data={filteredAdventures}
          renderItem={renderAdventureCard}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: 16 }}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center py-12">
              <MaterialIcons name="park" size={48} color="#D1D5DB" />
              <Text className="text-gray-500 text-lg mt-4">No outdoor adventures found</Text>
              <Text className="text-gray-400 text-sm mt-2">Try a different filter or check back later</Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
};

export default OutdoorCategoryScreen;
