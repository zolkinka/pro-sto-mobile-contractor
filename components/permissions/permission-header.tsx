import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { PERMISSIONS_CONTENT_WIDTH } from '@/constants/permissions';
import { theme } from '@/constants/theme';

interface PermissionHeaderProps {
  /** Omit on first onboarding step (back disabled, same as mobile-client onboarding). */
  onBackPress?: () => void;
}

export function PermissionHeader({ onBackPress }: PermissionHeaderProps) {
  const isBackEnabled = Boolean(onBackPress);

  return (
    <View style={styles.container}>
      <Pressable
        onPress={onBackPress}
        disabled={!isBackEnabled}
        accessibilityRole="button"
        accessibilityState={{ disabled: !isBackEnabled }}
        accessibilityLabel="Назад"
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        style={({ pressed }) => [
          styles.backButton,
          pressed && isBackEnabled && styles.pressed,
          !isBackEnabled && styles.disabled,
        ]}>
        <Icon name="arrow-left" size={24} color={theme.colors.gray[900]} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: PERMISSIONS_CONTENT_WIDTH,
    height: 28,
    paddingTop: 2,
    paddingBottom: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  backButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.6,
  },
  disabled: {
    opacity: 0.35,
  },
});
