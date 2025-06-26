import React, { useState } from 'react';
import { View, Text, ScrollView, SafeAreaView, Alert, TouchableOpacity, Modal, TextInput, Keyboard, TouchableWithoutFeedback } from 'react-native';
import Button from '../components/Button';
import Input from '../components/Input';
import Card from '../components/Card';
import { aiService, AdventureFilters, GeneratedAdventure, AdventureStep } from '../services/aiService';

const CurateScreen: React.FC = () => {
  const [filters, setFilters] = useState<AdventureFilters>({
    location: '',
    duration: 'half-day',
    budget: 'moderate',
    vibe: [],
    dietaryRestrictions: [],
    timeOfDay: 'flexible',
    groupSize: 1,
    radius: 5, // Default 5 miles
    transportMethod: 'flexible',
  });
  
  const [generatedAdventure, setGeneratedAdventure] = useState<GeneratedAdventure | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Step editing states
  const [editingStepIndex, setEditingStepIndex] = useState<number | null>(null);
  const [editRequest, setEditRequest] = useState('');
  const [isRegeneratingStep, setIsRegeneratingStep] = useState(false);
  
  const vibeOptions = ['relaxed', 'energetic', 'cultural', 'foodie', 'outdoor'];
  const dietaryOptions = ['vegetarian', 'vegan', 'gluten-free', 'halal'];
  const transportOptions: Array<{
    key: 'walking' | 'bike' | 'rideshare' | 'flexible';
    label: string;
    desc: string;
    icon: string;
  }> = [
    { key: 'walking', label: 'Walking', desc: '0.5 miles', icon: '🚶' },
    { key: 'bike', label: 'Bike/Scooter', desc: '2-3 miles', icon: '🛴' },
    { key: 'rideshare', label: 'Uber/Lyft', desc: '10+ miles', icon: '🚗' },
    { key: 'flexible', label: 'Any', desc: 'Mix of methods', icon: '🚀' }
  ];
  
  const toggleArraySelection = (array: string[], item: string, setter: (value: string[]) => void) => {
    if (array.includes(item)) {
      setter(array.filter(i => i !== item));
    } else {
      setter([...array, item]);
    }
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
                title="💾 Save This Adventure"
                onPress={() => Alert.alert('Coming Soon!', 'Adventure saving will be added in the next update')} 
                variant="primary"
                size="lg"
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
        <View className="mb-6">
          <Text className="text-2xl font-bold text-brand-sage">Curate Your Adventure</Text>
          <Text className="text-text-secondary">Let AI create your perfect local experience</Text>
        </View>

        <Card title="Adventure Preferences" elevated={true}>
          <Text className="text-text-secondary mb-4">
            Tell us what you're looking for and our AI will create a personalized adventure.
          </Text>
          
          {/* Location Input */}
          <Input
            label="Location *"
            placeholder="Enter city, neighborhood, or address"
            value={filters.location}
            onChangeText={(location) => setFilters(prev => ({ ...prev, location }))}
          />

          {/* Group Size */}
          <View className="mb-4">
            <Text className="text-brand-sage text-sm font-medium mb-2">
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

          {/* Transport Method & Radius */}
          <View className="mb-4">
            <Text className="text-brand-sage text-sm font-medium mb-2">How do you want to get around?</Text>
            <View className="space-y-2">
              {transportOptions.map((transport) => (
                <TouchableOpacity
                  key={transport.key}
                  onPress={() => handleTransportChange(transport.key)}
                  className={`rounded-lg p-3 border flex-row items-center ${
                    filters.transportMethod === transport.key 
                      ? 'bg-brand-gold border-brand-gold' 
                      : 'bg-brand-cream border-brand-light'
                  }`}
                >
                  <Text className="text-2xl mr-3">{transport.icon}</Text>
                  <View className="flex-1">
                    <Text className={`font-semibold ${
                      filters.transportMethod === transport.key ? 'text-brand-sage' : 'text-brand-sage'
                    }`}>
                      {transport.label}
                    </Text>
                    <Text className="text-xs text-brand-sage">{transport.desc}</Text>
                  </View>
                  {filters.transportMethod === transport.key && (
                    <Text className="text-brand-sage text-lg">✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
            
            {/* Custom Radius */}
            <View className="mt-3 p-3 bg-brand-light rounded-lg">
              <Text className="text-brand-sage text-sm font-medium mb-2">
                Max Distance: {filters.radius} {filters.radius === 1 ? 'mile' : 'miles'}
              </Text>
              <View className="flex-row items-center">
                <TouchableOpacity
                  onPress={() => setFilters(prev => ({ ...prev, radius: Math.max(0.5, prev.radius! - 0.5) }))}
                  className="bg-brand-cream rounded-full w-8 h-8 items-center justify-center"
                >
                  <Text className="text-brand-sage font-bold">-</Text>
                </TouchableOpacity>
                
                <View className="flex-1 mx-3 bg-white rounded-lg py-2 items-center">
                  <Text className="text-brand-sage font-semibold">{filters.radius} mi</Text>
                </View>
                
                <TouchableOpacity
                  onPress={() => setFilters(prev => ({ ...prev, radius: Math.min(50, prev.radius! + 0.5) }))}
                  className="bg-brand-cream rounded-full w-8 h-8 items-center justify-center"
                >
                  <Text className="text-brand-sage font-bold">+</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
          
          {/* Duration Selector */}
          <View className="mb-4">
            <Text className="text-brand-sage text-sm font-medium mb-2">Duration</Text>
            <View className="flex-row justify-between">
              {[
                { key: 'quick', label: '2 Hours', desc: 'Quick adventure' },
                { key: 'half-day', label: 'Half Day', desc: '4-6 hours' },
                { key: 'full-day', label: 'Full Day', desc: '8+ hours' }
              ].map((duration) => (
                <TouchableOpacity 
                  key={duration.key}
                  onPress={() => setFilters(prev => ({ ...prev, duration: duration.key as any }))}
                  className={`rounded-lg px-3 py-3 w-[32%] items-center border ${
                    filters.duration === duration.key 
                      ? 'bg-brand-gold border-brand-gold' 
                      : 'bg-brand-cream border-brand-light'
                  }`}
                >
                  <Text className={`font-semibold ${
                    filters.duration === duration.key ? 'text-brand-sage' : 'text-brand-sage'
                  }`}>
                    {duration.label}
                  </Text>
                  <Text className="text-xs text-brand-sage mt-1 text-center">{duration.desc}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          {/* Budget Selector */}
          <View className="mb-4">
            <Text className="text-brand-sage text-sm font-medium mb-2">Budget</Text>
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
                      ? 'bg-brand-gold border-brand-gold' 
                      : 'bg-brand-light border-brand-light'
                  }`}
                >
                  <Text className={`text-lg font-bold ${
                    filters.budget === budget.key ? 'text-brand-sage' : 'text-brand-sage'
                  }`}>
                    {budget.label}
                  </Text>
                  <Text className="text-xs text-brand-sage mt-1 text-center">{budget.desc}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          {/* Vibe selector */}
          <View className="mb-4">
            <Text className="text-brand-sage text-sm font-medium mb-2">
              Vibe (tap to select multiple)
            </Text>
            <View className="flex-row flex-wrap">
              {vibeOptions.map((vibe) => (
                <TouchableOpacity
                  key={vibe}
                  onPress={() => toggleArraySelection(
                    filters.vibe || [], 
                    vibe, 
                    (newVibes) => setFilters(prev => ({ ...prev, vibe: newVibes }))
                  )}
                  className={`rounded-full px-4 py-2 mr-2 mb-2 border ${
                    filters.vibe?.includes(vibe) 
                      ? 'bg-brand-gold border-brand-gold' 
                      : 'bg-brand-cream border-brand-light'
                  }`}
                >
                  <Text className={`font-medium ${
                    filters.vibe?.includes(vibe) ? 'text-brand-sage' : 'text-brand-sage'
                  }`}>
                    {vibe.charAt(0).toUpperCase() + vibe.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Dietary Restrictions */}
          <View className="mb-6">
            <Text className="text-brand-sage text-sm font-medium mb-2">Dietary Preferences</Text>
            <View className="flex-row flex-wrap">
              {dietaryOptions.map((dietary) => (
                <TouchableOpacity
                  key={dietary}
                  onPress={() => toggleArraySelection(
                    filters.dietaryRestrictions || [], 
                    dietary, 
                    (newDietary) => setFilters(prev => ({ ...prev, dietaryRestrictions: newDietary }))
                  )}
                  className={`rounded-full px-3 py-2 mr-2 mb-2 border ${
                    filters.dietaryRestrictions?.includes(dietary) 
                      ? 'bg-brand-teal border-brand-teal' 
                      : 'bg-brand-light border-brand-light'
                  }`}
                >
                  <Text className={`text-sm font-medium ${
                    filters.dietaryRestrictions?.includes(dietary) ? 'text-white' : 'text-brand-sage'
                  }`}>
                    {dietary.charAt(0).toUpperCase() + dietary.slice(1)}
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