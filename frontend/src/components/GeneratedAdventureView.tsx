import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, SafeAreaView, Alert, TouchableOpacity, Modal, TextInput, Animated } from 'react-native';
import Card from './Card';
import { GeneratedAdventure, AdventureStep, AdventureFilters } from '../services/aiService';
import { aiService } from '../services/aiService';

interface GeneratedAdventureViewProps {
  adventure: GeneratedAdventure;
  onBack: () => void;
  onSave: () => void;
  isSaving: boolean;
  filters: AdventureFilters;
  onAdventureUpdate: (updatedAdventure: GeneratedAdventure) => void;
}

const GeneratedAdventureView: React.FC<GeneratedAdventureViewProps> = ({
  adventure,
  onBack,
  onSave,
  isSaving,
  filters,
  onAdventureUpdate,
}) => {
  // Step editing states
  const [editingStepIndex, setEditingStepIndex] = useState<number | null>(null);
  const [editRequest, setEditRequest] = useState('');
  const [isRegeneratingStep, setIsRegeneratingStep] = useState(false);

  const openStepEditor = (stepIndex: number) => {
    setEditingStepIndex(stepIndex);
    setEditRequest('');
  };

  const regenerateStep = async () => {
    if (!adventure || editingStepIndex === null || !editRequest.trim()) {
      Alert.alert('Error', 'Please enter what you want to change about this step.');
      return;
    }

    setIsRegeneratingStep(true);

    try {
      const currentStep = adventure.steps[editingStepIndex];
      
      const { data, error } = await aiService.regenerateStep(
        editingStepIndex,
        currentStep,
        adventure.steps,
        editRequest,
        filters
      );

      if (error) {
        Alert.alert('Regeneration Failed', error);
        return;
      }

      if (data) {
        // Replace the step in the adventure
        const updatedSteps = [...adventure.steps];
        updatedSteps[editingStepIndex] = data;
        
        const updatedAdventure = {
          ...adventure,
          steps: updatedSteps
        };

        onAdventureUpdate(updatedAdventure);
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

  return (
    <SafeAreaView className="flex-1 bg-background-light">
      <ScrollView className="flex-1 p-4">
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity onPress={onBack}>
            <Text className="text-brand-sage text-lg">← Back to Filters</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onSave}>
            <Text className="text-brand-sage text-lg font-semibold">
              {isSaving ? 'Saving...' : 'Save Adventure'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Main Adventure Card with Gold Border */}
        <View 
          className="bg-white rounded-lg p-4 border-2 border-brand-gold"
          style={{
            shadowColor: '#D4AF37',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.25,
            shadowRadius: 12,
            elevation: 8
          }}
        >
          <Text className="text-2xl font-bold text-brand-sage mb-2">
            {adventure.title}
          </Text>
          <Text className="text-gray-600 mb-4">
            {adventure.description}
          </Text>
          
          {adventure.steps.map((step, index) => (
            <View 
              key={index} 
              className="mb-4 p-4 rounded-lg border border-brand-sage"
              style={{
                backgroundColor: '#4d987b0A',
                shadowColor: '#4d987b',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
                elevation: 1
              }}
            >
              <Text className="font-semibold text-brand-sage">
                {step.time} - {step.title}
              </Text>
              <Text className="text-gray-600 mt-1">{step.location}</Text>
              <Text className="text-gray-600 mt-1">{step.notes}</Text>
              
              <TouchableOpacity
                onPress={() => openStepEditor(index)}
                className="mt-2 rounded-full px-3 py-1 self-start bg-brand-sage"
              >
                <Text className="text-white text-sm">Edit Step</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Step Editor Modal */}
      <Modal
        visible={editingStepIndex !== null}
        transparent={true}
        animationType="slide"
      >
        <View className="flex-1 justify-end bg-black bg-opacity-50">
          <TouchableOpacity 
            className="flex-1" 
            onPress={() => setEditingStepIndex(null)}
          />
          <View className="bg-white rounded-t-lg p-4">
            <Text className="text-lg font-bold mb-4">
              Edit Step {editingStepIndex !== null ? editingStepIndex + 1 : ''}
            </Text>
            
            {/* Quick Edit Suggestions */}
            {editingStepIndex !== null && (
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Quick suggestions:
                </Text>
                <View className="flex-row flex-wrap mb-4">
                  {getQuickEditSuggestions(adventure.steps[editingStepIndex]).map((suggestion, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => {
                        setEditRequest(suggestion);
                      }}
                      className="bg-white border border-gray-200 rounded-full px-3 py-2 mr-2 mb-2"
                    >
                      <Text className="text-brand-sage text-sm">{suggestion}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
            
            <TextInput
              className="border border-gray-300 rounded-lg p-3 mb-4 min-h-[80px]"
              placeholder="What would you like to change?"
              value={editRequest}
              onChangeText={setEditRequest}
              multiline
              textAlignVertical="top"
            />
            
            <View className="flex-row justify-between">
              <TouchableOpacity
                onPress={() => setEditingStepIndex(null)}
                className="bg-gray-200 rounded-lg px-4 py-2 flex-1 mr-2"
              >
                <Text className="text-center">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={regenerateStep}
                className="bg-brand-sage rounded-lg px-4 py-2 flex-1 ml-2"
                disabled={isRegeneratingStep || !editRequest.trim()}
              >
                <Text className="text-white text-center">
                  {isRegeneratingStep ? 'Updating...' : 'Update Step'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default GeneratedAdventureView;