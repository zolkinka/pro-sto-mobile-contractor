import axios from 'axios';

const QR_NOT_FOUND_MESSAGE = 'QR-код не найден, попробуйте снова';

interface ConfirmationErrorBody {
  code?: string;
  message?: string;
  details?: Array<{ remaining_attempts?: number }>;
}

function readConfirmationError(error: unknown): ConfirmationErrorBody | null {
  if (!axios.isAxiosError(error) || !error.response?.data || typeof error.response.data !== 'object') {
    return null;
  }

  const data = error.response.data as { error?: ConfirmationErrorBody; message?: unknown };

  if ('error' in data && data.error && typeof data.error === 'object') {
    return data.error;
  }

  if (typeof data.message === 'string') {
    return { message: data.message };
  }

  return null;
}

export function getBookingConfirmErrorMessage(error: unknown): string {
  if (!axios.isAxiosError(error)) {
    return 'Не удалось подтвердить запись. Попробуйте ещё раз';
  }

  const status = error.response?.status;
  const body = readConfirmationError(error);
  const message = body?.message?.trim();

  if (body?.code === 'CONFIRMATION_ATTEMPTS_EXCEEDED' || status === 429) {
    return message || 'Превышен лимит попыток ввода кода';
  }

  if (body?.code === 'INVALID_CONFIRMATION_CODE' || status === 400) {
    const remaining = body?.details?.[0]?.remaining_attempts;
    const base = message || 'Неверный код подтверждения';

    if (typeof remaining === 'number') {
      return `${base}. Осталось попыток: ${remaining}`;
    }

    return base;
  }

  if (status === 404) {
    return message || 'Бронирование не найдено';
  }

  if (status === 403) {
    return message || 'Нет доступа к этому бронированию';
  }

  return message || 'Не удалось подтвердить запись. Попробуйте ещё раз';
}

export function getQrScanErrorMessage(): string {
  return QR_NOT_FOUND_MESSAGE;
}
