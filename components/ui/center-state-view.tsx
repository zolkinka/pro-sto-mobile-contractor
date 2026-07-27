import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { UI_STATE_LAYOUT } from '@/constants/ui-states';

interface CenterStateViewProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function CenterStateView({ children, style }: CenterStateViewProps) {
  return <View style={[styles.container, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: UI_STATE_LAYOUT.horizontalPadding,
    gap: UI_STATE_LAYOUT.contentGap,
  },
});
