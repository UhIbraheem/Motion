// src/components/modals/HorizontalStepsSection.tsx - Horizontal scrolling step cards section
import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { typography, spacing } from '../../constants/Theme';
import { AdventureStep } from './types';
import { StepCard } from './StepCard';
import StepDetailModal from './StepDetailModal';

interface HorizontalStepsSectionProps {
  steps: AdventureStep[];
  themeColors: any;
  title?: string;
}

export const HorizontalStepsSection: React.FC<HorizontalStepsSectionProps> = ({
  steps,
  themeColors,
  title = "Adventure Steps"
}) => {
  const [selectedStep, setSelectedStep] = useState<AdventureStep | null>(null);
  const [selectedStepIndex, setSelectedStepIndex] = useState<number>(0);
  const [stepDetailVisible, setStepDetailVisible] = useState(false);

  const handleViewStep = (step: AdventureStep, index: number) => {
    setSelectedStep(step);
    setSelectedStepIndex(index);
    setStepDetailVisible(true);
  };

  const closeStepDetail = () => {
    setStepDetailVisible(false);
    setSelectedStep(null);
  };

  return (
    <View>
      {/* Section Title */}
      <Text style={{
        ...typography.heading,
        color: themeColors.text.primary,
        marginBottom: spacing.md,
        paddingHorizontal: spacing.lg,
      }}>
        {title} ({steps.length})
      </Text>

      {/* Horizontal Step Cards */}
      <FlatList
        data={steps}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, index) => index.toString()}
        contentContainerStyle={{
          paddingHorizontal: spacing.lg,
        }}
        renderItem={({ item: step, index }) => (
          <StepCard
            step={step}
            index={index}
            themeColors={themeColors}
            onViewStep={() => handleViewStep(step, index)}
          />
        )}
      />

      {/* View All Steps Button */}
      {steps.length > 3 && (
        <TouchableOpacity
          style={{
            padding: spacing.md,
            alignItems: 'center',
            marginTop: spacing.sm,
          }}
        >
          <Text style={{
            ...typography.body,
            color: themeColors.brand.gold,
            fontWeight: '600',
          }}>
            Swipe to explore all {steps.length} steps →
          </Text>
        </TouchableOpacity>
      )}

      {/* Step Detail Modal */}
      <StepDetailModal
        visible={stepDetailVisible}
        step={selectedStep}
        stepIndex={selectedStepIndex}
        onClose={closeStepDetail}
      />
    </View>
  );
};

export default HorizontalStepsSection;
