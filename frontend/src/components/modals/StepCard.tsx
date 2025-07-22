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

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface StepCardProps {
  step: AdventureStep;
  index: number;
  themeColors: any;
  onViewStep: () => void;
}

// Function to get appropriate image for step type
const getStepImage = (stepTitle: string): string => {
  const title = stepTitle.toLowerCase();
  
  if (title.includes('restaurant') || title.includes('food') || title.includes('eat') || title.includes('dine')) {
    return 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop&q=80';
  } else if (title.includes('museum') || title.includes('gallery') || title.includes('art')) {
    return 'https://images.unsplash.com/photo-1533929736458-ca588d08c8be?w=400&h=300&fit=crop&q=80';
  } else if (title.includes('park') || title.includes('garden') || title.includes('outdoor')) {
    return 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop&q=80';
  } else if (title.includes('shop') || title.includes('store') || title.includes('market')) {
    return 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop&q=80';
  } else if (title.includes('coffee') || title.includes('cafe')) {
    return 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&h=300&fit=crop&q=80';
  } else if (title.includes('concert') || title.includes('music') || title.includes('event')) {
    return 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=400&h=300&fit=crop&q=80';
  } else if (title.includes('bar') || title.includes('drink') || title.includes('cocktail')) {
    return 'https://images.unsplash.com/photo-1544785349-c4a5301826fd?w=400&h=300&fit=crop&q=80';
  }
  
  // Default fallback
  return 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=300&fit=crop&q=80';
};

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

  return (
    <View style={{
      width: SCREEN_WIDTH * 0.8,
      marginRight: 16,
      backgroundColor: themeColors.background?.card || themeColors.cardBackground || '#FFFFFF',
      borderRadius: 16,
      overflow: 'hidden',
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
          {/* Reserve Button */}
          {step.booking && (
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
            <Ionicons name="location" size={14} color="white" /> Open in Google Maps
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
