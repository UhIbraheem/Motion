// src/components/ui/Header.tsx - Reusable header component with logo
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import MotionLogo from './shared/MotionLogo';

interface HeaderProps {
  title?: string;
  showLogo?: boolean;
  leftAction?: {
    icon: string;
    onPress: () => void;
  };
  rightAction?: {
    icon: string;
    onPress: () => void;
  };
  theme?: 'light' | 'dark';
}

const Header: React.FC<HeaderProps> = ({
  title,
  showLogo = true,
  leftAction,
  rightAction,
  theme = 'light'
}) => {
  const bgColor = theme === 'light' ? 'bg-brand-cream' : 'bg-brand-sage-dark';
  const textColor = theme === 'light' ? 'text-brand-sage' : 'text-brand-cream';

  return (
    <View className={`${bgColor} px-4 py-3 flex-row items-center justify-between border-b border-brand-light`}>
      {/* Left Action */}
      <View className="w-10">
        {leftAction && (
          <TouchableOpacity onPress={leftAction.onPress} className="w-10 h-10 justify-center items-center">
            <Text className="text-xl">{leftAction.icon}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Center - Logo or Title */}
      <View className="flex-1 items-center">
        {showLogo ? (
          <MotionLogo size="sm" variant="icon" theme={theme} />
        ) : (
          <Text className={`${textColor} text-lg font-semibold`}>
            {title}
          </Text>
        )}
      </View>

      {/* Right Action */}
      <View className="w-10">
        {rightAction && (
          <TouchableOpacity onPress={rightAction.onPress} className="w-10 h-10 justify-center items-center">
            <Text className="text-xl">{rightAction.icon}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default Header;