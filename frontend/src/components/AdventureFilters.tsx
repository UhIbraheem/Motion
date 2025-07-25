import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import Button from './Button';
import Input from './Input';
import Card from './Card';
import TimingSection from './TimingSection';
import { AdventureFilters as AdventureFiltersType } from '../services/aiService';
import { experienceTypes } from '../data/experienceTypes';
import { usePreferences } from '../context/PreferencesContext';
import { formatBudget } from '../utils/formatters';

interface AdventureFiltersProps {
  greeting: string;
  filters: AdventureFiltersType;
  setFilters: React.Dispatch<React.SetStateAction<AdventureFiltersType>>;
  isGenerating: boolean;
  onGenerateAdventure: () => void;
  onStartTimeChange: (time: string) => void;
  onDurationChange: (duration: string) => void;
}

const AdventureFilters: React.FC<AdventureFiltersProps> = ({
  greeting,
  filters,
  setFilters,
  isGenerating,
  onGenerateAdventure,
  onStartTimeChange,
  onDurationChange,
}) => {
  const { preferences } = usePreferences();
  const maxExperienceSelection = 4;
  const [isDietaryExpanded, setIsDietaryExpanded] = useState(false); // Add this state


  // Dietary options
  const dietaryRestrictions = ['Nut Allergy', 'Gluten-Free', 'Dairy-Free', 'Soy-Free', 'Shellfish Allergy'];
  const foodPreferences = ['Vegetarian', 'Vegan', 'Halal', 'Kosher', 'Local Cuisine', 'Healthy Options'];

  // Helper functions
  const toggleArraySelection = (array: string[], item: string, setter: (value: string[]) => void, maxLimit?: number) => {
    if (array.includes(item)) {
      setter(array.filter(i => i !== item));
    } else {
      if (maxLimit && array.length >= maxLimit) {
        Alert.alert('Selection Limit', `You can only select up to ${maxLimit} options.`);
        return;
      }
      setter([...array, item]);
    }
  };

  const getTransportSuggestion = (radius: number): { icon: string; text: string } => {
    if (radius <= 2) return { icon: 'walk', text: 'Walking distance' };
    if (radius <= 5) return { icon: 'bicycle', text: 'Bike/scooter friendly' };
    if (radius <= 15) return { icon: 'car', text: 'Uber/driving recommended' };
    return { icon: 'car-sport', text: 'Road trip territory' };
  };

  const milesToKm = (miles: number): number => {
    return Math.round(miles * 1.60934 * 10) / 10;
  };

  return (
    <ScrollView className="flex-1 p-4">
      {/* Header */}
      <View className="mb-6">
        <Text className="text-2xl font-bold text-gray-800">Create Plan</Text>
        <Text className="text-gray-600">
          {greeting}! Tell us what you're in the mood for
        </Text>
      </View>

      <Card elevated={true}>
        {/* Location Input */}
        <View className="mb-4">
          <Text className="text-lg font-semibold text-brand-sage mb-2">
            Location *
          </Text>
          <Input
            placeholder="Enter city, neighborhood, or address"
            value={filters.location}
            onChangeText={(location) => setFilters(prev => ({ ...prev, location }))}
          />
        </View>

        {/* Adventure Timing */}
        <View className="mb-4">
          <Text 
            className="text-brand-sage text-base font-semibold mb-2"
            style={{ fontFamily: 'Inter_600SemiBold' }}
          >
            <Ionicons name="time" size={16} color="#2F4F4F" /> Adventure Timing
          </Text>
          
          <TimingSection
            startTime={filters.startTime || '10:00'}
            endTime={filters.endTime || '16:00'}
            duration={filters.duration || 'half-day'}
            flexibleTiming={filters.flexibleTiming || false}
            customEndTime={filters.customEndTime || false}
            onStartTimeChange={onStartTimeChange}
            onDurationChange={onDurationChange}
            onFlexibleTimingChange={(flexible) => setFilters(prev => ({ ...prev, flexibleTiming: flexible }))}
            onCustomEndTimeChange={(custom) => setFilters(prev => ({ ...prev, customEndTime: custom }))}
            onEndTimeChange={(time) => setFilters(prev => ({ ...prev, endTime: time }))}
          />
        </View>

        {/* Experience Types */}
        <View className="mb-4">
          <View className="flex-row justify-between items-center mb-2">
            <Text 
              className="text-brand-sage text-base font-semibold"
              style={{ fontFamily: 'Inter_600SemiBold' }}
            >
              <Ionicons name="pricetags" size={16} color="#2F4F4F" /> Experience Types
            </Text>
            <Text className="text-brand-teal text-xs">
              {filters.experienceTypes?.length || 0}/{maxExperienceSelection} selected
            </Text>
          </View>
          <Text className="text-xs text-text-secondary mb-3">
            Choose up to {maxExperienceSelection} types that match your adventure style
          </Text>
          <View className="flex-row flex-wrap justify-center">
            {experienceTypes.map((type) => (
              <Button
                key={type.id}
                title={type.name}
                leftIcon={<Ionicons name={type.icon as keyof typeof Ionicons.glyphMap} size={14} color="#2F4F4F" />}
                onPress={() => toggleArraySelection(
                  filters.experienceTypes || [],
                  type.name, // Use type.name for compatibility
                  (newTypes) => setFilters(prev => ({ ...prev, experienceTypes: newTypes })),
                  maxExperienceSelection
                )}
                variant="filter"
                size="sm"
                isSelected={filters.experienceTypes?.includes(type.name)}
                disabled={!filters.experienceTypes?.includes(type.name) && 
                          (filters.experienceTypes?.length || 0) >= maxExperienceSelection}
              />
            ))}
          </View>
        </View>

        {/* Group Size */}
        <View className="mb-4">
          <Text 
            className="text-brand-sage text-base font-semibold mb-2"
            style={{ fontFamily: 'Inter_600SemiBold' }}
          >
            Group Size: {filters.groupSize} {filters.groupSize === 1 ? 'person' : 'people'}
          </Text>
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => setFilters(prev => ({ ...prev, groupSize: Math.max(1, prev.groupSize! - 1) }))}
              className="bg-brand-light rounded-full w-10 h-10 items-center justify-center"
            >
              <Text className="text-brand-sage text-lg font-bold">-</Text>
            </TouchableOpacity>
            
            <View className="flex-1 mx-4">
              <View className="bg-brand-cream rounded-lg py-3 items-center">
                <Text className="text-brand-sage font-semibold text-lg">{filters.groupSize}</Text>
              </View>
            </View>
            
            <TouchableOpacity
              onPress={() => setFilters(prev => ({ ...prev, groupSize: Math.min(20, prev.groupSize! + 1) }))}
              className="bg-brand-light rounded-full w-10 h-10 items-center justify-center"
            >
              <Text className="text-brand-sage text-lg font-bold">+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Radius Slider */}
        <View className="mb-4">
          <Text 
            className="text-brand-sage text-base font-semibold mb-2"
            style={{ fontFamily: 'Inter_600SemiBold' }}
          >
            <Ionicons name="resize" size={16} color="#2F4F4F" /> Max Distance
          </Text>
          
          <View className="bg-brand-light rounded-lg p-4">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-brand-sage font-semibold text-lg">
                {filters.radius} miles
              </Text>
              <Text className="text-brand-sage text-sm">
                ({milesToKm(filters.radius!)} km)
              </Text>
            </View>
            
            <View className="mb-4">
              <Slider
                style={{ width: '100%', height: 40 }}
                minimumValue={0.5}
                maximumValue={20}
                value={filters.radius}
                onValueChange={(value: number) => setFilters(prev => ({ ...prev, radius: Math.round(value * 2) / 2 }))}
                minimumTrackTintColor="#3c7660"
                maximumTrackTintColor="#f8f2d5"
                thumbTintColor="#3c7660"
                step={0.5}
              />
              
              <View className="flex-row justify-between">
                <Text className="text-xs text-brand-sage">0.5 mi</Text>
                <Text className="text-xs text-brand-sage">20 mi</Text>
              </View>
            </View>
            
            <View className="flex-row items-center justify-center bg-brand-cream rounded-lg p-3">
              <Ionicons name={getTransportSuggestion(filters.radius!).icon as keyof typeof Ionicons.glyphMap} size={18} color="#2F4F4F" />
              <Text className="text-brand-sage text-sm font-medium">
                {getTransportSuggestion(filters.radius!).text}
              </Text>
            </View>
          </View>
        </View>

        {/* Budget Selector */}
        <View className="mb-4">
          <Text 
            className="text-brand-sage text-base font-semibold mb-2"
            style={{ fontFamily: 'Inter_600SemiBold' }}
          >
            Budget
          </Text>
          <View className="flex-row justify-between px-1">
            {[
              { key: 'budget', cost: 20, desc: 'Budget' },
              { key: 'moderate', cost: 40, desc: 'Moderate' },
              { key: 'premium', cost: 70, desc: 'Premium' }
            ].map((budget) => (
              <Button
                key={budget.key}
                title={formatBudget(budget.cost, preferences)}
                description={budget.desc}
                onPress={() => setFilters(prev => ({ ...prev, budget: budget.key as any }))}
                variant="filter-action"
                isSelected={filters.budget === budget.key}
                className="flex-1 mx-0.5"
              />
            ))}
          </View>
        </View>

                {/* Collapsible Dietary Section */}
        <View className="mb-4">
          <TouchableOpacity
            onPress={() => setIsDietaryExpanded(!isDietaryExpanded)}
            className="flex-row items-center justify-between mb-2"
          >
            <Text 
              className="text-brand-sage text-base font-semibold"
              style={{ fontFamily: 'Inter_600SemiBold' }}
            >
              Dietary Preferences
            </Text>
            <Text className="text-brand-sage text-lg">
              {isDietaryExpanded ? '▼' : '▶'}
            </Text>
          </TouchableOpacity>
          
          {/* Show selected count when collapsed */}
          {!isDietaryExpanded && (
            <Text className="text-xs text-text-secondary mb-2">
              {((filters.dietaryRestrictions?.length || 0) + (filters.foodPreferences?.length || 0)) > 0
                ? `${(filters.dietaryRestrictions?.length || 0) + (filters.foodPreferences?.length || 0)} selected`
                : 'Tap to set dietary preferences (optional)'
              }
            </Text>
          )}

          {/* Expanded content */}
          {isDietaryExpanded && (
            <View>
              {/* Dietary Restrictions */}
              <View className="mb-4">
                <Text 
                  className="text-brand-sage text-sm font-medium mb-2"
                  style={{ fontFamily: 'Inter_500Medium' }}
                >
                  <Ionicons name="warning" size={16} color="#EF4444" />
                  <Text className="ml-1">Dietary Restrictions</Text>
                </Text>
                <Text className="text-xs text-text-secondary mb-3">
                  Select any allergies or strict dietary requirements
                </Text>
                <View className="flex-row flex-wrap justify-center mb-3">
                  {dietaryRestrictions.map((restriction) => (
                    <Button
                      key={restriction}
                      title={restriction}
                      onPress={() => toggleArraySelection(filters.dietaryRestrictions || [], 
                        restriction, 
                        (newRestrictions) => setFilters(prev => ({ ...prev, dietaryRestrictions: newRestrictions })))}
                      variant="filter-restriction"
                      size="sm"
                      isSelected={filters.dietaryRestrictions?.includes(restriction)}
                    />
                  ))}
                </View>
                
                <TextInput
                  className="bg-white border border-brand-light rounded-lg p-3 text-brand-sage"
                  placeholder="Other restriction (max 20 characters)"
                  placeholderTextColor="#999999"
                  value={filters.otherRestriction}
                  onChangeText={(text) => setFilters(prev => ({ ...prev, otherRestriction: text.slice(0, 20) }))}
                  maxLength={20}
                />
              </View>

              {/* Food Preferences */}
              <View className="mb-4">
                <Text 
                  className="text-brand-sage text-sm font-medium mb-2"
                  style={{ fontFamily: 'Inter_500Medium' }}
                >
                  🌱 Food Preferences
                </Text>
                <Text className="text-xs text-text-secondary mb-3">
                  Select food styles you prefer (optional)
                </Text>
                <View className="flex-row flex-wrap justify-center">
                  {foodPreferences.map((preference) => (
                    <Button
                      key={preference}
                      title={preference}
                      onPress={() => toggleArraySelection(
                        filters.foodPreferences || [],
                        preference,
                        (newPreferences) => setFilters(prev => ({ ...prev, foodPreferences: newPreferences }))
                      )}
                      variant="filter-preference"
                      size="sm"
                      isSelected={filters.foodPreferences?.includes(preference)}
                    />
                  ))}
                </View>
              </View>
            </View>
          )}
        </View>
        
        {/* Generate Button */}
        <Button 
          title={isGenerating ? "Creating Your Adventure..." : "Generate Adventure"}
          onPress={onGenerateAdventure} 
          variant="primary"
          size="lg"
          isLoading={isGenerating}
          leftIcon={isGenerating ? undefined : <Ionicons name="sparkles" size={16} color="white" />}
        />
      </Card>
      
      {/* Footer spacing for floating tab bar */}
      <View className="h-20" />
    </ScrollView>
  );
};

export default AdventureFilters;