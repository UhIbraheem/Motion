import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, View } from 'react-native';

type ButtonVariant = 'primary' | 'secondary' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  className?: string; // Add this line to accept the className prop
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  className = '', // Add default value
}) => {
  // Base classes that apply to all buttons
  let buttonClasses = `flex-row items-center justify-center rounded-full ${className}`;
  let textClasses = 'font-semibold text-center';
  
  // Apply size-specific classes
  switch (size) {
    case 'sm':
      buttonClasses += ' px-4 py-2';
      textClasses += ' text-sm';
      break;
    case 'lg':
      buttonClasses += ' px-8 py-4';
      textClasses += ' text-lg';
      break;
    default: // md
      buttonClasses += ' px-6 py-3';
      textClasses += ' text-base';
  }
  
  // Apply variant-specific classes
  switch (variant) {
    case 'primary':
      buttonClasses += ' bg-brand-gold';
      textClasses += ' text-brand-sage';
      if (disabled) {
        buttonClasses += ' opacity-50';
      }
      break;
    case 'secondary':
      buttonClasses += ' bg-brand-sage';
      textClasses += ' text-white';
      if (disabled) {
        buttonClasses += ' opacity-50';
      }
      break;
    case 'outline':
      buttonClasses += ' border-2 border-brand-sage bg-transparent';
      textClasses += ' text-brand-sage';
      if (disabled) {
        buttonClasses += ' opacity-50';
      }
      break;
  }
  
  return (
    <TouchableOpacity
      className={buttonClasses}
      onPress={onPress}
      disabled={disabled || isLoading}
      activeOpacity={0.8}
    >
      {isLoading ? (
        <ActivityIndicator 
          size="small" 
          color={variant === 'primary' ? '#3c7660' : '#FFFFFF'} 
        />
      ) : (
        <>
          {leftIcon && <View className="mr-2">{leftIcon}</View>}
          <Text className={textClasses}>{title}</Text>
          {rightIcon && <View className="ml-2">{rightIcon}</View>}
        </>
      )}
    </TouchableOpacity>
  );
};

export default Button;