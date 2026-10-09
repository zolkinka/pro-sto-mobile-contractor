import axios from 'axios';

const QR_NOT_FOUND_MESSAGE = 'QR-код не найден, попробуйте снова';

interface ConfirmationErrorDetail {
  remaining_attempts?: number;
  blocked?: boolean;
  support_email?: string;
}

interface ConfirmationErrorBody {
  code?: string;
  message?: string;
  details?: ConfirmationErrorDetail[];
}

export interface BookingConfirmFailure {
  message: string;
  blocked: boolean;
  supportEmail?: string | null;
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

export function getBookingConfirmFailure(error: unknown): BookingConfirmFailure {
  if (!axios.isAxiosError(error)) {
    return {
      message: 'Не удалось подтвердить запись. Попробуйте ещё раз',
      blocked: false,
    };
  }

  const status = error.response?.status;
  const body = readConfirmationError(error);
  const message = body?.message?.trim();
  const detail = body?.details?.[0];
  const blocked =
    body?.code === 'CONFIRMATION_ATTEMPTS_EXCEEDED' || detail?.blocked === true;

  if (blocked) {
    const base = message || 'Превышен лимит попыток ввода кода';
    const email = detail?.support_email?.trim();

    return { message: base, blocked: true, supportEmail: email || null };
  }

  if (body?.code === 'INVALID_CONFIRMATION_CODE' || status === 400) {
    const remaining = detail?.remaining_attempts;
    const base = message || 'Неверный код подтверждения';

    if (typeof remaining === 'number') {
      return { message: `${base}. Осталось попыток: ${remaining}`, blocked: false };
    }

    return { message: base, blocked: false };
  }

  if (status === 404) {
    return { message: message || 'Бронирование не найдено', blocked: false };
  }

  if (status === 403) {
    return { message: message || 'Нет доступа к этому бронированию', blocked: false };
  }

  return {
    message: message || 'Не удалось подтвердить запись. Попробуйте ещё раз',
    blocked: false,
  };
}

export function getBookingConfirmErrorMessage(error: unknown): string {
  return getBookingConfirmFailure(error).message;
}

export function getQrScanErrorMessage(): string {
  return QR_NOT_FOUND_MESSAGE;
}
