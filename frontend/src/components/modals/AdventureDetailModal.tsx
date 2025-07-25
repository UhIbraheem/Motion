// src/components/modals/AdventureDetailModal.tsx - Redesigned with Horizontal Step Cards
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
import { BlurView } from 'expo-blur';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { typography, spacing, borderRadius, getCurrentTheme } from '../../constants/Theme';
import { useTheme } from '../../context/ThemeContext';
import { Adventure } from './types';
import SchedulePickerModal from './SchedulePickerModal';
import { AdventureInfoSection } from './AdventureInfoSection';
import { HorizontalStepsSection } from './HorizontalStepsSection';
import StepsOverviewModal from './StepsOverviewModal';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface AdventureDetailModalProps {
  visible: boolean;
  adventure: Adventure | null;
  onClose: () => void;
  onMarkComplete: (adventureId: string) => void;
  onUpdateStepCompletion: (adventureId: string, stepIndex: number, completed: boolean) => void;
  onUpdateScheduledDate: (adventureId: string, scheduledDate: string) => void;
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
  formatDate,
  formatDuration,
  formatCost,
}) => {
  const { isDark } = useTheme();
  const themeColors = getCurrentTheme(isDark);
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  
  // Modal states
  const [isSchedulePickerVisible, setIsSchedulePickerVisible] = useState(false);
  const [showAllStepsModal, setShowAllStepsModal] = useState(false);

  // Animation for slide up
  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, slideAnim]);

  // Handle close with animation
  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: SCREEN_HEIGHT,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      onClose();
    });
  };

  // Handle schedule button press
  const handleSchedulePress = () => {
    setIsSchedulePickerVisible(true);
  };

  // Handle view all steps button press
  const handleViewAllStepsPress = () => {
    setShowAllStepsModal(true);
  };

  // Check if adventure is completed
  const isCompleted = adventure?.is_completed || false;
  const allStepsCompleted = adventure?.steps.every((_, index) => 
    adventure.step_completions?.[index] === true
  ) || false;

  if (!adventure) return null;

  return (
    <>
      <Modal
        visible={visible}
        animationType="none"
        transparent
        statusBarTranslucent
      >
        {/* Blurred Background - Fixed position, no dragging */}
        <BlurView
          intensity={20}
          tint="dark"
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
          }}
        >
          {/* Background Touchable to Close */}
          <TouchableOpacity
            style={{ flex: 1 }}
            activeOpacity={1}
            onPress={handleClose}
          />

          {/* Modal Content - Slides up from bottom, locks in place */}
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
              transform: [{ translateY: slideAnim }],
              shadowColor: '#000',
              shadowOffset: { width: 0, height: -4 },
              shadowOpacity: 0.25,
              shadowRadius: 12,
              elevation: 12,
            }}
          >
            <SafeAreaView style={{ flex: 1 }}>
              {/* Handle Bar */}
              <View style={{
                alignItems: 'center',
                paddingTop: spacing.sm,
                paddingBottom: spacing.md,
              }}>
                <View style={{
                  width: 40,
                  height: 4,
                  backgroundColor: themeColors.text.tertiary,
                  borderRadius: 2,
                }} />
              </View>

              {/* Scrollable Content - Only this section scrolls, not the whole modal */}
              <ScrollView 
                style={{ flex: 1 }}
                showsVerticalScrollIndicator={false}
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
                <View style={{ marginVertical: spacing.lg }}>
                  <HorizontalStepsSection
                    steps={adventure.steps}
                    themeColors={themeColors}
                    title="Adventure Steps"
                  />
                </View>

                {/* View All Steps Button */}
                <View style={{ paddingHorizontal: spacing.lg, marginBottom: spacing.lg }}>
                  <TouchableOpacity
                    onPress={handleViewAllStepsPress}
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.15)',
                      borderWidth: 1.5,
                      borderColor: 'rgba(60, 118, 96, 0.5)',
                      paddingVertical: spacing.md,
                      borderRadius: borderRadius.lg,
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{
                      ...typography.body,
                      fontWeight: '600',
                      color: themeColors.text?.primary || '#3c7660',
                    }}>
                      View All Steps Overview
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>

              {/* Fixed Footer */}
              <View style={{
                paddingHorizontal: spacing.lg,
                paddingVertical: spacing.md,
                borderTopWidth: 1,
                borderTopColor: themeColors.text.tertiary + '20',
              }}>
                {/* Action Button - Changes based on completion status */}
                <TouchableOpacity
                  onPress={() => onMarkComplete(adventure.id)}
                  style={{
                    backgroundColor: isCompleted ? themeColors.brand.sage : themeColors.brand.gold,
                    paddingVertical: spacing.md,
                    borderRadius: borderRadius.lg,
                    alignItems: 'center',
                    marginBottom: spacing.sm,
                  }}
                >
                  <Text style={{
                    ...typography.body,
                    fontWeight: '600',
                    color: themeColors.text.inverse,
                  }}>
                    {isCompleted ? 'Do Again?' : allStepsCompleted ? 'Mark as Complete' : 'Mark as Complete'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleClose}
                  style={{
                    paddingVertical: spacing.sm,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{
                    ...typography.body,
                    color: themeColors.text.secondary,
                  }}>
                    Close
                  </Text>
                </TouchableOpacity>
              </View>
            </SafeAreaView>
          </Animated.View>
        </BlurView>
      </Modal>

      {/* Schedule Picker Modal */}
      <SchedulePickerModal
        visible={isSchedulePickerVisible}
        adventure={adventure}
        onClose={() => setIsSchedulePickerVisible(false)}
        onUpdateScheduledDate={(dateString: string) => {
          onUpdateScheduledDate(adventure.id, dateString);
          setIsSchedulePickerVisible(false);
        }}
        getScheduleOptions={() => [
          { 
            label: 'Today', 
            date: new Date().toISOString(),
            fullDate: new Date().toLocaleDateString()
          },
          { 
            label: 'Tomorrow', 
            date: new Date(Date.now() + 86400000).toISOString(),
            fullDate: new Date(Date.now() + 86400000).toLocaleDateString()
          },
          { 
            label: 'This Weekend', 
            date: new Date(Date.now() + 86400000 * 2).toISOString(),
            fullDate: new Date(Date.now() + 86400000 * 2).toLocaleDateString()
          },
        ]}
      />

      {/* Steps Overview Modal */}
      <StepsOverviewModal
        visible={showAllStepsModal}
        adventure={adventure}
        onClose={() => setShowAllStepsModal(false)}
        formatDuration={formatDuration}
        formatCost={formatCost}
      />
    </>
  );
};

export default AdventureDetailModal;