import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AppPreferences {
  distance_unit: 'miles' | 'kilometers';
  budget_display: 'symbols' | 'numbers';
  theme_preference: 'light' | 'dark' | 'auto';
  default_adventure_privacy: 'public' | 'private' | 'friends';
  language: string;
  currency: string;
  time_format: '12h' | '24h';
  map_style: 'standard' | 'satellite' | 'hybrid';
}

interface PreferencesModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (preferences: AppPreferences) => void;
  initialPreferences?: Partial<AppPreferences>;
}

const NewPreferencesModal: React.FC<PreferencesModalProps> = ({
  visible,
  onClose,
  onSave,
  initialPreferences = {}
}) => {
  const [preferences, setPreferences] = useState<AppPreferences>({
    distance_unit: 'miles',
    budget_display: 'symbols',
    theme_preference: 'light',
    default_adventure_privacy: 'public',
    language: 'English',
    currency: 'USD',
    time_format: '12h',
    map_style: 'standard',
    ...initialPreferences
  });

  const handleSave = () => {
    onSave(preferences);
    onClose();
  };

  const updatePreference = <K extends keyof AppPreferences>(
    key: K, 
    value: AppPreferences[K]
  ) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
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
          <Text className="text-lg font-semibold text-gray-800">Preferences</Text>
          <TouchableOpacity onPress={handleSave}>
            <Text className="text-green-600 font-medium">Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1">
          {/* Display & Units */}
          <View className="bg-white mt-4 mx-4 rounded-2xl">
            <View className="p-4 border-b border-gray-100">
              <Text className="text-lg font-semibold text-gray-800">Display & Units</Text>
            </View>
            
            <SelectionRow
              icon="resize"
              title="Distance Unit"
              description="Choose how distances are displayed"
              currentValue={preferences.distance_unit}
              options={[
                { label: 'Miles', value: 'miles' },
                { label: 'Kilometers', value: 'kilometers' }
              ]}
              onSelect={(value) => updatePreference('distance_unit', value as 'miles' | 'kilometers')}
            />
            
            <View className="h-px bg-gray-100 mx-4" />
            
            <SelectionRow
              icon="card"
              title="Budget Display"
              description="How adventure costs are shown"
              currentValue={preferences.budget_display}
              options={[
                { label: '$ $$ $$$', value: 'symbols' },
                { label: '$10-50', value: 'numbers' }
              ]}
              onSelect={(value) => updatePreference('budget_display', value as 'symbols' | 'numbers')}
            />
            
            <View className="h-px bg-gray-100 mx-4" />
            
            <SelectionRow
              icon="time"
              title="Time Format"
              description="12-hour or 24-hour time display"
              currentValue={preferences.time_format}
              options={[
                { label: '12 Hour', value: '12h' },
                { label: '24 Hour', value: '24h' }
              ]}
              onSelect={(value) => updatePreference('time_format', value as '12h' | '24h')}
            />
          </View>

          {/* Adventure Defaults */}
          <View className="bg-white mt-4 mx-4 rounded-2xl">
            <View className="p-4 border-b border-gray-100">
              <Text className="text-lg font-semibold text-gray-800">Adventure Defaults</Text>
            </View>
            
            <SelectionRow
              icon="eye"
              title="Default Privacy"
              description="Default visibility for new adventures"
              currentValue={preferences.default_adventure_privacy}
              options={[
                { label: 'Public', value: 'public' },
                { label: 'Friends', value: 'friends' },
                { label: 'Private', value: 'private' }
              ]}
              onSelect={(value) => updatePreference('default_adventure_privacy', value as any)}
            />
            
            <View className="h-px bg-gray-100 mx-4" />
            
            <SelectionRow
              icon="map"
              title="Map Style"
              description="Default map appearance"
              currentValue={preferences.map_style}
              options={[
                { label: 'Standard', value: 'standard' },
                { label: 'Satellite', value: 'satellite' },
                { label: 'Hybrid', value: 'hybrid' }
              ]}
              onSelect={(value) => updatePreference('map_style', value as any)}
            />
          </View>

          {/* Appearance */}
          <View className="bg-white mt-4 mx-4 rounded-2xl">
            <View className="p-4 border-b border-gray-100">
              <Text className="text-lg font-semibold text-gray-800">Appearance</Text>
            </View>
            
            <SelectionRow
              icon="contrast"
              title="Theme"
              description="App appearance and color scheme"
              currentValue={preferences.theme_preference}
              options={[
                { label: 'Light', value: 'light' },
                { label: 'Dark', value: 'dark' },
                { label: 'Auto', value: 'auto' }
              ]}
              onSelect={(value) => updatePreference('theme_preference', value as any)}
            />
          </View>

          {/* Localization */}
          <View className="bg-white mt-4 mx-4 rounded-2xl mb-6">
            <View className="p-4 border-b border-gray-100">
              <Text className="text-lg font-semibold text-gray-800">Localization</Text>
            </View>
            
            <SelectionRow
              icon="language"
              title="Language"
              description="App display language"
              currentValue={preferences.language}
              options={[
                { label: 'English', value: 'English' },
                { label: 'Spanish', value: 'Spanish' },
                { label: 'French', value: 'French' },
                { label: 'German', value: 'German' }
              ]}
              onSelect={(value) => updatePreference('language', value)}
            />
            
            <View className="h-px bg-gray-100 mx-4" />
            
            <SelectionRow
              icon="card"
              title="Currency"
              description="Default currency for costs"
              currentValue={preferences.currency}
              options={[
                { label: 'USD ($)', value: 'USD' },
                { label: 'EUR (€)', value: 'EUR' },
                { label: 'GBP (£)', value: 'GBP' },
                { label: 'CAD (C$)', value: 'CAD' }
              ]}
              onSelect={(value) => updatePreference('currency', value)}
            />
          </View>

          {/* Footer spacing */}
          <View className="h-20" />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

export default NewPreferencesModal;
