// src/components/modals/SchedulePickerModal.tsx - Clean Schedule Modal with New Standards
import React, { useRef, useEffect } from 'react';
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
import { typography, spacing, borderRadius, getCurrentTheme } from '../../constants/Theme';
import { useTheme } from '../../context/ThemeContext';
import { Adventure, ScheduleOption } from './types';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface SchedulePickerModalProps {
  visible: boolean;
  adventure: Adventure | null;
  onClose: () => void;
  onUpdateScheduledDate: (date: string) => void;
  getScheduleOptions: () => ScheduleOption[];
}

const SchedulePickerModal: React.FC<SchedulePickerModalProps> = ({
  visible,
  adventure,
  onClose,
  onUpdateScheduledDate,
  getScheduleOptions,
}) => {
  const { isDark } = useTheme();
  const themeColors = getCurrentTheme(isDark);
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  // Slide up animation - no bounce, smooth slide
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

  const handleUpdateScheduledDate = (date: string) => {
    onUpdateScheduledDate(date);
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent
      statusBarTranslucent
    >
      {/* Blurred background - fixed position, no dragging */}
      <BlurView
        intensity={20}
        tint="dark"
        style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
        }}
      >
        {/* Background touchable to close */}
        <TouchableOpacity
          style={{ flex: 1 }}
          activeOpacity={1}
          onPress={onClose}
        />

        {/* Modal content - slides up from bottom, locks in place */}
        <Animated.View style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          maxHeight: SCREEN_HEIGHT * 0.6,
          backgroundColor: themeColors.background.primary,
          borderTopLeftRadius: borderRadius.xl,
          borderTopRightRadius: borderRadius.xl,
          transform: [{ translateY: slideAnim }],
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.25,
          shadowRadius: 12,
          elevation: 12,
        }}>
          <SafeAreaView style={{ flex: 1 }}>
            {/* Handle bar */}
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

            {/* Header */}
            <View style={{ 
              paddingHorizontal: spacing.lg,
              paddingBottom: spacing.md,
              borderBottomWidth: 1,
              borderBottomColor: themeColors.text.tertiary + '20',
            }}>
              <Text style={{
                ...typography.title,
                color: themeColors.text.primary,
                marginBottom: spacing.xs,
                textAlign: 'center',
              }}>
                Schedule Adventure
              </Text>
              <Text style={{
                ...typography.body,
                color: themeColors.text.secondary,
                textAlign: 'center',
              }}>
                Choose when you'd like to experience this adventure
              </Text>
            </View>

            {/* Scrollable date options - Only this section scrolls */}
            <ScrollView 
              style={{ flex: 1 }}
              contentContainerStyle={{ 
                paddingHorizontal: spacing.lg,
                paddingVertical: spacing.md,
              }}
              showsVerticalScrollIndicator={false}
            >
              {getScheduleOptions().map((option, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleUpdateScheduledDate(option.date)}
                  style={{
                    backgroundColor: themeColors.background.card,
                    marginBottom: spacing.md,
                    padding: spacing.lg,
                    borderRadius: borderRadius.lg,
                    borderWidth: 2,
                    borderColor: adventure?.scheduled_date === option.date 
                      ? themeColors.brand.sage
                      : themeColors.text.tertiary + '20',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 2,
                  }}
                  activeOpacity={0.7}
                >
                  <View style={{ 
                    flexDirection: 'row', 
                    alignItems: 'center', 
                    justifyContent: 'space-between' 
                  }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{
                        ...typography.heading,
                        fontWeight: '600',
                        color: adventure?.scheduled_date === option.date 
                          ? themeColors.brand.sage 
                          : themeColors.text.primary,
                        marginBottom: spacing.xs,
                      }}>
                        {option.label}
                      </Text>
                      <Text style={{
                        ...typography.body,
                        color: themeColors.text.secondary,
                      }}>
                        {option.fullDate}
                      </Text>
                    </View>
                    
                    {/* Selection indicator */}
                    {adventure?.scheduled_date === option.date && (
                      <View style={{
                        width: 24,
                        height: 24,
                        borderRadius: 12,
                        backgroundColor: themeColors.brand.sage,
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginLeft: spacing.md,
                      }}>
                        <Text style={{ 
                          color: themeColors.text.inverse, 
                          fontSize: 14, 
                          fontWeight: 'bold' 
                        }}>
                          ✓
                        </Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
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
                  backgroundColor: themeColors.text.tertiary + '20',
                  paddingVertical: spacing.md,
                  borderRadius: borderRadius.lg,
                  alignItems: 'center',
                }}
              >
                <Text style={{
                  ...typography.body,
                  color: themeColors.text.primary,
                  fontWeight: '600',
                }}>
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </Animated.View>
      </BlurView>
    </Modal>
  );
};

export default SchedulePickerModal;
