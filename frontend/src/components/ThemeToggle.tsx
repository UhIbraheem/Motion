// src/components/ThemeToggle.tsx - Dark Mode Toggle Button
import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
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
        {theme === 'dark' ? '☀️' : '🌙'}
      </Text>
    </TouchableOpacity>
  );
};

export default ThemeToggle;