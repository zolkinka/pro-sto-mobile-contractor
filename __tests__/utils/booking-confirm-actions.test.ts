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

  it('allows confirmation only while the visit is waiting for QR or code', () => {
    expect(canConfirmBooking('pending_confirmation')).toBe(true);
    expect(canConfirmBooking('confirmed')).toBe(false);
    expect(canConfirmBooking('completed')).toBe(false);
    expect(canConfirmBooking('cancelled')).toBe(false);
  });

  it('shows stub alert for pending booking QR flow', () => {
    showBookingConfirmStub('pending_confirmation', 'qr');

    expect(Alert.alert).toHaveBeenCalledWith(
      'Скоро',
      'Подтверждение через QR будет доступно позже',
    );
  });

  it('shows already confirmed alert for a finished booking', () => {
    showBookingConfirmStub('completed', 'phone');

    expect(Alert.alert).toHaveBeenCalledWith(
      'Запись уже подтверждена',
      'Подтверждение доступно только для новых записей',
    );
  });
});
