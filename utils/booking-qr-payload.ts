const BOOKING_UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const CONFIRMATION_CODE_PATTERN = /^\d{4}$/;

export interface BookingQrPayload {
  uuid: string;
  code: string;
}

/** Client QR payload is `{bookingUuid}:{4-digit code}`. */
export function parseBookingQrPayload(raw: string): BookingQrPayload | null {
  const value = raw.trim();
  const separator = value.lastIndexOf(':');

  if (separator <= 0) {
    return null;
  }

  const uuid = value.slice(0, separator);
  const code = value.slice(separator + 1);

  if (!BOOKING_UUID_PATTERN.test(uuid) || !CONFIRMATION_CODE_PATTERN.test(code)) {
    return null;
  }

  return { uuid, code };
}

export function isConfirmationCode(value: string): boolean {
  return CONFIRMATION_CODE_PATTERN.test(value);
}
