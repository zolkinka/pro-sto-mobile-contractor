import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';

import { API_BASE_URL } from '@/constants/config';

const FETCH_TIMEOUT_MS = 15000;

function joinUrl(path: string): string {
  const base = API_BASE_URL.replace(/\/$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  return `${base}${normalizedPath}`;
}

function toAxiosNetworkError(path: string, method: string, cause: unknown): AxiosError {
  const message =
    cause instanceof Error && cause.message.trim() ? cause.message : 'Network Error';

  return new AxiosError(message, 'ERR_NETWORK', {
    url: path,
    baseURL: API_BASE_URL,
    method,
    headers: {},
  } as InternalAxiosRequestConfig);
}

function toAxiosTimeoutError(path: string, method: string): AxiosError {
  return new AxiosError(
    `timeout of ${FETCH_TIMEOUT_MS}ms exceeded`,
    'ECONNABORTED',
    {
      url: path,
      baseURL: API_BASE_URL,
      method,
      headers: {},
    } as InternalAxiosRequestConfig,
  );
}

function toAxiosHttpError(
  path: string,
  method: string,
  response: Response,
  data: unknown,
): AxiosError {
  const config = {
    url: path,
    baseURL: API_BASE_URL,
    method,
    headers: {},
  } as InternalAxiosRequestConfig;

  return new AxiosError(
    'Request failed',
    undefined,
    config,
    undefined,
    {
      status: response.status,
      statusText: response.statusText,
      data,
      headers: {},
      config,
    },
  );
}

async function parseResponseBody(response: Response): Promise<unknown> {
  const text = await response.text();

  if (!text.trim()) {
    return {};
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return { message: text };
  }
}

async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  path: string,
  method: string,
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } catch (cause) {
    if (cause instanceof Error && cause.name === 'AbortError') {
      throw toAxiosTimeoutError(path, method);
    }

    throw toAxiosNetworkError(path, method, cause);
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function fetchJsonPost<T>(
  path: string,
  body: unknown,
  options?: { headers?: Record<string, string> },
): Promise<T> {
  const url = joinUrl(path);

  let response: Response;

  try {
    response = await fetchWithTimeout(
      url,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...options?.headers,
        },
        body: JSON.stringify(body),
      },
      path,
      'post',
    );
  } catch (error) {
    if (error instanceof AxiosError) {
      throw error;
    }

    throw toAxiosNetworkError(path, 'post', error);
  }

  const data = await parseResponseBody(response);

  if (!response.ok) {
    throw toAxiosHttpError(path, 'post', response, data);
  }

  return data as T;
}

export async function fetchJsonGet<T>(
  path: string,
  options?: { headers?: Record<string, string> },
): Promise<T> {
  const url = joinUrl(path);

  let response: Response;

  try {
    response = await fetchWithTimeout(
      url,
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          ...options?.headers,
        },
      },
      path,
      'get',
    );
  } catch (error) {
    if (error instanceof AxiosError) {
      throw error;
    }

    throw toAxiosNetworkError(path, 'get', error);
  }

  const data = await parseResponseBody(response);

  if (!response.ok) {
    throw toAxiosHttpError(path, 'get', response, data);
  }

  return data as T;
}

/** Dev-only: check whether RN fetch can reach the API host at all. */
export async function probeApiHostReachability(): Promise<string> {
  const url = joinUrl('/');

  try {
    const response = await fetchWithTimeout(url, { method: 'GET' }, '/', 'get');

    return `fetchProbe GET / → status=${response.status}`;
  } catch (cause) {
    if (cause instanceof AxiosError) {
      return `fetchProbe GET / → error=${cause.message} (${cause.code ?? 'unknown'})`;
    }

    const message = cause instanceof Error ? cause.message : String(cause);

    return `fetchProbe GET / → error=${message}`;
  }
}
