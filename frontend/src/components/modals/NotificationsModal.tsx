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

  const NotificationRow = ({ 
    icon, 
    title, 
    description, 
    settingKey 
  }: { 
    icon: string; 
    title: string; 
    description: string; 
    settingKey: keyof NotificationSettings;
  }) => (
    <View className="flex-row justify-between items-center py-3">
      <View className="flex-1 flex-row items-center">
        <Ionicons name={icon as any} size={20} color="#3c7660" />
        <View className="ml-3 flex-1">
          <Text className="text-base font-medium text-text-primary">{title}</Text>
          <Text className="text-sm text-text-secondary mt-1">{description}</Text>
        </View>
      </View>
      <Switch
        value={settings[settingKey]}
        onValueChange={(value) => updateSetting(settingKey, value)}
        trackColor={{ false: '#E5E7EB', true: '#3c7660' }}
        thumbColor={settings[settingKey] ? '#ffffff' : '#ffffff'}
      />
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
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
            <Text className="text-2xl font-bold text-text-primary">Notifications</Text>
            <TouchableOpacity
              onPress={handleSave}
              className="px-4 py-2 bg-brand-sage rounded-lg"
            >
              <Text className="text-brand-cream font-medium">Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView 
            className="flex-1 px-6" 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 120 }}
          >
          {/* Adventure Notifications */}
          <View className="bg-background-subtle rounded-xl p-4 mb-4">
            <Text className="text-lg font-semibold text-text-primary mb-4">Adventure Updates</Text>
            
            <NotificationRow
              icon="compass"
              title="Adventure Notifications"
              description="Get notified about your planned adventures"
              settingKey="adventure_notifications"
            />
            
            <View className="h-px bg-gray-200 my-2" />
            
            <NotificationRow
              icon="time"
              title="Adventure Reminders"
              description="Reminders for upcoming adventures"
              settingKey="adventure_reminders"
            />
            
            <View className="h-px bg-gray-100 mx-4" />
            
            <NotificationRow
              icon="people"
              title="Community Updates"
              description="New adventures shared by the community"
              settingKey="community_updates"
            />
          </View>

          {/* Personal Notifications */}
          <View className="bg-white mt-4 mx-4 rounded-2xl">
            <View className="p-4 border-b border-gray-100">
              <Text className="text-lg font-semibold text-gray-800">Personal</Text>
            </View>
            
            <NotificationRow
              icon="star"
              title="Weekly Suggestions"
              description="Personalized adventure recommendations"
              settingKey="weekly_suggestions"
            />
            
            <View className="h-px bg-gray-100 mx-4" />
            
            <NotificationRow
              icon="heart"
              title="Social Interactions"
              description="Likes, comments, and follows"
              settingKey="social_interactions"
            />
          </View>

          {/* Delivery Methods */}
          <View className="bg-white mt-4 mx-4 rounded-2xl">
            <View className="p-4 border-b border-gray-100">
              <Text className="text-lg font-semibold text-gray-800">Delivery Methods</Text>
            </View>
            
            <NotificationRow
              icon="phone-portrait"
              title="Push Notifications"
              description="Notifications on your device"
              settingKey="push_notifications"
            />
            
            <View className="h-px bg-gray-100 mx-4" />
            
            <NotificationRow
              icon="mail"
              title="Email Notifications"
              description="Updates sent to your email"
              settingKey="email_notifications"
            />
            
            <View className="h-px bg-gray-100 mx-4" />
            
            <NotificationRow
              icon="chatbubble"
              title="SMS Notifications"
              description="Text messages for urgent updates"
              settingKey="sms_notifications"
            />
          </View>

          {/* Marketing */}
          <View className="bg-white mt-4 mx-4 rounded-2xl mb-6">
            <View className="p-4 border-b border-gray-100">
              <Text className="text-lg font-semibold text-gray-800">Marketing</Text>
            </View>
            
            <NotificationRow
              icon="megaphone"
              title="Marketing Emails"
              description="Special offers and product updates"
              settingKey="marketing_emails"
            />
          </View>

          {/* Footer spacing */}
          <View className="h-20" />
        </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default NotificationsModal;
