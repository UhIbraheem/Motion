// src/components/modals/AdventureInfoSection.tsx - Adventure header with duration, budget, and schedule
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { typography, spacing, borderRadius } from '../../constants/Theme';
import { Adventure } from './types';

interface AdventureInfoSectionProps {
  adventure: Adventure;
  themeColors: any;
  formatDate: (dateString: string) => string;
  formatDuration: (hours: number) => string;
  formatCost: (cost: number) => string;
  onSchedulePress: () => void;
}

export const AdventureInfoSection: React.FC<AdventureInfoSectionProps> = ({
  adventure,
  themeColors,
  formatDate,
  formatDuration,
  formatCost,
  onSchedulePress,
}) => {
  return (
    <View>
      {/* Adventure Title and Description */}
      <View style={{
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: themeColors.text.tertiary + '20',
      }}>
        <Text style={{
          ...typography.title,
          color: themeColors.text.primary,
          marginBottom: spacing.xs,
        }}>
          {adventure.title}
        </Text>
        <Text style={{
          ...typography.body,
          color: themeColors.text.secondary,
          lineHeight: 22,
        }}>
          {adventure.description}
        </Text>
      </View>

      {/* Adventure Info Cards */}
      <View style={{
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
      }}>
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginBottom: spacing.lg,
        }}>
          {/* Duration Card */}
          <View style={{
            flex: 1,
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
            padding: spacing.sm, // Reduced padding
            borderRadius: borderRadius.md,
            marginRight: spacing.sm,
            alignItems: 'center',
            borderWidth: 1.5,
            borderColor: 'rgba(60, 118, 96, 0.5)',
          }}>
            <Text style={{
              ...typography.small,
              color: themeColors.text.tertiary,
              marginBottom: spacing.xs,
              fontSize: 12, // Smaller text
            }}>
              Duration
            </Text>
            <Text style={{
              ...typography.body,
              fontWeight: '600',
              color: themeColors.text?.primary || themeColors.brand.sage,
              fontSize: 14, // Smaller text
            }}>
              {formatDuration(adventure.duration_hours)}
            </Text>
          </View>

          {/* Budget Card */}
          <View style={{
            flex: 1,
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
            padding: spacing.sm, // Reduced padding
            borderRadius: borderRadius.md,
            marginLeft: spacing.sm,
            alignItems: 'center',
            borderWidth: 1.5,
            borderColor: 'rgba(60, 118, 96, 0.5)',
          }}>
            <Text style={{
              ...typography.small,
              color: themeColors.text.tertiary,
              marginBottom: spacing.xs,
              fontSize: 12, // Smaller text
            }}>
              Budget
            </Text>
            <Text style={{
              ...typography.body,
              fontWeight: '600',
              color: themeColors.text?.primary || themeColors.brand.gold,
              fontSize: 14, // Smaller text
            }}>
              {formatCost(adventure.estimated_cost)}
            </Text>
          </View>
        </View>

        {/* Scheduled Date (if exists) */}
        {adventure.scheduled_for && (
          <View style={{
            backgroundColor: themeColors.brand.sage + '10',
            padding: spacing.md,
            borderRadius: borderRadius.md,
            marginBottom: spacing.md,
            borderWidth: 1,
            borderColor: themeColors.brand.sage + '30',
          }}>
            <Text style={{
              ...typography.body,
              fontWeight: '600',
              color: themeColors.brand.sage,
              textAlign: 'center',
            }}>
              📅 Scheduled for {formatDate(adventure.scheduled_for)}
            </Text>
          </View>
        )}

        {/* Schedule Button - Only show for non-completed adventures */}
        {!adventure.is_completed && (
          <TouchableOpacity
            onPress={onSchedulePress}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              borderWidth: 1.5,
              borderColor: 'rgba(60, 118, 96, 0.5)',
              paddingVertical: spacing.md,
              borderRadius: borderRadius.lg,
              alignItems: 'center',
              marginBottom: spacing.sm,
            }}
          >
            <Text style={{
              ...typography.body,
              fontWeight: '600',
              color: themeColors.text?.primary || '#3c7660',
            }}>
              {adventure.scheduled_for ? 'Reschedule Adventure' : 'Schedule Adventure'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default AdventureInfoSection;
