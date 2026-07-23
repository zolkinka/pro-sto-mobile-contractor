export const formatPhone = (value: string): string => {
  const numbers = value.replace(/\D/g, '');

  if (numbers.length === 0) {
    return '';
  }

  let formatted = numbers;
  if (formatted.startsWith('8')) {
    formatted = '7' + formatted.slice(1);
  }

  if (!formatted.startsWith('7')) {
    formatted = '7' + formatted;
  }

  formatted = formatted.slice(0, 11);

  let result = '+7';

  if (formatted.length > 1) {
    result += ' (' + formatted.slice(1, 4);
  }

  if (formatted.length >= 5) {
    result += ') ' + formatted.slice(4, 7);
  }

  if (formatted.length >= 8) {
    result += '-' + formatted.slice(7, 9);
  }

  if (formatted.length >= 10) {
    result += '-' + formatted.slice(9, 11);
  }

  return result;
};

export const isValidPhone = (value: string): boolean => {
  const numbers = value.replace(/\D/g, '');
  return numbers.length === 11 && numbers.startsWith('7');
};

export const getCleanPhone = (value: string): string => {
  return value.replace(/\D/g, '');
};

export const toE164Phone = (value: string): string => {
  const numbers = getCleanPhone(value);
  return `+${numbers}`;
};
