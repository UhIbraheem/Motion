// src/components/modals/StepsOverviewModal.tsx - Redesigned with horizontal progress line
import React, { useRef, useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
  SafeAreaView,
  Alert,
  TextInput,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { typography, spacing, borderRadius, getCurrentTheme } from '../../constants/Theme';
import { useTheme } from '../../context/ThemeContext';
import { Adventure, AdventureStep } from './types';
import { BookingSection } from './StepBookingUtils';
import { StepEditor, EditingControls } from './StepEditor';
import { formatScheduledDate } from '../../utils/formatters';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface StepsOverviewModalProps {
  visible: boolean;
  adventure: Adventure | null;
  onClose: () => void;
  onUpdateSteps?: (adventureId: string, steps: AdventureStep[]) => void;
  formatDuration: (hours: number) => string;
  formatCost: (cost: number) => string;
}

const StepsOverviewModal: React.FC<StepsOverviewModalProps> = ({
  visible,
  adventure,
  onClose,
  onUpdateSteps,
  formatDuration,
  formatCost,
}) => {
  const { isDark } = useTheme();
  const themeColors = getCurrentTheme(isDark);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // State for step navigation
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // State for editing
  const [isEditing, setIsEditing] = useState(false);
  const [editingSteps, setEditingSteps] = useState<AdventureStep[]>([]);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [tempTime, setTempTime] = useState(new Date());

  // State for editable adventure name
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState('');

  // Animation effects
  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
      // Reset to first step when opening
      setCurrentStepIndex(0);
    } else {
      fadeAnim.setValue(0);
    }
  }, [visible]);

  // Initialize editing steps
  useEffect(() => {
    if (adventure) {
      setEditingSteps([...adventure.steps]);
      setEditedName(adventure.title);
    }
  }, [adventure]);

  // Handle time change
  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const timeString = selectedTime.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });

      const updatedSteps = [...editingSteps];
      updatedSteps[currentStepIndex] = {
        ...updatedSteps[currentStepIndex],
        time: timeString
      };
      setEditingSteps(updatedSteps);
    }
  };

  // Handle step field updates
  const handleStepUpdate = (index: number, field: keyof AdventureStep, value: string) => {
    const updatedSteps = [...editingSteps];
    updatedSteps[index] = {
      ...updatedSteps[index],
      [field]: value
    };
    setEditingSteps(updatedSteps);
  };

  // Handle time edit
  const handleTimeEdit = () => {
    const currentTime = editingSteps[currentStepIndex].time;
    const timeRegex = /(\d{1,2}):(\d{2})\s*(AM|PM)/i;
    const match = currentTime.match(timeRegex);

    if (match) {
      let hours = parseInt(match[1]);
      const minutes = parseInt(match[2]);
      const isPM = match[3].toUpperCase() === 'PM';

      if (isPM && hours !== 12) hours += 12;
      if (!isPM && hours === 12) hours = 0;

      const date = new Date();
      date.setHours(hours, minutes, 0, 0);
      setTempTime(date);
    } else {
      setTempTime(new Date());
    }

    setShowTimePicker(true);
  };

  // Handle save changes
  const handleSaveChanges = () => {
    Alert.alert(
      'Save Changes',
      'Are you sure you want to save the changes to this adventure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Save',
          onPress: () => {
            if (onUpdateSteps && adventure) {
              onUpdateSteps(adventure.id, editingSteps);
            }
            setIsEditing(false);
          }
        }
      ]
    );
  };

  // Handle discard changes
  const handleDiscardChanges = () => {
    if (adventure) {
      setEditingSteps([...adventure.steps]);
    }
    setIsEditing(false);
  };

  // Navigate to next step
  const goToNextStep = () => {
    if (currentStepIndex < (steps.length - 1)) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  // Navigate to previous step
  const goToPreviousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  if (!adventure || !visible) return null;

  const steps = isEditing ? editingSteps : adventure.steps;
  const currentStep = steps[currentStepIndex];

  // Calculate progress percentage
  const completedSteps = steps.filter(step => step.completed).length;
  const progressPercentage = steps.length > 0 ? (completedSteps / steps.length) * 100 : 0;

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent
      statusBarTranslucent
    >
      {/* Fade animation wrapper */}
      <Animated.View style={{
        flex: 1,
        opacity: fadeAnim,
      }}>
        {/* Blurred background */}
        <BlurView
          intensity={20}
          tint="dark"
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: spacing.lg,
          }}
        >
          {/* Background touchable to close */}
          <TouchableOpacity
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
            activeOpacity={1}
            onPress={onClose}
          />

          {/* Modal content */}
          <View style={{
            backgroundColor: themeColors.background.primary,
            borderRadius: borderRadius.xl,
            maxHeight: SCREEN_HEIGHT * 0.85,
            width: '100%',
            overflow: 'hidden',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.25,
            shadowRadius: 12,
            elevation: 12,
          }}>
            <SafeAreaView style={{ flex: 1 }}>
              {/* Compact Header */}
              <View style={{
                paddingHorizontal: spacing.lg,
                paddingTop: spacing.md,
                paddingBottom: spacing.sm,
                borderBottomWidth: 1,
                borderBottomColor: themeColors.text.tertiary + '10',
              }}>
                {/* Title Row with Edit and Close */}
                <View style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: spacing.sm,
                }}>
                  {isEditingName ? (
                    <TextInput
                      value={editedName}
                      onChangeText={setEditedName}
                      onBlur={() => setIsEditingName(false)}
                      autoFocus
                      style={{
                        flex: 1,
                        ...typography.heading,
                        fontSize: 20,
                        fontWeight: '700',
                        color: themeColors.text.primary,
                        backgroundColor: themeColors.background.secondary,
                        paddingHorizontal: spacing.sm,
                        paddingVertical: spacing.xs,
                        borderRadius: borderRadius.sm,
                        marginRight: spacing.sm,
                      }}
                    />
                  ) : (
                    <TouchableOpacity
                      onPress={() => setIsEditingName(true)}
                      style={{ flex: 1, marginRight: spacing.sm }}
                    >
                      <Text style={{
                        ...typography.heading,
                        fontSize: 20,
                        fontWeight: '700',
                        color: themeColors.text.primary,
                      }}>
                        {adventure.title}
                      </Text>
                      <Text style={{
                        ...typography.caption,
                        fontSize: 10,
                        color: themeColors.text.tertiary,
                        marginTop: 2,
                      }}>
                        Tap to edit
                      </Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    onPress={onClose}
                    style={{
                      padding: spacing.xs,
                      backgroundColor: themeColors.background.secondary,
                      borderRadius: borderRadius.round,
                    }}
                  >
                    <Ionicons
                      name="close"
                      size={20}
                      color={themeColors.text.primary}
                    />
                  </TouchableOpacity>
                </View>

                {/* Compact Info Grid - 2x2 */}
                <View style={{
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  marginBottom: spacing.sm,
                  gap: spacing.xs,
                }}>
                  {/* Progress */}
                  <View style={{
                    flex: 1,
                    minWidth: '48%',
                    backgroundColor: themeColors.background.secondary,
                    borderRadius: borderRadius.md,
                    padding: spacing.sm,
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}>
                    <Ionicons
                      name="checkmark-circle"
                      size={16}
                      color={themeColors.brand.sage}
                      style={{ marginRight: spacing.xs }}
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={{
                        ...typography.caption,
                        fontSize: 10,
                        color: themeColors.text.tertiary,
                      }}>
                        Progress
                      </Text>
                      <Text style={{
                        ...typography.body,
                        fontSize: 14,
                        fontWeight: '600',
                        color: themeColors.text.primary,
                      }}>
                        {completedSteps}/{steps.length} steps
                      </Text>
                    </View>
                  </View>

                  {/* Status */}
                  <View style={{
                    flex: 1,
                    minWidth: '48%',
                    backgroundColor: themeColors.background.secondary,
                    borderRadius: borderRadius.md,
                    padding: spacing.sm,
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}>
                    <Ionicons
                      name={adventure.is_completed ? "flag" : adventure.scheduled_for ? "calendar" : "time-outline"}
                      size={16}
                      color={adventure.is_completed ? themeColors.brand.gold : themeColors.brand.sage}
                      style={{ marginRight: spacing.xs }}
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={{
                        ...typography.caption,
                        fontSize: 10,
                        color: themeColors.text.tertiary,
                      }}>
                        Status
                      </Text>
                      <Text style={{
                        ...typography.body,
                        fontSize: 14,
                        fontWeight: '600',
                        color: themeColors.text.primary,
                      }}>
                        {adventure.is_completed ? 'Completed' : adventure.scheduled_for ? formatScheduledDate(adventure.scheduled_for).split(',')[0] : 'Unscheduled'}
                      </Text>
                    </View>
                  </View>

                  {/* Duration */}
                  <View style={{
                    flex: 1,
                    minWidth: '48%',
                    backgroundColor: themeColors.background.secondary,
                    borderRadius: borderRadius.md,
                    padding: spacing.sm,
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}>
                    <Ionicons
                      name="time-outline"
                      size={16}
                      color={themeColors.brand.sage}
                      style={{ marginRight: spacing.xs }}
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={{
                        ...typography.caption,
                        fontSize: 10,
                        color: themeColors.text.tertiary,
                      }}>
                        Duration
                      </Text>
                      <Text style={{
                        ...typography.body,
                        fontSize: 14,
                        fontWeight: '600',
                        color: themeColors.text.primary,
                      }}>
                        {formatDuration(adventure.duration_hours)}
                      </Text>
                    </View>
                  </View>

                  {/* Budget */}
                  <View style={{
                    flex: 1,
                    minWidth: '48%',
                    backgroundColor: themeColors.background.secondary,
                    borderRadius: borderRadius.md,
                    padding: spacing.sm,
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}>
                    <Ionicons
                      name="card-outline"
                      size={16}
                      color={themeColors.brand.sage}
                      style={{ marginRight: spacing.xs }}
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={{
                        ...typography.caption,
                        fontSize: 10,
                        color: themeColors.text.tertiary,
                      }}>
                        Budget
                      </Text>
                      <Text style={{
                        ...typography.body,
                        fontSize: 14,
                        fontWeight: '600',
                        color: themeColors.text.primary,
                      }}>
                        {formatCost(adventure.estimated_cost)}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Horizontal Progress Line */}
                <View style={{ marginTop: spacing.sm }}>
                  <Text style={{
                    ...typography.caption,
                    fontSize: 11,
                    color: themeColors.text.secondary,
                    fontWeight: '600',
                    marginBottom: spacing.sm,
                  }}>
                    STEPS ({currentStepIndex + 1}/{steps.length})
                  </Text>

                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{
                      paddingVertical: spacing.xs,
                    }}
                  >
                    <View style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      minWidth: '100%',
                      justifyContent: 'space-between',
                    }}>
                      {steps.map((step, index) => {
                        const isCompleted = step.completed;
                        const isCurrent = index === currentStepIndex;
                        const isLast = index === steps.length - 1;

                        return (
                          <View key={index} style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                            {/* Step Circle */}
                            <TouchableOpacity
                              onPress={() => setCurrentStepIndex(index)}
                              style={{
                                width: 32,
                                height: 32,
                                borderRadius: 16,
                                backgroundColor: isCompleted
                                  ? themeColors.brand.sage
                                  : isCurrent
                                    ? themeColors.brand.gold
                                    : 'transparent',
                                borderWidth: 2,
                                borderColor: isCompleted
                                  ? themeColors.brand.sage
                                  : isCurrent
                                    ? themeColors.brand.gold
                                    : themeColors.text.tertiary + '40',
                                alignItems: 'center',
                                justifyContent: 'center',
                                shadowColor: isCurrent ? themeColors.brand.gold : 'transparent',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.3,
                                shadowRadius: 4,
                                elevation: isCurrent ? 4 : 0,
                              }}
                            >
                              {isCompleted ? (
                                <Ionicons name="checkmark" size={18} color="white" />
                              ) : (
                                <Text style={{
                                  ...typography.small,
                                  fontSize: 12,
                                  fontWeight: '700',
                                  color: isCurrent ? 'white' : themeColors.text.tertiary,
                                }}>
                                  {index + 1}
                                </Text>
                              )}
                            </TouchableOpacity>

                            {/* Connecting Line */}
                            {!isLast && (
                              <View style={{
                                flex: 1,
                                height: 2,
                                backgroundColor: isCompleted && steps[index + 1]?.completed
                                  ? themeColors.brand.sage
                                  : themeColors.text.tertiary + '20',
                                marginHorizontal: spacing.xs,
                              }} />
                            )}
                          </View>
                        );
                      })}
                    </View>
                  </ScrollView>
                </View>
              </View>

              {/* Current Step Content - No Scrolling Needed */}
              <View style={{ flex: 1, paddingHorizontal: spacing.lg, paddingVertical: spacing.md }}>
                {isEditing ? (
                  <StepEditor
                    step={currentStep}
                    index={currentStepIndex}
                    themeColors={themeColors}
                    onUpdateStep={handleStepUpdate}
                    onTimeEdit={handleTimeEdit}
                  />
                ) : (
                  <View>
                    {/* Step Header */}
                    <View style={{ marginBottom: spacing.md }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xs }}>
                        <View style={{
                          backgroundColor: themeColors.brand.sage,
                          width: 28,
                          height: 28,
                          borderRadius: 14,
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginRight: spacing.sm,
                        }}>
                          <Text style={{
                            ...typography.small,
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: 14,
                          }}>
                            {currentStepIndex + 1}
                          </Text>
                        </View>
                        <Text style={{
                          ...typography.body,
                          fontSize: 16,
                          color: themeColors.brand.sage,
                          fontWeight: '600',
                        }}>
                          {currentStep.time}
                        </Text>
                      </View>

                      <Text style={{
                        ...typography.title,
                        fontSize: 22,
                        fontWeight: '700',
                        color: themeColors.text.primary,
                        marginBottom: spacing.xs,
                      }}>
                        {currentStep.title}
                      </Text>

                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicons
                          name="location"
                          size={18}
                          color={themeColors.text.secondary}
                          style={{ marginRight: spacing.xs }}
                        />
                        <Text style={{
                          ...typography.body,
                          fontSize: 15,
                          color: themeColors.text.secondary,
                        }}>
                          {currentStep.location}
                        </Text>
                      </View>
                    </View>

                    {/* Address */}
                    {currentStep.address && (
                      <View style={{
                        backgroundColor: themeColors.background.secondary,
                        borderRadius: borderRadius.md,
                        padding: spacing.md,
                        marginBottom: spacing.md,
                        flexDirection: 'row',
                        alignItems: 'flex-start',
                      }}>
                        <Ionicons
                          name="map-outline"
                          size={16}
                          color={themeColors.text.secondary}
                          style={{ marginRight: spacing.sm, marginTop: 2 }}
                        />
                        <Text style={{
                          ...typography.body,
                          fontSize: 14,
                          color: themeColors.text.secondary,
                          flex: 1,
                          lineHeight: 20,
                        }}>
                          {currentStep.address}
                        </Text>
                      </View>
                    )}

                    {/* Hours */}
                    {currentStep.hours && (
                      <View style={{
                        backgroundColor: themeColors.background.secondary,
                        borderRadius: borderRadius.md,
                        padding: spacing.md,
                        marginBottom: spacing.md,
                        flexDirection: 'row',
                        alignItems: 'center',
                      }}>
                        <Ionicons
                          name="time-outline"
                          size={16}
                          color={themeColors.text.secondary}
                          style={{ marginRight: spacing.sm }}
                        />
                        <Text style={{
                          ...typography.body,
                          fontSize: 14,
                          color: themeColors.text.secondary,
                        }}>
                          {currentStep.hours}
                        </Text>
                      </View>
                    )}

                    {/* Notes */}
                    {currentStep.notes && (
                      <View style={{
                        backgroundColor: themeColors.background.secondary,
                        borderRadius: borderRadius.md,
                        padding: spacing.md,
                        marginBottom: spacing.md,
                      }}>
                        <Text style={{
                          ...typography.body,
                          fontSize: 14,
                          color: themeColors.text.secondary,
                          lineHeight: 22,
                          fontStyle: 'italic',
                        }}>
                          {currentStep.notes}
                        </Text>
                      </View>
                    )}

                    {/* Booking Section */}
                    <BookingSection
                      step={currentStep}
                      themeColors={themeColors}
                    />
                  </View>
                )}

                {/* Editing Controls */}
                {isEditing && (
                  <View style={{ marginTop: spacing.md }}>
                    <EditingControls
                      themeColors={themeColors}
                      onSave={handleSaveChanges}
                      onCancel={handleDiscardChanges}
                    />
                  </View>
                )}
              </View>

              {/* Fixed Navigation Footer */}
              <View style={{
                paddingHorizontal: spacing.lg,
                paddingVertical: spacing.md,
                borderTopWidth: 1,
                borderTopColor: themeColors.text.tertiary + '10',
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                {/* Previous Button */}
                <TouchableOpacity
                  onPress={goToPreviousStep}
                  disabled={currentStepIndex === 0}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: currentStepIndex === 0
                      ? themeColors.background.secondary
                      : themeColors.brand.sage,
                    paddingHorizontal: spacing.md,
                    paddingVertical: spacing.sm,
                    borderRadius: borderRadius.lg,
                    opacity: currentStepIndex === 0 ? 0.5 : 1,
                  }}
                >
                  <Ionicons
                    name="chevron-back"
                    size={20}
                    color={currentStepIndex === 0 ? themeColors.text.tertiary : 'white'}
                  />
                  <Text style={{
                    ...typography.body,
                    fontSize: 14,
                    fontWeight: '600',
                    color: currentStepIndex === 0 ? themeColors.text.tertiary : 'white',
                    marginLeft: spacing.xs,
                  }}>
                    Previous
                  </Text>
                </TouchableOpacity>

                {/* Edit Button */}
                {!isEditing && onUpdateSteps && (
                  <TouchableOpacity
                    onPress={() => setIsEditing(true)}
                    style={{
                      backgroundColor: themeColors.background.secondary,
                      paddingHorizontal: spacing.md,
                      paddingVertical: spacing.sm,
                      borderRadius: borderRadius.lg,
                    }}
                  >
                    <Ionicons
                      name="pencil"
                      size={20}
                      color={themeColors.brand.sage}
                    />
                  </TouchableOpacity>
                )}

                {/* Next Button */}
                <TouchableOpacity
                  onPress={goToNextStep}
                  disabled={currentStepIndex === steps.length - 1}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: currentStepIndex === steps.length - 1
                      ? themeColors.background.secondary
                      : themeColors.brand.sage,
                    paddingHorizontal: spacing.md,
                    paddingVertical: spacing.sm,
                    borderRadius: borderRadius.lg,
                    opacity: currentStepIndex === steps.length - 1 ? 0.5 : 1,
                  }}
                >
                  <Text style={{
                    ...typography.body,
                    fontSize: 14,
                    fontWeight: '600',
                    color: currentStepIndex === steps.length - 1 ? themeColors.text.tertiary : 'white',
                    marginRight: spacing.xs,
                  }}>
                    Next
                  </Text>
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={currentStepIndex === steps.length - 1 ? themeColors.text.tertiary : 'white'}
                  />
                </TouchableOpacity>
              </View>
            </SafeAreaView>
          </View>
        </BlurView>
      </Animated.View>

      {/* Time Picker */}
      {showTimePicker && (
        <DateTimePicker
          value={tempTime}
          mode="time"
          is24Hour={false}
          onChange={handleTimeChange}
        />
      )}
    </Modal>
  );
};

export default StepsOverviewModal;
