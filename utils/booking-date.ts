const MONTH_NAMES_GENITIVE = [
  'января',
  'февраля',
  'марта',
  'апреля',
  'мая',
  'июня',
  'июля',
  'августа',
  'сентября',
  'октября',
  'ноября',
  'декабря',
];

export function getDayRangeIso(date: Date): { dateFrom: string; dateTo: string } {
  const start = startOfDay(date);
  const end = new Date(start);
  end.setHours(23, 59, 59, 999);

  return {
    dateFrom: start.toISOString(),
    dateTo: end.toISOString(),
  };
}

export function getMonthRangeIso(date: Date): { dateFrom: string; dateTo: string } {
  const start = startOfDay(new Date(date.getFullYear(), date.getMonth(), 1));
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);

  return {
    dateFrom: start.toISOString(),
    dateTo: end.toISOString(),
  };
}

export function formatCalendarDay(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

/** Compare calendar days in device local timezone (stable across UTC offsets). */
export function isBookingOnDay(startTimeIso: string, date: Date): boolean {
  return formatCalendarDay(new Date(startTimeIso)) === formatCalendarDay(date);
}

export function startOfDay(date: Date): Date {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
}

export function isSameDay(left: Date, right: Date): boolean {
  return startOfDay(left).getTime() === startOfDay(right).getTime();
}

export function formatBookingDayLabel(date: Date): string {
  const day = date.getDate();
  const month = MONTH_NAMES_GENITIVE[date.getMonth()];
  return `${day} ${month}`;
}

export function formatBookingTimeRange(startIso: string, endIso: string): string {
  const start = new Date(startIso);
  const end = new Date(endIso);

  const formatTime = (value: Date) =>
    value.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

  return `${formatTime(start)} — ${formatTime(end)}`;
}

export function formatBookingDurationMinutes(totalMinutes: number): string {
  if (totalMinutes < 60) {
    return `${totalMinutes} мин`;
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (minutes === 0) {
    return `${hours} ч`;
  }

  return `${hours} ч ${minutes} мин`;
}

function formatDurationHoursLabel(hours: number): string {
  const mod10 = hours % 10;
  const mod100 = hours % 100;

  if (mod100 >= 11 && mod100 <= 14) {
    return `${hours} часов`;
  }

  if (mod10 === 1) {
    return `${hours} час`;
  }

  if (mod10 >= 2 && mod10 <= 4) {
    return `${hours} часа`;
  }

  return `${hours} часов`;
}

/** Client card format: `13:30 — 14:30 (1 час)`. */
export function formatBookingTimeWithDuration(
  startIso: string,
  endIso: string,
  totalMinutes: number,
): string {
  const timeRange = formatBookingTimeRange(startIso, endIso);

  if (totalMinutes < 60) {
    return `${timeRange} (${totalMinutes} мин)`;
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (minutes === 0) {
    return `${timeRange} (${formatDurationHoursLabel(hours)})`;
  }

  return `${timeRange} (${formatDurationHoursLabel(hours)} ${minutes} мин)`;
}
