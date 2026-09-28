import { formatBookingDayLabel } from '@/utils/booking-date';

export interface ConfirmedBookingSummarySource {
  start_time: string;
  serviceCenterName?: string | null;
  serviceCenterAddress?: string | null;
  serviceBusinessType?: 'tire_service' | 'car_wash' | null;
  service_center?: { name?: string | null; address?: string | null } | null;
  service?: { name?: string | null } | null;
}

function formatClock(iso: string): string {
  return new Date(iso).toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

function visitPlace(businessType: ConfirmedBookingSummarySource['serviceBusinessType']): string {
  if (businessType === 'tire_service') {
    return 'шиномонтаж';
  }

  if (businessType === 'car_wash') {
    return 'мойку';
  }

  return '';
}

export function formatConfirmedBookingSummary(booking: ConfirmedBookingSummarySource): string {
  const centerName =
    booking.serviceCenterName?.trim() || booking.service_center?.name?.trim() || '';
  const address =
    booking.serviceCenterAddress?.trim() || booking.service_center?.address?.trim() || '';
  const place = [visitPlace(booking.serviceBusinessType), centerName].filter(Boolean).join(' ');
  const destination = place || booking.service?.name?.trim() || 'сервис';
  const when = `${formatBookingDayLabel(new Date(booking.start_time))} в ${formatClock(booking.start_time)}`;
  const where = address ? ` по адресу ${address}` : '';

  return `Вы записаны в ${destination} на ${when}${where}`;
}

export function formatConfirmedBookingPrice(totalCost: number | null | undefined): string | null {
  if (totalCost == null || Number.isNaN(Number(totalCost))) {
    return null;
  }

  return `${Math.round(Number(totalCost))}₽`;
}
