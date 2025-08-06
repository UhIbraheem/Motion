// src/components/modals/AdventureDetailModal.tsx - Streamlined Adventure Detail Modal
import React, { useState, useRef, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
  SafeAreaView,
} from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { BlurView } from 'expo-blur';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { typography, spacing, borderRadius, getCurrentTheme } from '../../constants/Theme';
import { useTheme } from '../../context/ThemeContext';
import { Adventure, AdventureStep } from './types';
import StreamlinedCalendar from './StreamlinedCalendar';
import { AdventureInfoSection, HorizontalStepsSection } from './AdventureDetailSections';
import StepsOverviewModal from './StepsOverviewModal';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface AdventureDetailModalProps {
  visible: boolean;
  adventure: Adventure | null;
  onClose: () => void;
  onMarkComplete: (adventureId: string) => void;
  onUpdateStepCompletion: (adventureId: string, stepIndex: number, completed: boolean) => void;
  onUpdateScheduledDate: (adventureId: string, scheduledDate: string) => void;
  onUpdateSteps?: (adventureId: string, steps: AdventureStep[]) => void;
  formatDate: (dateString: string) => string;
  formatDuration: (hours: number) => string;
  formatCost: (cost: number) => string;
}

export const AdventureDetailModal: React.FC<AdventureDetailModalProps> = ({
  visible,
  adventure,
  onClose,
  onMarkComplete,
  onUpdateStepCompletion,
  onUpdateScheduledDate,
  onUpdateSteps,
  formatDate,
  formatDuration,
  formatCost,
}) => {
  const { isDark } = useTheme();
  const themeColors = getCurrentTheme(isDark);
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const panY = useRef(new Animated.Value(0)).current;
  const backgroundOpacity = useRef(new Animated.Value(0)).current;
  
  // Modal states
  const [showAllStepsModal, setShowAllStepsModal] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);

  // Gesture handler for swipe to dismiss
  const onPanGestureEvent = Animated.event(
    [{ nativeEvent: { translationY: panY } }],
    { useNativeDriver: false } // Keep consistent - all false
  );

  const onPanHandlerStateChange = (event: any) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      const { translationY, velocityY } = event.nativeEvent;
      
      // If swiped down enough (threshold) or fast enough velocity
      if (translationY > 150 || velocityY > 1000) {
        // Dismiss modal with smooth background fade
        Animated.parallel([
          Animated.timing(slideAnim, {
            toValue: SCREEN_HEIGHT,
            duration: 250,
            useNativeDriver: false, // Changed to false to fix mixed animation error
          }),
          Animated.timing(backgroundOpacity, {
            toValue: 0,
            duration: 250,
            useNativeDriver: false, // Changed to false
          }),
          Animated.timing(panY, {
            toValue: 0,
            duration: 250,
            useNativeDriver: false,
          })
        ]).start(() => {
          onClose();
        });
      } else {
        // Snap back to original position
        Animated.spring(panY, {
          toValue: 0,
          useNativeDriver: false, // Changed to false
          tension: 100,
          friction: 8,
        }).start();
      }
    }
  };

  // Animation for slide up
  useEffect(() => {
    if (visible) {
      // Reset pan position and animate in
      panY.setValue(0);
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false, // Changed to false
        }),
        Animated.timing(backgroundOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false, // Changed to false
        })
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: SCREEN_HEIGHT,
          duration: 250,
          useNativeDriver: false, // Changed to false
        }),
        Animated.timing(backgroundOpacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: false, // Changed to false
        })
      ]).start();
    }
  }, [visible, slideAnim, panY, backgroundOpacity]);

  // Handle close with animation
  const handleClose = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 250,
        useNativeDriver: false, // Changed to false
      }),
      Animated.timing(backgroundOpacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: false, // Changed to false
      })
    ]).start(() => {
      onClose();
    });
  };

  // Handle schedule button press
  const handleSchedulePress = () => {
    console.log('🗓️ Schedule button pressed for adventure:', adventure?.id);
    setShowCalendar(true);
  };

  // Handle calendar date selection
  const handleCalendarDateSelect = (dateString: string) => {
    console.log('📅 Calendar date selected:', dateString);
    if (adventure) {
      onUpdateScheduledDate(adventure.id, dateString);
      // Also update local adventure state for immediate UI update
      const updatedAdventure = { ...adventure, scheduled_for: dateString };
      // We need to trigger a re-render, this should be handled by the parent
    }
    setShowCalendar(false);
  };

  // Check if adventure can be completed (must be scheduled and past scheduled time)
  const canCompleteAdventure = () => {
    if (!adventure || !adventure.scheduled_for) return false; // Cannot complete if not scheduled
    
    const scheduledDate = new Date(adventure.scheduled_for);
    const now = new Date();
    
    // Allow completion if scheduled time has passed
    return now >= scheduledDate;
  };

  // Handle view all steps button press
  const handleViewAllStepsPress = () => {
    setShowAllStepsModal(true);
  };

  // Check if adventure is completed
  const isCompleted = adventure?.is_completed || false;

  // Calculate completion status
  const allStepsCompleted = adventure?.steps?.every(step => step.completed) || false;

  if (!adventure) return null;

  return (
    <>
      {/* Streamlined Calendar Modal - Render first for higher priority */}
      <StreamlinedCalendar
        visible={showCalendar}
        onClose={() => setShowCalendar(false)}
        onDateSelect={handleCalendarDateSelect}
        currentDate={adventure.scheduled_for}
        adventure={adventure}
      />

      <Modal
        visible={visible && !showCalendar}
        animationType="none"
        transparent
        statusBarTranslucent
      >
        {/* Blurred Background - Fixed position, no dragging */}
        <Animated.View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            opacity: backgroundOpacity,
          }}
        >
          <BlurView
            intensity={20}
            tint="dark"
            style={{ flex: 1 }}
          >
            {/* Background Touchable to Close */}
            <TouchableOpacity
              style={{ flex: 1 }}
              activeOpacity={1}
              onPress={handleClose}
            />

          {/* Modal Content - Slides up from bottom, locks in place */}
          <PanGestureHandler
            onGestureEvent={onPanGestureEvent}
            onHandlerStateChange={onPanHandlerStateChange}
          >
            <Animated.View
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: SCREEN_HEIGHT * 0.85,
                backgroundColor: themeColors.background.primary,
                borderTopLeftRadius: borderRadius.xl,
                borderTopRightRadius: borderRadius.xl,
                transform: [
                  { translateY: slideAnim },
                  { translateY: panY }
                ],
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -4 },
                shadowOpacity: 0.25,
                shadowRadius: 12,
                elevation: 12,
              }}
            >
            <SafeAreaView style={{ flex: 1 }}>
              {/* Handle Bar - Enhanced for swipe indication */}
              <View style={{
                alignItems: 'center',
                paddingTop: spacing.sm,
                paddingBottom: spacing.md,
              }}>
                <View style={{
                  width: 50,
                  height: 5,
                  backgroundColor: themeColors.text.tertiary + '60',
                  borderRadius: 3,
                }} />
              </View>

              {/* Header with Title and Close Button */}
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                paddingHorizontal: spacing.lg,
                paddingBottom: spacing.lg,
              }}>
                <View style={{ flex: 1, paddingRight: spacing.md }}>
                  <Text style={{
                    ...typography.title,
                    fontSize: 24,
                    fontWeight: '700',
                    color: themeColors.text.primary,
                    lineHeight: 28,
                    letterSpacing: -0.5,
                  }}>
                    {adventure.title}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={handleClose}
                  style={{
                    padding: spacing.sm,
                    backgroundColor: themeColors.background.secondary,
                    borderRadius: borderRadius.round,
                    marginTop: -2,
                  }}
                >
                  <Ionicons 
                    name="close" 
                    size={20} 
                    color={themeColors.text.primary} 
                  />
                </TouchableOpacity>
              </View>

              {/* Scrollable Content */}
              <ScrollView 
                style={{ flex: 1 }}
                showsVerticalScrollIndicator={false}
                bounces={false}
              >
                {/* Adventure Info Section */}
                <AdventureInfoSection
                  adventure={adventure}
                  themeColors={themeColors}
                  formatDate={formatDate}
                  formatDuration={formatDuration}
                  formatCost={formatCost}
                  onSchedulePress={handleSchedulePress}
                />

                {/* Horizontal Steps Section */}
                <HorizontalStepsSection 
                  steps={adventure.steps || []}
                  onStepToggle={(stepIndex: number, completed: boolean) => {
                    onUpdateStepCompletion(adventure.id, stepIndex, completed);
                  }}
                  onViewAllPress={handleViewAllStepsPress}
                  themeColors={themeColors}
                />
              </ScrollView>

              {/* Fixed Footer */}
              <View style={{
                paddingHorizontal: spacing.lg,
                paddingVertical: spacing.md,
                borderTopWidth: 1,
                borderTopColor: themeColors.text.tertiary + '20',
              }}>
                {/* Action Button - Changes based on completion status and schedule */}
                <TouchableOpacity
                  onPress={() => {
                    if (isCompleted || canCompleteAdventure()) {
                      onMarkComplete(adventure.id);
                    }
                  }}
                  disabled={!isCompleted && !canCompleteAdventure()}
                  style={{
                    backgroundColor: (!isCompleted && !canCompleteAdventure()) 
                      ? 'rgba(128, 128, 128, 0.5)' 
                      : isCompleted 
                        ? themeColors.brand.sage 
                        : themeColors.brand.gold,
                    paddingVertical: spacing.md,
                    borderRadius: borderRadius.lg,
                    alignItems: 'center',
                    marginBottom: spacing.sm,
                    opacity: (!isCompleted && !canCompleteAdventure()) ? 0.6 : 1,
                  }}
                >
                  <Text style={{
                    ...typography.body,
                    fontWeight: '600',
                    fontSize: 16,
                    color: (!isCompleted && !canCompleteAdventure()) 
                      ? 'rgba(255, 255, 255, 0.7)' 
                      : themeColors.text.inverse,
                  }}>
                    {isCompleted 
                      ? 'Do Again?' 
                      : 'Mark as Complete'}
                  </Text>
                </TouchableOpacity>

                {/* Show completion requirement message */}
                {!isCompleted && (
                  <View style={{
                    alignItems: 'center',
                    paddingVertical: spacing.xs,
                  }}>
                    <Text style={{
                      fontSize: 13,
                      color: themeColors.text.secondary,
                      textAlign: 'center',
                      fontStyle: 'italic',
                    }}>
                      {!adventure.scheduled_for 
                        ? 'Schedule your adventure first to mark it complete'
                        : !canCompleteAdventure()
                        ? 'Complete after your scheduled adventure time'
                        : ''
                      }
                    </Text>
                  </View>
                )}
              </View>
            </SafeAreaView>
          </Animated.View>
          </PanGestureHandler>
          </BlurView>
        </Animated.View>
      </Modal>

      {/* Steps Overview Modal */}
      <StepsOverviewModal
        visible={showAllStepsModal}
        adventure={adventure}
        onClose={() => setShowAllStepsModal(false)}
        onUpdateSteps={onUpdateSteps}
        formatDuration={formatDuration}
        formatCost={formatCost}
      />
    </>
  );
};

export default AdventureDetailModal;
