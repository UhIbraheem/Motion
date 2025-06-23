import React from 'react';
import { View, TextInput, Text, TextInputProps } from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  ...props
}) => {
  return (
    <View className="mb-4">
      {label && (
        <Text className="text-brand-sage text-sm font-medium mb-1.5">
          {label}
        </Text>
      )}
      
      <View className="relative flex-row items-center">
        {leftIcon && (
          <View className="absolute left-3 z-10">
            {leftIcon}
          </View>
        )}
        
        <TextInput
          className={`w-full bg-white rounded-lg border ${
            error 
              ? 'border-red-500' 
              : 'border-gray-300'
          } px-4 py-3 text-brand-sage ${
            leftIcon ? 'pl-10' : ''
          } ${
            rightIcon ? 'pr-10' : ''
          }`}
          placeholderTextColor="#999999"
          {...props}
        />
        
        {rightIcon && (
          <View className="absolute right-3 z-10">
            {rightIcon}
          </View>
        )}
      </View>
      
      {error && (
        <Text className="text-red-500 text-xs mt-1">
          {error}
        </Text>
      )}
      
      {helperText && !error && (
        <Text className="text-brand-teal text-xs mt-1">
          {helperText}
        </Text>
      )}
    </View>
  );
};

export default Input;