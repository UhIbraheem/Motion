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
    
    onClose();
  };

  const SelectionRow = ({ 
    icon, 
    title, 
    description, 
    currentValue,
    options,
    onSelect
  }: { 
    icon: string; 
    title: string; 
    description: string; 
    currentValue: string;
    options: { label: string; value: string }[];
    onSelect: (value: string) => void;
  }) => (
    <View className="py-4 px-4">
      <View className="flex-row items-center mb-3">
        <Ionicons name={icon as any} size={20} color="#3c7660" />
        <View className="ml-3 flex-1">
          <Text className="text-base font-medium text-gray-800">{title}</Text>
          <Text className="text-sm text-gray-500 mt-1">{description}</Text>
        </View>
      </View>
      
      <View className="flex-row flex-wrap ml-8">
        {options.map((option) => (
          <TouchableOpacity
            key={option.value}
            className={`mr-3 mb-2 px-4 py-2 rounded-full border ${
              currentValue === option.value
                ? 'bg-green-50 border-green-500'
                : 'bg-gray-50 border-gray-300'
            }`}
            onPress={() => onSelect(option.value)}
          >
            <Text className={`text-sm font-medium ${
              currentValue === option.value
                ? 'text-green-700'
                : 'text-gray-700'
            }`}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const InputSection = ({ 
    icon, 
    title, 
    description, 
    value,
    onChangeText,
    placeholder,
    multiline = false
  }: { 
    icon: string; 
    title: string; 
    description: string; 
    value: string;
    onChangeText: (text: string) => void;
    placeholder: string;
    multiline?: boolean;
  }) => (
    <View className="py-4 px-4">
      <View className="flex-row items-center mb-3">
        <Ionicons name={icon as any} size={20} color="#3c7660" />
        <View className="ml-3 flex-1">
          <Text className="text-base font-medium text-gray-800">{title}</Text>
          <Text className="text-sm text-gray-500 mt-1">{description}</Text>
        </View>
      </View>
      
      <View className="ml-8">
        <TextInput
          className={`bg-gray-50 border border-gray-300 rounded-lg px-3 py-3 text-gray-800 ${
            multiline ? 'min-h-[100px]' : ''
          }`}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#9ca3af"
          multiline={multiline}
          textAlignVertical={multiline ? 'top' : 'center'}
        />
      </View>
    </View>
  );

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
            <Text className="text-green-600 font-medium">Send</Text>
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1">
          {/* Feedback Type */}
          <View className="bg-white mt-4 mx-4 rounded-2xl">
            <View className="p-4 border-b border-gray-100">
              <Text className="text-lg font-semibold text-gray-800">Feedback Type</Text>
            </View>
            
            <SelectionRow
              icon="chatbubble"
              title="Type"
              description="What kind of feedback are you providing?"
              currentValue={feedback.type}
              options={[
                { label: 'Bug Report', value: 'bug' },
                { label: 'Feature Request', value: 'feature' },
                { label: 'General Feedback', value: 'general' },
                { label: 'Compliment', value: 'compliment' }
              ]}
              onSelect={(value) => setFeedback(prev => ({ ...prev, type: value as any }))}
            />
            
            <View className="h-px bg-gray-100 mx-4" />
            
            <SelectionRow
              icon="flag"
              title="Priority"
              description="How urgent is this feedback?"
              currentValue={feedback.priority}
              options={[
                { label: 'Low', value: 'low' },
                { label: 'Medium', value: 'medium' },
                { label: 'High', value: 'high' }
              ]}
              onSelect={(value) => setFeedback(prev => ({ ...prev, priority: value as any }))}
            />
          </View>

          {/* Details */}
          <View className="bg-white mt-4 mx-4 rounded-2xl">
            <View className="p-4 border-b border-gray-100">
              <Text className="text-lg font-semibold text-gray-800">Details</Text>
            </View>
            
            <InputSection
              icon="text"
              title="Subject"
              description="Brief summary of your feedback"
              value={feedback.subject}
              onChangeText={(text) => setFeedback(prev => ({ ...prev, subject: text }))}
              placeholder="Enter a subject..."
            />
            
            <View className="h-px bg-gray-100 mx-4" />
            
            <InputSection
              icon="document-text"
              title="Description"
              description="Provide detailed information about your feedback"
              value={feedback.description}
              onChangeText={(text) => setFeedback(prev => ({ ...prev, description: text }))}
              placeholder="Tell us more..."
              multiline={true}
            />
            
            <View className="h-px bg-gray-100 mx-4" />
            
            <InputSection
              icon="folder"
              title="Category"
              description="Which part of the app does this relate to? (Optional)"
              value={feedback.category}
              onChangeText={(text) => setFeedback(prev => ({ ...prev, category: text }))}
              placeholder="e.g., Adventure Generation, Profile, etc."
            />
          </View>

          {/* Footer spacing */}
          <View className="h-20" />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

export default FeedbackModal;
