import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { CenterStateView } from '@/components/ui/center-state-view';
import { LoadingDots } from '@/components/ui/loading-dots';

interface LoadingStateViewProps {
  /** Центрированные точки — для экранов без контентной разметки. */
  variant?: 'dots' | 'content';
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function LoadingStateView({
  variant = 'dots',
  children,
  style,
}: LoadingStateViewProps) {
  if (variant === 'content' && children) {
    return <View style={[styles.contentContainer, style]}>{children}</View>;
  }

  return (
    <CenterStateView style={style}>
      <LoadingDots />
    </CenterStateView>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    minHeight: 0,
  },
});
