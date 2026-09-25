import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Icon } from '@/components/ui/icon';
import { ICON_CARET_COLOR } from '@/constants/bookings';
import { theme } from '@/constants/theme';
import type { BookingListItem } from '@/types/bookings';
import { formatBookingTimeRange } from '@/utils/booking-date';
import {
  formatCarTitle,
  formatLicensePlate,
  formatPostLabel,
} from '@/utils/booking-format';

interface BookingCardProps {
  booking: BookingListItem;
  backgroundColor: string;
  onPress: () => void;
}

function MetaSeparator() {
  return (
    <AppText weight="medium" style={styles.cardMetaSeparator}>
      {' • '}
    </AppText>
  );
}

export function BookingCard({ booking, backgroundColor, onPress }: BookingCardProps) {
  const timeRange = formatBookingTimeRange(booking.start_time, booking.end_time);
  const plate = formatLicensePlate(booking.car?.license_plate);
  const box = formatPostLabel(booking.post?.orderNumber);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor },
        pressed && styles.cardPressed,
      ]}>
      <View style={styles.cardHeader}>
        <View style={styles.cardContent}>
          <AppText weight="semiBold" style={styles.cardTitle}>
            {formatCarTitle(booking.car)}
          </AppText>
          <View style={styles.cardMetaRow}>
            <AppText weight="medium" style={styles.cardMetaTime}>
              {timeRange}
            </AppText>
            <MetaSeparator />
            <AppText weight="medium" style={styles.cardMetaSecondary}>
              {plate}
            </AppText>
            <MetaSeparator />
            <AppText weight="medium" style={styles.cardMetaSecondary}>
              {box}
            </AppText>
          </View>
        </View>
        <Icon name="qr-code" size={24} color={ICON_CARET_COLOR} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    padding: 16,
  },
  cardPressed: {
    opacity: 0.92,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  cardContent: {
    flex: 1,
    gap: 8,
  },
  cardTitle: {
    fontSize: 18,
    color: theme.colors.gray[900],
  },
  cardMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  cardMetaTime: {
    fontSize: 16,
    lineHeight: 19.2,
    color: theme.colors.gray[900],
  },
  cardMetaSecondary: {
    fontSize: 16,
    lineHeight: 19.2,
    color: theme.colors.gray[600],
  },
  cardMetaSeparator: {
    fontSize: 16,
    lineHeight: 19.2,
    color: theme.colors.gray[600],
  },
});
