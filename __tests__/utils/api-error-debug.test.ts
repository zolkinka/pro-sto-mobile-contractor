import axios, { type InternalAxiosRequestConfig } from 'axios';

import { buildApiErrorDebugDetails } from '@/utils/api-error-debug';

jest.mock('@/constants/config', () => ({
  API_BASE_URL: 'https://dev.prosto-app.ru',
}));

describe('buildApiErrorDebugDetails', () => {
  it('includes base URL and axios network fields', () => {
    const error = new axios.AxiosError(
      'Network Error',
      'ERR_NETWORK',
      {
        baseURL: 'https://dev.prosto-app.ru',
        url: '/api/admin-auth/send-code',
        method: 'post',
        headers: {},
      } as InternalAxiosRequestConfig,
      {},
      undefined,
    );

    const details = buildApiErrorDebugDetails(error, {
      method: 'POST',
      path: '/api/admin-auth/send-code',
    });

    expect(details).toContain('API_BASE_URL=https://dev.prosto-app.ru');
    expect(details).toContain('code=ERR_NETWORK');
    expect(details).toContain('url=https://dev.prosto-app.ru/api/admin-auth/send-code');
  });
});
