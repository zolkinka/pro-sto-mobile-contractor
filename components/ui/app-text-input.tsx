import React from 'react';
import { StyleSheet, TextInput, type TextInputProps, type TextStyle } from 'react-native';

import { fonts, type FontWeight } from '@/constants/typography';

export interface AppTextInputProps extends TextInputProps {
  weight?: FontWeight;
}

const weightToFont: Record<FontWeight, TextStyle['fontFamily']> = {
  regular: fonts.regular,
  medium: fonts.medium,
  semiBold: fonts.semiBold,
};

export const AppTextInput = React.forwardRef<TextInput, AppTextInputProps>(
  function AppTextInput({ style, weight = 'regular', ...props }, ref) {
    return (
      <TextInput
        ref={ref}
        {...props}
        style={[styles.base, { fontFamily: weightToFont[weight] }, style]}
      />
    );
  },
);

const styles = StyleSheet.create({
  base: {
    fontFamily: fonts.regular,
  },
});
