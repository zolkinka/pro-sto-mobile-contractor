import React from 'react';
import { View, StyleSheet, ViewStyle, TextInputProps } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { AppTextInput } from '@/components/ui/app-text-input';
import { theme } from '@/constants/theme';

export interface AppInputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  inputContainerStyle?: ViewStyle;
  borderless?: boolean;
  postfix?: string;
}

export const AppInput: React.FC<AppInputProps> = ({
  label,
  error,
  containerStyle,
  inputContainerStyle,
  borderless = false,
  postfix,
  ...textInputProps
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <View style={styles.labelContainer}>
          <AppText style={styles.label}>{label}</AppText>
        </View>
      )}
      <View
        style={[
          styles.inputContainer,
          borderless && styles.inputContainerBorderless,
          error && styles.inputContainerError,
          inputContainerStyle,
        ]}>
        <AppTextInput
          style={[styles.input, postfix && styles.inputWithPostfix]}
          placeholderTextColor={theme.colors.placeholder}
          {...textInputProps}
        />
        {postfix && <AppText style={styles.postfix}>{postfix}</AppText>}
      </View>
      {error && <AppText style={styles.error}>{error}</AppText>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  label: {
    fontSize: 14,
    lineHeight: 16.8,
    color: '#53514F',
  },
  inputContainer: {
    backgroundColor: theme.colors.gray[100],
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 12,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inputContainerBorderless: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.gray[100],
  },
  inputContainerError: {
    borderColor: '#D8182E',
  },
  input: {
    fontSize: 15,
    lineHeight: 18,
    color: theme.colors.gray[900],
    padding: 0,
    margin: 0,
    flex: 1,
  },
  inputWithPostfix: {
    paddingRight: 8,
  },
  postfix: {
    fontSize: 15,
    lineHeight: 18,
    color: '#888684',
    paddingLeft: 4,
  },
  error: {
    fontSize: 12,
    lineHeight: 14.4,
    color: '#D8182E',
  },
});
