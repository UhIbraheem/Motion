import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  Switch,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface PrivacySettings {
  public_profile: boolean;
  location_sharing: boolean;
  adventure_sharing_default: boolean;
  show_in_discover: boolean;
  allow_friend_requests: boolean;
  show_real_name: boolean;
  data_analytics: boolean;
  personalized_ads: boolean;
  third_party_sharing: boolean;
}

interface PrivacySecurityModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (settings: PrivacySettings) => void;
  initialSettings?: Partial<PrivacySettings>;
}

const PrivacySecurityModal: React.FC<PrivacySecurityModalProps> = ({
  visible,
  onClose,
  onSave,
  initialSettings = {}
}) => {
  const [settings, setSettings] = useState<PrivacySettings>({
    public_profile: false,
    location_sharing: true,
    adventure_sharing_default: true,
    show_in_discover: true,
    allow_friend_requests: true,
    show_real_name: true,
    data_analytics: true,
    personalized_ads: false,
    third_party_sharing: false,
    ...initialSettings
  });

  const handleSave = () => {
    onSave(settings);
    onClose();
  };

  const updateSetting = (key: keyof PrivacySettings, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleDataDeletion = () => {
    Alert.alert(
      'Delete Account Data',
      'This will permanently delete all your data including adventures, preferences, and profile information. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // Implement data deletion logic
            Alert.alert('Data Deletion', 'Feature coming soon. Please contact support for data deletion requests.');
          }
        }
      ]
    );
  };

  const handleDataExport = () => {
    Alert.alert('Export Data', 'Feature coming soon. You will be able to export all your data in JSON format.');
  };

  const PrivacyRow = ({ 
    icon, 
    title, 
    description, 
    settingKey,
    dangerous = false
  }: { 
    icon: string; 
    title: string; 
    description: string; 
    settingKey: keyof PrivacySettings;
    dangerous?: boolean;
  }) => (
    <View className="flex-row justify-between items-center py-4 px-4">
      <View className="flex-1 flex-row items-center">
        <Ionicons name={icon as any} size={20} color={dangerous ? "#EF4444" : "#3c7660"} />
        <View className="ml-3 flex-1">
          <Text className={`text-base font-medium ${dangerous ? 'text-red-600' : 'text-gray-800'}`}>
            {title}
          </Text>
          <Text className="text-sm text-gray-500 mt-1">{description}</Text>
        </View>
      </View>
      <Switch
        value={settings[settingKey]}
        onValueChange={(value) => updateSetting(settingKey, value)}
        trackColor={{ 
          false: '#E5E7EB', 
          true: dangerous ? '#EF4444' : '#3c7660' 
        }}
        thumbColor={settings[settingKey] ? '#ffffff' : '#ffffff'}
      />
    </View>
  );

  const ActionButton = ({ 
    icon, 
    title, 
    description, 
    onPress,
    dangerous = false 
  }: { 
    icon: string; 
    title: string; 
    description: string; 
    onPress: () => void;
    dangerous?: boolean;
  }) => (
    <TouchableOpacity 
      className="flex-row items-center py-4 px-4"
      onPress={onPress}
    >
      <Ionicons name={icon as any} size={20} color={dangerous ? "#EF4444" : "#3c7660"} />
      <View className="ml-3 flex-1">
        <Text className={`text-base font-medium ${dangerous ? 'text-red-600' : 'text-gray-800'}`}>
          {title}
        </Text>
        <Text className="text-sm text-gray-500 mt-1">{description}</Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
    </TouchableOpacity>
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
          <Text className="text-lg font-semibold text-gray-800">Privacy & Security</Text>
          <TouchableOpacity onPress={handleSave}>
            <Text className="text-green-600 font-medium">Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1">
          {/* Profile Privacy */}
          <View className="bg-white mt-4 mx-4 rounded-2xl">
            <View className="p-4 border-b border-gray-100">
              <Text className="text-lg font-semibold text-gray-800">Profile Privacy</Text>
            </View>
            
            <PrivacyRow
              icon="globe"
              title="Public Profile"
              description="Allow others to find and view your profile"
              settingKey="public_profile"
            />
            
            <View className="h-px bg-gray-100 mx-4" />
            
            <PrivacyRow
              icon="person"
              title="Show Real Name"
              description="Display your full name instead of username"
              settingKey="show_real_name"
            />
            
            <View className="h-px bg-gray-100 mx-4" />
            
            <PrivacyRow
              icon="compass"
              title="Show in Discover"
              description="Allow your adventures to appear in community feed"
              settingKey="show_in_discover"
            />
            
            <View className="h-px bg-gray-100 mx-4" />
            
            <PrivacyRow
              icon="people"
              title="Allow Friend Requests"
              description="Let others send you friend requests"
              settingKey="allow_friend_requests"
            />
          </View>

          {/* Adventure Privacy */}
          <View className="bg-white mt-4 mx-4 rounded-2xl">
            <View className="p-4 border-b border-gray-100">
              <Text className="text-lg font-semibold text-gray-800">Adventure Privacy</Text>
            </View>
            
            <PrivacyRow
              icon="location"
              title="Location Sharing"
              description="Share your location for better recommendations"
              settingKey="location_sharing"
            />
            
            <View className="h-px bg-gray-100 mx-4" />
            
            <PrivacyRow
              icon="share"
              title="Default Adventure Sharing"
              description="Make new adventures public by default"
              settingKey="adventure_sharing_default"
            />
          </View>

          {/* Data & Analytics */}
          <View className="bg-white mt-4 mx-4 rounded-2xl">
            <View className="p-4 border-b border-gray-100">
              <Text className="text-lg font-semibold text-gray-800">Data & Analytics</Text>
            </View>
            
            <PrivacyRow
              icon="analytics"
              title="Usage Analytics"
              description="Help improve Motion by sharing usage data"
              settingKey="data_analytics"
            />
            
            <View className="h-px bg-gray-100 mx-4" />
            
            <PrivacyRow
              icon="eye"
              title="Personalized Ads"
              description="Show ads based on your interests"
              settingKey="personalized_ads"
            />
            
            <View className="h-px bg-gray-100 mx-4" />
            
            <PrivacyRow
              icon="business"
              title="Third-party Sharing"
              description="Share data with partner services"
              settingKey="third_party_sharing"
              dangerous={true}
            />
          </View>

          {/* Data Management */}
          <View className="bg-white mt-4 mx-4 rounded-2xl">
            <View className="p-4 border-b border-gray-100">
              <Text className="text-lg font-semibold text-gray-800">Data Management</Text>
            </View>
            
            <ActionButton
              icon="download"
              title="Export My Data"
              description="Download all your data in JSON format"
              onPress={handleDataExport}
            />
            
            <View className="h-px bg-gray-100 mx-4" />
            
            <ActionButton
              icon="trash"
              title="Delete All Data"
              description="Permanently delete your account and all data"
              onPress={handleDataDeletion}
              dangerous={true}
            />
          </View>

          {/* Legal */}
          <View className="bg-white mt-4 mx-4 rounded-2xl mb-6">
            <View className="p-4 border-b border-gray-100">
              <Text className="text-lg font-semibold text-gray-800">Legal</Text>
            </View>
            
            <ActionButton
              icon="document-text"
              title="Privacy Policy"
              description="Read our privacy policy"
              onPress={() => Alert.alert('Privacy Policy', 'Privacy policy will open here')}
            />
            
            <View className="h-px bg-gray-100 mx-4" />
            
            <ActionButton
              icon="shield-checkmark"
              title="Terms of Service"
              description="Read our terms of service"
              onPress={() => Alert.alert('Terms of Service', 'Terms of service will open here')}
            />
          </View>

          {/* Footer spacing */}
          <View className="h-20" />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

export default PrivacySecurityModal;
