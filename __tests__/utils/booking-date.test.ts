import { formatCalendarDay, isBookingOnDay, isSameDay } from '@/utils/booking-date';

describe('booking-date', () => {
  describe('isBookingOnDay', () => {
    it('matches booking to selected local calendar day', () => {
      const selected = new Date(2026, 5, 29, 12, 0, 0);
      const startTimeIso = new Date(2026, 5, 29, 23, 30, 0).toISOString();

      expect(isBookingOnDay(startTimeIso, selected)).toBe(true);
    });

    it('does not match booking on previous local day', () => {
      const selected = new Date(2026, 5, 30, 12, 0, 0);
      const startTimeIso = new Date(2026, 5, 29, 23, 30, 0).toISOString();

      expect(isBookingOnDay(startTimeIso, selected)).toBe(false);
    });
  });

  describe('formatCalendarDay', () => {
    it('formats local date as YYYY-MM-DD', () => {
      const date = new Date(2026, 5, 9, 15, 0, 0);
      expect(formatCalendarDay(date)).toBe('2026-06-09');
    });
  });

  describe('isSameDay', () => {
    it('returns true for same local day with different times', () => {
      const morning = new Date(2026, 5, 29, 8, 0, 0);
      const evening = new Date(2026, 5, 29, 20, 0, 0);

      expect(isSameDay(morning, evening)).toBe(true);
    });
  });
});
