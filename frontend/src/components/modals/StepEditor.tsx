// src/components/modals/StepEditor.tsx - Step editing components for StepsOverviewModal
import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { typography, spacing, borderRadius } from '../../constants/Theme';
import { AdventureStep } from './types';

interface StepEditorProps {
  step: AdventureStep;
  index: number;
  themeColors: any;
  onUpdateStep: (index: number, field: keyof AdventureStep, value: string) => void;
  onTimeEdit: (index: number) => void;
}

export const StepEditor: React.FC<StepEditorProps> = ({
  step,
  index,
  themeColors,
  onUpdateStep,
  onTimeEdit,
}) => {
  return (
    <View style={{
      backgroundColor: themeColors.background.card,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      marginBottom: spacing.md,
      borderWidth: 1,
      borderColor: themeColors.text.tertiary + '20',
    }}>
      {/* Time Editor */}
      <View style={{ marginBottom: spacing.md }}>
        <Text style={{
          ...typography.caption,
          color: themeColors.text.secondary,
          marginBottom: spacing.xs,
          fontWeight: '600',
        }}>
          Time
        </Text>
        <TouchableOpacity
          onPress={() => onTimeEdit(index)}
          style={{
            backgroundColor: themeColors.background.secondary,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
            borderRadius: borderRadius.sm,
            borderWidth: 1,
            borderColor: themeColors.text.tertiary + '30',
          }}
        >
          <Text style={{
            ...typography.body,
            color: themeColors.text.primary,
          }}>
            {step.time}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Title Editor */}
      <View style={{ marginBottom: spacing.md }}>
        <Text style={{
          ...typography.caption,
          color: themeColors.text.secondary,
          marginBottom: spacing.xs,
          fontWeight: '600',
        }}>
          Title
        </Text>
        <TextInput
          value={step.title}
          onChangeText={(text) => onUpdateStep(index, 'title', text)}
          style={{
            backgroundColor: themeColors.background.secondary,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
            borderRadius: borderRadius.sm,
            borderWidth: 1,
            borderColor: themeColors.text.tertiary + '30',
            color: themeColors.text.primary,
            ...typography.body,
          }}
          multiline
          placeholder="Step title..."
          placeholderTextColor={themeColors.text.tertiary}
        />
      </View>

      {/* Location Editor */}
      <View style={{ marginBottom: spacing.md }}>
        <Text style={{
          ...typography.caption,
          color: themeColors.text.secondary,
          marginBottom: spacing.xs,
          fontWeight: '600',
        }}>
          Location
        </Text>
        <TextInput
          value={step.location}
          onChangeText={(text) => onUpdateStep(index, 'location', text)}
          style={{
            backgroundColor: themeColors.background.secondary,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
            borderRadius: borderRadius.sm,
            borderWidth: 1,
            borderColor: themeColors.text.tertiary + '30',
            color: themeColors.text.primary,
            ...typography.body,
          }}
          placeholder="Location name..."
          placeholderTextColor={themeColors.text.tertiary}
        />
      </View>

      {/* Address Editor */}
      {step.address && (
        <View style={{ marginBottom: spacing.md }}>
          <Text style={{
            ...typography.caption,
            color: themeColors.text.secondary,
            marginBottom: spacing.xs,
            fontWeight: '600',
          }}>
            Address
          </Text>
          <TextInput
            value={step.address}
            onChangeText={(text) => onUpdateStep(index, 'address', text)}
            style={{
              backgroundColor: themeColors.background.secondary,
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.sm,
              borderRadius: borderRadius.sm,
              borderWidth: 1,
              borderColor: themeColors.text.tertiary + '30',
              color: themeColors.text.primary,
              ...typography.body,
            }}
            multiline
            placeholder="Full address..."
            placeholderTextColor={themeColors.text.tertiary}
          />
        </View>
      )}

      {/* Notes Editor */}
      {step.notes && (
        <View>
          <Text style={{
            ...typography.caption,
            color: themeColors.text.secondary,
            marginBottom: spacing.xs,
            fontWeight: '600',
          }}>
            Notes
          </Text>
          <TextInput
            value={step.notes}
            onChangeText={(text) => onUpdateStep(index, 'notes', text)}
            style={{
              backgroundColor: themeColors.background.secondary,
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.sm,
              borderRadius: borderRadius.sm,
              borderWidth: 1,
              borderColor: themeColors.text.tertiary + '30',
              color: themeColors.text.primary,
              ...typography.body,
              minHeight: 60,
            }}
            multiline
            placeholder="Additional notes..."
            placeholderTextColor={themeColors.text.tertiary}
          />
        </View>
      )}
    </View>
  );
};

interface EditingControlsProps {
  themeColors: any;
  onSave: () => void;
  onCancel: () => void;
}

export const EditingControls: React.FC<EditingControlsProps> = ({
  themeColors,
  onSave,
  onCancel,
}) => {
  return (
    <View style={{
      flexDirection: 'row',
      gap: spacing.sm,
      paddingTop: spacing.md,
      borderTopWidth: 1,
      borderTopColor: themeColors.text.tertiary + '20',
      marginTop: spacing.md,
    }}>
      <TouchableOpacity
        onPress={onCancel}
        style={{
          flex: 1,
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: themeColors.text.tertiary,
          paddingVertical: spacing.md,
          borderRadius: borderRadius.md,
          alignItems: 'center',
        }}
      >
        <Text style={{
          ...typography.body,
          color: themeColors.text.secondary,
          fontWeight: '600',
        }}>
          Cancel
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onSave}
        style={{
          flex: 1,
          backgroundColor: themeColors.brand.sage,
          paddingVertical: spacing.md,
          borderRadius: borderRadius.md,
          alignItems: 'center',
        }}
      >
        <Text style={{
          ...typography.body,
          color: 'white',
          fontWeight: '600',
        }}>
          Save Changes
        </Text>
      </TouchableOpacity>
    </View>
  );
};
