import React, { useId } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { theme } from '@/constants/theme';

interface FooterFadeProps {
  height?: number;
  /** Fade target color; Figma uses #FFFFFF. */
  color?: string;
  style?: ViewStyle;
}

export function FooterFade({
  height = 56,
  color = theme.colors.gray[50],
  style,
}: FooterFadeProps) {
  const gradientId = `footerFade-${useId().replace(/:/g, '')}`;

  return (
    <View pointerEvents="none" style={[styles.container, { height }, style]}>
      <Svg width="100%" height="100%">
        <Defs>
          <LinearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={color} stopOpacity="0" />
            <Stop offset="1" stopColor={color} stopOpacity="1" />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill={`url(#${gradientId})`} />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
});
