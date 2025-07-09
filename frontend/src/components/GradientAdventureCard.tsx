// src/components/GradientAdventureCard.tsx - FIXED TYPES
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import {
  PanGestureHandler,
  State,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

// Type definitions - UNIFIED WITH PLANSSCREEN
interface AdventureStep {
  time: string;
  title: string;
  location?: string;
  booking?: any;
  notes?: string;
}

// Updated to match SavedAdventure from PlansScreen EXACTLY
interface Adventure {
  id: string;
  title: string;
  description: string;
  duration_hours: number;
  estimated_cost: number;
  steps: any[]; // Changed to any[] to match PlansScreen SavedAdventure
  is_completed: boolean;
  is_favorite: boolean;
  created_at: string;
  filters_used?: any;
  step_completions?: { [stepIndex: number]: boolean };
}

interface GradientAdventureCardProps {
  adventure: Adventure;
  onPress: (adventure: Adventure) => void;
  onDelete: (adventureId: string) => void;
  onEdit: (adventure: Adventure) => void;
  formatDuration: (hours: number) => string;
  formatCost: (cost: number) => string;
  formatDate: (dateString: string) => string;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = 100;
const ANIMATION_DURATION = 6000; // 6 seconds for gradient cycle

export const GradientAdventureCard: React.FC<GradientAdventureCardProps> = ({
  adventure,
  onPress,
  onDelete,
  onEdit,
  formatDuration,
  formatCost,
  formatDate,
}) => {
  // Animation values
  const translateX = useRef(new Animated.Value(0)).current;
  const gradientAnimation = useRef(new Animated.Value(0)).current;
  const actionOpacity = useRef(new Animated.Value(0)).current;

  // Gradient animation loop
  useEffect(() => {
    const animateGradient = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(gradientAnimation, {
            toValue: 1,
            duration: ANIMATION_DURATION / 3,
            useNativeDriver: false,
          }),
          Animated.timing(gradientAnimation, {
            toValue: 2,
            duration: ANIMATION_DURATION / 3,
            useNativeDriver: false,
          }),
          Animated.timing(gradientAnimation, {
            toValue: 0,
            duration: ANIMATION_DURATION / 3,
            useNativeDriver: false,
          }),
        ])
      ).start();
    };

    animateGradient();
  }, [gradientAnimation]);

  // Interpolate gradient colors
  const gradientColors = gradientAnimation.interpolate({
    inputRange: [0, 1, 2],
    outputRange: ['#f2cc6c', '#f6dc9b', '#4d987b'], // gold → light gold → teal
  });

  // Handle pan gesture
  const handleGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX } }],
    { useNativeDriver: true }
  );

  const handleGestureStateChange = (event: any) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      const { translationX } = event.nativeEvent;

      if (translationX > SWIPE_THRESHOLD) {
        // Swipe right - Delete
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        Animated.spring(translateX, {
          toValue: SCREEN_WIDTH,
          useNativeDriver: true,
          speed: 20,
        }).start(() => {
          onDelete(adventure.id);
          translateX.setValue(0);
        });
      } else if (translationX < -SWIPE_THRESHOLD) {
        // Swipe left - Edit
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        Animated.spring(translateX, {
          toValue: -SCREEN_WIDTH,
          useNativeDriver: true,
          speed: 20,
        }).start(() => {
          onEdit(adventure);
          translateX.setValue(0);
        });
      } else {
        // Spring back to center
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
          friction: 5,
        }).start();
      }
    }
  };

  // Update opacity for swipe actions
  useEffect(() => {
    const listener = translateX.addListener(({ value }) => {
      const opacity = Math.min(Math.abs(value) / SWIPE_THRESHOLD, 1);
      actionOpacity.setValue(opacity);
    });

    return () => translateX.removeListener(listener);
  }, [translateX, actionOpacity]);

  // Render swipe actions
  const renderActions = () => (
    <>
      {/* Delete Action (Right Swipe) */}
      <Animated.View
        style={{
          position: 'absolute',
          left: 8,
          top: 0,
          bottom: 0,
          width: SCREEN_WIDTH * 0.75,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#ef4444',
          borderRadius: 16,
          opacity: actionOpacity.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1],
            extrapolate: 'clamp',
          }),
          transform: [
            {
              translateX: translateX.interpolate({
                inputRange: [0, SCREEN_WIDTH],
                outputRange: [-SCREEN_WIDTH * 0.75, 0],
                extrapolate: 'clamp',
              }),
            },
          ],
        }}
      >
        <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>
          Delete
        </Text>
      </Animated.View>

      {/* Edit Action (Left Swipe) */}
      <Animated.View
        style={{
          position: 'absolute',
          right: 8,
          top: 0,
          bottom: 0,
          width: SCREEN_WIDTH * 0.75,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#3b82f6',
          borderRadius: 16,
          opacity: actionOpacity.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1],
            extrapolate: 'clamp',
          }),
          transform: [
            {
              translateX: translateX.interpolate({
                inputRange: [-SCREEN_WIDTH, 0],
                outputRange: [0, SCREEN_WIDTH * 0.75],
                extrapolate: 'clamp',
              }),
            },
          ],
        }}
      >
        <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>
          Edit
        </Text>
      </Animated.View>
    </>
  );

  return (
    <View style={{ marginBottom: 16, overflow: 'hidden' }}>
      {renderActions()}
      
      <PanGestureHandler
        onGestureEvent={handleGestureEvent}
        onHandlerStateChange={handleGestureStateChange}
        activeOffsetX={[-10, 10]}
        failOffsetY={[-30, 30]}
      >
        <Animated.View
          style={{
            transform: [{ translateX }],
          }}
        >
          <TouchableOpacity
            activeOpacity={0.95}
            onPress={() => onPress(adventure)}
          >
            {/* Gradient Border Container */}
            <Animated.View
              style={{
                padding: 2,
                borderRadius: 18,
                backgroundColor: gradientColors,
              }}
            >
              {/* Inner Content Container */}
              <View
                style={{
                  backgroundColor: '#f8f8f8',
                  borderRadius: 16,
                  padding: 16,
                }}
              >
                {/* Status Badge */}
                <View
                  style={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    paddingHorizontal: 12,
                    paddingVertical: 4,
                    borderRadius: 12,
                    backgroundColor: adventure.is_completed ? '#10b981' : '#f2cc6c',
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: '600',
                      color: adventure.is_completed ? 'white' : '#3c7660',
                    }}
                  >
                    {adventure.is_completed ? 'Completed' : 'Upcoming'}
                  </Text>
                </View>

                {/* Favorite Icon */}
                {adventure.is_favorite && (
                  <View
                    style={{
                      position: 'absolute',
                      top: 48,
                      right: 12,
                    }}
                  >
                    <Text style={{ fontSize: 16 }}>⭐</Text>
                  </View>
                )}

                {/* Title */}
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: 'bold',
                    color: '#3c7660',
                    marginBottom: 8,
                    paddingRight: 80, // Make room for badges
                    lineHeight: 24,
                  }}
                  numberOfLines={2}
                >
                  {adventure.title}
                </Text>

                {/* Description */}
                <Text
                  style={{
                    fontSize: 14,
                    color: '#666666',
                    marginBottom: 16,
                    lineHeight: 20,
                  }}
                  numberOfLines={2}
                >
                  {adventure.description}
                </Text>

                {/* Adventure Details */}
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    marginBottom: 16,
                  }}
                >
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginRight: 16,
                      marginBottom: 4,
                    }}
                  >
                    <Text style={{ fontSize: 16, marginRight: 4 }}>⏱️</Text>
                    <Text style={{ fontSize: 13, color: '#666666' }}>
                      {formatDuration(adventure.duration_hours)}
                    </Text>
                  </View>

                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginRight: 16,
                      marginBottom: 4,
                    }}
                  >
                    <Text style={{ fontSize: 16, marginRight: 4 }}>💰</Text>
                    <Text style={{ fontSize: 13, color: '#666666' }}>
                      {formatCost(adventure.estimated_cost)}
                    </Text>
                  </View>

                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginBottom: 4,
                    }}
                  >
                    <Text style={{ fontSize: 16, marginRight: 4 }}>📍</Text>
                    <Text style={{ fontSize: 13, color: '#666666' }}>
                      {adventure.steps.length} stops
                    </Text>
                  </View>
                </View>

                {/* Footer */}
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderTopWidth: 1,
                    borderTopColor: '#e5e5e5',
                    paddingTop: 12,
                  }}
                >
                  <Text style={{ fontSize: 12, color: '#999999' }}>
                    Created {formatDate(adventure.created_at)}
                  </Text>

                  <TouchableOpacity
                    onPress={() => onPress(adventure)}
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                      borderRadius: 20,
                      borderWidth: 1.5,
                      borderColor: '#3c7660',
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: '600',
                        color: '#3c7660',
                      }}
                    >
                      View Details
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Animated.View>
          </TouchableOpacity>
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
};