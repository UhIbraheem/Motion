import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

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

interface CommunityAdventureReviewModalProps {
  visible: boolean;
  onClose: () => void;
  adventure: CommunityAdventure | null;
  formatDuration: (hours: number) => string;
  formatCost: (cost: number) => string;
}

const CommunityAdventureReviewModal: React.FC<CommunityAdventureReviewModalProps> = ({
  visible,
  onClose,
  adventure,
  formatDuration,
  formatCost,
}) => {
  const [selectedStepIndex, setSelectedStepIndex] = useState(0);
  
  if (!adventure) return null;

  // Helper function to get a meaningful location (city only)
  const getDisplayLocation = () => {
    // If location exists and isn't "unknown", extract city name
    if (adventure.location && adventure.location.toLowerCase() !== 'unknown') {
      // Extract city from address - take the last part before state/country
      const parts = adventure.location.split(',').map((part: string) => part.trim());
      // Return the last meaningful part (usually city) or first part if only one
      return parts.length > 1 ? parts[parts.length - 2] || parts[0] : parts[0];
    }
    
    // Otherwise, try to get location from first step with a location
    const stepWithLocation = adventure.steps?.find((step: any) => step.location && step.location.toLowerCase() !== 'unknown');
    if (stepWithLocation?.location) {
      const parts = stepWithLocation.location.split(',').map((part: string) => part.trim());
      return parts.length > 1 ? parts[parts.length - 2] || parts[0] : parts[0];
    }
    
    // Default fallback
    return 'Location not specified';
  };

  const renderStarsRating = (rating: number) => {
    return (
      <View className="flex-row">
        {[1, 2, 3, 4, 5].map((star) => (
          <Ionicons
            key={star}
            name={star <= rating ? 'star' : star <= rating + 0.5 ? 'star-half' : 'star-outline'}
            size={20}
            color="#f2cc6c"
          />
        ))}
      </View>
    );
  };

  const renderStepTimeline = () => {
    if (!adventure.steps || adventure.steps.length === 0) return null;

    return (
      <View className="bg-white rounded-2xl p-4 mx-4 mb-4">
        <Text className="text-lg font-bold text-gray-900 mb-4">Adventure Timeline</Text>
        
        <View className="flex-row items-center justify-between mb-4">
          {adventure.steps.map((step: any, index: number) => (
            <React.Fragment key={step.id || index}>
              <TouchableOpacity 
                className="items-center flex-1"
                onPress={() => setSelectedStepIndex(index)}
              >
                <View 
                  className="w-8 h-8 rounded-full items-center justify-center border-2"
                  style={{ 
                    backgroundColor: selectedStepIndex === index ? '#3c7660' : 'transparent',
                    borderColor: '#3c7660'
                  }}
                >
                  <Text 
                    className="font-bold text-sm"
                    style={{ 
                      color: selectedStepIndex === index ? 'white' : '#3c7660'
                    }}
                  >
                    {index + 1}
                  </Text>
                </View>
                <Text className="text-xs text-gray-600 mt-1 text-center" numberOfLines={2}>
                  {step.time || `Step ${index + 1}`}
                </Text>
              </TouchableOpacity>
              
              {index < adventure.steps.length - 1 && (
                <View className="flex-1 h-0.5 bg-gray-200 mx-2 mb-6">
                  <Ionicons name="arrow-forward" size={16} color="#9CA3AF" />
                </View>
              )}
            </React.Fragment>
          ))}
        </View>
        
        {/* Selected Step Details */}
        <View className="mt-4">
          <Text className="text-md font-bold text-gray-900 mb-2">Step {selectedStepIndex + 1} Details</Text>
          {adventure.steps[selectedStepIndex] && (
            <View className="p-4 bg-gray-50 rounded-xl">
              <View className="flex-row items-center mb-2">
                <View 
                  className="w-6 h-6 rounded-full items-center justify-center mr-2"
                  style={{ backgroundColor: '#3c7660' }}
                >
                  <Text className="text-white font-bold text-xs">{selectedStepIndex + 1}</Text>
                </View>
                <Text className="font-semibold text-gray-900 flex-1">{adventure.steps[selectedStepIndex].title}</Text>
              </View>
              {adventure.steps[selectedStepIndex].location && (
                <View className="flex-row items-center mb-1">
                  <Ionicons name="location" size={14} color="#6B7280" />
                  <Text className="text-sm text-gray-600 ml-1">{adventure.steps[selectedStepIndex].location}</Text>
                </View>
              )}
              {adventure.steps[selectedStepIndex].time && (
                <View className="flex-row items-center mb-1">
                  <Ionicons name="time" size={14} color="#6B7280" />
                  <Text className="text-sm text-gray-600 ml-1">{adventure.steps[selectedStepIndex].time}</Text>
                </View>
              )}
              {adventure.steps[selectedStepIndex].notes && (
                <Text className="text-sm text-gray-700 mt-2 italic">{adventure.steps[selectedStepIndex].notes}</Text>
              )}
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        activeOpacity={1}
        onPress={onClose}
      />
      
      <View style={{ 
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: SCREEN_HEIGHT * 0.85, // Use same 85% height pattern
        backgroundColor: '#f9fafb', 
        borderTopLeftRadius: 20, 
        borderTopRightRadius: 20 
      }}>
        {/* Header */}
        <SafeAreaView>
          <View className="flex-row justify-between items-center p-4 bg-white" style={{ borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>
            <TouchableOpacity 
              onPress={onClose}
              className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
            >
              <Text className="text-gray-600 font-bold text-lg">×</Text>
            </TouchableOpacity>
            <Text className="text-lg font-bold text-gray-900">Adventure Review</Text>
            <View className="w-10" />
          </View>
        </SafeAreaView>

        <ScrollView 
          className="flex-1"
          showsVerticalScrollIndicator={false}
        >
              {/* Adventure Photos */}
              {adventure.adventure_photos && adventure.adventure_photos.length > 0 && (
                <View className="h-60 mb-4">
                  <ScrollView 
                    horizontal 
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                  >
                    {adventure.adventure_photos.map((photo, index) => (
                      <Image
                        key={index}
                        source={{ uri: photo.photo_url }}
                        style={{ width: SCREEN_WIDTH, height: 240 }}
                        resizeMode="cover"
                      />
                    ))}
                  </ScrollView>
                </View>
              )}

              {/* Adventure Info */}
              <View className="bg-white rounded-2xl p-4 mx-4 mb-4">
                {/* Author Info */}
                <View className="flex-row items-center mb-4">
                  {adventure.profiles.profile_picture_url ? (
                    <Image 
                      source={{ uri: adventure.profiles.profile_picture_url }}
                      className="w-12 h-12 rounded-full mr-3"
                    />
                  ) : (
                    <View className="w-12 h-12 rounded-full bg-green-500 items-center justify-center mr-3">
                      <Text className="text-white font-bold">
                        {adventure.profiles.first_name?.[0] || adventure.profiles.last_name?.[0] || 'U'}
                      </Text>
                    </View>
                  )}
                  <View className="flex-1">
                    <Text className="font-semibold text-gray-900">
                      {adventure.profiles.first_name} {adventure.profiles.last_name}
                    </Text>
                    <Text className="text-sm text-gray-500">Adventure Creator</Text>
                  </View>
                  {renderStarsRating(adventure.rating)}
                </View>

                {/* Adventure Title & Description */}
                <Text className="text-xl font-bold text-gray-900 mb-2">
                  {adventure.custom_title}
                </Text>
                <Text className="text-gray-600 mb-4 leading-relaxed">
                  {adventure.custom_description}
                </Text>

                {/* Adventure Stats */}
                <View className="flex-row justify-between items-center p-3 bg-gray-50 rounded-xl">
                  <View className="items-center">
                    <Ionicons name="time" size={20} color="#3c7660" />
                    <Text className="text-sm font-medium text-gray-900 mt-1">
                      {formatDuration(adventure.duration_hours)}
                    </Text>
                  </View>
                  <View className="items-center">
                    <Ionicons name="wallet" size={20} color="#3c7660" />
                    <Text className="text-sm font-medium text-gray-900 mt-1">
                      {formatCost(adventure.estimated_cost)}
                    </Text>
                  </View>
                  <View className="items-center">
                    <Ionicons name="location" size={20} color="#3c7660" />
                    <Text className="text-sm font-medium text-gray-900 mt-1">
                      {getDisplayLocation()}
                    </Text>
                  </View>
                  <View className="items-center">
                    <Ionicons name="list" size={20} color="#3c7660" />
                    <Text className="text-sm font-medium text-gray-900 mt-1">
                      {adventure.steps.length} steps
                    </Text>
                  </View>
                </View>
              </View>

              {/* Step Timeline */}
              {renderStepTimeline()}

              {/* Bottom Padding */}
              <View className="h-20" />
            </ScrollView>
          </View>
    </Modal>
  );
};

export default CommunityAdventureReviewModal;
