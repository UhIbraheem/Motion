// src/components/modals/StepBookingUtils.tsx - Booking utilities and components for steps
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { typography, spacing, borderRadius } from '../../constants/Theme';
import { AdventureStep } from './types';

// Get appropriate image for step type
export const getStepImage = (stepTitle: string): string => {
  const title = stepTitle.toLowerCase();
  
  if (title.includes('restaurant') || title.includes('food') || title.includes('eat') || title.includes('dine')) {
    return 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=400&fit=crop&q=80';
  } else if (title.includes('museum') || title.includes('gallery') || title.includes('art')) {
    return 'https://images.unsplash.com/photo-1533929736458-ca588d08c8be?w=600&h=400&fit=crop&q=80';
  } else if (title.includes('park') || title.includes('garden') || title.includes('outdoor')) {
    return 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&h=400&fit=crop&q=80';
  } else if (title.includes('shop') || title.includes('store') || title.includes('market')) {
    return 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=400&fit=crop&q=80';
  } else if (title.includes('coffee') || title.includes('cafe')) {
    return 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&h=400&fit=crop&q=80';
  } else if (title.includes('concert') || title.includes('music') || title.includes('event')) {
    return 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=600&h=400&fit=crop&q=80';
  } else if (title.includes('bar') || title.includes('drink') || title.includes('cocktail')) {
    return 'https://images.unsplash.com/photo-1544785349-c4a5301826fd?w=600&h=400&fit=crop&q=80';
  }
  
  return 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600&h=400&fit=crop&q=80';
};

// Check if booking info should be displayed
export const shouldShowBookingInfo = (booking: any) => {
  if (!booking || !booking.method) return false;
  
  const bookingText = booking.method.toLowerCase();
  const fallbackText = booking.fallback?.toLowerCase() || '';
  
  // Check if it requires reservation
  const requiresReservation = bookingText.includes('reservation') || 
                            bookingText.includes('book') || 
                            bookingText.includes('advance') ||
                            fallbackText.includes('reservation') ||
                            fallbackText.includes('book') ||
                            fallbackText.includes('advance');
  
  // Check if it has online reservation systems
  const hasOnlineReservation = bookingText.includes('opentable') || 
                             bookingText.includes('google') ||
                             bookingText.includes('resy') ||
                             bookingText.includes('yelp');
  
  // Don't show booking section if it accepts walk-ins
  if (!requiresReservation && (fallbackText.includes('walk') || fallbackText.includes('no reservation'))) {
    return false;
  }
  
  const phoneMatch = booking?.fallback?.match(/(\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/);
  
  return requiresReservation || hasOnlineReservation || phoneMatch;
};

// Check if this step is food/dining related
export const isFoodRelated = (step: AdventureStep): boolean => {
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

// Booking Section Component
interface BookingSectionProps {
  step: AdventureStep;
  themeColors: any;
}

export const BookingSection: React.FC<BookingSectionProps> = ({
  step,
  themeColors,
}) => {
  if (!step.booking || !shouldShowBookingInfo(step.booking) || !isFoodRelated(step)) {
    return null;
  }

  const bookingText = step.booking.method?.toLowerCase() || '';
  const fallbackText = step.booking.fallback?.toLowerCase() || '';
  
  const requiresReservation = bookingText.includes('reservation') || 
                            bookingText.includes('book') || 
                            bookingText.includes('ticket') ||
                            fallbackText.includes('reservation') ||
                            fallbackText.includes('book') ||
                            fallbackText.includes('ticket');

  const phoneMatch = step.booking.fallback?.match(/(\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/);

  return (
    <View style={{
      marginTop: spacing.md,
      paddingTop: spacing.md,
      borderTopWidth: 1,
      borderTopColor: themeColors.brand.gold + '30',
    }}>
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.sm,
      }}>
        <Ionicons 
          name="restaurant-outline" 
          size={18} 
          color={themeColors.brand.gold} 
          style={{ marginRight: spacing.xs }}
        />
        <Text style={{
          ...typography.subheading,
          color: themeColors.brand.gold,
          fontSize: 16,
          fontWeight: '600',
        }}>
          {requiresReservation ? 'Reservation Required' : 'Booking Info'}
        </Text>
      </View>

      <Text style={{
        ...typography.body,
        color: themeColors.text.secondary,
        marginBottom: spacing.sm,
        lineHeight: 20,
      }}>
        {step.booking.method}
      </Text>

      <View style={{
        flexDirection: 'row',
        gap: spacing.sm,
      }}>
        {step.booking.link && (
          <TouchableOpacity
            onPress={() => {
              if (step.booking?.link) {
                Linking.openURL(step.booking.link).catch(() => {
                  Alert.alert('Error', 'Could not open the booking link');
                });
              }
            }}
            style={{
              flex: 1,
              backgroundColor: themeColors.brand.gold,
              paddingVertical: spacing.sm,
              borderRadius: borderRadius.md,
              alignItems: 'center',
            }}
          >
            <Text style={{
              ...typography.small,
              fontWeight: '600',
              color: 'white',
            }}>
              Book Online
            </Text>
          </TouchableOpacity>
        )}

        {phoneMatch && (
          <TouchableOpacity
            onPress={() => {
              const phoneNumber = phoneMatch[1].replace(/[-.\s]/g, '');
              Linking.openURL(`tel:${phoneNumber}`).catch(() => {
                Alert.alert('Error', 'Could not open the phone dialer');
              });
            }}
            style={{
              flex: 1,
              backgroundColor: 'transparent',
              borderWidth: 1,
              borderColor: themeColors.brand.gold,
              paddingVertical: spacing.sm,
              borderRadius: borderRadius.md,
              alignItems: 'center',
            }}
          >
            <Text style={{
              ...typography.small,
              fontWeight: '600',
              color: themeColors.brand.gold,
            }}>
              Call
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};
