import React from 'react';
import { StyleSheet, View } from 'react-native';

import { Skeleton } from '@/components/ui/skeleton';
import { theme } from '@/constants/theme';

export function BookingCardSkeleton() {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.content}>
          <Skeleton width="58%" height={18} borderRadius={8} />
          <Skeleton width="78%" height={16} borderRadius={8} />
        </View>
        <Skeleton width={24} height={24} borderRadius={6} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    padding: 16,
    backgroundColor: theme.colors.gray[100],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  content: {
    flex: 1,
    gap: 8,
  },
});
