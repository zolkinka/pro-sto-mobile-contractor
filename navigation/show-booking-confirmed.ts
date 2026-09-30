import { CommonActions, type NavigationProp } from '@react-navigation/native';

import { bookingsStore } from '@/stores/bookings.store';

import type { MainStackParamList } from './types';

export function showBookingConfirmed(
  navigation: NavigationProp<MainStackParamList>,
  bookingUuid: string,
): void {
  bookingsStore.fetchBookings({ silent: true }).catch(() => undefined);
  navigation.dispatch(
    CommonActions.reset({
      index: 1,
      routes: [{ name: 'Home' }, { name: 'BookingConfirmed', params: { bookingUuid } }],
    }),
  );
}
