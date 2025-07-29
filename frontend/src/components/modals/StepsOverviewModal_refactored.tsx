// src/components/modals/StepsOverviewModal.tsx - Refactored and split modal
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
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { typography, spacing, borderRadius, getCurrentTheme } from '../../constants/Theme';
import { useTheme } from '../../context/ThemeContext';
import { Adventure, AdventureStep } from './types';
import { BookingSection } from './StepBookingUtils';
import { StepEditor, EditingControls } from './StepEditor';

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
  
  // State for editing
  const [isEditing, setIsEditing] = useState(false);
  const [editingSteps, setEditingSteps] = useState<AdventureStep[]>([]);
  const [editingStepIndex, setEditingStepIndex] = useState<number | null>(null);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [tempTime, setTempTime] = useState(new Date());

  // Animation effects
  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      fadeAnim.setValue(0);
    }
  }, [visible]);

  // Initialize editing steps
  useEffect(() => {
    if (adventure) {
      setEditingSteps([...adventure.steps]);
    }
  }, [adventure]);

  // Handle time change
  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime && editingStepIndex !== null) {
      const timeString = selectedTime.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
      
      const updatedSteps = [...editingSteps];
      updatedSteps[editingStepIndex] = {
        ...updatedSteps[editingStepIndex],
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
  const handleTimeEdit = (index: number) => {
    setEditingStepIndex(index);
    // Parse current time or use default
    const currentTime = editingSteps[index].time;
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

  // Render individual step
  const renderStep = (step: AdventureStep, index: number) => {
    if (isEditing) {
      return (
        <StepEditor
          key={`edit-${index}`}
          step={step}
          index={index}
          themeColors={themeColors}
          onUpdateStep={handleStepUpdate}
          onTimeEdit={handleTimeEdit}
        />
      );
    }

    return (
      <View
        key={index}
        style={{
          backgroundColor: themeColors.background.card,
          borderRadius: borderRadius.md,
          padding: spacing.lg,
          marginBottom: spacing.md,
          borderWidth: 1,
          borderColor: themeColors.text.tertiary + '20',
        }}
      >
        {/* Step Header */}
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: spacing.md,
        }}>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xs }}>
              <View style={{
                backgroundColor: themeColors.brand.sage,
                width: 24,
                height: 24,
                borderRadius: 12,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: spacing.sm,
              }}>
                <Text style={{
                  ...typography.small,
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: 12,
                }}>
                  {index + 1}
                </Text>
              </View>
              <Text style={{
                ...typography.caption,
                color: themeColors.brand.sage,
                fontWeight: '600',
              }}>
                {step.time}
              </Text>
            </View>
            
            <Text style={{
              ...typography.subheading,
              color: themeColors.text.primary,
              marginBottom: spacing.xs,
            }}>
              {step.title}
            </Text>
            
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons 
                name="location-outline" 
                size={16} 
                color={themeColors.text.secondary} 
                style={{ marginRight: spacing.xs }}
              />
              <Text style={{
                ...typography.body,
                color: themeColors.text.secondary,
                flex: 1,
              }}>
                {step.location}
              </Text>
            </View>
          </View>
        </View>

        {/* Address */}
        {step.address && (
          <View style={{
            flexDirection: 'row',
            alignItems: 'flex-start',
            marginBottom: spacing.sm,
            paddingLeft: spacing.xl,
          }}>
            <Ionicons 
              name="map-outline" 
              size={14} 
              color={themeColors.text.tertiary} 
              style={{ marginRight: spacing.xs, marginTop: 2 }}
            />
            <Text style={{
              ...typography.caption,
              color: themeColors.text.tertiary,
              flex: 1,
              lineHeight: 18,
            }}>
              {step.address}
            </Text>
          </View>
        )}

        {/* Hours */}
        {step.hours && (
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: spacing.sm,
            paddingLeft: spacing.xl,
          }}>
            <Ionicons 
              name="time-outline" 
              size={14} 
              color={themeColors.text.tertiary} 
              style={{ marginRight: spacing.xs }}
            />
            <Text style={{
              ...typography.caption,
              color: themeColors.text.tertiary,
            }}>
              {step.hours}
            </Text>
          </View>
        )}

        {/* Notes */}
        {step.notes && (
          <View style={{
            marginTop: spacing.sm,
            paddingTop: spacing.sm,
            borderTopWidth: 1,
            borderTopColor: themeColors.text.tertiary + '20',
          }}>
            <Text style={{
              ...typography.body,
              color: themeColors.text.secondary,
              fontStyle: 'italic',
              lineHeight: 20,
            }}>
              {step.notes}
            </Text>
          </View>
        )}

        {/* Booking Section */}
        <BookingSection
          step={step}
          themeColors={themeColors}
        />
      </View>
    );
  };

  if (!adventure || !visible) return null;

  const steps = isEditing ? editingSteps : adventure.steps;

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
              {/* Header */}
              <View style={{
                paddingHorizontal: spacing.lg,
                paddingTop: spacing.lg,
                paddingBottom: spacing.md,
                borderBottomWidth: 1,
                borderBottomColor: themeColors.text.tertiary + '20',
              }}>
                <View style={{ 
                  flexDirection: 'row', 
                  justifyContent: 'space-between', 
                  alignItems: 'flex-start',
                  marginBottom: spacing.md,
                }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{
                      ...typography.title,
                      color: themeColors.text.primary,
                      marginBottom: spacing.xs,
                    }}>
                      {isEditing ? 'Edit Steps' : 'Adventure Steps'}
                    </Text>
                    <Text style={{
                      ...typography.body,
                      color: themeColors.text.secondary,
                    }}>
                      {adventure.title}
                    </Text>
                  </View>
                  
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {!isEditing && onUpdateSteps && (
                      <TouchableOpacity
                        onPress={() => setIsEditing(true)}
                        style={{
                          padding: spacing.sm,
                          marginRight: spacing.xs,
                        }}
                      >
                        <Ionicons 
                          name="pencil" 
                          size={20} 
                          color={themeColors.brand.sage} 
                        />
                      </TouchableOpacity>
                    )}
                    
                    <TouchableOpacity
                      onPress={onClose}
                      style={{
                        padding: spacing.sm,
                      }}
                    >
                      <Ionicons 
                        name="close" 
                        size={24} 
                        color={themeColors.text.secondary} 
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Adventure Info */}
                <View style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  paddingVertical: spacing.sm,
                  paddingHorizontal: spacing.md,
                  backgroundColor: themeColors.background.secondary,
                  borderRadius: borderRadius.sm,
                }}>
                  <View style={{ alignItems: 'center' }}>
                    <Text style={{
                      ...typography.caption,
                      color: themeColors.text.tertiary,
                      marginBottom: 2,
                    }}>
                      Duration
                    </Text>
                    <Text style={{
                      ...typography.body,
                      color: themeColors.text.primary,
                      fontWeight: '600',
                    }}>
                      {formatDuration(adventure.duration_hours)}
                    </Text>
                  </View>
                  
                  <View style={{ alignItems: 'center' }}>
                    <Text style={{
                      ...typography.caption,
                      color: themeColors.text.tertiary,
                      marginBottom: 2,
                    }}>
                      Budget
                    </Text>
                    <Text style={{
                      ...typography.body,
                      color: themeColors.text.primary,
                      fontWeight: '600',
                    }}>
                      {formatCost(adventure.estimated_cost)}
                    </Text>
                  </View>
                  
                  <View style={{ alignItems: 'center' }}>
                    <Text style={{
                      ...typography.caption,
                      color: themeColors.text.tertiary,
                      marginBottom: 2,
                    }}>
                      Steps
                    </Text>
                    <Text style={{
                      ...typography.body,
                      color: themeColors.text.primary,
                      fontWeight: '600',
                    }}>
                      {steps.length}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Steps Content */}
              <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{
                  padding: spacing.lg,
                }}
                showsVerticalScrollIndicator={false}
              >
                {steps.map((step, index) => renderStep(step, index))}

                {/* Editing Controls */}
                {isEditing && (
                  <EditingControls
                    themeColors={themeColors}
                    onSave={handleSaveChanges}
                    onCancel={handleDiscardChanges}
                  />
                )}
              </ScrollView>
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
