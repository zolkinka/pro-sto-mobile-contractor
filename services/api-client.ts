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

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (accessToken && config.headers) {
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

    const isAuthEndpoint =
      originalRequest?.url?.includes('/admin-auth/') ||
      originalRequest?.url?.includes('/auth/refresh');

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isAuthEndpoint &&
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
  if (!axios.isAxiosError(error)) {
    return 'Произошла ошибка. Попробуйте ещё раз';
  }

  const status = error.response?.status;
  const serverMessage =
    typeof error.response?.data === 'object' &&
    error.response?.data &&
    'message' in error.response.data
      ? String((error.response.data as { message: unknown }).message)
      : null;

  switch (status) {
    case 400:
      return serverMessage || 'Неверный код или формат данных';
    case 401:
      return serverMessage || 'Неверные данные для входа';
    case 404:
      return 'Пользователь с таким номером не найден';
    case 410:
      return 'Код истёк. Запросите новый код';
    case 429:
      return 'Превышено количество попыток. Попробуйте позже';
    default:
      return serverMessage || 'Произошла ошибка. Попробуйте ещё раз';
  }
}
