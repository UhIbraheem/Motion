// src/components/GradientAdventureCard.tsx - Netflix-style Vertical Cards
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
  ImageBackground,
} from 'react-native';
import {
  PanGestureHandler,
  State,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
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
  cardWidth?: number; // New prop for horizontal scrolling
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Card dimensions for vertical layout
const CARD_WIDTH = 280;
const CARD_HEIGHT = 380;
const IMAGE_HEIGHT = CARD_HEIGHT * 0.4; // 40% for image
const CONTENT_HEIGHT = CARD_HEIGHT * 0.6; // 60% for content

const SWIPE_THRESHOLD = 100;

// Experience type to image mapping
const getExperienceImage = (adventure: Adventure): string => {
  const experienceTypes = adventure.filters_used?.experienceTypes || [];
  
  // High-quality Unsplash images for different experience types
  const imageMap: { [key: string]: string } = {
    'hidden-gem': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=300&fit=crop&q=80',
    'explorer': 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=500&h=300&fit=crop&q=80',
    'nature': 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=500&h=300&fit=crop&q=80',
    'partier': 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&h=300&fit=crop&q=80',
    'solo-freestyle': 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=500&h=300&fit=crop&q=80',
    'academic-weapon': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=300&fit=crop&q=80',
    'special-occasion': 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=500&h=300&fit=crop&q=80',
    'artsy': 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=500&h=300&fit=crop&q=80',
    'foodie-adventure': 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500&h=300&fit=crop&q=80',
    'culture-dive': 'https://images.unsplash.com/photo-1533929736458-ca588d08c8be?w=500&h=300&fit=crop&q=80',
    'sweet-treat': 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=500&h=300&fit=crop&q=80',
    'puzzle-solver': 'https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=500&h=300&fit=crop&q=80',
    'wellness': 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500&h=300&fit=crop&q=80',
  };

  // Find the first matching experience type
  for (const type of experienceTypes) {
    if (imageMap[type]) {
      return imageMap[type];
    }
  }

  // Default fallback image
  return 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=500&h=300&fit=crop&q=80';
};

const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

export const GradientAdventureCard: React.FC<GradientAdventureCardProps> = ({
  adventure,
  onPress,
  onDelete,
  onEdit,
  formatDuration,
  formatCost,
  formatDate,
  cardWidth = CARD_WIDTH,
}) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Handle pan gesture for swipe actions
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
        Animated.timing(translateX, {
          toValue: cardWidth,
          duration: 200,
          useNativeDriver: true,
        }).start(() => {
          onDelete(adventure.id);
          translateX.setValue(0);
        });
      } else if (translationX < -SWIPE_THRESHOLD) {
        // Swipe left - Edit
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        Animated.timing(translateX, {
          toValue: -cardWidth,
          duration: 200,
          useNativeDriver: true,
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

  // Press animation
  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <View style={{ width: cardWidth, marginRight: 16 }}>
      <PanGestureHandler
        onGestureEvent={handleGestureEvent}
        onHandlerStateChange={handleGestureStateChange}
        activeOffsetX={[-10, 10]}
        failOffsetY={[-30, 30]}
      >
        <Animated.View
          style={{
            transform: [
              { translateX },
              { scale: scaleAnim }
            ],
          }}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => onPress(adventure)}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
          >
            {/* Glass Card Container */}
            <View
              style={{
                width: cardWidth,
                height: CARD_HEIGHT,
                borderRadius: 20,
                overflow: 'hidden',
                shadowColor: '#000',
                shadowOffset: {
                  width: 0,
                  height: 8,
                },
                shadowOpacity: 0.2,
                shadowRadius: 16,
                elevation: 12,
              }}
            >
              {/* Image Section (40%) */}
              <View style={{ height: IMAGE_HEIGHT }}>
                <ImageBackground
                  source={{ uri: getExperienceImage(adventure) }}
                  style={{
                    width: '100%',
                    height: '100%',
                    justifyContent: 'flex-end',
                  }}
                  resizeMode="cover"
                >
                  {/* Gradient overlay on image */}
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.7)']}
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: 80,
                    }}
                  />
                  
                  {/* Status Badge */}
                  <View
                    style={{
                      position: 'absolute',
                      top: 12,
                      right: 12,
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 16,
                      overflow: 'hidden',
                    }}
                  >
                    <BlurView
                      intensity={20}
                      tint="dark"
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                      }}
                    />
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: '600',
                        color: adventure.is_completed ? '#10b981' : '#f2cc6c',
                      }}
                    >
                      {adventure.is_completed ? '✓ Completed' : '⏳ Upcoming'}
                    </Text>
                  </View>

                  {/* Favorite Icon */}
                  {adventure.is_favorite && (
                    <View
                      style={{
                        position: 'absolute',
                        top: 12,
                        left: 12,
                        width: 32,
                        height: 32,
                        borderRadius: 16,
                        overflow: 'hidden',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <BlurView
                        intensity={20}
                        tint="dark"
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                        }}
                      />
                      <Text style={{ fontSize: 16 }}>⭐</Text>
                    </View>
                  )}
                </ImageBackground>
              </View>

              {/* Content Section (60%) with Glass Effect */}
              <View style={{ height: CONTENT_HEIGHT, overflow: 'hidden' }}>
                <BlurView
                  intensity={15}
                  tint="light"
                  style={{
                    flex: 1,
                    padding: 16,
                  }}
                >
                  {/* Light overlay for better readability */}
                  <View
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    }}
                  />
                  
                  {/* Content */}
                  <View style={{ flex: 1, zIndex: 1 }}>
                    {/* Title */}
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: 'bold',
                        color: '#3c7660',
                        marginBottom: 8,
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
                        flex: 1,
                      }}
                      numberOfLines={3}
                    >
                      {truncateText(adventure.description, 120)}
                    </Text>

                    {/* Adventure Details */}
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        marginBottom: 12,
                      }}
                    >
                      <View style={{ alignItems: 'center' }}>
                        <Text style={{ fontSize: 12, color: '#999', marginBottom: 2 }}>
                          Duration
                        </Text>
                        <Text style={{ fontSize: 13, fontWeight: '600', color: '#3c7660' }}>
                          {formatDuration(adventure.duration_hours)}
                        </Text>
                      </View>

                      <View style={{ alignItems: 'center' }}>
                        <Text style={{ fontSize: 12, color: '#999', marginBottom: 2 }}>
                          Budget
                        </Text>
                        <Text style={{ fontSize: 13, fontWeight: '600', color: '#3c7660' }}>
                          {formatCost(adventure.estimated_cost)}
                        </Text>
                      </View>

                      <View style={{ alignItems: 'center' }}>
                        <Text style={{ fontSize: 12, color: '#999', marginBottom: 2 }}>
                          Steps
                        </Text>
                        <Text style={{ fontSize: 13, fontWeight: '600', color: '#3c7660' }}>
                          {adventure.steps.length}
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
                        borderTopColor: 'rgba(229, 229, 229, 0.6)',
                        paddingTop: 12,
                      }}
                    >
                      <Text style={{ fontSize: 11, color: '#999999' }}>
                        {formatDate(adventure.created_at)}
                      </Text>

                      <View
                        style={{
                          paddingHorizontal: 12,
                          paddingVertical: 6,
                          borderRadius: 16,
                          backgroundColor: 'rgba(60, 118, 96, 0.1)',
                          borderWidth: 1,
                          borderColor: 'rgba(60, 118, 96, 0.3)',
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 12,
                            fontWeight: '600',
                            color: '#3c7660',
                          }}
                        >
                          View Details
                        </Text>
                      </View>
                    </View>
                  </View>
                </BlurView>
              </View>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
};