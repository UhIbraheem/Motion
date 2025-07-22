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

const CultureCategoryScreen = ({ navigation }: any) => {
  const { isDark } = useTheme();
  const themeColors = getCurrentTheme(isDark);
  const [adventures, setAdventures] = useState<Adventure[]>([]);
  const [filterType, setFilterType] = useState<string>('all');

  // Culture-specific filters
  const cultureFilters = [
    { id: 'all', label: 'All Culture', icon: 'palette' as const },
    { id: 'museums', label: 'Museums', icon: 'museum' as const },
    { id: 'galleries', label: 'Art Galleries', icon: 'brush' as const },
    { id: 'history', label: 'Historical', icon: 'account-balance' as const },
    { id: 'performing', label: 'Theater & Music', icon: 'theater-comedy' as const },
  ];

  // Mock culture adventures data
  const mockCultureAdventures: Adventure[] = [
    {
      id: '1',
      title: 'Modern Art Museum Tour',
      description: 'Explore contemporary masterpieces with a professional art guide',
      location: 'Museum District',
      duration_hours: 2,
      category: 'Culture',
      subcategory: 'museums',
      rating: 4.7,
      price_range: '$$',
      images: [],
      created_at: new Date().toISOString(),
      steps: [],
      is_completed: false,
      estimated_cost: 25,
    },
    {
      id: '2',
      title: 'Historic Downtown Walking Tour',
      description: 'Discover the city\'s rich history through its architecture and landmarks',
      location: 'Historic District',
      duration_hours: 3,
      category: 'Culture',
      subcategory: 'history',
      rating: 4.5,
      price_range: '$',
      images: [],
      created_at: new Date().toISOString(),
      steps: [],
      is_completed: false,
      estimated_cost: 15,
    },
    {
      id: '3',
      title: 'Local Gallery Hop',
      description: 'Visit 3 unique galleries featuring local artists and emerging talent',
      location: 'Arts District',
      duration_hours: 4,
      category: 'Culture',
      subcategory: 'galleries',
      rating: 4.6,
      price_range: '$$',
      images: [],
      created_at: new Date().toISOString(),
      steps: [],
      is_completed: false,
      estimated_cost: 30,
    },
    {
      id: '4',
      title: 'Symphony & Wine Experience',
      description: 'Enjoy a classical performance with premium wine tasting',
      location: 'Concert Hall',
      duration_hours: 3,
      category: 'Culture',
      subcategory: 'performing',
      rating: 4.9,
      price_range: '$$$',
      images: [],
      created_at: new Date().toISOString(),
      steps: [],
      is_completed: false,
      estimated_cost: 75,
    },
  ];

  useEffect(() => {
    // Load culture adventures - in real app, this would fetch from API
    setAdventures(mockCultureAdventures);
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
          <View className="flex-row items-center bg-purple-100 px-2 py-1 rounded-full mb-1">
            <Ionicons name="star" size={12} color="#7c3aed" />
            <Text className="text-xs font-medium text-purple-700 ml-1">{item.rating}</Text>
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

        <TouchableOpacity className="bg-purple-600 rounded-full px-4 py-2">
          <Text className="text-white font-medium text-sm">Explore</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderFilterButton = (filter: typeof cultureFilters[0]) => (
    <TouchableOpacity
      key={filter.id}
      className={`mr-3 px-4 py-2 rounded-full border ${
        filterType === filter.id
          ? 'bg-purple-600 border-purple-600'
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
            <MaterialIcons name="palette" size={24} color="#7c3aed" />
            <Text className="text-xl font-bold text-gray-800 ml-2">Culture & Arts</Text>
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
          {cultureFilters.map(renderFilterButton)}
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
              <MaterialIcons name="palette" size={48} color="#D1D5DB" />
              <Text className="text-gray-500 text-lg mt-4">No cultural adventures found</Text>
              <Text className="text-gray-400 text-sm mt-2">Try a different filter or check back later</Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
};

export default CultureCategoryScreen;
