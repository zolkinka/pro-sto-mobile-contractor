import { formatPhone, getCleanPhone, isValidPhone, toE164Phone } from '@/utils/phone-mask';

describe('phone-mask', () => {
  describe('formatPhone', () => {
    it('returns empty string for empty input', () => {
      expect(formatPhone('')).toBe('');
    });

    it('formats partial RU number', () => {
      expect(formatPhone('7999')).toBe('+7 (999');
    });

    it('formats full RU number', () => {
      expect(formatPhone('79991234567')).toBe('+7 (999) 123-45-67');
    });

    it('normalizes leading 8 to 7', () => {
      expect(formatPhone('89991234567')).toBe('+7 (999) 123-45-67');
    });
  });

  describe('isValidPhone', () => {
    it('returns false for empty input', () => {
      expect(isValidPhone('')).toBe(false);
    });

    it('returns false for partial number', () => {
      expect(isValidPhone('+7 (999) 123')).toBe(false);
    });

    it('returns true for full RU number', () => {
      expect(isValidPhone('+7 (999) 123-45-67')).toBe(true);
    });
  });

  describe('toE164Phone', () => {
    it('returns E.164 format from formatted phone', () => {
      expect(toE164Phone('+7 (999) 123-45-67')).toBe('+79991234567');
    });

    it('returns E.164 from digits only', () => {
      expect(toE164Phone('79991234567')).toBe('+79991234567');
    });
  });

  describe('getCleanPhone', () => {
    it('strips non-digit characters', () => {
      expect(getCleanPhone('+7 (999) 123-45-67')).toBe('79991234567');
    });
  });
});
