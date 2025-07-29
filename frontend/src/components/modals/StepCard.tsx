// src/components/modals/StepCard.tsx - Individual step card for horizontal scrolling
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  ImageBackground,
  Linking,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { AdventureStep } from './types';
import { getStepImage } from './StepBookingUtils';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface StepCardProps {
  step: AdventureStep;
  index: number;
  themeColors: any;
  onViewStep: () => void;
}

export const StepCard: React.FC<StepCardProps> = ({ step, index, themeColors, onViewStep }) => {
  const stepNumber = index + 1;

  const openGoogleMaps = () => {
    const address = step.location || step.title;
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    Linking.openURL(url);
  };

  const openReservation = () => {
    if (step.booking?.link) {
      Linking.openURL(step.booking.link);
    } else {
      // Default to OpenTable search
      const query = encodeURIComponent(step.title);
      Linking.openURL(`https://www.opentable.com/s?query=${query}`);
    }
  };

  // Check if this step is food/dining related
  const isFoodRelated = (): boolean => {
    const title = step.title?.toLowerCase() || '';
    const location = step.location?.toLowerCase() || '';
    const address = step.address?.toLowerCase() || '';
    
    const foodKeywords = [
      'restaurant', 'cafe', 'coffee', 'lunch', 'dinner', 'brunch', 
      'food', 'drink', 'bar', 'bistro', 'eatery', 'diner', 'grill',
      'kitchen', 'tavern', 'pub', 'brewery', 'winery', 'bakery',
      'pizzeria', 'taco', 'burger', 'sandwich', 'sushi', 'thai',
      'italian', 'mexican', 'chinese', 'indian', 'japanese'
    ];
    
    return foodKeywords.some(keyword => 
      title.includes(keyword) || location.includes(keyword) || address.includes(keyword)
    );
  };

  return (
    <View style={{
      width: SCREEN_WIDTH * 0.8,
      marginRight: 16,
      backgroundColor: themeColors.background?.card || themeColors.cardBackground || '#FFFFFF',
      borderRadius: 16,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: '#D1D5DB',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    }}>
      {/* Step Image */}
      <ImageBackground
        source={{ uri: getStepImage(step.title) }}
        style={{ height: 180 }}
        resizeMode="cover"
      >
        <BlurView
          style={{
            position: 'absolute',
            top: 12,
            left: 12,
            borderRadius: 20,
            borderWidth: 1.5,
            borderColor: 'rgba(255, 215, 0, 0.7)',
            paddingHorizontal: 12,
            paddingVertical: 6,
            overflow: 'hidden',
          }}
          intensity={40}
          experimentalBlurMethod="dimezisBlurView"
        >
          <Text style={{ 
            fontWeight: 'bold', 
            color: '#FFD700', 
            fontSize: 14,
            textShadowColor: 'rgba(0, 0, 0, 0.5)',
            textShadowOffset: { width: 0, height: 1 },
            textShadowRadius: 2,
          }}>
            Step {stepNumber}
          </Text>
        </BlurView>
      </ImageBackground>

      {/* Step Content */}
      <View style={{ padding: 16 }}>
        {/* Place Name */}
        <Text style={{
          fontSize: 18,
          fontWeight: 'bold',
          color: themeColors.text?.primary || themeColors.text || '#000000',
          marginBottom: 8,
        }}>
          {step.title}
        </Text>

        {/* Time and Location */}
        <View style={{ marginBottom: 12 }}>
          <Text style={{ 
            fontSize: 14, 
            color: themeColors.text?.secondary || themeColors.textSecondary || '#666666', 
            marginBottom: 4 
          }}>
            🕐 {step.time}
          </Text>
          {step.location && (
            <Text 
              style={{ 
                fontSize: 14, 
                color: themeColors.text?.secondary || themeColors.textSecondary || '#666666'
              }}
              numberOfLines={2}
            >
              <Ionicons name="location" size={14} color="#6B7280" /> {step.location}
            </Text>
          )}
        </View>

        {/* Hours (if available) */}
        {step.hours && (
          <Text style={{
            fontSize: 14,
            color: themeColors.text?.secondary || themeColors.textSecondary || '#666666',
            marginBottom: 12,
            fontStyle: 'italic'
          }}>
            ⏰ Hours: {step.hours}
          </Text>
        )}

        {/* Action Buttons */}
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
          {/* Reserve Button - Only show for food/dining steps */}
          {step.booking && isFoodRelated() && (
            <TouchableOpacity
              onPress={openReservation}
              style={{
                flex: 1,
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                borderWidth: 1.5,
                borderColor: 'rgba(60, 118, 96, 0.5)',
                borderRadius: 8,
                paddingVertical: 10,
                paddingHorizontal: 8,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text 
                style={{ 
                  fontWeight: '600', 
                  color: themeColors.text?.primary || '#3c7660', 
                  fontSize: 13,
                  textAlign: 'center',
                  lineHeight: 16,
                }}
                numberOfLines={2}
                adjustsFontSizeToFit
              >
                Reserve Table
              </Text>
            </TouchableOpacity>
          )}
          
          {/* View Step Button */}
          <TouchableOpacity
            onPress={onViewStep}
            style={{
              flex: step.booking ? 1 : 1,
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              borderWidth: 1.5,
              borderColor: 'rgba(60, 118, 96, 0.5)',
              borderRadius: 8,
              paddingVertical: 10,
              paddingHorizontal: 8,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text 
              style={{ 
                fontWeight: '600', 
                color: themeColors.text?.primary || '#3c7660', 
                fontSize: 14,
                textAlign: 'center',
              }}
            >
              View Details
            </Text>
          </TouchableOpacity>
        </View>

        {/* Google Maps Button */}
        <TouchableOpacity
          onPress={openGoogleMaps}
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
            borderWidth: 1.5,
            borderColor: 'rgba(60, 118, 96, 0.5)',
            borderRadius: 8,
            paddingVertical: 8,
            paddingHorizontal: 8,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ 
            fontWeight: '500', 
            color: themeColors.text?.primary || '#3c7660', 
            fontSize: 14,
            textAlign: 'center',
          }}>
            <Ionicons name="location" size={14} color="#374151" /> Open in Google Maps
          </Text>
        </TouchableOpacity>

        {/* Address (if different from location) */}
        {step.address && step.address !== step.location && (
          <Text style={{
            fontSize: 12,
            color: themeColors.text?.tertiary || themeColors.textSecondary || '#999999',
            marginTop: 8,
            textAlign: 'center',
            fontStyle: 'italic'
          }}>
            {step.address}
          </Text>
        )}
      </View>
    </View>
  );
};

export default StepCard;
