import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { observer } from 'mobx-react-lite';
import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppButton } from '@/components/ui/app-button';
import { AppText } from '@/components/ui/app-text';
import { Icon } from '@/components/ui/icon';
import { theme } from '@/constants/theme';
import type { MainStackParamList } from '@/navigation/types';
import { bookingsStore } from '@/stores/bookings.store';
import { formatBookingDayLabel } from '@/utils/booking-date';

type Navigation = NativeStackNavigationProp<MainStackParamList, 'BookingConfirmed'>;
type BookingConfirmedRoute = RouteProp<MainStackParamList, 'BookingConfirmed'>;

const SUCCESS_GREEN = '#22C55E';
const PRICE_GREEN = '#16A34A';
const LINK_BLUE = '#3B6CFF';
const CHIP_BG = '#F3F1EE';

const SMS_REMINDERS = ['2 часа', '4 часа', '8 часов', '1 день', '2 дня'] as const;

function formatClock(iso: string): string {
  return new Date(iso).toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

export const BookingConfirmedScreen = observer(function BookingConfirmedScreen() {
  const navigation = useNavigation<Navigation>();
  const route = useRoute<BookingConfirmedRoute>();
  const bookingUuid = route.params.bookingUuid;
  const [smsReminder, setSmsReminder] = useState<(typeof SMS_REMINDERS)[number] | null>(null);

  const booking =
    bookingsStore.selectedBooking?.uuid === bookingUuid
      ? bookingsStore.selectedBooking
      : bookingsStore.bookings.find((item) => item.uuid === bookingUuid);

  const serviceName = booking?.service?.name?.trim() || 'услугу';
  const when = booking
    ? `${formatBookingDayLabel(new Date(booking.start_time))} в ${formatClock(booking.start_time)}`
    : null;
  const summary = when
    ? `Вы записаны в ${serviceName} на ${when}`
    : 'Клиент может проходить к услуге';
  const price =
    booking?.total_cost != null ? `${Math.round(booking.total_cost)}₽` : null;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.content}>
        <AppText weight="medium" style={styles.title}>
          Запись подтверждена!
        </AppText>

        <View style={styles.check}>
          <Icon name="check" size={28} color={theme.colors.gray[50]} />
        </View>

        <AppText weight="regular" style={styles.summary}>
          {summary}
        </AppText>

        {price ? (
          <AppText weight="regular" style={styles.priceLine}>
            Стоимость заказа: <AppText weight="medium" style={styles.price}>{price}</AppText>
          </AppText>
        ) : null}

        <AppButton
          label="На главную"
          onPress={() => navigation.navigate('Home')}
          style={styles.homeButton}
        />

        <AppText weight="regular" style={styles.remindLabel}>
          Напомнить в SMS за:
        </AppText>

        <View style={styles.chips}>
          {SMS_REMINDERS.map((label) => {
            const selected = smsReminder === label;

            return (
              <Pressable
                key={label}
                onPress={() => setSmsReminder(label)}
                style={[styles.chip, selected && styles.chipSelected]}
                accessibilityRole="button"
                accessibilityState={{ selected }}>
                <AppText weight="regular" style={styles.chipText}>
                  {label}
                </AppText>
              </Pressable>
            );
          })}
        </View>

        <Pressable style={styles.calendar} accessibilityRole="button">
          <Icon name="calendar" size={16} color={LINK_BLUE} />
          <AppText weight="regular" style={styles.calendarText}>
            Добавить в календарь
          </AppText>
        </Pressable>
      </View>
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.gray[50],
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 72,
  },
  title: {
    fontSize: 22,
    lineHeight: 26,
    textAlign: 'center',
    color: theme.colors.gray[900],
  },
  check: {
    marginTop: 28,
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: SUCCESS_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summary: {
    marginTop: 28,
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
    color: theme.colors.gray[900],
  },
  priceLine: {
    marginTop: 16,
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
    color: theme.colors.gray[900],
  },
  price: {
    fontSize: 16,
    lineHeight: 22,
    color: PRICE_GREEN,
  },
  homeButton: {
    marginTop: 28,
    width: 220,
    height: 52,
    borderRadius: 26,
  },
  remindLabel: {
    marginTop: 36,
    fontSize: 15,
    lineHeight: 20,
    color: theme.colors.gray[900],
  },
  chips: {
    marginTop: 14,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    maxWidth: 280,
  },
  chip: {
    backgroundColor: CHIP_BG,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipSelected: {
    backgroundColor: theme.colors.gray[200],
  },
  chipText: {
    fontSize: 14,
    lineHeight: 18,
    color: theme.colors.gray[800],
  },
  calendar: {
    marginTop: 22,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  calendarText: {
    fontSize: 15,
    lineHeight: 20,
    color: LINK_BLUE,
  },
});
