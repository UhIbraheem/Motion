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
            Alert.alert('Data Deletion', 'Feature coming soon. Please contact support for data deletion requests.');
          }
        }
      ]
    );
  };

  const handleDataExport = () => {
    Alert.alert('Export Data', 'Feature coming soon. You will be able to export all your data in JSON format.');
  };

  const ToggleSection = ({ 
    icon, 
    title, 
    description, 
    value,
    onToggle
  }: { 
    icon: string; 
    title: string; 
    description: string; 
    value: boolean;
    onToggle: (value: boolean) => void;
  }) => (
    <View className="flex-row items-center justify-between py-4 px-4">
      <View className="flex-row items-center flex-1">
        <Ionicons name={icon as any} size={20} color="#3c7660" />
        <View className="ml-3 flex-1">
          <Text className="text-base font-medium text-gray-800">{title}</Text>
          <Text className="text-sm text-gray-500 mt-1">{description}</Text>
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: '#e5e7eb', true: '#10b981' }}
        thumbColor={value ? '#ffffff' : '#ffffff'}
      />
    </View>
  );

  const ActionButton = ({ 
    icon, 
    title, 
    description, 
    onPress,
    destructive = false
  }: { 
    icon: string; 
    title: string; 
    description: string; 
    onPress: () => void;
    destructive?: boolean;
  }) => (
    <TouchableOpacity className="py-4 px-4" onPress={onPress}>
      <View className="flex-row items-center">
        <Ionicons 
          name={icon as any} 
          size={20} 
          color={destructive ? "#dc2626" : "#3c7660"} 
        />
        <View className="ml-3 flex-1">
          <Text className={`text-base font-medium ${destructive ? 'text-red-600' : 'text-gray-800'}`}>
            {title}
          </Text>
          <Text className="text-sm text-gray-500 mt-1">{description}</Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
      </View>
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
            
            <ToggleSection
              icon="person"
              title="Public Profile"
              description="Allow others to view your profile information"
              value={settings.public_profile}
              onToggle={(value) => updateSetting('public_profile', value)}
            />
            
            <View className="h-px bg-gray-100 mx-4" />
            
            <ToggleSection
              icon="person-add"
              title="Allow Friend Requests"
              description="Let other users send you friend requests"
              value={settings.allow_friend_requests}
              onToggle={(value) => updateSetting('allow_friend_requests', value)}
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
              description="Download a copy of all your data"
              onPress={handleDataExport}
            />
            
            <View className="h-px bg-gray-100 mx-4" />
            
            <ActionButton
              icon="trash"
              title="Delete Account Data"
              description="Permanently delete all your data"
              onPress={handleDataDeletion}
              destructive={true}
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
