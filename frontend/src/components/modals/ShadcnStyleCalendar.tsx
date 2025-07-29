// src/components/modals/ShadcnStyleCalendar.tsx - Shadcn-inspired calendar for React Native
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { typography, spacing, borderRadius } from '../../constants/Theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ShadcnStyleCalendarProps {
  selectedDate?: Date;
  onDateSelect: (date: Date) => void;
  themeColors: any;
  minDate?: Date;
  maxDate?: Date;
}

const DAYS_OF_WEEK = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const ShadcnStyleCalendar: React.FC<ShadcnStyleCalendarProps> = ({
  selectedDate,
  onDateSelect,
  themeColors,
  minDate,
  maxDate,
}) => {
  const [currentMonth, setCurrentMonth] = useState(selectedDate ? new Date(selectedDate) : new Date());
  const today = new Date();

  // Get calendar data for current month
  const calendarData = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    // First day of the month
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // Days to show from previous month
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    // Days to show from next month
    const endDate = new Date(lastDay);
    const remainingDays = 6 - lastDay.getDay();
    endDate.setDate(endDate.getDate() + remainingDays);
    
    const days = [];
    const current = new Date(startDate);
    
    while (current <= endDate) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  }, [currentMonth]);

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
  };

  const isToday = (date: Date) => {
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    return selectedDate && date.toDateString() === selectedDate.toDateString();
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentMonth.getMonth();
  };

  const isDisabled = (date: Date) => {
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return false;
  };

  const getDayStyle = (date: Date) => {
    const base = {
      width: 36,
      height: 36,
      borderRadius: 6,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      marginHorizontal: 1,
      marginVertical: 1,
    };

    if (isDisabled(date)) {
      return {
        ...base,
        backgroundColor: 'transparent',
        opacity: 0.3,
      };
    }

    if (isSelected(date)) {
      return {
        ...base,
        backgroundColor: themeColors.brand.sage,
      };
    }

    if (isToday(date)) {
      return {
        ...base,
        backgroundColor: themeColors.background.secondary,
        borderWidth: 1,
        borderColor: themeColors.brand.sage,
      };
    }

    return {
      ...base,
      backgroundColor: 'transparent',
    };
  };

  const getDayTextStyle = (date: Date) => {
    const base = {
      ...typography.body,
      fontSize: 14,
      fontWeight: '400' as const,
    };

    if (isDisabled(date)) {
      return {
        ...base,
        color: themeColors.text.tertiary,
      };
    }

    if (isSelected(date)) {
      return {
        ...base,
        color: 'white',
        fontWeight: '500' as const,
      };
    }

    if (isToday(date)) {
      return {
        ...base,
        color: themeColors.brand.sage,
        fontWeight: '500' as const,
      };
    }

    if (!isCurrentMonth(date)) {
      return {
        ...base,
        color: themeColors.text.tertiary,
      };
    }

    return {
      ...base,
      color: themeColors.text.primary,
    };
  };

  const handleDatePress = (date: Date) => {
    if (isDisabled(date)) return;
    onDateSelect(date);
  };

  // Chunk days into weeks
  const weeks = [];
  for (let i = 0; i < calendarData.length; i += 7) {
    weeks.push(calendarData.slice(i, i + 7));
  }

  return (
    <View style={{
      backgroundColor: themeColors.background.card,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      margin: spacing.md,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    }}>
      {/* Header with month navigation */}
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.lg,
        paddingHorizontal: spacing.sm,
      }}>
        <TouchableOpacity
          onPress={() => navigateMonth('prev')}
          style={{
            width: 32,
            height: 32,
            borderRadius: 6,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'transparent',
          }}
          activeOpacity={0.6}
        >
          <Ionicons 
            name="chevron-back" 
            size={18} 
            color={themeColors.text.primary} 
          />
        </TouchableOpacity>

        <Text style={{
          ...typography.subheading,
          color: themeColors.text.primary,
          fontWeight: '600',
        }}>
          {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </Text>

        <TouchableOpacity
          onPress={() => navigateMonth('next')}
          style={{
            width: 32,
            height: 32,
            borderRadius: 6,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'transparent',
          }}
          activeOpacity={0.6}
        >
          <Ionicons 
            name="chevron-forward" 
            size={18} 
            color={themeColors.text.primary} 
          />
        </TouchableOpacity>
      </View>

      {/* Days of week header */}
      <View style={{
        flexDirection: 'row',
        marginBottom: spacing.sm,
        paddingHorizontal: 2,
      }}>
        {DAYS_OF_WEEK.map((day) => (
          <View
            key={day}
            style={{
              width: 36,
              height: 32,
              alignItems: 'center',
              justifyContent: 'center',
              marginHorizontal: 1,
            }}
          >
            <Text style={{
              ...typography.caption,
              color: themeColors.text.secondary,
              fontWeight: '500',
              fontSize: 12,
            }}>
              {day}
            </Text>
          </View>
        ))}
      </View>

      {/* Calendar grid */}
      <View>
        {weeks.map((week, weekIndex) => (
          <View key={weekIndex} style={{ flexDirection: 'row', marginBottom: 2 }}>
            {week.map((date, dayIndex) => (
              <TouchableOpacity
                key={`${weekIndex}-${dayIndex}`}
                onPress={() => handleDatePress(date)}
                style={getDayStyle(date)}
                activeOpacity={isDisabled(date) ? 1 : 0.6}
                disabled={isDisabled(date)}
              >
                <Text style={getDayTextStyle(date)}>
                  {date.getDate()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>

      {/* Today button */}
      <View style={{
        marginTop: spacing.md,
        paddingTop: spacing.sm,
        borderTopWidth: 1,
        borderTopColor: themeColors.text.tertiary + '20',
      }}>
        <TouchableOpacity
          onPress={() => {
            const today = new Date();
            setCurrentMonth(today);
            onDateSelect(today);
          }}
          style={{
            alignSelf: 'center',
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.xs,
            borderRadius: borderRadius.sm,
            backgroundColor: 'transparent',
          }}
          activeOpacity={0.6}
        >
          <Text style={{
            ...typography.caption,
            color: themeColors.brand.sage,
            fontWeight: '500',
          }}>
            Today
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ShadcnStyleCalendar;
