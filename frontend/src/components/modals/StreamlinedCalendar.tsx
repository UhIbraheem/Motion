// src/components/modals/StreamlinedCalendar.tsx - Shadcn-inspired calendar for React Native
import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  Dimensions,
  Animated,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { typography, spacing, borderRadius, getCurrentTheme } from '../../constants/Theme';
import { useTheme } from '../../context/ThemeContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface StreamlinedCalendarProps {
  visible: boolean;
  onClose: () => void;
  onDateSelect: (dateString: string) => void;
  currentDate?: string;
  adventure?: any;
}

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const StreamlinedCalendar: React.FC<StreamlinedCalendarProps> = ({
  visible,
  onClose,
  onDateSelect,
  currentDate,
}) => {
  const { isDark } = useTheme();
  const themeColors = getCurrentTheme(isDark);
  
  const [viewDate, setViewDate] = useState(currentDate ? new Date(currentDate) : new Date());
  const [tempSelectedDate, setTempSelectedDate] = useState<string | null>(currentDate || null);
  const [isClosing, setIsClosing] = useState(false);
  const backgroundOpacity = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const today = new Date();
  const selectedDate = currentDate ? new Date(currentDate) : null;
  
  // Reset time to start of day for accurate comparisons
  const resetTime = (date: Date) => {
    const newDate = new Date(date);
    newDate.setHours(0, 0, 0, 0);
    return newDate;
  };

  const todayReset = resetTime(today);
  const selectedReset = selectedDate ? resetTime(selectedDate) : null;
  const tempSelectedReset = tempSelectedDate ? resetTime(new Date(tempSelectedDate)) : null;

  // Generate calendar data
  const calendarData = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();
    
    const days: (Date | null)[] = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  }, [viewDate]);

  // Navigation functions
  const goToPreviousMonth = () => {
    setViewDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  };

  const goToNextMonth = () => {
    setViewDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  };

  // Check if date is disabled (past dates)
  const isDateDisabled = (date: Date) => {
    return resetTime(date) < todayReset;
  };

  // Handle date selection (keep calendar open)
  const handleDateTap = (date: Date) => {
    if (isDateDisabled(date)) return;
    setTempSelectedDate(date.toISOString());
  };

  // Handle save/schedule action
  const handleSaveSchedule = () => {
    if (tempSelectedDate) {
      setIsClosing(true);
      animateOut(() => {
        onDateSelect(tempSelectedDate);
        onClose();
        setIsClosing(false);
      });
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setIsClosing(true);
    animateOut(() => {
      setTempSelectedDate(currentDate || null);
      onClose();
      setIsClosing(false);
    });
  };

  // Render individual day cell
  const renderDay = (date: Date | null, index: number) => {
    if (!date) {
      return (
        <View
          key={`empty-${index}`}
          style={{
            width: (SCREEN_WIDTH - spacing.xl * 2) / 7,
            height: 44,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        />
      );
    }

    const dateReset = resetTime(date);
    const isToday = dateReset.getTime() === todayReset.getTime();
    const isSelected = selectedReset && dateReset.getTime() === selectedReset.getTime();
    const isTempSelected = tempSelectedReset && dateReset.getTime() === tempSelectedReset.getTime();
    const isDisabled = isDateDisabled(date);

    return (
      <TouchableOpacity
        key={`day-${date.getDate()}-${index}`}
        onPress={() => handleDateTap(date)}
        disabled={isDisabled}
        style={{
          width: (SCREEN_WIDTH - spacing.xl * 2) / 7,
          height: 44,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: borderRadius.sm,
          backgroundColor: isTempSelected || isSelected 
            ? themeColors.brand.sage 
            : isToday 
            ? themeColors.background.secondary 
            : 'transparent',
          borderWidth: isToday && !isSelected && !isTempSelected ? 1 : 0,
          borderColor: themeColors.brand.sage,
          opacity: isDisabled ? 0.3 : 1,
        }}
      >
        <Text
          style={{
            ...typography.body,
            color: isTempSelected || isSelected 
              ? 'white' 
              : isToday 
              ? themeColors.brand.sage 
              : isDisabled 
              ? themeColors.text.tertiary 
              : themeColors.text.primary,
            fontWeight: isToday || isSelected || isTempSelected ? '600' : 'normal',
          }}
        >
          {date.getDate()}
        </Text>
      </TouchableOpacity>
    );
  };

  const currentMonth = MONTHS[viewDate.getMonth()];
  const currentYear = viewDate.getFullYear();

  // Animation effects
  useEffect(() => {
    if (visible) {
      backgroundOpacity.setValue(0);
      scaleAnim.setValue(0.9);
      Animated.parallel([
        Animated.timing(backgroundOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: false, // Changed to false for consistency
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: false, // Changed to false for consistency
        })
      ]).start();
    }
  }, [visible, backgroundOpacity, scaleAnim]);

  const animateOut = (callback: () => void) => {
    Animated.parallel([
      Animated.timing(backgroundOpacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: false, // Changed to false for consistency
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 150,
        useNativeDriver: false, // Changed to false for consistency
      })
    ]).start(callback);
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <Animated.View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: spacing.lg,
          opacity: backgroundOpacity,
        }}
      >
        <TouchableOpacity
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          activeOpacity={1}
          onPress={() => !isClosing && handleCancel()}
        />
        
        <Animated.View style={{
          backgroundColor: themeColors.background.primary,
          borderRadius: borderRadius.xl,
          width: '100%',
          maxWidth: 400,
          overflow: 'hidden',
          elevation: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.3,
          shadowRadius: 20,
          transform: [{ scale: scaleAnim }],
        }}>
          <SafeAreaView>
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
                alignItems: 'center',
                marginBottom: spacing.md,
              }}>
                <TouchableOpacity
                  onPress={goToPreviousMonth}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: themeColors.background.secondary,
                  }}
                >
                  <Ionicons 
                    name="chevron-back" 
                    size={20} 
                    color={themeColors.text.primary} 
                  />
                </TouchableOpacity>

                <View style={{ alignItems: 'center' }}>
                  <Text style={{
                    ...typography.title,
                    color: themeColors.text.primary,
                    fontSize: 18,
                  }}>
                    {currentMonth} {currentYear}
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={goToNextMonth}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: themeColors.background.secondary,
                  }}
                >
                  <Ionicons 
                    name="chevron-forward" 
                    size={20} 
                    color={themeColors.text.primary} 
                  />
                </TouchableOpacity>
              </View>

              {/* Day headers */}
              <View style={{
                flexDirection: 'row',
                paddingBottom: spacing.sm,
              }}>
                {DAYS_OF_WEEK.map((day, index) => (
                  <View 
                    key={`header-${day}-${index}`}
                    style={{ 
                      width: (SCREEN_WIDTH - spacing.xl * 2) / 7, 
                      alignItems: 'center' 
                    }}
                  >
                    <Text style={{
                      ...typography.caption,
                      color: themeColors.text.secondary,
                      fontWeight: '600',
                      fontSize: 12,
                    }}>
                      {day.charAt(0)}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Calendar grid */}
            <View style={{
              paddingHorizontal: spacing.lg,
              paddingVertical: spacing.md,
            }}>
              <View style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
              }}>
                {calendarData.map((date, index) => renderDay(date, index))}
              </View>
            </View>

            {/* Footer */}
            <View style={{
              paddingHorizontal: spacing.lg,
              paddingBottom: spacing.lg,
              paddingTop: spacing.sm,
              borderTopWidth: 1,
              borderTopColor: themeColors.text.tertiary + '20',
              flexDirection: 'row',
              gap: spacing.sm,
            }}>
              <TouchableOpacity
                onPress={handleCancel}
                style={{
                  flex: 1,
                  backgroundColor: themeColors.background.secondary,
                  paddingVertical: spacing.md,
                  borderRadius: borderRadius.md,
                  alignItems: 'center',
                }}
              >
                <Text style={{
                  ...typography.body,
                  color: themeColors.text.secondary,
                  fontWeight: '500',
                }}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSaveSchedule}
                disabled={!tempSelectedDate}
                style={{
                  flex: 1,
                  backgroundColor: tempSelectedDate ? themeColors.brand.sage : themeColors.background.secondary,
                  paddingVertical: spacing.md,
                  borderRadius: borderRadius.md,
                  alignItems: 'center',
                  opacity: tempSelectedDate ? 1 : 0.5,
                }}
              >
                <Text style={{
                  ...typography.body,
                  color: tempSelectedDate ? 'white' : themeColors.text.secondary,
                  fontWeight: '600',
                }}>
                  Schedule
                </Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

export default StreamlinedCalendar;
