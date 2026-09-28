import type { BookingCar, BookingDetails, BookingClient, BookingServiceItem } from '@/types/bookings';

export function formatCarTitle(car: BookingCar | null | undefined): string {
  if (!car) {
    return 'Автомобиль не указан';
  }

  const title = `${car.make ?? ''} ${car.model ?? ''}`.trim();
  return title || 'Автомобиль не указан';
}

export function formatClientName(client: BookingClient | null | undefined): string {
  return client?.name?.trim() || 'Клиент не указан';
}

export function getBookingServiceItems(
  booking: Pick<BookingDetails, 'service' | 'additionalServices'>,
): BookingServiceItem[] {
  return [booking.service, ...(booking.additionalServices ?? [])].filter(
    (item): item is BookingServiceItem => Boolean(item?.uuid && item?.name),
  );
}

export function formatLicensePlate(
  licensePlate: BookingCar['license_plate'] | undefined,
): string {
  if (!licensePlate) {
    return '—';
  }

  if (typeof licensePlate === 'string') {
    return licensePlate;
  }

  const number = licensePlate.number ?? '';
  const region = licensePlate.region ?? '';

  return region ? `${number}${region}` : number || '—';
}

export function formatPostLabel(orderNumber: number | null | undefined): string {
  if (orderNumber == null) {
    return '—';
  }

  return `Бокс ${orderNumber}`;
}

export function getBookingDurationMinutes(booking: BookingDetails): number {
  return getBookingServiceItems(booking).reduce(
    (total, item) => total + (item.duration_minutes ?? 0),
    0,
  );
}

export function parseClientComment(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}
