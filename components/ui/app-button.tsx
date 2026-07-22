import React from 'react';
import { Pressable, StyleSheet, ViewStyle } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { theme } from '@/constants/theme';

export interface AppButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
}

export const AppButton: React.FC<AppButtonProps> = ({
  label,
  onPress,
  disabled = false,
  variant = 'primary',
  size = 'large',
  style,
}) => {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        styles[variant],
        styles[size],
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled}>
      <AppText weight="regular" style={[styles.text, styles[`${variant}Text`]]}>
        {label}
      </AppText>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#15181E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 13,
    elevation: 3,
  },
  primary: {
    backgroundColor: theme.colors.gray[900],
  },
  secondary: {
    backgroundColor: theme.colors.gray[50],
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  small: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    height: 36,
  },
  medium: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    height: 44,
  },
  large: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    height: 50,
  },
  pressed: {
    opacity: 0.8,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: 16,
    lineHeight: 19.2,
  },
  primaryText: {
    color: theme.colors.gray[50],
  },
  secondaryText: {
    color: theme.colors.gray[900],
  },
});
