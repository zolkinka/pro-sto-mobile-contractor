import React from 'react';
import { Pressable, StyleSheet, ViewStyle } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Icon, type IconName } from '@/components/ui/icon';
import { theme } from '@/constants/theme';

export interface AppButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'invisible';
  size?: 'small' | 'medium' | 'large';
  rightIcon?: IconName;
  /** Use for long single-line labels (e.g. confirm-by-code). Default buttons keep full-size text. */
  shrinkLabelToFit?: boolean;
  style?: ViewStyle;
}

export const AppButton: React.FC<AppButtonProps> = ({
  label,
  onPress,
  disabled = false,
  variant = 'primary',
  size = 'large',
  rightIcon,
  shrinkLabelToFit = false,
  style,
}) => {
  const isPrimaryWithIcon = variant === 'primary' && Boolean(rightIcon);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        styles[variant],
        styles[size],
        isPrimaryWithIcon && styles.buttonWithIcon,
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled}>
      <AppText
        weight="regular"
        numberOfLines={shrinkLabelToFit ? 1 : undefined}
        adjustsFontSizeToFit={shrinkLabelToFit}
        minimumFontScale={shrinkLabelToFit ? 0.75 : undefined}
        style={[
          styles.text,
          styles[`${variant}Text`],
          shrinkLabelToFit && styles.shrinkLabel,
        ]}>
        {label}
      </AppText>
      {rightIcon ? (
        <Icon
          name={rightIcon}
          size={20}
          color={variant === 'primary' ? theme.colors.gray[50] : theme.colors.gray[900]}
        />
      ) : null}
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
  buttonWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 20,
  },
  primary: {
    backgroundColor: theme.colors.gray[900],
  },
  secondary: {
    backgroundColor: theme.colors.gray[50],
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  invisible: {
    backgroundColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
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
  shrinkLabel: {
    width: '100%',
    textAlign: 'center',
  },
  primaryText: {
    color: theme.colors.gray[50],
  },
  secondaryText: {
    color: theme.colors.gray[900],
  },
  invisibleText: {
    color: theme.colors.gray[900],
  },
});
