import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  Switch,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface NotificationSettings {
  adventure_notifications: boolean;
  community_updates: boolean;
  weekly_suggestions: boolean;
  adventure_reminders: boolean;
  social_interactions: boolean;
  marketing_emails: boolean;
  push_notifications: boolean;
  email_notifications: boolean;
  sms_notifications: boolean;
}

interface NotificationsModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (settings: NotificationSettings) => void;
  initialSettings?: Partial<NotificationSettings>;
}

const NotificationsModal: React.FC<NotificationsModalProps> = ({
  visible,
  onClose,
  onSave,
  initialSettings = {}
}) => {
  const [settings, setSettings] = useState<NotificationSettings>({
    adventure_notifications: true,
    community_updates: true,
    weekly_suggestions: false,
    adventure_reminders: true,
    social_interactions: true,
    marketing_emails: false,
    push_notifications: true,
    email_notifications: true,
    sms_notifications: false,
    ...initialSettings
  });

  const handleSave = () => {
    onSave(settings);
    onClose();
  };

  const updateSetting = (key: keyof NotificationSettings, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
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
          <Text className="text-lg font-semibold text-gray-800">Notifications</Text>
          <TouchableOpacity onPress={handleSave}>
            <Text className="text-green-600 font-medium">Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1">
          {/* Adventure Notifications */}
          <View className="bg-white mt-4 mx-4 rounded-2xl">
            <View className="p-4 border-b border-gray-100">
              <Text className="text-lg font-semibold text-gray-800">Adventure Notifications</Text>
            </View>
            
            <ToggleSection
              icon="compass"
              title="Adventure Updates"
              description="Get notified about your scheduled adventures"
              value={settings.adventure_notifications}
              onToggle={(value) => updateSetting('adventure_notifications', value)}
            />
            
            <View className="h-px bg-gray-100 mx-4" />
            
            <ToggleSection
              icon="alarm"
              title="Adventure Reminders"
              description="Receive reminders before your adventures"
              value={settings.adventure_reminders}
              onToggle={(value) => updateSetting('adventure_reminders', value)}
            />
            
            <View className="h-px bg-gray-100 mx-4" />
            
            <ToggleSection
              icon="bulb"
              title="Weekly Suggestions"
              description="Get personalized adventure suggestions weekly"
              value={settings.weekly_suggestions}
              onToggle={(value) => updateSetting('weekly_suggestions', value)}
            />
          </View>

          {/* Social Notifications */}
          <View className="bg-white mt-4 mx-4 rounded-2xl">
            <View className="p-4 border-b border-gray-100">
              <Text className="text-lg font-semibold text-gray-800">Social Notifications</Text>
            </View>
            
            <ToggleSection
              icon="people"
              title="Social Interactions"
              description="Get notified about likes, comments, and follows"
              value={settings.social_interactions}
              onToggle={(value) => updateSetting('social_interactions', value)}
            />
            
            <View className="h-px bg-gray-100 mx-4" />
            
            <ToggleSection
              icon="megaphone"
              title="Community Updates"
              description="Stay updated with community news and events"
              value={settings.community_updates}
              onToggle={(value) => updateSetting('community_updates', value)}
            />
          </View>

          {/* Delivery Methods */}
          <View className="bg-white mt-4 mx-4 rounded-2xl">
            <View className="p-4 border-b border-gray-100">
              <Text className="text-lg font-semibold text-gray-800">Delivery Methods</Text>
            </View>
            
            <ToggleSection
              icon="notifications"
              title="Push Notifications"
              description="Receive notifications on your device"
              value={settings.push_notifications}
              onToggle={(value) => updateSetting('push_notifications', value)}
            />
            
            <View className="h-px bg-gray-100 mx-4" />
            
            <ToggleSection
              icon="mail"
              title="Email Notifications"
              description="Receive notifications via email"
              value={settings.email_notifications}
              onToggle={(value) => updateSetting('email_notifications', value)}
            />
            
            <View className="h-px bg-gray-100 mx-4" />
            
            <ToggleSection
              icon="chatbubble"
              title="SMS Notifications"
              description="Receive notifications via text message"
              value={settings.sms_notifications}
              onToggle={(value) => updateSetting('sms_notifications', value)}
            />
          </View>

          {/* Marketing */}
          <View className="bg-white mt-4 mx-4 rounded-2xl">
            <View className="p-4 border-b border-gray-100">
              <Text className="text-lg font-semibold text-gray-800">Marketing</Text>
            </View>
            
            <ToggleSection
              icon="trending-up"
              title="Marketing Emails"
              description="Receive promotional content and offers"
              value={settings.marketing_emails}
              onToggle={(value) => updateSetting('marketing_emails', value)}
            />
          </View>

          {/* Footer spacing */}
          <View className="h-20" />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

export default NotificationsModal;
