import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  SafeAreaView,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';

interface DatePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onDateSelect: (date: Date) => void;
  initialDate?: Date;
  minimumDate?: Date;
  maximumDate?: Date;
  title?: string;
}

const DatePickerModal: React.FC<DatePickerModalProps> = ({
  visible,
  onClose,
  onDateSelect,
  initialDate = new Date(),
  minimumDate = new Date(),
  maximumDate,
  title = 'Select Date'
}) => {
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [showPicker, setShowPicker] = useState(Platform.OS === 'ios');

  const handleDateChange = (event: any, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }
    
    if (date) {
      setSelectedDate(date);
      if (Platform.OS === 'android') {
        onDateSelect(date);
        onClose();
      }
    } else if (Platform.OS === 'android') {
      onClose();
    }
  };

  const handleConfirm = () => {
    onDateSelect(selectedDate);
    onClose();
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <SafeAreaView className="bg-white rounded-t-3xl">
          {/* Header */}
          <View className="flex-row items-center justify-between p-6 border-b border-gray-100">
            <TouchableOpacity onPress={onClose}>
              <Text className="text-green-600 font-medium">Cancel</Text>
            </TouchableOpacity>
            <Text className="text-lg font-semibold text-gray-900">{title}</Text>
            {Platform.OS === 'ios' && (
              <TouchableOpacity onPress={handleConfirm}>
                <Text className="text-green-600 font-medium">Done</Text>
              </TouchableOpacity>
            )}
            {Platform.OS === 'android' && (
              <View style={{ width: 50 }} />
            )}
          </View>

          {/* Selected Date Display */}
          <View className="px-6 py-4 bg-gray-50">
            <Text className="text-center text-gray-600 text-sm">Selected Date</Text>
            <Text className="text-center text-gray-900 font-semibold text-lg mt-1">
              {formatDate(selectedDate)}
            </Text>
          </View>

          {/* Date Picker */}
          <View className="px-6 py-4">
            {Platform.OS === 'android' && !showPicker && (
              <TouchableOpacity
                className="bg-green-600 py-4 px-6 rounded-xl items-center"
                onPress={() => setShowPicker(true)}
              >
                <Text className="text-white font-semibold">Open Calendar</Text>
              </TouchableOpacity>
            )}
            
            {showPicker && (
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleDateChange}
                minimumDate={minimumDate}
                maximumDate={maximumDate}
                textColor="#374151"
                accentColor="#16a34a"
              />
            )}
          </View>

          {/* Footer spacing */}
          <View className="h-8" />
        </SafeAreaView>
      </View>
    </Modal>
  );
};

export default DatePickerModal;
