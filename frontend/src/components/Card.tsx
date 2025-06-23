import React, { ReactNode } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface CardProps {
  children: ReactNode;
  title?: string;
  onPress?: () => void;
  footer?: ReactNode;
  elevated?: boolean;
}

const Card: React.FC<CardProps> = ({ 
  children, 
  title, 
  onPress, 
  footer,
  elevated = false
}) => {
  const cardContent = (
    <View 
      className={`bg-white rounded-xl p-4 overflow-hidden ${
        elevated ? 'shadow-md' : 'border border-gray-200'
      }`}
    >
      {title && (
        <Text className="text-lg font-semibold text-brand-sage mb-2">
          {title}
        </Text>
      )}
      
      <View className="mb-2">
        {children}
      </View>
      
      {footer && (
        <View className="mt-2 pt-2 border-t border-gray-100">
          {footer}
        </View>
      )}
    </View>
  );
  
  if (onPress) {
    return (
      <TouchableOpacity 
        activeOpacity={0.7} 
        onPress={onPress}
        className="mb-4"
      >
        {cardContent}
      </TouchableOpacity>
    );
  }
  
  return <View className="mb-4">{cardContent}</View>;
};

export default Card;