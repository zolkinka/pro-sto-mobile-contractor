import React from 'react';
import { StyleSheet, View } from 'react-native';

import { BookingCardSkeleton } from '@/components/bookings/booking-card-skeleton';

interface BookingsListSkeletonProps {
  count?: number;
}

export function BookingsListSkeleton({ count = 5 }: BookingsListSkeletonProps) {
  return (
    <View style={styles.list}>
      {Array.from({ length: count }, (_, index) => (
        <BookingCardSkeleton key={`booking-skeleton-${index}`} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: 20,
    gap: 12,
  },
});
