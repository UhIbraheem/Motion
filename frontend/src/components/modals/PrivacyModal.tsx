import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface PrivacyModalProps {
  visible: boolean;
  onClose: () => void;
  onBackToPreferences: () => void;
}

const PrivacyModal: React.FC<PrivacyModalProps> = ({
  visible,
  onClose,
  onBackToPreferences,
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
              onPress={() => {
                onClose();
                onBackToPreferences();
              }}
              className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
            >
              <Text className="text-gray-600 font-bold text-lg">←</Text>
            </TouchableOpacity>
            <Text className="text-2xl font-bold text-text-primary">Privacy & Data</Text>
            <TouchableOpacity 
              onPress={onClose}
              className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
            >
              <Text className="text-gray-600 font-bold text-lg">×</Text>
            </TouchableOpacity>
          </View>

          <ScrollView 
            className="flex-1 px-6" 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 40 }}
          >
            {/* Data Collection */}
            <View className="mb-6">
              <Text className="text-lg font-bold text-text-primary mb-4">📊 Data Collection</Text>
              
              <View className="bg-background-subtle rounded-xl p-4">
                <TouchableOpacity className="flex-row justify-between items-center py-2">
                  <View className="flex-1 mr-3">
                    <Text className="text-text-primary font-medium">Location Data</Text>
                    <Text className="text-text-secondary text-sm">Help improve recommendations with location</Text>
                  </View>
                  <View className="w-12 h-6 bg-brand-sage rounded-full justify-center">
                    <View className="w-5 h-5 bg-white rounded-full ml-6" />
                  </View>
                </TouchableOpacity>

                <View className="h-px bg-gray-200 my-2" />

                <TouchableOpacity className="flex-row justify-between items-center py-2">
                  <View className="flex-1 mr-3">
                    <Text className="text-text-primary font-medium">Usage Analytics</Text>
                    <Text className="text-text-secondary text-sm">Anonymous app usage data</Text>
                  </View>
                  <View className="w-12 h-6 bg-brand-sage rounded-full justify-center">
                    <View className="w-5 h-5 bg-white rounded-full ml-6" />
                  </View>
                </TouchableOpacity>

                <View className="h-px bg-gray-200 my-2" />

                <TouchableOpacity className="flex-row justify-between items-center py-2">
                  <View className="flex-1 mr-3">
                    <Text className="text-text-primary font-medium">Personalization Data</Text>
                    <Text className="text-text-secondary text-sm">Preferences and behavior for better suggestions</Text>
                  </View>
                  <View className="w-12 h-6 bg-gray-300 rounded-full justify-center">
                    <View className="w-5 h-5 bg-white rounded-full ml-1" />
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            {/* Account Management */}
            <View className="mb-6">
              <View className="flex-row items-center mb-4">
                <Ionicons name="person" size={20} color="#2F4F4F" />
                <Text className="text-lg font-bold text-gray-800 ml-2">Account Management</Text>
              </View>
              
              <TouchableOpacity className="bg-background-subtle rounded-xl p-4 mb-3">
                <Text className="text-text-primary font-medium">Export My Data</Text>
                <Text className="text-text-secondary text-sm mt-1">Download all your data</Text>
              </TouchableOpacity>

              <TouchableOpacity className="bg-red-50 border border-red-200 rounded-xl p-4">
                <Text className="text-red-600 font-medium">Delete Account</Text>
                <Text className="text-red-500 text-sm mt-1">Permanently delete your account and data</Text>
              </TouchableOpacity>
            </View>

            {/* Legal */}
            <View className="mb-6">
              <View className="flex-row items-center mb-4">
                <Ionicons name="document-text" size={20} color="#2F4F4F" />
                <Text className="text-lg font-bold text-gray-800 ml-2">Legal</Text>
              </View>
              
              <TouchableOpacity className="bg-background-subtle rounded-xl p-4 mb-3">
                <Text className="text-text-primary font-medium">Privacy Policy</Text>
                <Text className="text-text-secondary text-sm mt-1">Read our privacy policy</Text>
              </TouchableOpacity>

              <TouchableOpacity className="bg-background-subtle rounded-xl p-4">
                <Text className="text-text-primary font-medium">Terms of Service</Text>
                <Text className="text-text-secondary text-sm mt-1">Read our terms of service</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default PrivacyModal;
