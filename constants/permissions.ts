export const PERMISSIONS_CONTENT_WIDTH = 358;

/** Device-scoped onboarding copy — shown once per device, not per user account. */
export const CAMERA_PERMISSION_COPY = {
  titleLine1: 'Разрешите доступ',
  titleLine2: 'к камере',
  step: '(1/2)' as const,
  subtitle: 'Необходимо для сканирования QR-кодов записей',
  image: require('@/assets/images/permissions/camera.png'),
};

export const NOTIFICATIONS_PERMISSION_COPY = {
  titleLine1: 'Разрешите доступ',
  titleLine2: 'к уведомлениям',
  step: '(2/2)' as const,
  subtitle: 'Не пропускайте новые записи и уведомления о слотах',
  image: require('@/assets/images/permissions/notifications.png'),
};
