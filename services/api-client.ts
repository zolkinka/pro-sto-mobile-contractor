import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

import { API_BASE_URL } from '@/constants/config';

type TokenRefreshHandler = () => Promise<string | null>;

let accessToken: string | null = null;
let refreshHandler: TokenRefreshHandler | null = null;

export function setAuthAccessToken(token: string | null) {
  accessToken = token;
}

export function setTokenRefreshHandler(handler: TokenRefreshHandler | null) {
  refreshHandler = handler;
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

function isAuthEndpoint(url?: string) {
  return Boolean(url?.includes('/admin-auth/') || url?.includes('/auth/refresh'));
}

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (accessToken && config.headers && !isAuthEndpoint(config.url)) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isAuthEndpoint(originalRequest.url) &&
      refreshHandler
    ) {
      originalRequest._retry = true;

      const newToken = await refreshHandler();
      if (newToken && originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      }
    }

    return Promise.reject(error);
  },
);

export function isApiUnauthorizedError(error: unknown): boolean {
  return axios.isAxiosError(error) && error.response?.status === 401;
}

export function getApiErrorMessage(error: unknown): string {
  try {
    if (!axios.isAxiosError(error)) {
      if (error instanceof Error && typeof error.message === 'string' && error.message.trim()) {
        return error.message;
      }

      return 'Произошла ошибка. Попробуйте ещё раз';
    }

    if (!error.response) {
      const axiosCode = typeof error.code === 'string' ? error.code : undefined;

      if (axiosCode === 'ECONNABORTED') {
        return 'Превышено время ожидания ответа сервера';
      }

      return 'Нет связи с сервером. Проверьте интернет и попробуйте снова';
    }

    const status = error.response.status;
    const data = error.response.data;
    let serverMessage: string | null = null;

    if (data && typeof data === 'object' && 'message' in data) {
      const rawMessage = (data as { message?: unknown }).message;

      if (typeof rawMessage === 'string' && rawMessage.trim()) {
        serverMessage = rawMessage;
      } else if (rawMessage != null) {
        serverMessage = String(rawMessage);
      }
    }

    switch (status) {
      case 400:
        return serverMessage || 'Неверный код или формат данных';
      case 401:
        return serverMessage || 'Неверные данные для входа';
      case 404:
        return serverMessage || 'Пользователь с таким номером не найден';
      case 410:
        return serverMessage || 'Код истёк. Запросите новый код';
      case 429:
        return serverMessage || 'Превышено количество попыток. Попробуйте позже';
      default:
        return serverMessage || 'Произошла ошибка. Попробуйте ещё раз';
    }
  } catch {
    return 'Произошла ошибка. Попробуйте ещё раз';
  }
}
