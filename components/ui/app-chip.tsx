import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle } from 'react-native';

export interface AppChipProps {
  label: string;
  onPress?: () => void;
  active?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export const AppChip: React.FC<AppChipProps> = ({
  label,
  onPress,
  active = false,
  disabled = false,
  style,
}) => {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.chip,
        active && styles.chipActive,
        pressed && !disabled && styles.chipPressed,
        disabled && styles.chipDisabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={[styles.text, active && styles.textActive]}>
        {label}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 19,
    backgroundColor: '#F9F8F5',
    borderWidth: 1,
    borderColor: '#F9F8F5',
  },
  chipActive: {
    backgroundColor: '#302F2D',
    borderColor: '#302F2D',
  },
  chipPressed: {
    opacity: 0.7,
  },
  chipDisabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 16.8, // 14 * 1.2
    color: '#53514F',
  },
  textActive: {
    color: '#FFFFFF',
  },
});
