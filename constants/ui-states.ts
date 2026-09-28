import { theme } from '@/constants/theme';

export const UI_STATE_LABELS = {
  retry: 'Повторить',
  emptyBookingsTitle: 'На этот день записей нет',
  loadBookingsError: 'Не удалось загрузить записи',
  loadBookingDetailsError: 'Не удалось загрузить запись',
  comingSoonTitle: 'Скоро',
  profileComingSoonMessage: 'Профиль будет доступен позже',
  qrScannerComingSoonMessage: 'QR-сканер будет доступен позже',
} as const;

export const UI_STATE_TYPOGRAPHY = {
  title: {
    fontSize: 15,
    lineHeight: 18,
    color: theme.colors.gray[700],
    textAlign: 'center' as const,
  },
  description: {
    fontSize: 14,
    lineHeight: 16.8,
    color: theme.colors.gray[600],
    textAlign: 'center' as const,
  },
} as const;

export const UI_STATE_LAYOUT = {
  horizontalPadding: 32,
  contentGap: 16,
} as const;
