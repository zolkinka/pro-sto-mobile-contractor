import {
  formatConfirmedBookingPrice,
  formatConfirmedBookingSummary,
} from '@/utils/booking-confirmed-summary';

describe('booking-confirmed-summary', () => {
  const start = new Date(2026, 8, 25, 13, 0, 0);

  it('includes service center, time and address', () => {
    const summary = formatConfirmedBookingSummary({
      start_time: start.toISOString(),
      serviceCenterName: 'Шинка',
      serviceCenterAddress: '6-я линия Васильевского острова, 59',
      serviceBusinessType: 'tire_service',
    });

    expect(summary).toContain('Вы записаны в шиномонтаж Шинка');
    expect(summary).toContain('25 сентября');
    expect(summary).toContain('по адресу 6-я линия Васильевского острова, 59');
    expect(summary).toMatch(/в \d{2}:\d{2}/);
  });

  it('reads address from nested service center', () => {
    const summary = formatConfirmedBookingSummary({
      start_time: start.toISOString(),
      serviceBusinessType: 'car_wash',
      service_center: {
        name: 'ПроСТО',
        address: 'Невский пр., 1',
      },
    });

    expect(summary).toContain('мойку ПроСТО');
    expect(summary).toContain('по адресу Невский пр., 1');
  });

  it('omits the address clause when the API did not send one', () => {
    const summary = formatConfirmedBookingSummary({
      start_time: start.toISOString(),
      service: { name: 'Эконом мойка' },
    });

    expect(summary).toContain('Эконом мойка');
    expect(summary).not.toContain('по адресу');
  });

  it('formats the order price without a space', () => {
    expect(formatConfirmedBookingPrice(4000)).toBe('4000₽');
    expect(formatConfirmedBookingPrice(null)).toBeNull();
  });
});
