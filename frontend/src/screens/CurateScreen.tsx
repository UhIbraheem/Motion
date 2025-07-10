import React, { useState } from 'react';
import { View, Text, ScrollView, SafeAreaView, Alert, TouchableOpacity, Modal, TextInput, Keyboard, TouchableWithoutFeedback } from 'react-native';
import Slider from '@react-native-community/slider';
import Button from '../components/Button';
import Input from '../components/Input';
import Card from '../components/Card';
import { aiService, AdventureFilters, GeneratedAdventure, AdventureStep } from '../services/aiService';
import { useAuth } from '../context/AuthContext';
import { 
  Poppins_700Bold, 
  Poppins_600SemiBold,
  useFonts 
} from '@expo-google-fonts/poppins';
import { 
  Inter_600SemiBold,
  Inter_500Medium 
} from '@expo-google-fonts/inter';

const CurateScreen: React.FC = () => {
    const [fontsLoaded] = useFonts({
    Poppins_700Bold,
    Poppins_600SemiBold,
    Inter_600SemiBold,
    Inter_500Medium,
  });


  const { user } = useAuth(); // Get current user
  const [filters, setFilters] = useState<AdventureFilters>({
    location: '',
    duration: 'half-day',
    budget: 'moderate',
    dietaryRestrictions: [], // Now hard restrictions only
    foodPreferences: [], // NEW: Soft preferences
    timeOfDay: 'flexible',
    groupSize: 1,
    radius: 5, // Default 5 miles
    transportMethod: 'flexible', // Keep for backend compatibility but don't show UI
    // Phase 1 additions
    experienceTypes: [],
    startTime: '10:00',
    endTime: '16:00',
    flexibleTiming: true,
    customEndTime: false,
    // Phase 2 additions
    otherRestriction: '', // NEW: Custom restriction text

    
  });
  
  const [generatedAdventure, setGeneratedAdventure] = useState<GeneratedAdventure | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Step editing states
  const [editingStepIndex, setEditingStepIndex] = useState<number | null>(null);
  const [editRequest, setEditRequest] = useState('');
  const [isRegeneratingStep, setIsRegeneratingStep] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // NEW: Random greeting rotation
  const getRandomGreeting = (): string => {
    const greetings = [
      "What's the vibe?",
      "What are you looking for?", 
      "What's the plan?",
      "Ready to explore?",
      "Where to today?",
      "What's calling you?",
      "Adventure awaits...",
      "What sounds good?",
      "Let's get started",
      "Time to discover"
    ];
    
    // Random greeting each visit (not daily) for more variety
    const randomIndex = Math.floor(Math.random() * greetings.length);
    return greetings[randomIndex];
  };
  
  // Experience Types with selection limit
  const experienceTypes = [
    'Hidden Gem', 'Explorer', 'Nature', 'Partier', 'Solo Freestyle', 
    'Academic Weapon', 'Special Occasion', 'Artsy', 'Foodie Adventure', 'Culture Dive'
  ];
  const maxExperienceSelection = 4;
  
  // REMOVED: vibeOptions (replaced by experienceTypes)
  
  // NEW: Split dietary into restrictions (hard) and preferences (soft)
  const dietaryRestrictions = ['Nut Allergy', 'Gluten-Free', 'Dairy-Free', 'Soy-Free', 'Shellfish Allergy'];
  const foodPreferences = ['Vegetarian', 'Vegan', 'Halal', 'Kosher', 'Local Cuisine', 'Healthy Options'];
  
  // REMOVED: transportOptions array - no longer needed

  // Time options for start time picker
  const timeOptions = [
    '6:00', '7:00', '8:00', '9:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
  ];
  
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

  // Smart end time calculation based on duration
  const calculateEndTime = (startTime: string, duration: string): string => {
    const start = parseInt(startTime.split(':')[0]);
    let hours = 4; // default
    
    switch (duration) {
      case 'quick': hours = 2; break;
      case 'half-day': hours = 6; break;
      case 'full-day': hours = 9; break;
    }
    
    const endHour = start + hours;
    return `${endHour}:00`;
  };

  // Format time for display (24h to 12h)
  const formatTimeDisplay = (time: string): string => {
    const hour = parseInt(time.split(':')[0]);
    if (hour === 0) return '12:00 AM';
    if (hour < 12) return `${hour}:00 AM`;
    if (hour === 12) return '12:00 PM';
    return `${hour - 12}:00 PM`;
  };

  // NEW: Get transport suggestion based on radius
  const getTransportSuggestion = (radius: number): { icon: string; text: string } => {
    if (radius <= 2) return { icon: '🚶', text: 'Walking distance' };
    if (radius <= 5) return { icon: '🚲', text: 'Bike/scooter friendly' };
    if (radius <= 15) return { icon: '🚗', text: 'Uber/driving recommended' };
    return { icon: '🛣️', text: 'Road trip territory' };
  };

  // NEW: Convert miles to km
  const milesToKm = (miles: number): number => {
    return Math.round(miles * 1.60934 * 10) / 10;
  };

  // Update radius based on transport method
  const handleTransportChange = (transport: 'walking' | 'bike' | 'rideshare' | 'flexible') => {
    setFilters(prev => {
      const transportRadiusMap: Record<'walking' | 'bike' | 'rideshare' | 'flexible', number> = {
        walking: 0.5,
        bike: 3,
        rideshare: 15,
        flexible: 10
      };
      
      return {
        ...prev,
        transportMethod: transport,
        radius: transportRadiusMap[transport]
      };
    });
  };

  // Handle start time change with auto end time calculation
  const handleStartTimeChange = (startTime: string) => {
    const newEndTime = filters.customEndTime ? filters.endTime : calculateEndTime(startTime, filters.duration ?? 'half-day');
    setFilters(prev => ({
      ...prev,
      startTime,
      endTime: newEndTime
    }));
  };

  // Handle duration change with auto end time calculation  
  const handleDurationChange = (duration: string) => {
    const newEndTime = filters.customEndTime ? filters.endTime : calculateEndTime(filters.startTime ?? '', duration);
    setFilters(prev => ({
      ...prev,
      duration: duration as any,
      endTime: newEndTime
    }));
  };

  const generateAdventure = async () => {
    if (!filters.location || filters.location.trim() === '') {
      Alert.alert('Location Required', 'Please enter your location to generate an adventure.');
      return;
    }

    setIsGenerating(true);
    
    try {
      console.log('🎯 Starting adventure generation with filters:', filters);
      const { data, error } = await aiService.generateAdventure(filters);
      
      if (error) {
        console.error('❌ Generation failed:', error);
        Alert.alert('Generation Failed', error);
        return;
      }

      if (data) {
        console.log('✅ Adventure generated successfully:', data.title);
        setGeneratedAdventure(data);
      }
    } catch (error) {
      console.error('❌ Unexpected error:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const openStepEditor = (stepIndex: number) => {
    setEditingStepIndex(stepIndex);
    setEditRequest('');
  };

  const regenerateStep = async () => {
    if (!generatedAdventure || editingStepIndex === null || !editRequest.trim()) {
      Alert.alert('Error', 'Please enter what you want to change about this step.');
      return;
    }

    setIsRegeneratingStep(true);

    try {
      const currentStep = generatedAdventure.steps[editingStepIndex];
      
      const { data, error } = await aiService.regenerateStep(
        editingStepIndex,
        currentStep,
        generatedAdventure.steps,
        editRequest,
        filters
      );

      if (error) {
        Alert.alert('Regeneration Failed', error);
        return;
      }

      if (data) {
        // Replace the step in the adventure
        const updatedSteps = [...generatedAdventure.steps];
        updatedSteps[editingStepIndex] = data;
        
        setGeneratedAdventure({
          ...generatedAdventure,
          steps: updatedSteps
        });

        setEditingStepIndex(null);
        setEditRequest('');
        
        Alert.alert('Success! 🎉', `Step ${editingStepIndex + 1} has been updated!`);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to regenerate step. Please try again.');
    } finally {
      setIsRegeneratingStep(false);
    }
  };

  const getQuickEditSuggestions = (step: AdventureStep) => {
    const suggestions = [];
    
    if (step.title.toLowerCase().includes('restaurant') || step.title.toLowerCase().includes('cafe')) {
      suggestions.push('Make it more budget-friendly');
      suggestions.push('Try a different cuisine');
      suggestions.push('Find something with outdoor seating');
    } else if (step.title.toLowerCase().includes('walk') || step.title.toLowerCase().includes('park')) {
      suggestions.push('Find an indoor alternative');
      suggestions.push('Make it more active');
      suggestions.push('Add shopping nearby');
    } else {
      suggestions.push('Find something more relaxing');
      suggestions.push('Make it more interactive');
      suggestions.push('Try a different vibe');
    }
    
    return suggestions.slice(0, 3);
  };

  const resetForm = () => {
    setGeneratedAdventure(null);
    setEditingStepIndex(null);
    setEditRequest('');
  };

  const saveAdventure = async () => {
    if (!generatedAdventure || !user) {
      Alert.alert('Error', 'Please generate an adventure and make sure you are logged in.');
      return;
    }

    setIsSaving(true);
    
    try {
      console.log('💾 Saving adventure for user:', user.email);
      const { data, error } = await aiService.saveAdventure(generatedAdventure, user.id);
      
      if (error) {
        Alert.alert('Save Failed', error);
        return;
      }

      Alert.alert(
        'Adventure Saved! 🎉', 
        `"${generatedAdventure.title}" has been saved to your plans.`,
        [
          { 
            text: 'View My Plans', 
            onPress: () => {
              // This will navigate to Plans tab in the future
              console.log('Navigate to Plans tab');
            }
          },
          { text: 'Create Another', onPress: resetForm }
        ]
      );
    } catch (error) {
      console.error('❌ Save error:', error);
      Alert.alert('Error', 'Failed to save adventure. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (generatedAdventure) {
    return (
      <SafeAreaView className="flex-1 bg-background-light">
        <ScrollView className="flex-1 p-4">
          <Card title={`🌊 ${generatedAdventure.title}`} elevated={true}>
            <View className="mb-4">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-sm text-text-secondary">
                  Duration: {generatedAdventure.estimatedDuration}
                </Text>
                <Text className="text-sm text-text-secondary">
                  Budget: {generatedAdventure.estimatedCost}
                </Text>
              </View>
              <Text className="text-brand-teal text-sm italic mb-4">
                💡 Tap any step to customize it!
              </Text>
            </View>

            {/* Adventure Steps */}
            <View className="space-y-3 mb-6">
              <Text className="text-lg font-semibold text-brand-sage mb-2">Your Adventure Plan:</Text>
              {generatedAdventure.steps.map((step, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => openStepEditor(index)}
                  className="bg-brand-cream p-4 rounded-xl border border-brand-light active:bg-brand-light"
                >
                  <View className="flex-row justify-between items-start mb-2">
                    <Text className="text-brand-sage font-semibold flex-1 text-base">
                      {index + 1}. {step.title}
                    </Text>
                    <View className="flex-row items-center">
                      <Text className="text-brand-teal text-sm font-medium mr-2">{step.time}</Text>
                      <Text className="text-brand-gold text-lg">✏️</Text>
                    </View>
                  </View>
                  <Text className="text-brand-sage text-sm mb-1">📍 {step.location}</Text>
                  {step.notes && (
                    <Text className="text-text-secondary text-sm italic mt-2">💡 {step.notes}</Text>
                  )}
                  {step.booking && (
                    <View className="mt-2 p-2 bg-brand-light rounded-lg">
                      <Text className="text-brand-teal text-sm font-medium">
                        📅 {step.booking.method}
                        {step.booking.link && ' - Reservation available'}
                      </Text>
                      {step.booking.fallback && (
                        <Text className="text-xs text-text-secondary mt-1">{step.booking.fallback}</Text>
                      )}
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* Action Buttons */}
            <View className="space-y-3">
              <Button 
                title={isSaving ? "Saving Adventure..." : "💾 Save This Adventure"}
                onPress={saveAdventure}
                variant="primary"
                size="lg"
                isLoading={isSaving}
                leftIcon={!isSaving ? <Text className="text-xl">💾</Text> : undefined}
              />
              <Button 
                title="🔄 Generate Completely New Adventure"
                onPress={() => {
                  setGeneratedAdventure(null);
                  generateAdventure();
                }} 
                variant="secondary"
                size="lg"
                isLoading={isGenerating}
              />
              <Button 
                title="← Back to Filters"
                onPress={resetForm} 
                variant="outline"
                size="lg"
              />
            </View>
          </Card>
        </ScrollView>

        {/* Step Editor Modal */}
        <Modal
          visible={editingStepIndex !== null}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <SafeAreaView className="flex-1 bg-background-light">
              <ScrollView className="flex-1 p-4" keyboardShouldPersistTaps="handled">
                <View className="flex-row justify-between items-center mb-4">
                  <Text className="text-xl font-bold text-brand-sage">
                    Edit Step {editingStepIndex !== null ? editingStepIndex + 1 : ''}
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      Keyboard.dismiss();
                      setEditingStepIndex(null);
                    }}
                    className="p-2"
                  >
                    <Text className="text-brand-sage text-lg">✕</Text>
                  </TouchableOpacity>
                </View>

                {editingStepIndex !== null && generatedAdventure && (
                  <Card title="Current Step" elevated={true}>
                    <View className="bg-brand-cream p-3 rounded-lg mb-4">
                      <Text className="text-brand-sage font-semibold mb-1">
                        {generatedAdventure.steps[editingStepIndex].title}
                      </Text>
                      <Text className="text-brand-sage text-sm">
                        📍 {generatedAdventure.steps[editingStepIndex].location}
                      </Text>
                      <Text className="text-brand-teal text-sm mt-1">
                        🕐 {generatedAdventure.steps[editingStepIndex].time}
                      </Text>
                    </View>

                    <Text className="text-brand-sage text-sm font-medium mb-2">
                      What would you like to change about this step?
                    </Text>

                    <TextInput
                      className="bg-white border border-brand-light rounded-lg p-3 mb-4 text-brand-sage"
                      placeholder="e.g., 'Make it more budget-friendly' or 'Try a different cuisine'"
                      placeholderTextColor="#999999"
                      value={editRequest}
                      onChangeText={setEditRequest}
                      multiline
                      numberOfLines={3}
                      textAlignVertical="top"
                      returnKeyType="done"
                      blurOnSubmit={true}
                      onSubmitEditing={Keyboard.dismiss}
                    />

                    <Text className="text-brand-sage text-sm font-medium mb-2">
                      Quick suggestions:
                    </Text>
                    
                    <View className="flex-row flex-wrap mb-4">
                      {getQuickEditSuggestions(generatedAdventure.steps[editingStepIndex]).map((suggestion, index) => (
                        <TouchableOpacity
                          key={index}
                          onPress={() => {
                            setEditRequest(suggestion);
                            Keyboard.dismiss();
                          }}
                          className="bg-brand-light rounded-full px-3 py-2 mr-2 mb-2"
                        >
                          <Text className="text-brand-sage text-sm">{suggestion}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>

                    <View className="space-y-3">
                      <Button
                        title={isRegeneratingStep ? "Updating Step..." : "🎯 Update This Step"}
                        onPress={() => {
                          Keyboard.dismiss();
                          regenerateStep();
                        }}
                        variant="primary"
                        size="lg"
                        isLoading={isRegeneratingStep}
                      />
                      <Button
                        title="Cancel"
                        onPress={() => {
                          Keyboard.dismiss();
                          setEditingStepIndex(null);
                        }}
                        variant="outline"
                        size="lg"
                      />
                    </View>
                  </Card>
                )}
              </ScrollView>
            </SafeAreaView>
          </TouchableWithoutFeedback>
        </Modal>
      </SafeAreaView>
    );
  }

  // Filter Interface
  return (
    <SafeAreaView className="flex-1 bg-background-light">
      <ScrollView className="flex-1 p-4">
        {/* NEW: Random Greeting Header */}
        <View className="mb-2">
          <Text 
            className="text-3xl font-bold text-brand-sage mb-1"
            style={{ 
              fontFamily: 'Poppins_700', // Will fallback to system if not available
              letterSpacing: -0.5 
            }}
          >
            {getRandomGreeting()}
          </Text>
        </View>

        <Card elevated={true}>
        {/* Location Input with matching header style */}
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
              🕐 Adventure Timing
            </Text>
            
            {/* Start Time */}
            <View className="mb-3">
              <Text 
                className="text-brand-sage text-sm font-medium mb-2"
                style={{ fontFamily: 'Inter-Medium' }}
              >
                Start time
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
                <View className="flex-row space-x-2">
                  {timeOptions.map((time) => (
                    <TouchableOpacity
                      key={time}
                      onPress={() => handleStartTimeChange(time)}
                      className={`rounded-lg px-3 py-2 border ${
                        filters.startTime === time 
                          ? 'bg-brand-sage border-brand-sage' 
                          : 'bg-brand-cream border-brand-light'
                      }`}
                    >
                      <Text className={`text-sm font-medium ${
                        filters.startTime === time ? 'text-white' : 'text-brand-sage'
                      }`}>
                        {formatTimeDisplay(time)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* Duration with Smart End Time */}
            <View className="mb-3">
              <Text 
                className="text-brand-sage text-sm font-medium mb-2"
                style={{ fontFamily: 'Inter-Medium' }}
              >
                Duration
              </Text>
              <View className="flex-row justify-between mb-2">
                {[
                  { key: 'quick', label: '2 Hours', desc: 'Quick adventure' },
                  { key: 'half-day', label: 'Half Day', desc: '4-6 hours' },
                  { key: 'full-day', label: 'Full Day', desc: '8+ hours' }
                ].map((duration) => (
                  <TouchableOpacity 
                    key={duration.key}
                    onPress={() => handleDurationChange(duration.key)}
                    className={`rounded-lg px-3 py-3 w-[32%] items-center border ${
                      filters.duration === duration.key 
                        ? 'bg-brand-sage border-brand-sage' 
                        : 'bg-brand-cream border-brand-light'
                    }`}
                  >
                    <Text className={`font-semibold ${
                      filters.duration === duration.key ? 'text-white' : 'text-brand-sage'
                    }`}>
                      {duration.label}
                    </Text>
                    <Text className={`text-xs mt-1 text-center ${
                      filters.duration === duration.key ? 'text-white' : 'text-brand-sage'
                    }`}>
                      {duration.desc}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              {/* Smart End Time Display */}
              <View className="bg-brand-light rounded-lg p-3">
                <Text className="text-brand-sage text-sm">
                  Ends around: {formatTimeDisplay(filters.endTime ?? '')}
                </Text>
                
                {/* Custom End Time Toggle */}
                <TouchableOpacity
                  onPress={() => setFilters(prev => ({ ...prev, customEndTime: !prev.customEndTime }))}
                  className="flex-row items-center mt-2"
                >
                  <View className={`w-4 h-4 rounded border mr-2 ${
                    filters.customEndTime ? 'bg-brand-sage border-brand-sage' : 'border-gray-400'
                  }`}>
                    {filters.customEndTime && (
                      <Text className="text-white text-xs text-center">✓</Text>
                    )}
                  </View>
                  <Text className="text-brand-sage text-sm">Custom end time</Text>
                </TouchableOpacity>

                {/* Custom End Time Picker */}
                {filters.customEndTime && (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-2">
                    <View className="flex-row space-x-2">
                      {timeOptions.map((time) => (
                        <TouchableOpacity
                          key={time}
                          onPress={() => setFilters(prev => ({ ...prev, endTime: time }))}
                          className={`rounded-lg px-3 py-2 border ${
                            filters.endTime === time 
                              ? 'bg-brand-sage border-brand-sage' 
                              : 'bg-brand-cream border-brand-light'
                          }`}
                        >
                          <Text className={`text-sm font-medium ${
                            filters.endTime === time ? 'text-white' : 'text-brand-sage'
                          }`}>
                            {formatTimeDisplay(time)}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                )}

                {/* Flexible Timing Toggle */}
                <TouchableOpacity
                  onPress={() => setFilters(prev => ({ ...prev, flexibleTiming: !prev.flexibleTiming }))}
                  className="flex-row items-center mt-3"
                >
                  <View className={`w-4 h-4 rounded border mr-2 ${
                    filters.flexibleTiming ? 'bg-brand-sage border-brand-sage' : 'border-gray-400'
                  }`}>
                    {filters.flexibleTiming && (
                      <Text className="text-white text-xs text-center">✓</Text>
                    )}
                  </View>
                  <Text className="text-brand-sage text-sm">Flexible timing (+/- 1 hour)</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Experience Types with Selection Limit */}
          <View className="mb-4">
            <View className="flex-row justify-between items-center mb-2">
              <Text 
                className="text-brand-sage text-base font-semibold"
                style={{ fontFamily: 'Inter_600SemiBold' }}
              >
                🏷️ Experience Types
              </Text>
              <Text className="text-brand-teal text-xs">
                {filters.experienceTypes?.length || 0}/{maxExperienceSelection} selected
              </Text>
            </View>
            <Text className="text-xs text-text-secondary mb-3">
              Choose up to {maxExperienceSelection} types that match your adventure style
            </Text>
            <View className="flex-row flex-wrap justify-center">
              {experienceTypes.map((type) => {
                const isSelected = filters.experienceTypes?.includes(type);
                const isDisabled = !isSelected && (filters.experienceTypes?.length || 0) >= maxExperienceSelection;
                
                return (
                  <TouchableOpacity
                    key={type}
                    onPress={() => {
                      if (!isDisabled) {
                        toggleArraySelection(
                          filters.experienceTypes || [], 
                          type, 
                          (newTypes) => setFilters(prev => ({ ...prev, experienceTypes: newTypes })),
                          maxExperienceSelection
                        );
                      }
                    }}
                    disabled={isDisabled}
                    className={`rounded-full px-3 py-2 mx-1 mb-2 border ${
                      isSelected
                        ? 'bg-brand-sage border-brand-sage' 
                        : isDisabled
                        ? 'bg-gray-100 border-gray-300'
                        : 'bg-brand-cream border-brand-light'
                    }`}
                  >
                    <Text className={`text-sm font-medium ${
                      isSelected
                        ? 'text-white' 
                        : isDisabled
                        ? 'text-gray-400'
                        : 'text-brand-sage'
                    }`}>
                      {type}
                    </Text>
                  </TouchableOpacity>
                );
              })}
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

          {/* NEW: Draggable Radius Slider with Transport Context */}
          <View className="mb-4">
            <Text 
              className="text-brand-sage text-base font-semibold mb-2"
              style={{ fontFamily: 'Inter_600SemiBold' }}
            >
              📏 Max Distance
            </Text>
            
            {/* Slider Display */}
            <View className="bg-brand-light rounded-lg p-4">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-brand-sage font-semibold text-lg">
                  {filters.radius} miles
                </Text>
                <Text className="text-brand-sage text-sm">
                  ({milesToKm(filters.radius!)} km)
                </Text>
              </View>
              
              {/* Draggable Slider */}
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
                
                {/* Slider Labels */}
                <View className="flex-row justify-between">
                  <Text className="text-xs text-brand-sage">0.5 mi</Text>
                  <Text className="text-xs text-brand-sage">20 mi</Text>
                </View>
              </View>
              
              {/* Transport Suggestion */}
              <View className="flex-row items-center justify-center bg-brand-cream rounded-lg p-3">
                <Text className="text-lg mr-2">{getTransportSuggestion(filters.radius!).icon}</Text>
                <Text className="text-brand-sage text-sm font-medium">
                  {getTransportSuggestion(filters.radius!).text}
                </Text>
              </View>
            </View>
          </View>

          {/* REMOVED: Transport Method section - saves space */}
          
          {/* Budget Selector */}
          <View className="mb-4">
            <Text 
              className="text-brand-sage text-base font-semibold mb-2"
              style={{ fontFamily: 'Inter_600SemiBold' }}
            >
              Budget
            </Text>
            <View className="flex-row justify-between">
              {[
                { key: 'budget', label: '$', desc: 'Budget-friendly' },
                { key: 'moderate', label: '$$', desc: 'Moderate' },
                { key: 'premium', label: '$$$', desc: 'Premium' }
              ].map((budget) => (
                <TouchableOpacity 
                  key={budget.key}
                  onPress={() => setFilters(prev => ({ ...prev, budget: budget.key as any }))}
                  className={`rounded-lg px-4 py-3 w-[32%] items-center border ${
                    filters.budget === budget.key 
                      ? 'bg-brand-sage border-brand-sage' 
                      : 'bg-brand-light border-brand-light'
                  }`}
                >
                  <Text className={`text-lg font-bold ${
                    filters.budget === budget.key ? 'text-white' : 'text-brand-sage'
                  }`}>
                    {budget.label}
                  </Text>
                  <Text className={`text-xs mt-1 text-center ${
                    filters.budget === budget.key ? 'text-white' : 'text-brand-sage'
                  }`}>
                    {budget.desc}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* REMOVED: Old Vibe selector - replaced by Experience Types */}

          {/* NEW: Split Dietary System */}
          {/* Dietary Restrictions (Hard Constraints) */}
          <View className="mb-4">
            <Text 
              className="text-brand-sage text-base font-semibold mb-2"
              style={{ fontFamily: 'Inter_600SemiBold' }}
            >
              🚨 Dietary Restrictions
            </Text>
            <Text className="text-xs text-text-secondary mb-3">
              Select any allergies or strict dietary requirements
            </Text>
            <View className="flex-row flex-wrap justify-center mb-3">
              {dietaryRestrictions.map((restriction) => (
                <TouchableOpacity
                  key={restriction}
                  onPress={() => toggleArraySelection(
                    filters.dietaryRestrictions || [], 
                    restriction, 
                    (newRestrictions) => setFilters(prev => ({ ...prev, dietaryRestrictions: newRestrictions }))
                  )}
                  className={`rounded-full px-3 py-2 mx-1 mb-2 border ${
                    filters.dietaryRestrictions?.includes(restriction) 
                      ? 'bg-red-500 border-red-500' 
                      : 'bg-brand-light border-brand-light'
                  }`}
                >
                  <Text className={`text-sm font-medium ${
                    filters.dietaryRestrictions?.includes(restriction) ? 'text-white' : 'text-brand-sage'
                  }`}>
                    {restriction}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            {/* Other Restriction Input */}
            <TextInput
              className="bg-white border border-brand-light rounded-lg p-3 text-brand-sage"
              placeholder="Other restriction (max 20 characters)"
              placeholderTextColor="#999999"
              value={filters.otherRestriction}
              onChangeText={(text) => setFilters(prev => ({ ...prev, otherRestriction: text.slice(0, 20) }))}
              maxLength={20}
            />
          </View>

          {/* Food Preferences (Soft Preferences) */}
          <View className="mb-6">
            <Text 
              className="text-brand-sage text-base font-semibold mb-2"
              style={{ fontFamily: 'Inter_600SemiBold' }}
            >
              🌱 Food Preferences
            </Text>
            <Text className="text-xs text-text-secondary mb-3">
              Select food styles you prefer (optional)
            </Text>
            <View className="flex-row flex-wrap justify-center">
              {foodPreferences.map((preference) => (
                <TouchableOpacity
                  key={preference}
                  onPress={() => toggleArraySelection(
                    filters.foodPreferences || [], 
                    preference, 
                    (newPreferences) => setFilters(prev => ({ ...prev, foodPreferences: newPreferences }))
                  )}
                  className={`rounded-full px-3 py-2 mx-1 mb-2 border ${
                    filters.foodPreferences?.includes(preference) 
                      ? 'bg-brand-teal border-brand-teal' 
                      : 'bg-brand-light border-brand-light'
                  }`}
                >
                  <Text className={`text-sm font-medium ${
                    filters.foodPreferences?.includes(preference) ? 'text-white' : 'text-brand-sage'
                  }`}>
                    {preference}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          <Button 
            title={isGenerating ? "Creating Your Adventure..." : "✨ Generate Adventure"}
            onPress={generateAdventure} 
            variant="primary"
            size="lg"
            isLoading={isGenerating}
            leftIcon={!isGenerating ? <Text className="text-xl">🤖</Text> : undefined}
          />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CurateScreen;