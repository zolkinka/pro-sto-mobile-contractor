import React from 'react';
import { StyleSheet, Text, type TextProps, type TextStyle } from 'react-native';

import { fonts, type FontWeight } from '@/constants/typography';

export type AppTextWeight = FontWeight;

export interface AppTextProps extends TextProps {
  weight?: FontWeight;
}

const weightToFont: Record<FontWeight, TextStyle['fontFamily']> = {
  regular: fonts.regular,
  medium: fonts.medium,
  semiBold: fonts.semiBold,
};

export const AppText = React.forwardRef<Text, AppTextProps>(function AppText(
  { style, weight = 'regular', ...props },
  ref,
) {
  return (
    <Text
      ref={ref}
      {...props}
      style={[styles.base, { fontFamily: weightToFont[weight] }, style]}
    />
  );
});

const styles = StyleSheet.create({
  base: {
    fontFamily: fonts.regular,
  },
});
