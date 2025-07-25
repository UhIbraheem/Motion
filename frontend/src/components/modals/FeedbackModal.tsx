import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface FeedbackModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (feedback: FeedbackData) => void;
}

interface FeedbackData {
  type: 'bug' | 'feature' | 'general' | 'compliment';
  category: string;
  subject: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({
  visible,
  onClose,
  onSubmit
}) => {
  const [feedback, setFeedback] = useState<FeedbackData>({
    type: 'general',
    category: '',
    subject: '',
    description: '',
    priority: 'medium'
  });

  const handleSubmit = () => {
    if (!feedback.subject.trim() || !feedback.description.trim()) {
      Alert.alert('Missing Information', 'Please fill in both subject and description.');
      return;
    }
    
    onSubmit(feedback);
    
    // Reset form
    setFeedback({
      type: 'general',
      category: '',
      subject: '',
      description: '',
      priority: 'medium'
    });
    
    Alert.alert('Thank You!', 'Your feedback has been submitted successfully.');
    onClose();
  };

  const feedbackTypes = [
    { label: '🐛 Bug Report', value: 'bug', icon: 'bug' },
    { label: '💡 Feature Request', value: 'feature', icon: 'bulb' },
    { label: '💬 General Feedback', value: 'general', icon: 'chatbubble' },
    { label: '❤️ Compliment', value: 'compliment', icon: 'heart' }
  ];

  const categories = [
    'Adventures & Planning',
    'User Interface',
    'Performance',
    'Navigation',
    'Profile & Settings',
    'Community Features',
    'Notifications',
    'Maps & Location',
    'Other'
  ];

  const priorities = [
    { label: 'Low', value: 'low', color: '#10B981' },
    { label: 'Medium', value: 'medium', color: '#F59E0B' },
    { label: 'High', value: 'high', color: '#EF4444' }
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView className="flex-1 bg-gray-50">
        {/* Header */}
        <View className="flex-row items-center justify-between p-4 bg-white border-b border-gray-200">
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#374151" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-gray-800">Send Feedback</Text>
          <TouchableOpacity onPress={handleSubmit}>
            <Text className="text-green-600 font-medium">Submit</Text>
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 p-4">
          {/* Feedback Type */}
          <View className="bg-white rounded-2xl p-4 mb-4">
            <Text className="text-lg font-semibold text-gray-800 mb-3">What type of feedback?</Text>
            <View className="flex-row flex-wrap">
              {feedbackTypes.map((type) => (
                <TouchableOpacity
                  key={type.value}
                  className={`mr-3 mb-3 px-4 py-3 rounded-xl border flex-row items-center ${
                    feedback.type === type.value
                      ? 'bg-green-50 border-green-500'
                      : 'bg-gray-50 border-gray-300'
                  }`}
                  onPress={() => setFeedback(prev => ({ ...prev, type: type.value as any }))}
                >
                  <Text className="mr-2">{type.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Category */}
          <View className="bg-white rounded-2xl p-4 mb-4">
            <Text className="text-lg font-semibold text-gray-800 mb-3">Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row">
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category}
                    className={`mr-3 px-4 py-2 rounded-full border ${
                      feedback.category === category
                        ? 'bg-green-50 border-green-500'
                        : 'bg-gray-50 border-gray-300'
                    }`}
                    onPress={() => setFeedback(prev => ({ ...prev, category }))}
                  >
                    <Text className={`text-sm font-medium ${
                      feedback.category === category
                        ? 'text-green-700'
                        : 'text-gray-700'
                    }`}>
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Priority (only for bugs and feature requests) */}
          {(feedback.type === 'bug' || feedback.type === 'feature') && (
            <View className="bg-white rounded-2xl p-4 mb-4">
              <Text className="text-lg font-semibold text-gray-800 mb-3">Priority</Text>
              <View className="flex-row">
                {priorities.map((priority) => (
                  <TouchableOpacity
                    key={priority.value}
                    className={`mr-3 px-4 py-2 rounded-full border ${
                      feedback.priority === priority.value
                        ? 'border-opacity-100'
                        : 'bg-gray-50 border-gray-300'
                    }`}
                    style={{
                      backgroundColor: feedback.priority === priority.value ? `${priority.color}20` : undefined,
                      borderColor: feedback.priority === priority.value ? priority.color : undefined
                    }}
                    onPress={() => setFeedback(prev => ({ ...prev, priority: priority.value as any }))}
                  >
                    <Text className={`text-sm font-medium ${
                      feedback.priority === priority.value
                        ? 'text-gray-800'
                        : 'text-gray-700'
                    }`}>
                      {priority.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Subject */}
          <View className="bg-white rounded-2xl p-4 mb-4">
            <Text className="text-lg font-semibold text-gray-800 mb-3">Subject *</Text>
            <TextInput
              className="bg-gray-50 p-3 rounded-xl text-gray-800"
              placeholder="Brief summary of your feedback"
              value={feedback.subject}
              onChangeText={(text) => setFeedback(prev => ({ ...prev, subject: text }))}
              maxLength={100}
            />
            <Text className="text-xs text-gray-500 mt-1">{feedback.subject.length}/100</Text>
          </View>

          {/* Description */}
          <View className="bg-white rounded-2xl p-4 mb-4">
            <Text className="text-lg font-semibold text-gray-800 mb-3">Description *</Text>
            <TextInput
              className="bg-gray-50 p-3 rounded-xl text-gray-800"
              placeholder={
                feedback.type === 'bug' 
                  ? "Please describe the bug, steps to reproduce, and expected vs actual behavior..."
                  : feedback.type === 'feature'
                  ? "Describe the feature you'd like to see and how it would help you..."
                  : "Tell us about your experience, suggestions, or any other feedback..."
              }
              value={feedback.description}
              onChangeText={(text) => setFeedback(prev => ({ ...prev, description: text }))}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              maxLength={1000}
            />
            <Text className="text-xs text-gray-500 mt-1">{feedback.description.length}/1000</Text>
          </View>

          {/* Additional Info */}
          <View className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6">
            <View className="flex-row items-center mb-2">
              <Ionicons name="information-circle" size={20} color="#3B82F6" />
              <Text className="text-blue-800 font-medium ml-2">Additional Information</Text>
            </View>
            <Text className="text-blue-700 text-sm">
              Your feedback helps us improve Motion for everyone. We may follow up with questions about your feedback.
              {feedback.type === 'bug' && ' For bugs, please include device info and app version if relevant.'}
            </Text>
          </View>

          {/* Footer spacing */}
          <View className="h-20" />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

export default FeedbackModal;
