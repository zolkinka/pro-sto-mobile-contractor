import React from 'react';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { AppButton } from '@/components/ui/app-button';
import { AppText } from '@/components/ui/app-text';
import { CenterStateView } from '@/components/ui/center-state-view';
import { UI_STATE_LABELS, UI_STATE_TYPOGRAPHY } from '@/constants/ui-states';

interface ErrorStateViewProps {
  message: string;
  retryLabel?: string;
  onRetry: () => void;
  style?: StyleProp<ViewStyle>;
}

export function ErrorStateView({
  message,
  retryLabel = UI_STATE_LABELS.retry,
  onRetry,
  style,
}: ErrorStateViewProps) {
  return (
    <CenterStateView style={style}>
      <AppText style={styles.message}>{message}</AppText>
      <AppButton label={retryLabel} onPress={onRetry} size="medium" />
    </CenterStateView>
  );
}

const styles = StyleSheet.create({
  message: UI_STATE_TYPOGRAPHY.title,
});
