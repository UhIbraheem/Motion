// src/components/modals/SchedulePickerModal.tsx - Calendar-based Schedule Modal
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
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
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
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [calendarMode, setCalendarMode] = useState(false);

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];
  
  // Generate quick options for the next 7 days
  const getQuickOptions = () => {
    const options = [];
    const date = new Date();
    
    for (let i = 0; i < 7; i++) {
      const optionDate = new Date(date);
      optionDate.setDate(date.getDate() + i);
      
      let label = '';
      if (i === 0) label = 'Today';
      else if (i === 1) label = 'Tomorrow';
      else label = optionDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
      
      options.push({
        date: optionDate.toISOString().split('T')[0],
        label,
        subtitle: i === 0 ? 'Start your adventure now' : i === 1 ? 'Plan for tomorrow' : ''
      });
    }
    
    return options;
  };

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

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
  };

  const handleConfirmSchedule = () => {
    if (!selectedDate) {
      Alert.alert('Select Date', 'Please select a date for your adventure.');
      return;
    }
    
    onUpdateScheduledDate(selectedDate);
    onClose();
  };

  const handleQuickOptionSelect = (date: string) => {
    setSelectedDate(date);
    onUpdateScheduledDate(date);
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none">
      {/* Backdrop */}
      <BlurView intensity={20} style={{ flex: 1 }}>
        <TouchableOpacity 
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}
          activeOpacity={1}
          onPress={onClose}
        />
        
        {/* Modal Content */}
        <Animated.View
          style={[
            {
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              transform: [{ translateY: slideAnim }],
              backgroundColor: themeColors.background?.primary || '#ffffff',
              borderTopLeftRadius: borderRadius.lg,
              borderTopRightRadius: borderRadius.lg,
              maxHeight: SCREEN_HEIGHT * 0.8,
            }
          ]}
        >
          <SafeAreaView>
            {/* Header */}
            <View className="flex-row items-center justify-between p-4 border-b border-gray-100">
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={24} color="#9CA3AF" />
              </TouchableOpacity>
              <Text className="text-xl font-bold text-brand-sage">Schedule Adventure</Text>
              <View className="w-6" />
            </View>

            <ScrollView className="px-4 py-2" showsVerticalScrollIndicator={false}>
              {/* Quick Options */}
              <View className="mb-6">
                <Text className="text-lg font-semibold text-gray-800 mb-3">Quick Schedule</Text>
                {getQuickOptions().map((option, index) => (
                  <TouchableOpacity
                    key={index}
                    className="bg-gray-50 rounded-xl p-4 mb-2 border border-gray-200"
                    onPress={() => handleQuickOptionSelect(option.date)}
                    activeOpacity={0.7}
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-1">
                        <Text className="text-base font-medium text-gray-800">{option.label}</Text>
                        {option.subtitle && (
                          <Text className="text-sm text-gray-500 mt-1">{option.subtitle}</Text>
                        )}
                      </View>
                      <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                    </View>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Calendar Toggle */}
              <View className="mb-4">
                <TouchableOpacity
                  className="flex-row items-center justify-between bg-brand-light rounded-xl p-4"
                  onPress={() => setCalendarMode(!calendarMode)}
                >
                  <View className="flex-row items-center">
                    <Ionicons name="calendar" size={20} color="#3c7660" />
                    <Text className="text-base font-medium text-brand-sage ml-2">
                      Choose Custom Date
                    </Text>
                  </View>
                  <Ionicons 
                    name={calendarMode ? "chevron-up" : "chevron-down"} 
                    size={20} 
                    color="#3c7660" 
                  />
                </TouchableOpacity>
              </View>

              {/* Calendar */}
              {calendarMode && (
                <View className="mb-6">
                  <Calendar
                    minDate={today}
                    onDayPress={(day: any) => handleDateSelect(day.dateString)}
                    markedDates={selectedDate ? {
                      [selectedDate]: {
                        selected: true,
                        selectedColor: '#3c7660',
                      }
                    } : {}}
                    theme={{
                      backgroundColor: 'transparent',
                      calendarBackground: 'transparent',
                      selectedDayBackgroundColor: '#3c7660',
                      selectedDayTextColor: '#ffffff',
                      todayTextColor: '#f2cc6c',
                      dayTextColor: '#2d4150',
                      textDisabledColor: '#d9e1e8',
                      arrowColor: '#3c7660',
                      disabledArrowColor: '#d9e1e8',
                      monthTextColor: '#3c7660',
                      textDayFontWeight: '400',
                      textMonthFontWeight: 'bold',
                      textDayHeaderFontWeight: '300',
                      textDayFontSize: 16,
                      textMonthFontSize: 18,
                      textDayHeaderFontSize: 13
                    }}
                  />
                  
                  {/* Confirm Button for Calendar Selection */}
                  {selectedDate && (
                    <View className="mt-4">
                      <TouchableOpacity
                        className="bg-brand-sage rounded-xl py-4 items-center"
                        onPress={handleConfirmSchedule}
                        activeOpacity={0.8}
                      >
                        <Text className="text-white font-semibold text-lg">
                          Schedule for {new Date(selectedDate).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              )}

              {/* Adventure Info */}
              {adventure && (
                <View className="mb-4 bg-gray-50 rounded-xl p-4">
                  <Text className="font-semibold text-gray-800 mb-1">{adventure.title}</Text>
                  <View className="flex-row items-center">
                    <Ionicons name="time" size={16} color="#9CA3AF" />
                    <Text className="text-sm text-gray-600 ml-1">
                      Estimated {Math.ceil((adventure.duration_hours || 2))} hours
                    </Text>
                  </View>
                </View>
              )}
            </ScrollView>
          </SafeAreaView>
        </Animated.View>
      </BlurView>
    </Modal>
  );
};

export default SchedulePickerModal;
