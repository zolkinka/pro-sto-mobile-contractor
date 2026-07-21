import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle } from 'react-native';

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
      disabled={disabled}
    >
      <Text style={[styles.text, styles[`${variant}Text`]]}>
        {label}
      </Text>
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
    backgroundColor: '#302F2D',
  },
  secondary: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F4F3F0',
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
    fontWeight: '400',
    lineHeight: 19.2, // 16 * 1.2
  },
  primaryText: {
    color: '#FFFFFF',
  },
  secondaryText: {
    color: '#302F2D',
  },
});
