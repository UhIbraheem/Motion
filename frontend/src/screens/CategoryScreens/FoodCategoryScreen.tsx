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

const FoodCategoryScreen = ({ navigation }: any) => {
  const { isDark } = useTheme();
  const themeColors = getCurrentTheme(isDark);
  const [adventures, setAdventures] = useState<Adventure[]>([]);
  const [filterType, setFilterType] = useState<string>('all');

  // Food-specific filters
  const foodFilters = [
    { id: 'all', label: 'All Food', icon: 'restaurant' as const },
    { id: 'fine-dining', label: 'Fine Dining', icon: 'wine-bar' as const },
    { id: 'street-food', label: 'Street Food', icon: 'local-dining' as const },
    { id: 'desserts', label: 'Desserts', icon: 'cake' as const },
    { id: 'coffee', label: 'Coffee & Tea', icon: 'coffee' as const },
  ];

  // Mock food adventures data
  const mockFoodAdventures: Adventure[] = [
    {
      id: '1',
      title: 'Michelin Star Tasting Menu',
      description: 'Experience a 7-course tasting menu at the city\'s most acclaimed restaurant',
      location: 'Downtown',
      duration_hours: 3,
      category: 'Food',
      subcategory: 'fine-dining',
      rating: 4.8,
      price_range: '$$$',
      images: [],
      created_at: new Date().toISOString(),
      steps: [],
      is_completed: false,
      estimated_cost: 150,
    },
    {
      id: '2',
      title: 'Food Truck Festival Tour',
      description: 'Sample the best street food from 5 different food trucks in one night',
      location: 'Food Truck Park',
      duration_hours: 2,
      category: 'Food',
      subcategory: 'street-food',
      rating: 4.6,
      price_range: '$$',
      images: [],
      created_at: new Date().toISOString(),
      steps: [],
      is_completed: false,
      estimated_cost: 35,
    },
    {
      id: '3',
      title: 'Artisan Coffee Crawl',
      description: 'Visit 4 local roasters and learn about their unique brewing methods',
      location: 'Arts District',
      duration_hours: 4,
      category: 'Food',
      subcategory: 'coffee',
      rating: 4.5,
      price_range: '$',
      images: [],
      created_at: new Date().toISOString(),
      steps: [],
      is_completed: false,
      estimated_cost: 20,
    },
    {
      id: '4',
      title: 'Dessert & Sweets Tour',
      description: 'Indulge in handcrafted desserts from the city\'s top pastry shops',
      location: 'Historic District',
      duration_hours: 2.5,
      category: 'Food',
      subcategory: 'desserts',
      rating: 4.7,
      price_range: '$$',
      images: [],
      created_at: new Date().toISOString(),
      steps: [],
      is_completed: false,
      estimated_cost: 40,
    },
  ];

  useEffect(() => {
    // Load food adventures - in real app, this would fetch from API
    setAdventures(mockFoodAdventures);
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
          <View className="flex-row items-center bg-yellow-100 px-2 py-1 rounded-full mb-1">
            <Ionicons name="star" size={12} color="#f59e0b" />
            <Text className="text-xs font-medium text-yellow-700 ml-1">{item.rating}</Text>
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

        <TouchableOpacity className="bg-brand-sage rounded-full px-4 py-2">
          <Text className="text-white font-medium text-sm">Book Now</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderFilterButton = (filter: typeof foodFilters[0]) => (
    <TouchableOpacity
      key={filter.id}
      className={`mr-3 px-4 py-2 rounded-full border ${
        filterType === filter.id
          ? 'bg-brand-sage border-brand-sage'
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
            <MaterialIcons name="restaurant" size={24} color="#f59e0b" />
            <Text className="text-xl font-bold text-gray-800 ml-2">Food Adventures</Text>
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
          {foodFilters.map(renderFilterButton)}
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
              <MaterialIcons name="restaurant-menu" size={48} color="#D1D5DB" />
              <Text className="text-gray-500 text-lg mt-4">No food adventures found</Text>
              <Text className="text-gray-400 text-sm mt-2">Try a different filter or check back later</Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
};

export default FoodCategoryScreen;
