import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/ui/app-button';
import { AppText } from '@/components/ui/app-text';
import { PERMISSIONS_CONTENT_WIDTH } from '@/constants/permissions';
import { theme } from '@/constants/theme';

interface PermissionFooterProps {
  onRequest: () => void;
  onLater: () => void;
  isRequesting?: boolean;
}

export function PermissionFooter({
  onRequest,
  onLater,
  isRequesting = false,
}: PermissionFooterProps) {
  return (
    <View style={styles.container}>
      <AppButton
        label="Запросить"
        onPress={onRequest}
        disabled={isRequesting}
        style={styles.primaryButton}
      />
      <Pressable
        onPress={onLater}
        disabled={isRequesting}
        style={({ pressed }) => [styles.laterButton, pressed && styles.pressed]}>
        <AppText weight="regular" style={styles.laterText}>
          Позже
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
