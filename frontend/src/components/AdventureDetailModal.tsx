// src/components/AdventureDetailModal.tsx - MINIMAL FIX - Back to Original with Small Fixes
import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
  SafeAreaView,
  StatusBar,
  PanResponder,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

interface AdventureStep {
  time: string;
  title: string;
  location: string;
  booking?: {
    method: string;
    link?: string;
    fallback?: string;
  };
  notes?: string;
  completed?: boolean;
}

interface Adventure {
  id: string;
  title: string;
  description: string;
  duration_hours: number;
  estimated_cost: number;
  steps: AdventureStep[];
  is_completed: boolean;
  is_favorite?: boolean;
  created_at: string;
  step_completions?: { [stepIndex: number]: boolean };
}

interface AdventureDetailModalProps {
  visible: boolean;
  adventure: Adventure | null;
  onClose: () => void;
  onMarkComplete: (adventureId: string) => void;
  onUpdateStepCompletion: (adventureId: string, stepIndex: number, completed: boolean) => void;
  formatDate: (dateString: string) => string;
  formatDuration: (hours: number) => string;
  formatCost: (cost: number) => string;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export const AdventureDetailModal: React.FC<AdventureDetailModalProps> = ({
  visible,
  adventure,
  onClose,
  onMarkComplete,
  onUpdateStepCompletion,
  formatDate,
  formatDuration,
  formatCost,
}) => {
  const [stepCompletions, setStepCompletions] = useState<{ [stepIndex: number]: boolean }>({});
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const closingRef = useRef(false);

  // PanResponder for swipe down
  const pan = useRef(new Animated.Value(0)).current;
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only respond to vertical swipes, and only if swiping down
        return Math.abs(gestureState.dy) > 10 && gestureState.dy > 0;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          pan.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 80) {
          // If swiped down enough, close
          animateOutAndClose();
        } else {
          // Otherwise, snap back
          Animated.spring(pan, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const modalTranslateY = Animated.add(slideAnim, pan);

  // Interpolate overlay opacity based on modal position
  const overlayOpacity = modalTranslateY.interpolate({
    inputRange: [0, SCREEN_HEIGHT * 0.7, SCREEN_HEIGHT],
    outputRange: [1, 0.3, 0],
    extrapolate: 'clamp',
  });

  // Animate in/out
  useEffect(() => {
    if (visible) {
      closingRef.current = false;
      pan.setValue(0);
      // Initialize step completions from adventure data
      if (adventure?.step_completions) {
        setStepCompletions(adventure.step_completions);
      } else {
        // If no step completions data, initialize all as false
        const initialCompletions: { [stepIndex: number]: boolean } = {};
        adventure?.steps.forEach((_, index) => {
          initialCompletions[index] = false;
        });
        setStepCompletions(initialCompletions);
      }

      // Animate modal in
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
      ]).start();
    } else {
      // Animate modal out
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: SCREEN_HEIGHT,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, adventure]);

  // Animate out and close
  const animateOutAndClose = () => {
    if (closingRef.current) return;
    closingRef.current = true;
    Animated.timing(slideAnim, {
      toValue: SCREEN_HEIGHT,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      pan.setValue(0);
      onClose();
      closingRef.current = false;
    });
  };

  // When clicking X or background
  const handleClose = () => {
    animateOutAndClose();
  };

  const toggleStepCompletion = (stepIndex: number) => {
    if (!adventure) return;

    const newCompleted = !stepCompletions[stepIndex];
    const newCompletions = { ...stepCompletions, [stepIndex]: newCompleted };
    
    setStepCompletions(newCompletions);
    onUpdateStepCompletion(adventure.id, stepIndex, newCompleted);
    
    // Haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const getProgressPercentage = () => {
    if (!adventure?.steps.length) return 0;
    const completedSteps = Object.values(stepCompletions).filter(Boolean).length;
    return (completedSteps / adventure.steps.length) * 100;
  };

  const handleMarkAdventureComplete = () => {
    if (!adventure) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onMarkComplete(adventure.id);
    onClose();
  };

  if (!adventure) return null;

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent
      statusBarTranslucent
    >
      <StatusBar backgroundColor="rgba(0,0,0,0.5)" barStyle="light-content" />
      {/* Animated Overlay */}
      <Animated.View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          opacity: overlayOpacity,
          justifyContent: 'flex-end',
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
        }}
        pointerEvents={visible ? 'auto' : 'none'}
      >
        <TouchableOpacity
          style={{ flex: 1 }}
          activeOpacity={1}
          onPress={handleClose}
        />
      </Animated.View>
      {/* Modal Content */}
      <Animated.View
        style={{
          transform: [
            { translateY: Animated.add(slideAnim, pan) }
          ],
          backgroundColor: 'white',
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          maxHeight: SCREEN_HEIGHT * 0.9,
          minHeight: SCREEN_HEIGHT * 0.6,
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
        }}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity activeOpacity={1} onPress={() => {}}>
          <SafeAreaView>
            {/* Handle */}
            <View
              style={{ alignItems: 'center', paddingTop: 12, paddingBottom: 8 }}
            >
              <View
                style={{
                  width: 40,
                  height: 4,
                  backgroundColor: '#E5E5E5',
                  borderRadius: 2,
                }}
              />
            </View>


            {/* Header */}
            <View style={{ paddingHorizontal: 24, paddingBottom: 8 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                <View style={{ flex: 1, marginRight: 12 }}>
                  <Text
                    style={{
                      fontSize: 20, // smaller
                      fontWeight: 'bold',
                      color: '#3c7660',
                      lineHeight: 26,
                    }}
                    numberOfLines={2}
                  >
                    {adventure.title}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={handleClose}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    backgroundColor: '#F5F5F5',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ fontSize: 16, color: '#666' }}>✕</Text>
                </TouchableOpacity>
              </View>

              <Text style={{ fontSize: 14, color: '#666', marginBottom: 8, lineHeight: 18 }}>
                {adventure.description}
              </Text>

              {/* Adventure Stats */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontSize: 11, color: '#999', marginBottom: 2 }}>Duration</Text>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: '#3c7660' }}>
                    {formatDuration(adventure.duration_hours)}
                  </Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontSize: 11, color: '#999', marginBottom: 2 }}>Budget</Text>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: '#3c7660' }}>
                    {formatCost(adventure.estimated_cost)}
                  </Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontSize: 11, color: '#999', marginBottom: 2 }}>Created</Text>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: '#3c7660' }}>
                    {formatDate(adventure.created_at)}
                  </Text>
                </View>
              </View>

              {/* Progress Bar */}
              <View style={{ marginBottom: 8 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: '#3c7660' }}>
                    Progress
                  </Text>
                  <Text style={{ fontSize: 12, color: '#4d987b' }}>
                    {Math.round(getProgressPercentage())}% Complete
                  </Text>
                </View>
                <View
                  style={{
                    height: 6,
                    backgroundColor: '#f8f2d5',
                    borderRadius: 3,
                    overflow: 'hidden',
                  }}
                >
                  <LinearGradient
                    colors={['#f2cc6c', '#4d987b']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{
                      height: '100%',
                      width: `${getProgressPercentage()}%`,
                      borderRadius: 3,
                    }}
                  />
                </View>
              </View>

              {/* Divider */}
              <View style={{
                height: 1,
                backgroundColor: '#E5E5E5',
                marginHorizontal: -24,
                marginBottom: 4,
              }} />
            </View>

            {/* Steps List */}
            <ScrollView
              style={{ maxHeight: SCREEN_HEIGHT * 0.4 }}
              contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24 }}
              showsVerticalScrollIndicator={false}
            >
              <Text style={{ fontSize: 18, fontWeight: '600', color: '#3c7660', marginBottom: 16 }}>
                Adventure Steps
              </Text>
              
              {adventure.steps.map((step, index) => {
                const isCompleted = stepCompletions[index] || false;
                
                return (
                  <TouchableOpacity
                    key={index}
                    onPress={() => toggleStepCompletion(index)}
                    style={{
                      backgroundColor: isCompleted ? '#f0fdf4' : '#fafafa',
                      borderRadius: 16,
                      padding: 16,
                      marginBottom: 12,
                      borderWidth: 1,
                      borderColor: isCompleted ? '#10b981' : '#e5e5e5',
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                      {/* Checkbox */}
                      <View
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: 12,
                          backgroundColor: isCompleted ? '#10b981' : 'transparent',
                          borderWidth: 2,
                          borderColor: isCompleted ? '#10b981' : '#d1d5db',
                          justifyContent: 'center',
                          alignItems: 'center',
                          marginRight: 12,
                          marginTop: 2,
                        }}
                      >
                        {isCompleted && (
                          <Text style={{ color: 'white', fontSize: 14, fontWeight: 'bold' }}>✓</Text>
                        )}
                      </View>

                      <View style={{ flex: 1 }}>
                        {/* Time and Step Number */}
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                          <Text style={{ fontSize: 14, fontWeight: '600', color: '#4d987b' }}>
                            {step.time}
                          </Text>
                          <Text style={{ fontSize: 12, color: '#999' }}>
                            Step {index + 1} of {adventure.steps.length}
                          </Text>
                        </View>

                        {/* Title */}
                        <Text
                          style={{
                            fontSize: 16,
                            fontWeight: '600',
                            color: isCompleted ? '#059669' : '#3c7660',
                            marginBottom: 4,
                            textDecorationLine: isCompleted ? 'line-through' : 'none',
                          }}
                        >
                          {step.title}
                        </Text>

                        {/* Location */}
                        <Text style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>
                          📍 {step.location}
                        </Text>

                        {/* Notes */}
                        {step.notes && (
                          <Text style={{ fontSize: 14, color: '#666', fontStyle: 'italic', marginBottom: 8 }}>
                            💡 {step.notes}
                          </Text>
                        )}

                        {/* Booking Info */}
                        {step.booking && (
                          <View
                            style={{
                              backgroundColor: '#f6dc9b',
                              padding: 8,
                              borderRadius: 8,
                              marginTop: 4,
                            }}
                          >
                            <Text style={{ fontSize: 13, fontWeight: '600', color: '#3c7660' }}>
                              📅 {step.booking.method}
                              {step.booking.link && ' - Reservation Available'}
                            </Text>
                            {step.booking.fallback && (
                              <Text style={{ fontSize: 12, color: '#666', marginTop: 2 }}>
                                {step.booking.fallback}
                              </Text>
                            )}
                          </View>
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Action Button */}
            {!adventure.is_completed && (
              <View style={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 24 }}>
                <TouchableOpacity
                  onPress={handleMarkAdventureComplete}
                  style={{
                    backgroundColor: getProgressPercentage() === 100 ? '#10b981' : '#3c7660',
                    paddingVertical: 16,
                    borderRadius: 16,
                    alignItems: 'center',
                    opacity: getProgressPercentage() === 100 ? 1 : 0.7,
                  }}
                >
                  <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
                    {getProgressPercentage() === 100 ? '🎉 Mark Adventure Complete!' : `Complete Adventure (${Math.round(getProgressPercentage())}%)`}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </SafeAreaView>
        </TouchableOpacity>
      </Animated.View>
    </Modal>
  );
};