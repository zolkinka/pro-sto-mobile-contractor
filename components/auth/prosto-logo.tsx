import React from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { theme } from '@/constants/theme';

export function ProStoLogo() {
  return (
    <View style={styles.container}>
      <View style={styles.dotsRow}>
        <View style={[styles.dot, styles.dotLarge]} />
        <View style={styles.dotColumn}>
          <View style={[styles.dot, styles.dotSmall]} />
          <View style={[styles.dot, styles.dotSmall]} />
        </View>
      </View>
      <AppText weight="semiBold" style={styles.title}>просто</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
  },
  dotColumn: {
    gap: 4,
  },
  dot: {
    backgroundColor: theme.colors.gray[900],
    borderRadius: 2,
  },
  dotLarge: {
    width: 14,
    height: 14,
  },
  dotSmall: {
    width: 8,
    height: 8,
  },
  title: {
    fontSize: 28,
    color: theme.colors.gray[900],
    letterSpacing: -0.5,
  },
});
