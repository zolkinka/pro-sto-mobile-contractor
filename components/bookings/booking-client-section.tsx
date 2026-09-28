import React from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Icon, type IconName } from '@/components/ui/icon';
import { BOOKING_CONTENT_WIDTH, BOOKING_MUTED_COLOR } from '@/constants/bookings';
import { theme } from '@/constants/theme';
import type { BookingDetails } from '@/types/bookings';
import { formatBookingTimeWithDuration } from '@/utils/booking-date';
import {
  formatCarTitle,
  formatClientName,
  formatLicensePlate,
  formatPostLabel,
  getBookingDurationMinutes,
} from '@/utils/booking-format';

interface BookingClientSectionProps {
  booking: BookingDetails & { postOrderNumber?: number | null };
}

interface ClientRowProps {
  icon: IconName;
  label: string;
  muted?: boolean;
}

function ClientRow({ icon, label, muted = false }: ClientRowProps) {
  const color = muted ? BOOKING_MUTED_COLOR : theme.colors.gray[900];

  return (
    <View style={styles.row}>
      <Icon name={icon} size={20} color={color} />
      <AppText weight="medium" style={[styles.rowText, { color }]}>
        {label}
      </AppText>
    </View>
  );
}

export function BookingClientSection({ booking }: BookingClientSectionProps) {
  const durationMinutes = getBookingDurationMinutes(booking);
  const timeLabel = formatBookingTimeWithDuration(
    booking.start_time,
    booking.end_time,
    durationMinutes,
  );

  return (
    <View style={styles.card}>
      <AppText weight="semiBold" style={styles.sectionTitle}>
        Клиент:
      </AppText>
      <ClientRow icon="car" label={formatCarTitle(booking.car)} />
      <ClientRow icon="identification-card" label={formatLicensePlate(booking.car?.license_plate)} />
      <ClientRow icon="user" label={formatClientName(booking.client)} />
      <View style={styles.divider} />
      <ClientRow icon="clock" label={timeLabel} muted />
      <ClientRow icon="garage" label={formatPostLabel(booking.postOrderNumber)} muted />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: BOOKING_CONTENT_WIDTH,
    backgroundColor: theme.colors.gray[100],
    borderRadius: 16,
    paddingTop: 16,
    paddingRight: 24,
    paddingBottom: 16,
    paddingLeft: 24,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 20,
    lineHeight: 24,
    color: theme.colors.gray[900],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rowText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 19.2,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: 4,
  },
});
