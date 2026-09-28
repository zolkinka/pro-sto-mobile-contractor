import { Alert } from 'react-native';

import type { BookingStatus } from '@/types/bookings';

const CONFIRM_STUB_MESSAGES = {
  qr: 'Подтверждение через QR будет доступно позже',
  phone: 'Подтверждение по номеру телефона будет доступно позже',
} as const;

export type BookingConfirmMethod = keyof typeof CONFIRM_STUB_MESSAGES;

export function canConfirmBooking(status: BookingStatus): boolean {
  return status === 'pending_confirmation';
}

export function showBookingConfirmStub(
  status: BookingStatus,
  method: BookingConfirmMethod,
): void {
  if (!canConfirmBooking(status)) {
    Alert.alert('Запись уже подтверждена', 'Подтверждение доступно только для новых записей');
    return;
  }

  Alert.alert('Скоро', CONFIRM_STUB_MESSAGES[method]);
}
