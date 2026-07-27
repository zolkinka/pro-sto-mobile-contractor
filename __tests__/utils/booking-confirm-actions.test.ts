import { Alert } from 'react-native';

import {
  canConfirmBooking,
  showBookingConfirmStub,
} from '@/utils/booking-confirm-actions';

jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);

describe('booking-confirm-actions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('allows confirmation only for pending_confirmation', () => {
    expect(canConfirmBooking('pending_confirmation')).toBe(true);
    expect(canConfirmBooking('confirmed')).toBe(false);
  });

  it('shows stub alert for pending booking QR flow', () => {
    showBookingConfirmStub('pending_confirmation', 'qr');

    expect(Alert.alert).toHaveBeenCalledWith(
      'Скоро',
      'Подтверждение через QR будет доступно позже',
    );
  });

  it('shows already confirmed alert for confirmed booking', () => {
    showBookingConfirmStub('confirmed', 'phone');

    expect(Alert.alert).toHaveBeenCalledWith(
      'Запись уже подтверждена',
      'Подтверждение доступно только для новых записей',
    );
  });
});
