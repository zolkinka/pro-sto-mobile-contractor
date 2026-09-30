import { apiClient } from '@/services/api-client';

export interface AdminNotificationSettings {
  newBooking: boolean;
  statusChange: boolean;
  reminders: boolean;
  promotions: boolean;
}

const DEFAULT_SETTINGS: AdminNotificationSettings = {
  newBooking: true,
  statusChange: true,
  reminders: true,
  promotions: false,
};

function normalizeSettings(payload: Partial<AdminNotificationSettings> | null | undefined): AdminNotificationSettings {
  return {
    newBooking: payload?.newBooking ?? DEFAULT_SETTINGS.newBooking,
    statusChange: payload?.statusChange ?? DEFAULT_SETTINGS.statusChange,
    reminders: payload?.reminders ?? DEFAULT_SETTINGS.reminders,
    promotions: payload?.promotions ?? DEFAULT_SETTINGS.promotions,
  };
}

export async function fetchNotificationSettings(): Promise<AdminNotificationSettings> {
  const response = await apiClient.get<Partial<AdminNotificationSettings>>('/api/notifications/settings');
  return normalizeSettings(response.data);
}

export async function updateNotificationSettings(
  settings: AdminNotificationSettings,
): Promise<AdminNotificationSettings> {
  const response = await apiClient.put<Partial<AdminNotificationSettings>>(
    '/api/notifications/settings',
    settings,
  );
  return normalizeSettings(response.data);
}
