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

  // Inline step editing states
  const [editingStepTitleIndex, setEditingStepTitleIndex] = useState<number | null>(null);
  const [editingStepTimeIndex, setEditingStepTimeIndex] = useState<number | null>(null);
  const [editedStepTitle, setEditedStepTitle] = useState('');
  const [editedStepTime, setEditedStepTime] = useState('');

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

  // Inline step title editing
  const handleStepTitleEdit = (stepIndex: number) => {
    setEditingStepTitleIndex(stepIndex);
    setEditedStepTitle(adventure.steps[stepIndex].title);
  };

  const handleStepTitleSave = (stepIndex: number) => {
    const finalTitle = editedStepTitle.trim() || adventure.steps[stepIndex].title;
    const updatedSteps = [...adventure.steps];
    updatedSteps[stepIndex] = { ...updatedSteps[stepIndex], title: finalTitle };

    const updatedAdventure = { ...adventure, steps: updatedSteps };
    onAdventureUpdate(updatedAdventure);
    setEditingStepTitleIndex(null);
  };

  const handleStepTitleCancel = () => {
    setEditingStepTitleIndex(null);
  };

  // Inline step time editing with cascading time adjustments
  const handleStepTimeEdit = (stepIndex: number) => {
    setEditingStepTimeIndex(stepIndex);
    setEditedStepTime(adventure.steps[stepIndex].time);
  };

  const parseTime = (timeStr: string): number => {
    // Parse times like "10:00 AM" or "10:00" to minutes since midnight
    const cleanTime = timeStr.trim().toUpperCase();
    const match = cleanTime.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/);

    if (!match) return 0;

    let hours = parseInt(match[1]);
    const minutes = parseInt(match[2]);
    const meridiem = match[3];

    if (meridiem === 'PM' && hours !== 12) hours += 12;
    if (meridiem === 'AM' && hours === 12) hours = 0;

    return hours * 60 + minutes;
  };

  const formatTime = (minutes: number): string => {
    // Convert minutes since midnight back to "HH:MM AM/PM" format
    const hours24 = Math.floor(minutes / 60) % 24;
    const mins = minutes % 60;
    const hours12 = hours24 === 0 ? 12 : hours24 > 12 ? hours24 - 12 : hours24;
    const meridiem = hours24 < 12 ? 'AM' : 'PM';

    return `${hours12}:${mins.toString().padStart(2, '0')} ${meridiem}`;
  };

  const handleStepTimeSave = (stepIndex: number) => {
    const newTime = editedStepTime.trim();
    if (!newTime) {
      setEditingStepTimeIndex(null);
      return;
    }

    const updatedSteps = [...adventure.steps];
    const oldTimeMinutes = parseTime(updatedSteps[stepIndex].time);
    const newTimeMinutes = parseTime(newTime);
    const timeDifference = newTimeMinutes - oldTimeMinutes;

    // Update the current step's time
    updatedSteps[stepIndex] = { ...updatedSteps[stepIndex], time: newTime };

    // Adjust all subsequent steps by the time difference
    for (let i = stepIndex + 1; i < updatedSteps.length; i++) {
      const currentStepMinutes = parseTime(updatedSteps[i].time);
      const adjustedMinutes = currentStepMinutes + timeDifference;
      updatedSteps[i] = { ...updatedSteps[i], time: formatTime(adjustedMinutes) };
    }

    const updatedAdventure = { ...adventure, steps: updatedSteps };
    onAdventureUpdate(updatedAdventure);
    setEditingStepTimeIndex(null);
  };

  const handleStepTimeCancel = () => {
    setEditingStepTimeIndex(null);
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

  // Quick step replacement with pregenerated prompts
  const regenerateStepWithPrompt = async (stepIndex: number, prompt: string) => {
    setIsRegeneratingStep(true);

    try {
      const currentStep = adventure.steps[stepIndex];

      const { data, error } = await aiService.regenerateStep(
        stepIndex,
        currentStep,
        adventure.steps,
        prompt,
        filters
      );

      if (error) {
        Alert.alert('Regeneration Failed', error);
        return;
      }

      if (data) {
        // Replace the step in the adventure
        const updatedSteps = [...adventure.steps];
        updatedSteps[stepIndex] = data;

        const updatedAdventure = {
          ...adventure,
          steps: updatedSteps
        };

        onAdventureUpdate(updatedAdventure);
        Alert.alert('Success! 🎉', `Step ${stepIndex + 1} has been updated!`);
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
                  {/* Step number and editable time */}
                  <View className="flex-row items-center mb-2">
                    <View className="w-6 h-6 bg-green-600 rounded-full items-center justify-center mr-3">
                      <Text className="text-white text-xs font-bold">{index + 1}</Text>
                    </View>
                    {editingStepTimeIndex === index ? (
                      <View className="flex-row items-center">
                        <TextInput
                          value={editedStepTime}
                          onChangeText={setEditedStepTime}
                          placeholder={step.time}
                          className="text-green-600 text-sm font-medium bg-green-50 px-2 py-1 rounded border border-green-300"
                          autoFocus={true}
                          onSubmitEditing={() => handleStepTimeSave(index)}
                        />
                        <TouchableOpacity onPress={() => handleStepTimeSave(index)} className="ml-2">
                          <Text className="text-green-700 text-xs">✓</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleStepTimeCancel} className="ml-1">
                          <Text className="text-gray-500 text-xs">✕</Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <TouchableOpacity onPress={() => handleStepTimeEdit(index)}>
                        <Text className="text-green-600 text-sm font-medium">{step.time}</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* Editable step title */}
                  {editingStepTitleIndex === index ? (
                    <View className="mb-2">
                      <TextInput
                        value={editedStepTitle}
                        onChangeText={setEditedStepTitle}
                        placeholder={step.title}
                        className="font-semibold text-gray-900 text-base bg-gray-50 px-2 py-1 rounded border border-gray-300"
                        multiline={false}
                        autoFocus={true}
                        onSubmitEditing={() => handleStepTitleSave(index)}
                      />
                      <View className="flex-row justify-end mt-1">
                        <TouchableOpacity
                          onPress={handleStepTitleCancel}
                          className="px-2 py-1 rounded bg-gray-200 mr-1"
                        >
                          <Text className="text-gray-600 text-xs">Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => handleStepTitleSave(index)}
                          className="px-2 py-1 rounded bg-green-600"
                        >
                          <Text className="text-white text-xs">Save</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : (
                    <TouchableOpacity onPress={() => handleStepTitleEdit(index)} className="mb-1">
                      <Text className="font-semibold text-gray-900 text-base">
                        {step.title}
                      </Text>
                      <Text className="text-gray-400 text-xs">Tap to edit name</Text>
                    </TouchableOpacity>
                  )}

                  <Text className="text-gray-600 text-sm mb-1">{step.location}</Text>
                  <Text className="text-gray-600 text-sm leading-relaxed">{step.notes}</Text>
                </View>
              </View>

              {/* Quick action buttons - Pregenerated prompts */}
              <View className="mt-3 mb-2">
                <Text className="text-gray-500 text-xs mb-2">Quick actions:</Text>
                <View className="flex-row flex-wrap gap-2">
                  <TouchableOpacity
                    onPress={() => regenerateStepWithPrompt(index, "Try a different food category or type of experience")}
                    className="bg-blue-100 border border-blue-200 rounded-lg px-3 py-2"
                    disabled={isRegeneratingStep}
                  >
                    <Text className="text-blue-700 text-xs font-medium">🔄 Different Category</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => regenerateStepWithPrompt(index, "I've been to this place before. Find me something new and different.")}
                    className="bg-purple-100 border border-purple-200 rounded-lg px-3 py-2"
                    disabled={isRegeneratingStep}
                  >
                    <Text className="text-purple-700 text-xs font-medium">🏠 Been Here Before</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => regenerateStepWithPrompt(index, "I don't like this pick. Find me a completely different option.")}
                    className="bg-orange-100 border border-orange-200 rounded-lg px-3 py-2"
                    disabled={isRegeneratingStep}
                  >
                    <Text className="text-orange-700 text-xs font-medium">👎 Don't Like This</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Custom edit button */}
              <TouchableOpacity
                onPress={() => openStepEditor(index)}
                className="mt-2 bg-gray-100 rounded-lg px-3 py-2 self-start"
              >
                <Text className="text-gray-700 text-sm font-medium">✏️ Custom Edit</Text>
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