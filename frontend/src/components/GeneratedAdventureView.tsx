import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, SafeAreaView, Alert, TouchableOpacity, Modal, TextInput, Animated } from 'react-native';
import Card from './Card';
import { GeneratedAdventure, AdventureStep, AdventureFilters } from '../services/aiService';
import { aiService } from '../services/aiService';
import { FormatPreferences, formatBudget, formatDuration } from '../utils/formatters';

interface GeneratedAdventureViewProps {
  adventure: GeneratedAdventure;
  onBack: () => void;
  onSave: () => void;
  isSaving: boolean;
  filters: AdventureFilters;
  onAdventureUpdate: (updatedAdventure: GeneratedAdventure) => void;
  userPreferences?: FormatPreferences;
  showDatePicker?: boolean;
  onOpenDatePicker?: () => void;
}

const GeneratedAdventureView: React.FC<GeneratedAdventureViewProps> = ({
  adventure,
  onBack,
  onSave,
  isSaving,
  filters,
  onAdventureUpdate,
  userPreferences,
  showDatePicker,
  onOpenDatePicker,
}) => {
  // Step editing states
  const [editingStepIndex, setEditingStepIndex] = useState<number | null>(null);
  const [editRequest, setEditRequest] = useState('');
  const [isRegeneratingStep, setIsRegeneratingStep] = useState(false);

  // Adventure title editing states
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(adventure.title);

  // Update adventure title
  const handleTitleSave = () => {
    const finalTitle = editedTitle.trim() || adventure.title;
    const updatedAdventure = { ...adventure, title: finalTitle };
    onAdventureUpdate(updatedAdventure);
    setIsEditingTitle(false);
  };

  const handleTitleCancel = () => {
    setEditedTitle(adventure.title);
    setIsEditingTitle(false);
  };

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
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView 
        className="flex-1" 
        contentContainerStyle={{ 
          flexGrow: 1,
          paddingHorizontal: 16,
          paddingTop: 8,
          paddingBottom: 120 // Extra space for nav bar
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between mb-6">
          <TouchableOpacity 
            onPress={onBack}
            className="flex-row items-center bg-white px-4 py-2 rounded-xl shadow-sm"
          >
            <Text className="text-green-600 text-base font-medium">← Back</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={onSave}
            className="bg-green-600 px-6 py-2 rounded-xl shadow-sm"
            disabled={isSaving}
          >
            <Text className="text-white text-base font-medium">
              {isSaving ? 'Saving...' : 'Save Adventure'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Main Adventure Card */}
        <View 
          className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-gray-100"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 4
          }}
        >
          {/* Editable Adventure Title */}
          {isEditingTitle ? (
            <View className="mb-3">
              <TextInput
                value={editedTitle}
                onChangeText={setEditedTitle}
                placeholder={adventure.title === 'Your Adventure' ? 'Enter adventure name' : adventure.title}
                className="text-2xl font-bold text-gray-900 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200"
                multiline={false}
                autoFocus={true}
                onSubmitEditing={handleTitleSave}
              />
              <View className="flex-row justify-end mt-2 space-x-2">
                <TouchableOpacity 
                  onPress={handleTitleCancel}
                  className="px-3 py-1 rounded-md bg-gray-200"
                >
                  <Text className="text-gray-600 text-sm">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={handleTitleSave}
                  className="px-3 py-1 rounded-md bg-green-600"
                >
                  <Text className="text-white text-sm">Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity 
              onPress={() => setIsEditingTitle(true)}
              className="mb-3"
            >
              <Text className="text-2xl font-bold text-gray-900">
                {adventure.title}
              </Text>
              <Text className="text-gray-400 text-xs mt-1">
                Tap to edit adventure name
              </Text>
            </TouchableOpacity>
          )}
          <Text className="text-gray-600 text-base leading-relaxed mb-6">
            {adventure.description}
          </Text>
          
          {/* Adventure Info */}
          <View className="flex-row items-center justify-between mb-6 p-4 bg-gray-50 rounded-xl">
            <View className="items-center">
              <Text className="text-gray-500 text-sm">Duration</Text>
              <Text className="text-gray-900 font-semibold">
                {adventure.estimatedDuration || '4 hours'}
              </Text>
            </View>
            <View className="items-center">
              <Text className="text-gray-500 text-sm">Cost</Text>
              <Text className="text-gray-900 font-semibold">
                {adventure.estimatedCost || '$$'}
              </Text>
            </View>
            <View className="items-center">
              <Text className="text-gray-500 text-sm">Location</Text>
              <Text className="text-gray-900 font-semibold">{adventure.location || 'Local'}</Text>
            </View>
            {adventure.scheduledFor && (
              <View className="items-center">
                <Text className="text-gray-500 text-sm">Scheduled</Text>
                <Text className="text-gray-900 font-semibold">
                  {new Date(adventure.scheduledFor).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </Text>
              </View>
            )}
          </View>

          {/* Schedule Adventure Button - Only show for non-completed adventures */}
          {!adventure.isCompleted && (
            <TouchableOpacity 
              className="bg-green-100 border border-green-200 rounded-xl p-4 mb-6"
              onPress={onOpenDatePicker}
            >
              <View className="flex-row items-center justify-center">
                <Text className="text-green-700 font-semibold text-base mr-2">📅 Schedule Adventure</Text>
              </View>
              <Text className="text-green-600 text-sm text-center mt-1">
                Pick a date and time for this adventure
              </Text>
            </TouchableOpacity>
          )}
          
          {/* Steps Header */}
          <Text className="text-lg font-bold text-gray-900 mb-4">Adventure Steps</Text>
          
          {/* Steps */}
          {adventure.steps.map((step, index) => (
            <View 
              key={index} 
              className="mb-4 p-4 bg-white border border-gray-200 rounded-xl"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 3,
                elevation: 2
              }}
            >
              <View className="flex-row items-start justify-between mb-2">
                <View className="flex-1">
                  <View className="flex-row items-center mb-2">
                    <View className="w-6 h-6 bg-green-600 rounded-full items-center justify-center mr-3">
                      <Text className="text-white text-xs font-bold">{index + 1}</Text>
                    </View>
                    <Text className="text-green-600 text-sm font-medium">{step.time}</Text>
                  </View>
                  <Text className="font-semibold text-gray-900 text-base mb-1">
                    {step.title}
                  </Text>
                  <Text className="text-gray-600 text-sm mb-1">{step.location}</Text>
                  <Text className="text-gray-600 text-sm leading-relaxed">{step.notes}</Text>
                </View>
              </View>
              
              <TouchableOpacity
                onPress={() => openStepEditor(index)}
                className="mt-3 bg-gray-100 rounded-lg px-3 py-2 self-start"
              >
                <Text className="text-gray-700 text-sm font-medium">✏️ Edit Step</Text>
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
        statusBarTranslucent
      >
        <View className="flex-1 bg-black/50 justify-end">
          <SafeAreaView className="bg-white rounded-t-3xl">
            {/* Header */}
            <View className="flex-row items-center justify-between p-6 border-b border-gray-100">
              <TouchableOpacity onPress={() => setEditingStepIndex(null)}>
                <Text className="text-gray-500 font-medium">Cancel</Text>
              </TouchableOpacity>
              <Text className="text-lg font-semibold text-gray-900">
                Edit Step {editingStepIndex !== null ? editingStepIndex + 1 : ''}
              </Text>
              <TouchableOpacity
                onPress={regenerateStep}
                disabled={isRegeneratingStep || !editRequest.trim()}
                className={`px-4 py-2 rounded-lg ${!editRequest.trim() ? 'bg-gray-200' : 'bg-green-600'}`}
              >
                <Text className={`font-medium ${!editRequest.trim() ? 'text-gray-400' : 'text-white'}`}>
                  {isRegeneratingStep ? 'Updating...' : 'Update'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Current Step Info */}
            {editingStepIndex !== null && (
              <View className="px-6 py-4 bg-gray-50">
                <Text className="text-center text-gray-600 text-sm">Current Step</Text>
                <Text className="text-center text-gray-900 font-semibold text-lg mt-1">
                  {adventure.steps[editingStepIndex].title}
                </Text>
              </View>
            )}
            
            {/* Input Field */}
            <View className="p-6">
              <TextInput
                className="border border-gray-300 rounded-xl p-4 text-base bg-gray-50"
                style={{ minHeight: 120, textAlignVertical: 'top' }}
                placeholder="What would you like to change about this step?"
                placeholderTextColor="#9CA3AF"
                value={editRequest}
                onChangeText={setEditRequest}
                multiline
                autoFocus
              />
            </View>

            {/* Footer spacing */}
            <View className="h-8" />
          </SafeAreaView>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default GeneratedAdventureView;