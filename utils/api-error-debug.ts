import axios from 'axios';

import { API_BASE_URL } from '@/constants/config';

export type ApiRequestMeta = {
  method?: string;
  path?: string;
};

export function buildApiErrorDebugDetails(
  error: unknown,
  request?: ApiRequestMeta,
): string {
  const parts: string[] = [`API_BASE_URL=${API_BASE_URL}`];

  if (request?.method && request?.path) {
    parts.push(`${request.method} ${request.path}`);
  }

  if (axios.isAxiosError(error)) {
    const base = error.config?.baseURL ?? API_BASE_URL;
    const path = error.config?.url ?? request?.path;

    if (path) {
      parts.push(`url=${base}${path.startsWith('/') ? '' : '/'}${path}`);
    }

    if (typeof error.code === 'string' && error.code) {
      parts.push(`code=${error.code}`);
    }

    if (typeof error.message === 'string' && error.message.trim()) {
      parts.push(`transportMessage=${error.message}`);
    }

    if (error.response?.status != null) {
      parts.push(`httpStatus=${error.response.status}`);
    }
  } else if (error instanceof Error && error.message.trim()) {
    parts.push(`message=${error.message}`);
  } else {
    parts.push(`type=${typeof error}`);
  }

  return parts.join('\n');
}

/** Logs to Metro/DevTools and returns details for on-screen dev hints. */
export function logApiErrorInDev(
  error: unknown,
  label: string,
  request?: ApiRequestMeta,
): string | null {
  if (!__DEV__) {
    return null;
  }

  const details = buildApiErrorDebugDetails(error, request);
  console.warn(`[API ${label}]\n${details}`);

  return details;
}
