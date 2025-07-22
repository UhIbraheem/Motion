import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface PreferencesModalProps {
  visible: boolean;
  onClose: () => void;
  onOpenPrivacy: () => void;
}

const PreferencesModal: React.FC<PreferencesModalProps> = ({
  visible,
  onClose,
  onOpenPrivacy,
}) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50">
        <View className="flex-1 bg-background-light mt-12">
          {/* Modal Header */}
          <View className="flex-row justify-between items-center p-6 pb-4">
            <TouchableOpacity 
              onPress={onClose}
              className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
            >
              <Text className="text-gray-600 font-bold text-lg">×</Text>
            </TouchableOpacity>
            <Text className="text-2xl font-bold text-text-primary">Preferences</Text>
            <View className="w-10" />
          </View>

          <ScrollView 
            className="flex-1 px-6" 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 40 }}
          >
            {/* Adventure Preferences */}
            <View className="mb-6">
              <View className="flex-row items-center mb-4">
                <Ionicons name="settings" size={20} color="#2F4F4F" />
                <Text className="text-lg font-bold text-gray-800 ml-2">Adventure Preferences</Text>
              </View>
              
              <View className="bg-background-subtle rounded-xl p-4 mb-4">
                <Text className="text-text-primary font-medium mb-2">Preferred Adventure Types</Text>
                <Text className="text-text-secondary text-sm mb-3">Select your favorite types of experiences</Text>
                
                <View className="flex-row flex-wrap gap-2">
                  {['Cultural', 'Outdoor', 'Food', 'Adventure', 'Relaxation', 'Nightlife'].map((type) => (
                    <TouchableOpacity 
                      key={type}
                      className="px-4 py-2 rounded-full bg-brand-sage border"
                    >
                      <Text className="text-brand-cream text-sm">{type}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View className="bg-background-subtle rounded-xl p-4 mb-4">
                <Text className="text-text-primary font-medium mb-2">Budget Preference</Text>
                <View className="flex-row justify-between items-center">
                  <Text className="text-text-secondary">Default budget range</Text>
                  <Text className="text-brand-teal font-medium">$50 - $200</Text>
                </View>
              </View>

              <View className="bg-background-subtle rounded-xl p-4">
                <Text className="text-text-primary font-medium mb-2">Group Size Preference</Text>
                <View className="flex-row justify-between items-center">
                  <Text className="text-text-secondary">Preferred group size</Text>
                  <Text className="text-brand-teal font-medium">2-4 people</Text>
                </View>
              </View>
            </View>

            {/* Notification Preferences */}
            <View className="mb-6">
              <View className="flex-row items-center mb-4">
                <Ionicons name="notifications" size={20} color="#2F4F4F" />
                <Text className="text-lg font-bold text-gray-800 ml-2">Notifications</Text>
              </View>
              
              <View className="bg-background-subtle rounded-xl p-4">
                <TouchableOpacity className="flex-row justify-between items-center py-2">
                  <View>
                    <Text className="text-text-primary font-medium">Adventure Reminders</Text>
                    <Text className="text-text-secondary text-sm">Get notified about upcoming plans</Text>
                  </View>
                  <View className="w-12 h-6 bg-brand-sage rounded-full justify-center">
                    <View className="w-5 h-5 bg-white rounded-full ml-6" />
                  </View>
                </TouchableOpacity>

                <View className="h-px bg-gray-200 my-2" />

                <TouchableOpacity className="flex-row justify-between items-center py-2">
                  <View>
                    <Text className="text-text-primary font-medium">New Adventure Suggestions</Text>
                    <Text className="text-text-secondary text-sm">Weekly personalized recommendations</Text>
                  </View>
                  <View className="w-12 h-6 bg-brand-sage rounded-full justify-center">
                    <View className="w-5 h-5 bg-white rounded-full ml-6" />
                  </View>
                </TouchableOpacity>

                <View className="h-px bg-gray-200 my-2" />

                <TouchableOpacity className="flex-row justify-between items-center py-2">
                  <View>
                    <Text className="text-text-primary font-medium">Social Updates</Text>
                    <Text className="text-text-secondary text-sm">Friends' adventures and activity</Text>
                  </View>
                  <View className="w-12 h-6 bg-gray-300 rounded-full justify-center">
                    <View className="w-5 h-5 bg-white rounded-full ml-1" />
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            {/* Privacy Settings */}
            <View className="mb-6">
              <Text className="text-lg font-bold text-text-primary mb-4">🔒 Privacy & Data</Text>
              
              <TouchableOpacity 
                onPress={() => {
                  onClose();
                  onOpenPrivacy();
                }}
                className="bg-background-subtle rounded-xl p-4 flex-row justify-between items-center"
              >
                <View>
                  <Text className="text-text-primary font-medium">Privacy Settings</Text>
                  <Text className="text-text-secondary text-sm">Manage data and privacy preferences</Text>
                </View>
                <Text className="text-text-secondary">{'>'}</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default PreferencesModal;
