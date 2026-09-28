import React from 'react';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { AppButton } from '@/components/ui/app-button';
import { AppText } from '@/components/ui/app-text';
import { CenterStateView } from '@/components/ui/center-state-view';
import { UI_STATE_TYPOGRAPHY } from '@/constants/ui-states';

interface EmptyStateViewProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onActionPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function EmptyStateView({
  title,
  description,
  actionLabel,
  onActionPress,
  style,
}: EmptyStateViewProps) {
  const showAction = Boolean(actionLabel && onActionPress);

  return (
    <CenterStateView style={style}>
      <AppText style={styles.title}>{title}</AppText>
      {description ? <AppText style={styles.description}>{description}</AppText> : null}
      {showAction ? (
        <AppButton label={actionLabel!} onPress={onActionPress!} size="medium" />
      ) : null}
    </CenterStateView>
  );
}

const styles = StyleSheet.create({
  title: UI_STATE_TYPOGRAPHY.title,
  description: UI_STATE_TYPOGRAPHY.description,
});
