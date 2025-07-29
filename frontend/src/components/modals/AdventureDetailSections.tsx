// src/components/modals/AdventureDetailSections.tsx - Combined adventure detail sections
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { typography, spacing, borderRadius } from '../../constants/Theme';
import { Adventure, AdventureStep } from './types';
import { formatScheduledDate } from '../../utils/formatters';
import { StepCard } from './StepCard';
import StepDetailModal from './StepDetailModal';

// Adventure Info Section Props
interface AdventureInfoSectionProps {
  adventure: Adventure;
  themeColors: any;
  formatDate: (dateString: string) => string;
  formatDuration: (hours: number) => string;
  formatCost: (cost: number) => string;
  onSchedulePress: () => void;
}

// Horizontal Steps Section Props
interface HorizontalStepsSectionProps {
  steps: AdventureStep[];
  themeColors: any;
  title?: string;
  onStepToggle?: (stepIndex: number, completed: boolean) => void;
  onViewAllPress?: () => void;
}

// Adventure Info Section Component
export const AdventureInfoSection: React.FC<AdventureInfoSectionProps> = ({
  adventure,
  themeColors,
  formatDate,
  formatDuration,
  formatCost,
  onSchedulePress,
}) => {
  // Format first step start time for scheduling display
  const getFirstStepStartTime = () => {
    if (adventure.steps && adventure.steps.length > 0) {
      const firstStep = adventure.steps[0];
      if (firstStep.time) {
        // Parse time like "10:00 AM" or "10:00"
        try {
          const time = new Date(`2000-01-01T${firstStep.time.replace(/\s*(AM|PM)\s*/i, '')}`);
          return time.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
          });
        } catch {
          // If parsing fails, return the original time string
          return firstStep.time;
        }
      }
    }
    return null;
  };

  const firstStepTime = getFirstStepStartTime();

  return (
    <View style={{ paddingHorizontal: spacing.lg, paddingTop: 0 }}>
      {/* Adventure Title */}
      <Text style={{
        ...typography.title,
        fontSize: 26,
        fontWeight: '700',
        color: themeColors.text.primary,
        marginBottom: spacing.xs,
        lineHeight: 32,
        letterSpacing: -0.5,
      }}>
        {adventure.title}
      </Text>

      {/* Adventure Description / Review */}
      {adventure.review ? (
        <View style={{ marginBottom: spacing.lg }}>
          <Text style={{
            ...typography.caption,
            fontSize: 12,
            color: themeColors.text.tertiary,
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: 0.5,
            marginBottom: spacing.xs,
          }}>
            Review
          </Text>
          <Text style={{
            ...typography.body,
            fontSize: 15,
            color: themeColors.text.secondary,
            lineHeight: 22,
            fontWeight: '400',
            marginBottom: spacing.xs,
          }}>
            {adventure.review}
          </Text>
          {adventure.creator_name && (
            <Text style={{
              ...typography.caption,
              fontSize: 12,
              color: themeColors.text.tertiary,
              fontStyle: 'italic',
            }}>
              - {adventure.creator_name}
            </Text>
          )}
        </View>
      ) : (
        <Text style={{
          ...typography.body,
          fontSize: 15,
          color: themeColors.text.secondary,
          lineHeight: 22,
          marginBottom: spacing.lg,
          fontWeight: '400',
        }}>
          {adventure.description}
        </Text>
      )}

      {/* Modern Stats Row */}
      <View style={{
        flexDirection: 'row',
        marginBottom: spacing.lg,
        gap: spacing.md,
      }}>
        {/* Duration Stat */}
        <View style={{
          flex: 1,
          backgroundColor: themeColors.brand.sage + '08',
          borderRadius: borderRadius.md,
          padding: spacing.md,
          borderLeftWidth: 3,
          borderLeftColor: themeColors.brand.sage,
        }}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: spacing.xs,
          }}>
            <Ionicons 
              name="time-outline" 
              size={18} 
              color={themeColors.brand.sage} 
              style={{ marginRight: spacing.xs }}
            />
            <Text style={{
              ...typography.caption,
              color: themeColors.brand.sage,
              fontSize: 11,
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}>
              Duration
            </Text>
          </View>
          <Text style={{
            ...typography.body,
            fontWeight: '700',
            color: themeColors.text.primary,
            fontSize: 16,
          }}>
            {formatDuration(adventure.duration_hours)}
          </Text>
        </View>
        
        {/* Budget Stat */}
        <View style={{
          flex: 1,
          backgroundColor: themeColors.brand.gold + '08',
          borderRadius: borderRadius.md,
          padding: spacing.md,
          borderLeftWidth: 3,
          borderLeftColor: themeColors.brand.gold,
        }}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: spacing.xs,
          }}>
            <Ionicons 
              name="card-outline" 
              size={18} 
              color={themeColors.brand.gold} 
              style={{ marginRight: spacing.xs }}
            />
            <Text style={{
              ...typography.caption,
              color: themeColors.brand.gold,
              fontSize: 11,
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}>
              Budget
            </Text>
          </View>
          <Text style={{
            ...typography.body,
            fontWeight: '700',
            color: themeColors.text.primary,
            fontSize: 16,
          }}>
            {formatCost(adventure.estimated_cost)}
          </Text>
        </View>
      </View>

      {/* Modern Schedule Section */}
      <View style={{
        marginBottom: spacing.lg,
      }}>
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: spacing.md,
        }}>
          <Text style={{
            ...typography.body,
            fontSize: 18,
            fontWeight: '600',
            color: themeColors.text.primary,
            letterSpacing: -0.3,
          }}>
            Schedule
          </Text>
          <TouchableOpacity 
            onPress={onSchedulePress}
            style={{
              backgroundColor: themeColors.brand.sage,
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.sm,
              borderRadius: borderRadius.lg,
              shadowColor: themeColors.brand.sage,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            <Text style={{
              ...typography.caption,
              color: 'white',
              fontWeight: '600',
              fontSize: 13,
            }}>
              {adventure.scheduled_for ? 'Reschedule' : 'Schedule'}
            </Text>
          </TouchableOpacity>
        </View>

        {adventure.scheduled_for ? (
          <View style={{
            backgroundColor: themeColors.background.primary,
            borderRadius: borderRadius.lg,
            padding: spacing.lg,
            borderWidth: 1,
            borderColor: themeColors.brand.sage + '20',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
            elevation: 1,
          }}>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <View style={{ flex: 1 }}>
                <Text style={{
                  ...typography.body,
                  color: themeColors.text.primary,
                  fontWeight: '600',
                  fontSize: 16,
                  marginBottom: spacing.xs,
                }}>
                  {formatScheduledDate(adventure.scheduled_for)}
                </Text>
                {firstStepTime && (
                  <Text style={{
                    ...typography.caption,
                    color: themeColors.text.secondary,
                    fontSize: 13,
                  }}>
                    Starts at {firstStepTime}
                  </Text>
                )}
              </View>
              <View style={{
                backgroundColor: themeColors.brand.sage + '15',
                borderRadius: borderRadius.round,
                padding: spacing.sm,
              }}>
                <Ionicons 
                  name="calendar" 
                  size={20} 
                  color={themeColors.brand.sage} 
                />
              </View>
            </View>
          </View>
        ) : (
          <View style={{
            backgroundColor: themeColors.background.secondary,
            borderRadius: borderRadius.lg,
            padding: spacing.lg,
            borderWidth: 1,
            borderColor: themeColors.text.tertiary + '15',
            borderStyle: 'dashed',
            alignItems: 'center',
          }}>
            <View style={{
              backgroundColor: themeColors.text.tertiary + '10',
              borderRadius: borderRadius.round,
              padding: spacing.md,
              marginBottom: spacing.sm,
            }}>
              <Ionicons 
                name="calendar-outline" 
                size={24} 
                color={themeColors.text.tertiary} 
              />
            </View>
            <Text style={{
              ...typography.caption,
              color: themeColors.text.tertiary,
              fontSize: 13,
              fontStyle: 'italic',
            }}>
              Tap "Schedule" to set a date
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};
// Horizontal Steps Section Component
export const HorizontalStepsSection: React.FC<HorizontalStepsSectionProps> = ({
  steps,
  themeColors,
  title = "Adventure Steps",
  onStepToggle,
  onViewAllPress,
}) => {
  const [selectedStep, setSelectedStep] = useState<AdventureStep | null>(null);
  const [selectedStepIndex, setSelectedStepIndex] = useState<number>(0);

  const handleStepPress = (step: AdventureStep, index: number) => {
    setSelectedStep(step);
    setSelectedStepIndex(index);
  };

  const handleCloseStepDetail = () => {
    setSelectedStep(null);
  };

  if (!steps || steps.length === 0) {
    return (
      <View style={{
        paddingVertical: spacing.lg,
        alignItems: 'center',
      }}>
        <Text style={[
          typography.caption,
          { color: themeColors.textSecondary }
        ]}>
          No steps available for this adventure
        </Text>
      </View>
    );
  }

  return (
    <View>
      {/* Section Header */}
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
        paddingHorizontal: spacing.md,
      }}>
        <Text style={[
          typography.heading,
          { color: themeColors.text }
        ]}>
          {title}
        </Text>
        {onViewAllPress && (
          <TouchableOpacity onPress={onViewAllPress}>
            <Text style={[
              typography.caption,
              { color: themeColors.primary }
            ]}>
              View All
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Horizontal Steps List */}
      <FlatList
        data={steps}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: spacing.md,
        }}
        keyExtractor={(item, index) => `step-${index}`}
        renderItem={({ item: step, index }) => (
          <View style={{ marginRight: spacing.sm }}>
            <StepCard
              step={step}
              index={index}
              themeColors={themeColors}
              onViewStep={() => handleStepPress(step, index)}
            />
          </View>
        )}
      />

      {/* Step Detail Modal */}
      {selectedStep && (
        <StepDetailModal
          visible={true}
          step={selectedStep}
          stepIndex={selectedStepIndex}
          onClose={handleCloseStepDetail}
        />
      )}
    </View>
  );
};

// Default exports for backward compatibility
export default { AdventureInfoSection, HorizontalStepsSection };
