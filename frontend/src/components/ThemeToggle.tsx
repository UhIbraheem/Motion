// src/components/ThemeToggle.tsx - Dark Mode Toggle Button
import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <TouchableOpacity
      onPress={toggleTheme}
      className={`p-3 rounded-full ${
        theme === 'dark' ? 'bg-brand-gold' : 'bg-brand-sage'
      }`}
    >
      <Text className="text-lg">
        <Ionicons name={theme === 'dark' ? 'sunny' : 'moon'} size={20} color={theme === 'dark' ? '#FFA500' : '#4A90E2'} />
      </Text>
    </TouchableOpacity>
  );
};

export default ThemeToggle;