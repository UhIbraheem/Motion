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

  return (
    <SafeAreaView className="flex-1 bg-background-light">
      <ScrollView className="flex-1 p-4" contentContainerStyle={{ flexGrow: 1 }}>
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
        animationType="fade"
        statusBarTranslucent
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 20,
        }}>
          <TouchableOpacity 
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
            onPress={() => setEditingStepIndex(null)}
            activeOpacity={1}
          />
          
          <View style={{
            backgroundColor: 'white',
            borderRadius: 16,
            padding: 24,
            width: '100%',
            maxWidth: 400,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.25,
            shadowRadius: 12,
            elevation: 12,
          }}>
            {/* Header */}
            <View style={{ alignItems: 'center', marginBottom: 24 }}>
              <Text style={{
                fontSize: 20,
                fontWeight: '600',
                color: '#3c7660',
                marginBottom: 8,
              }}>
                Edit Step {editingStepIndex !== null ? editingStepIndex + 1 : ''}
              </Text>
              {editingStepIndex !== null && (
                <Text style={{
                  fontSize: 14,
                  color: '#666',
                  textAlign: 'center',
                  lineHeight: 20,
                }}>
                  {adventure.steps[editingStepIndex].title}
                </Text>
              )}
            </View>
            
            {/* Input Field */}
            <TextInput
              style={{
                borderWidth: 1.5,
                borderColor: '#e0e0e0',
                borderRadius: 12,
                padding: 16,
                fontSize: 16,
                minHeight: 100,
                textAlignVertical: 'top',
                backgroundColor: '#fafafa',
                marginBottom: 20,
              }}
              placeholder="What would you like to change about this step?"
              placeholderTextColor="#999"
              value={editRequest}
              onChangeText={setEditRequest}
              multiline
              autoFocus
            />
            
            {/* Buttons */}
            <View style={{
              flexDirection: 'row',
              gap: 12,
            }}>
              <TouchableOpacity
                onPress={() => setEditingStepIndex(null)}
                style={{
                  flex: 1,
                  paddingVertical: 14,
                  borderRadius: 12,
                  backgroundColor: '#f5f5f5',
                  alignItems: 'center',
                }}
              >
                <Text style={{
                  fontSize: 16,
                  fontWeight: '500',
                  color: '#666',
                }}>
                  Cancel
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={regenerateStep}
                disabled={isRegeneratingStep || !editRequest.trim()}
                style={{
                  flex: 1,
                  paddingVertical: 14,
                  borderRadius: 12,
                  backgroundColor: !editRequest.trim() ? '#ccc' : '#3c7660',
                  alignItems: 'center',
                }}
              >
                <Text style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: 'white',
                }}>
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