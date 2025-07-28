// src/components/modals/StepsOverviewModal.tsx - Clean Steps Modal with New Standards
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

  // Fade in/out animation
  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, fadeAnim]);

  // Initialize editing steps when adventure changes
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

  // Helper function for reservation info display
  const shouldShowBookingInfo = (booking: any) => {
    if (!booking) return false;
    
    const bookingText = booking.method?.toLowerCase() || '';
    const fallbackText = booking.fallback?.toLowerCase() || '';
    
    // Check if it requires reservation/booking
    const requiresReservation = bookingText.includes('reservation') || 
                              bookingText.includes('book') || 
                              bookingText.includes('ticket') ||
                              fallbackText.includes('reservation') ||
                              fallbackText.includes('book') ||
                              fallbackText.includes('ticket') ||
                              fallbackText.includes('advance') ||
                              fallbackText.includes('must');
    
    // Check if it has online reservation systems
    const hasOnlineReservation = bookingText.includes('opentable') || 
                               bookingText.includes('google') ||
                               bookingText.includes('resy') ||
                               bookingText.includes('yelp');
    
    // Don't show booking section if it accepts walk-ins
    if (!requiresReservation && (fallbackText.includes('walk') || fallbackText.includes('no reservation'))) {
      return false;
    }
    
    const phoneMatch = booking?.fallback?.match(/(\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/);
    
    return requiresReservation || hasOnlineReservation || phoneMatch;
  };

  // Check if this step is food/dining related
  const isFoodRelated = (step: AdventureStep): boolean => {
    const title = step.title?.toLowerCase() || '';
    const location = step.location?.toLowerCase() || '';
    const address = step.address?.toLowerCase() || '';
    
    const foodKeywords = [
      'restaurant', 'cafe', 'coffee', 'lunch', 'dinner', 'brunch', 
      'food', 'drink', 'bar', 'bistro', 'eatery', 'diner', 'grill',
      'kitchen', 'tavern', 'pub', 'brewery', 'winery', 'bakery',
      'pizzeria', 'taco', 'burger', 'sandwich', 'sushi', 'thai',
      'italian', 'mexican', 'chinese', 'indian', 'japanese'
    ];
    
    return foodKeywords.some(keyword => 
      title.includes(keyword) || location.includes(keyword) || address.includes(keyword)
    );
  };

  // Render reservation section with gold styling - Only for food/dining steps
  const renderBookingSection = (step: AdventureStep) => {
    if (!step.booking || !shouldShowBookingInfo(step.booking) || !isFoodRelated(step)) {
      return null;
    }

    const bookingText = step.booking.method?.toLowerCase() || '';
    const fallbackText = step.booking.fallback?.toLowerCase() || '';
    
    const requiresReservation = bookingText.includes('reservation') || 
                              bookingText.includes('book') || 
                              bookingText.includes('ticket') ||
                              fallbackText.includes('reservation') ||
                              fallbackText.includes('book') ||
                              fallbackText.includes('ticket');
    
    const hasOnlineReservation = bookingText.includes('opentable') || 
                               bookingText.includes('google') ||
                               bookingText.includes('resy');
    
    const phoneMatch = step.booking?.fallback?.match(/(\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/);
    
    return (
      <View style={{
        backgroundColor: themeColors.brand.gold + '08', // Softer gold background as requested
        borderWidth: 1,
        borderColor: themeColors.brand.gold + '40', // Gold border as requested
        padding: spacing.md,
        borderRadius: borderRadius.md,
        marginTop: spacing.sm,
      }}>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: spacing.sm,
        }}>
          <Text style={{ fontSize: 16, marginRight: spacing.sm }}>📅</Text>
          <Text style={{
            ...typography.small,
            color: themeColors.brand.gold,
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: 0.5,
          }}>
            {requiresReservation ? 'Reservation Required' : 'Booking Info'}
          </Text>
        </View>
        
        <Text style={{
          ...typography.body,
          color: themeColors.text.primary,
          fontWeight: '600',
          marginBottom: spacing.xs,
        }}>
          {step.booking.method}
        </Text>
        
        {step.booking.fallback && (
          <Text style={{
            ...typography.small,
            color: themeColors.text.secondary,
            lineHeight: 20,
            marginBottom: spacing.sm,
            fontStyle: 'italic',
          }}>
            {step.booking.fallback}
          </Text>
        )}
        
        {/* Action Buttons */}
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          {/* Reserve Button - Only show for food/dining steps */}
          {hasOnlineReservation && isFoodRelated(step) && (
            <TouchableOpacity
              onPress={() => {
                if (step.booking?.method.toLowerCase().includes('opentable')) {
                  Alert.alert('OpenTable', 'OpenTable integration coming soon!');
                } else if (step.booking?.method.toLowerCase().includes('google')) {
                  Alert.alert('Google', 'Google reservation integration coming soon!');
                } else {
                  Alert.alert('Reservation', 'Online reservation coming soon!');
                }
              }}
              style={{
                flex: 1,
                backgroundColor: themeColors.brand.gold,
                paddingVertical: spacing.sm,
                borderRadius: borderRadius.md,
                alignItems: 'center',
              }}
            >
              <Text style={{
                ...typography.small,
                fontWeight: '600',
                color: themeColors.text.inverse,
              }}>
                Reserve Online
              </Text>
            </TouchableOpacity>
          )}
          
          {/* Call Button */}
          {phoneMatch && (
            <TouchableOpacity
              onPress={() => {
                Alert.alert(
                  'Call Restaurant',
                  `Would you like to call ${phoneMatch[0]}?`,
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Call', onPress: () => Alert.alert('Calling...', 'Phone integration coming soon!') }
                  ]
                );
              }}
              style={{
                flex: 1,
                backgroundColor: 'transparent',
                borderWidth: 1,
                borderColor: themeColors.brand.gold,
                paddingVertical: spacing.sm,
                borderRadius: borderRadius.md,
                alignItems: 'center',
              }}
            >
              <Text style={{
                ...typography.small,
                fontWeight: '600',
                color: themeColors.brand.gold,
              }}>
                Call
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  if (!adventure || !visible) return null;

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
        {/* Blurred background - fixed, no dragging */}
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
          
          {/* Modal content - fixed in center, no movement */}
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
                    {isEditing ? (
                      <>
                        <TouchableOpacity
                          onPress={handleDiscardChanges}
                          style={{
                            paddingHorizontal: spacing.md,
                            paddingVertical: spacing.sm,
                            backgroundColor: themeColors.background.card,
                            borderRadius: borderRadius.md,
                            marginRight: spacing.sm,
                          }}
                        >
                          <Text style={{
                            ...typography.caption,
                            color: themeColors.text.secondary,
                            fontWeight: '600',
                          }}>
                            Cancel
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={handleSaveChanges}
                          style={{
                            paddingHorizontal: spacing.md,
                            paddingVertical: spacing.sm,
                            backgroundColor: themeColors.brand.sage,
                            borderRadius: borderRadius.md,
                            marginRight: spacing.sm,
                          }}
                        >
                          <Text style={{
                            ...typography.caption,
                            color: 'white',
                            fontWeight: '600',
                          }}>
                            Save
                          </Text>
                        </TouchableOpacity>
                      </>
                    ) : (
                      onUpdateSteps && (
                        <TouchableOpacity
                          onPress={() => setIsEditing(true)}
                          style={{
                            paddingHorizontal: spacing.md,
                            paddingVertical: spacing.sm,
                            backgroundColor: themeColors.brand.sage + '20',
                            borderRadius: borderRadius.md,
                            marginRight: spacing.sm,
                          }}
                        >
                          <Text style={{
                            ...typography.caption,
                            color: themeColors.brand.sage,
                            fontWeight: '600',
                          }}>
                            Edit
                          </Text>
                        </TouchableOpacity>
                      )
                    )}
                    
                    <TouchableOpacity
                      onPress={isEditing ? handleDiscardChanges : onClose}
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 16,
                        backgroundColor: themeColors.background.card,
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <Text style={{ 
                        fontSize: 18, 
                        color: themeColors.text.secondary,
                        fontWeight: '500',
                      }}>
                        ✕
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
                
                {/* Adventure info */}
                <View style={{
                  flexDirection: 'row',
                  justifyContent: 'space-around',
                  paddingHorizontal: spacing.sm,
                }}>
                  <View style={{
                    alignItems: 'center',
                    backgroundColor: themeColors.brand.sage + '15',
                    paddingVertical: spacing.sm,
                    paddingHorizontal: spacing.md,
                    borderRadius: borderRadius.md,
                    minWidth: 80,
                  }}>
                    <Text style={{
                      ...typography.small,
                      color: themeColors.text.tertiary,
                      marginBottom: 2,
                    }}>
                      Duration
                    </Text>
                    <Text style={{
                      ...typography.body,
                      fontWeight: '600',
                      color: themeColors.brand.sage,
                    }}>
                      {formatDuration(adventure.duration_hours)}
                    </Text>
                  </View>
                  
                  <View style={{
                    alignItems: 'center',
                    backgroundColor: themeColors.brand.gold + '15',
                    paddingVertical: spacing.sm,
                    paddingHorizontal: spacing.md,
                    borderRadius: borderRadius.md,
                    minWidth: 80,
                  }}>
                    <Text style={{
                      ...typography.small,
                      color: themeColors.text.tertiary,
                      marginBottom: 2,
                    }}>
                      Budget
                    </Text>
                    <Text style={{
                      ...typography.body,
                      fontWeight: '600',
                      color: themeColors.brand.gold,
                    }}>
                      {formatCost(adventure.estimated_cost)}
                    </Text>
                  </View>
                  
                  <View style={{
                    alignItems: 'center',
                    backgroundColor: themeColors.text.tertiary + '15',
                    paddingVertical: spacing.sm,
                    paddingHorizontal: spacing.md,
                    borderRadius: borderRadius.md,
                    minWidth: 80,
                  }}>
                    <Text style={{
                      ...typography.small,
                      color: themeColors.text.tertiary,
                      marginBottom: 2,
                    }}>
                      Steps
                    </Text>
                    <Text style={{
                      ...typography.body,
                      fontWeight: '600',
                      color: themeColors.text.primary,
                    }}>
                      {adventure.steps.length}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Scrollable Steps List - Only this scrolls, not the whole modal */}
              <ScrollView 
                style={{ flex: 1 }}
                contentContainerStyle={{ 
                  paddingHorizontal: spacing.lg,
                  paddingVertical: spacing.md,
                }}
                showsVerticalScrollIndicator={false}
              >
                {(isEditing ? editingSteps : adventure.steps).map((step, index) => (
                  <View
                    key={index}
                    style={{
                      backgroundColor: themeColors.background.card,
                      borderRadius: borderRadius.lg,
                      marginBottom: spacing.lg,
                      overflow: 'hidden',
                      borderWidth: 1,
                      borderColor: themeColors.text.tertiary + '20',
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.1,
                      shadowRadius: 4,
                      elevation: 2,
                    }}
                  >
                    <View style={{ padding: spacing.lg }}>
                      {/* Step header */}
                      <View style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: spacing.md,
                      }}>
                        <View style={{
                          backgroundColor: themeColors.brand.sage + '20',
                          paddingVertical: spacing.xs,
                          paddingHorizontal: spacing.sm,
                          borderRadius: borderRadius.sm,
                          borderWidth: 1,
                          borderColor: themeColors.brand.sage + '40',
                        }}>
                          {isEditing ? (
                            <TouchableOpacity
                              onPress={() => {
                                setEditingStepIndex(index);
                                const timeDate = new Date();
                                // Parse the time string and set to date
                                const timeParts = step.time.match(/(\d+):(\d+)\s*(AM|PM)?/);
                                if (timeParts) {
                                  let hours = parseInt(timeParts[1]);
                                  const minutes = parseInt(timeParts[2]);
                                  const ampm = timeParts[3];
                                  
                                  if (ampm === 'PM' && hours !== 12) hours += 12;
                                  if (ampm === 'AM' && hours === 12) hours = 0;
                                  
                                  timeDate.setHours(hours, minutes);
                                }
                                setTempTime(timeDate);
                                setShowTimePicker(true);
                              }}
                            >
                              <Text style={{
                                ...typography.caption,
                                fontWeight: '700',
                                color: themeColors.brand.sage,
                              }}>
                                {step.time}
                              </Text>
                            </TouchableOpacity>
                          ) : (
                            <Text style={{
                              ...typography.caption,
                              fontWeight: '700',
                              color: themeColors.brand.sage,
                            }}>
                              {step.time}
                            </Text>
                          )}
                        </View>
                        
                        <Text style={{
                          ...typography.small,
                          color: themeColors.text.tertiary,
                        }}>
                          Step {index + 1} of {adventure.steps.length}
                        </Text>
                      </View>

                      {/* Step title */}
                      {isEditing ? (
                        <TextInput
                          value={step.title}
                          onChangeText={(text) => handleStepUpdate(index, 'title', text)}
                          style={{
                            ...typography.heading,
                            color: themeColors.text.primary,
                            marginBottom: spacing.sm,
                            lineHeight: 28,
                            backgroundColor: themeColors.background.primary,
                            borderWidth: 1,
                            borderColor: themeColors.text.tertiary + '30',
                            borderRadius: borderRadius.sm,
                            padding: spacing.sm,
                          }}
                          placeholder="Step title"
                          multiline
                        />
                      ) : (
                        <Text style={{
                          ...typography.heading,
                          color: themeColors.text.primary,
                          marginBottom: spacing.sm,
                          lineHeight: 28,
                        }}>
                          {step.title}
                        </Text>
                      )}

                      {/* Step location */}
                      <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginBottom: spacing.sm,
                      }}>
                        <Ionicons name="location" size={16} color="#6B7280" style={{ marginRight: 8 }} />
                        {isEditing ? (
                          <TextInput
                            value={step.location || ''}
                            onChangeText={(text) => handleStepUpdate(index, 'location', text)}
                            style={{
                              ...typography.body,
                              color: themeColors.text.secondary,
                              flex: 1,
                              backgroundColor: themeColors.background.primary,
                              borderWidth: 1,
                              borderColor: themeColors.text.tertiary + '30',
                              borderRadius: borderRadius.sm,
                              padding: spacing.sm,
                            }}
                            placeholder="Location"
                          />
                        ) : (
                          <Text style={{
                            ...typography.body,
                            color: themeColors.text.secondary,
                            flex: 1,
                          }}>
                            {step.location}
                          </Text>
                        )}
                      </View>

                      {/* Step notes */}
                      {step.notes && (
                        <View style={{
                          backgroundColor: themeColors.brand.sage + '10',
                          padding: spacing.md,
                          borderRadius: borderRadius.md,
                          marginBottom: spacing.sm,
                          borderLeftWidth: 4,
                          borderLeftColor: themeColors.brand.sage,
                        }}>
                          <View style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            marginBottom: spacing.xs,
                          }}>
                            <Text style={{ fontSize: 16, marginRight: spacing.sm }}>💡</Text>
                            <Text style={{
                              ...typography.small,
                              color: themeColors.text.secondary,
                              fontWeight: '600',
                              textTransform: 'uppercase',
                            }}>
                              Notes
                            </Text>
                          </View>
                          {isEditing ? (
                            <TextInput
                              value={step.notes || ''}
                              onChangeText={(text) => handleStepUpdate(index, 'notes', text)}
                              style={{
                                ...typography.body,
                                color: themeColors.text.primary,
                                lineHeight: 22,
                                backgroundColor: themeColors.background.primary,
                                borderWidth: 1,
                                borderColor: themeColors.text.tertiary + '30',
                                borderRadius: borderRadius.sm,
                                padding: spacing.sm,
                                minHeight: 60,
                              }}
                              placeholder="Additional notes (optional)"
                              multiline
                              numberOfLines={3}
                            />
                          ) : (
                            <Text style={{
                              ...typography.body,
                              color: themeColors.text.primary,
                              lineHeight: 22,
                              fontStyle: 'italic',
                            }}>
                              {step.notes}
                            </Text>
                          )}
                        </View>
                      )}

                      {/* Booking information with gold styling as requested */}
                      {renderBookingSection(step)}
                    </View>
                  </View>
                ))}
              </ScrollView>

              {/* Fixed footer */}
              <View style={{ 
                paddingHorizontal: spacing.lg, 
                paddingVertical: spacing.md,
                borderTopWidth: 1,
                borderTopColor: themeColors.text.tertiary + '20',
              }}>
                <TouchableOpacity
                  onPress={onClose}
                  style={{
                    backgroundColor: themeColors.brand.sage,
                    paddingVertical: spacing.md,
                    borderRadius: borderRadius.lg,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{
                    ...typography.body,
                    fontWeight: '600',
                    color: themeColors.text.inverse,
                  }}>
                    Close
                  </Text>
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
          display="default"
          onChange={handleTimeChange}
        />
      )}
    </Modal>
  );
};

export default StepsOverviewModal;
