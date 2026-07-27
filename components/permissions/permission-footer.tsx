import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/ui/app-button';
import { AppText } from '@/components/ui/app-text';
import { PERMISSION_FOOTER_LABELS, PERMISSIONS_CONTENT_WIDTH } from '@/constants/permissions';
import { theme } from '@/constants/theme';

interface PermissionFooterProps {
  requestLabel?: string;
  laterLabel?: string;
  onRequest: () => void;
  onLater: () => void;
  isRequesting?: boolean;
}

export function PermissionFooter({
  requestLabel = PERMISSION_FOOTER_LABELS.request,
  laterLabel = PERMISSION_FOOTER_LABELS.later,
  onRequest,
  onLater,
  isRequesting = false,
}: PermissionFooterProps) {
  return (
    <View style={styles.container}>
      <AppButton
        label={requestLabel}
        onPress={onRequest}
        disabled={isRequesting}
        style={styles.primaryButton}
      />
      <Pressable
        onPress={onLater}
        disabled={isRequesting}
        style={({ pressed }) => [styles.laterButton, pressed && styles.pressed]}>
        <AppText weight="regular" style={styles.laterText}>
          {laterLabel}
        </AppText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: PERMISSIONS_CONTENT_WIDTH,
    paddingBottom: 36,
    gap: 8,
  },
  primaryButton: {
    width: '100%',
  },
  laterButton: {
    width: '100%',
    height: 44,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  laterText: {
    fontSize: 16,
    lineHeight: 19.2,
    color: theme.colors.gray[900],
  },
  pressed: {
    opacity: 0.7,
  },
});
