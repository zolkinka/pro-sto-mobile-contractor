import axios, { type AxiosError } from 'axios';

import { getBookingConfirmErrorMessage, getQrScanErrorMessage } from '@/utils/booking-confirm-error';
import { isConfirmationCode, parseBookingQrPayload } from '@/utils/booking-qr-payload';

describe('booking-qr-payload', () => {
  it('parses a client QR payload', () => {
    expect(
      parseBookingQrPayload('123e4567-e89b-12d3-a456-426614174000:0421'),
    ).toEqual({
      uuid: '123e4567-e89b-12d3-a456-426614174000',
      code: '0421',
    });
  });

  it('rejects payloads that are not uuid and a 4-digit code', () => {
    expect(parseBookingQrPayload('not-a-qr')).toBeNull();
    expect(parseBookingQrPayload('123e4567-e89b-12d3-a456-426614174000:12')).toBeNull();
    expect(isConfirmationCode('0421')).toBe(true);
    expect(isConfirmationCode('42')).toBe(false);
  });
});

describe('booking-confirm-error', () => {
  it('returns the scan hint for an unreadable QR', () => {
    expect(getQrScanErrorMessage()).toBe('QR-код не найден, попробуйте снова');
  });

  it('includes remaining attempts for an invalid code', () => {
    const error = new axios.AxiosError('bad');
    error.response = {
      status: 400,
      data: {
        error: {
          code: 'INVALID_CONFIRMATION_CODE',
          message: 'Неверный код подтверждения',
          details: [{ remaining_attempts: 3 }],
        },
      },
      statusText: 'Bad Request',
      headers: {},
      config: { headers: {} },
    } as AxiosError['response'];

    expect(getBookingConfirmErrorMessage(error)).toBe(
      'Неверный код подтверждения. Осталось попыток: 3',
    );
  });

  it('returns the lockout message after too many attempts', () => {
    const error = new axios.AxiosError('locked');
    error.response = {
      status: 429,
      data: {
        error: {
          code: 'CONFIRMATION_ATTEMPTS_EXCEEDED',
          message: 'Превышен лимит попыток ввода кода',
          details: [{ remaining_attempts: 0 }],
        },
      },
      statusText: 'Too Many Requests',
      headers: {},
      config: { headers: {} },
    } as AxiosError['response'];

    expect(getBookingConfirmErrorMessage(error)).toBe('Превышен лимит попыток ввода кода');
  });
});
