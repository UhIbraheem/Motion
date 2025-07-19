// src/components/modals/StepDetailModal.tsx - Detailed view for individual steps
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
  ImageBackground,
  Linking,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { typography, spacing, borderRadius, getCurrentTheme } from '../../constants/Theme';
import { useTheme } from '../../context/ThemeContext';
import { AdventureStep } from './types';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface StepDetailModalProps {
  visible: boolean;
  step: AdventureStep | null;
  stepIndex: number;
  onClose: () => void;
}

// Same image function as StepCard
const getStepImage = (stepTitle: string): string => {
  const title = stepTitle.toLowerCase();
  
  if (title.includes('restaurant') || title.includes('food') || title.includes('eat') || title.includes('dine')) {
    return 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=400&fit=crop&q=80';
  } else if (title.includes('museum') || title.includes('gallery') || title.includes('art')) {
    return 'https://images.unsplash.com/photo-1533929736458-ca588d08c8be?w=600&h=400&fit=crop&q=80';
  } else if (title.includes('park') || title.includes('garden') || title.includes('outdoor')) {
    return 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&h=400&fit=crop&q=80';
  } else if (title.includes('shop') || title.includes('store') || title.includes('market')) {
    return 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=400&fit=crop&q=80';
  } else if (title.includes('coffee') || title.includes('cafe')) {
    return 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&h=400&fit=crop&q=80';
  } else if (title.includes('concert') || title.includes('music') || title.includes('event')) {
    return 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=600&h=400&fit=crop&q=80';
  } else if (title.includes('bar') || title.includes('drink') || title.includes('cocktail')) {
    return 'https://images.unsplash.com/photo-1544785349-c4a5301826fd?w=600&h=400&fit=crop&q=80';
  }
  
  return 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600&h=400&fit=crop&q=80';
};

export const StepDetailModal: React.FC<StepDetailModalProps> = ({
  visible,
  step,
  stepIndex,
  onClose,
}) => {
  const { isDark } = useTheme();
  const themeColors = getCurrentTheme(isDark);
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

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

  const openGoogleMaps = () => {
    if (!step) return;
    const address = step.address || step.location || step.title;
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    Linking.openURL(url);
  };

  const openReservation = () => {
    if (!step) return;
    if (step.booking?.link) {
      Linking.openURL(step.booking.link);
    } else {
      const query = encodeURIComponent(step.title);
      Linking.openURL(`https://www.opentable.com/s?query=${query}`);
    }
  };

  if (!step) return null;

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent
      statusBarTranslucent
    >
      <BlurView
        intensity={20}
        tint="dark"
        style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
        }}
      >
        <TouchableOpacity
          style={{ flex: 1 }}
          activeOpacity={1}
          onPress={onClose}
        />

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

            {/* Header Image */}
            <ImageBackground
              source={{ uri: getStepImage(step.title) }}
              style={{ height: 200 }}
              resizeMode="cover"
            >
              <BlurView
                style={{
                  position: 'absolute',
                  top: 16,
                  left: 16,
                  borderRadius: 20,
                  borderWidth: 1.5,
                  borderColor: 'rgba(255, 215, 0, 0.7)',
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  overflow: 'hidden',
                }}
                intensity={40}
                experimentalBlurMethod="dimezisBlurView"
              >
                <Text style={{ 
                  fontWeight: 'bold', 
                  color: '#FFD700', 
                  fontSize: 16,
                  textShadowColor: 'rgba(0, 0, 0, 0.5)',
                  textShadowOffset: { width: 0, height: 1 },
                  textShadowRadius: 2,
                }}>
                  Step {stepIndex + 1}
                </Text>
              </BlurView>
            </ImageBackground>

            {/* Content */}
            <ScrollView 
              style={{ flex: 1 }}
              contentContainerStyle={{ 
                paddingHorizontal: spacing.lg,
                paddingVertical: spacing.lg,
              }}
              showsVerticalScrollIndicator={false}
            >
              {/* Step Title */}
              <Text style={{
                ...typography.title,
                color: themeColors.text.primary,
                marginBottom: spacing.sm,
              }}>
                {step.title}
              </Text>

              {/* Time */}
              <View style={{
                backgroundColor: themeColors.brand.sage + '15',
                padding: spacing.md,
                borderRadius: borderRadius.md,
                marginBottom: spacing.md,
              }}>
                <Text style={{
                  ...typography.body,
                  fontWeight: '600',
                  color: themeColors.brand.sage,
                  textAlign: 'center',
                }}>
                  🕐 {step.time}
                </Text>
              </View>

              {/* Location */}
              <View style={{ marginBottom: spacing.lg }}>
                <Text style={{
                  ...typography.heading,
                  color: themeColors.text.primary,
                  marginBottom: spacing.sm,
                }}>
                  📍 Location
                </Text>
                <Text style={{
                  ...typography.body,
                  color: themeColors.text.secondary,
                  lineHeight: 22,
                }}>
                  {step.location}
                </Text>
                {step.address && step.address !== step.location && (
                  <Text style={{
                    ...typography.small,
                    color: themeColors.text.tertiary,
                    marginTop: spacing.xs,
                    fontStyle: 'italic',
                  }}>
                    {step.address}
                  </Text>
                )}
              </View>

              {/* Hours */}
              {step.hours && (
                <View style={{ marginBottom: spacing.lg }}>
                  <Text style={{
                    ...typography.heading,
                    color: themeColors.text.primary,
                    marginBottom: spacing.sm,
                  }}>
                    ⏰ Hours
                  </Text>
                  <Text style={{
                    ...typography.body,
                    color: themeColors.text.secondary,
                  }}>
                    {step.hours}
                  </Text>
                </View>
              )}

              {/* Reservation Info */}
              {step.booking && (
                <View style={{
                  backgroundColor: themeColors.brand.gold + '08',
                  borderWidth: 1,
                  borderColor: themeColors.brand.gold + '40',
                  padding: spacing.md,
                  borderRadius: borderRadius.md,
                  marginBottom: spacing.lg,
                }}>
                  <Text style={{
                    ...typography.heading,
                    color: themeColors.brand.gold,
                    marginBottom: spacing.sm,
                  }}>
                    📅 Reservation Information
                  </Text>
                  <Text style={{
                    ...typography.body,
                    color: themeColors.text.primary,
                    lineHeight: 22,
                  }}>
                    {step.booking.method}
                  </Text>
                  {step.booking.fallback && (
                    <Text style={{
                      ...typography.small,
                      color: themeColors.text.secondary,
                      marginTop: spacing.sm,
                      fontStyle: 'italic',
                    }}>
                      {step.booking.fallback}
                    </Text>
                  )}
                </View>
              )}

              {/* Notes */}
              {step.notes && (
                <View style={{ marginBottom: spacing.lg }}>
                  <Text style={{
                    ...typography.heading,
                    color: themeColors.text.primary,
                    marginBottom: spacing.sm,
                  }}>
                    📝 Notes
                  </Text>
                  <Text style={{
                    ...typography.body,
                    color: themeColors.text.secondary,
                    lineHeight: 22,
                  }}>
                    {step.notes}
                  </Text>
                </View>
              )}

              {/* Action Buttons */}
              <View style={{ gap: spacing.md }}>
                {step.booking && (
                  <TouchableOpacity
                    onPress={openReservation}
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
                      textAlign: 'center',
                    }}>
                      Reserve Table
                    </Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  onPress={openGoogleMaps}
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
                    textAlign: 'center',
                  }}>
                    📍 Open in Google Maps
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={onClose}
                  style={{
                    backgroundColor: 'transparent',
                    borderWidth: 1.5,
                    borderColor: 'rgba(60, 118, 96, 0.3)',
                    paddingVertical: spacing.md,
                    borderRadius: borderRadius.lg,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{
                    ...typography.body,
                    fontWeight: '600',
                    color: themeColors.text.secondary,
                  }}>
                    Close
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </SafeAreaView>
        </Animated.View>
      </BlurView>
    </Modal>
  );
};

export default StepDetailModal;
