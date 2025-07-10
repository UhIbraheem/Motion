// Update your existing Button.tsx with these additions

import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, View } from 'react-native';

// EXTENDED: Add new button variants for filters
type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'filter' | 'filter-time' | 'filter-restriction' | 'filter-preference' | 'filter-action';
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
  className?: string;
  // NEW: Filter-specific props
  isSelected?: boolean; // For filter buttons
  description?: string; // For action buttons (budget, duration)
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
  className = '',
  isSelected = false,
  description,
}) => {
  // Base classes that apply to all buttons
  let buttonClasses = `flex-row items-center justify-center ${className}`;
  let textClasses = 'font-semibold text-center';
  
  // Apply size-specific classes
  switch (size) {
    case 'sm':
      buttonClasses += ' px-3 py-2';
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
      buttonClasses += ' bg-brand-gold rounded-full';
      textClasses += ' text-brand-sage';
      if (disabled) buttonClasses += ' opacity-50';
      break;
      
    case 'secondary':
      buttonClasses += ' bg-brand-sage rounded-full';
      textClasses += ' text-white';
      if (disabled) buttonClasses += ' opacity-50';
      break;
      
    case 'outline':
      buttonClasses += ' border-2 border-brand-sage bg-transparent rounded-full';
      textClasses += ' text-brand-sage';
      if (disabled) buttonClasses += ' opacity-50';
      break;
      
    // NEW FILTER VARIANTS
    case 'filter':
      // Default filter buttons (Experience Types, Food Preferences)  
      buttonClasses += ` rounded-full border mx-1 mb-2 ${
        disabled
          ? 'bg-gray-100 border-gray-300'
          : isSelected
          ? 'bg-brand-sage border-brand-sage'
          : 'bg-white border-brand-gold shadow-sm'
      }`;
      textClasses = `text-sm font-medium ${
        disabled
          ? 'text-gray-400'
          : isSelected
          ? 'text-white'
          : 'text-brand-sage'
      }`;
      break;

    case 'filter-time':
      // Time buttons with gold border (for start time, end time)
      buttonClasses += ` rounded-full border mx-1 mb-2 ${
        isSelected
          ? 'bg-brand-sage border-brand-sage'
          : 'bg-white border-brand-gold shadow-sm'
      }`;
      textClasses = `text-sm font-medium ${
        isSelected ? 'text-white' : 'text-brand-sage'
      }`;
      break;

    case 'filter-restriction':
      // Dietary restrictions with gold border (consistent with others)
      buttonClasses += ` rounded-full border mx-1 mb-2 ${
        isSelected
          ? 'bg-red-500 border-red-500'
          : 'bg-white border-brand-gold shadow-sm'
      }`;
      textClasses = `text-sm font-medium ${
        isSelected ? 'text-white' : 'text-brand-sage'
      }`;
      break;

    case 'filter-preference':
      // Food preferences with gold border
      buttonClasses += ` rounded-full border mx-1 mb-2 ${
        isSelected
          ? 'bg-brand-teal border-brand-teal'
          : 'bg-white border-brand-gold shadow-sm'
      }`;
      textClasses = `text-sm font-medium ${
        isSelected ? 'text-white' : 'text-brand-sage'
      }`;
      break;

    case 'filter-action':
      // Budget and Duration buttons (rectangular with descriptions)
      buttonClasses += ` rounded-lg border ${
        isSelected
          ? 'bg-brand-sage border-brand-sage'
          : 'bg-white border-brand-gold shadow-sm'
      }`;
      textClasses = `text-base font-bold ${
        isSelected ? 'text-white' : 'text-brand-sage'
      }`;
      break;
    // End of switch
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
        {/* For buttons WITH descriptions (duration, budget) */}
        {description ? (
          <View className="items-center justify-center">
            {leftIcon && <View className="mb-1">{leftIcon}</View>}
            <Text className={`font-bold ${
              isSelected ? 'text-white' : 'text-brand-sage'
            } text-base`}>
              {title}
            </Text>
            <Text className={`text-xs mt-1 text-center ${
              isSelected ? 'text-white' : 'text-brand-sage'
            }`}>
              {description}
            </Text>
            {rightIcon && <View className="mt-1">{rightIcon}</View>}
          </View>
        ) : (
          /* For buttons WITHOUT descriptions (chips) */
          <View className="flex-row items-center">
            {leftIcon && <View className="mr-2">{leftIcon}</View>}
            <Text className={textClasses}>{title}</Text>
            {rightIcon && <View className="ml-2">{rightIcon}</View>}
          </View>
        )}
      </>
    )}
  </TouchableOpacity>
);
};

export default Button;