import { AxiosError, InternalAxiosRequestConfig } from 'axios';

const mockRefreshHandler = jest.fn();

jest.mock('@/constants/config', () => ({
  API_BASE_URL: 'https://test.example.com',
}));

describe('api-client interceptors', () => {
  beforeEach(() => {
    jest.resetModules();
    mockRefreshHandler.mockReset();
  });

  function loadApiClient() {
    const apiClientModule = require('@/services/api-client') as typeof import('@/services/api-client');
    apiClientModule.setTokenRefreshHandler(mockRefreshHandler);
    return apiClientModule;
  }

  function create401Error(url: string, config?: Partial<InternalAxiosRequestConfig>) {
    const requestConfig = {
      url,
      headers: {},
      ...config,
    } as InternalAxiosRequestConfig;

    return new AxiosError(
      'Unauthorized',
      undefined,
      requestConfig,
      undefined,
      {
        status: 401,
        data: {},
        headers: {},
        config: requestConfig,
        statusText: 'Unauthorized',
      },
    );
  }

  function getRejectedHandler(apiClient: typeof import('@/services/api-client').apiClient) {
    const responseInterceptor = apiClient.interceptors.response as unknown as {
      handlers: Array<{ rejected: (error: AxiosError) => Promise<unknown> }>;
    };
    return responseInterceptor.handlers[0].rejected;
  }

  it('retries original request after successful token refresh', async () => {
    const { apiClient } = loadApiClient();
    mockRefreshHandler.mockResolvedValue('new-token');

    const adapterMock = jest.fn(async (config: InternalAxiosRequestConfig) => ({
      data: { ok: true },
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    }));
    apiClient.defaults.adapter = adapterMock;

    const rejectedHandler = getRejectedHandler(apiClient);
    const error = create401Error('/api/orders');
    const response = await rejectedHandler(error);

    expect(mockRefreshHandler).toHaveBeenCalled();
    expect(adapterMock).toHaveBeenCalled();
    expect(response).toEqual(expect.objectContaining({ status: 200, data: { ok: true } }));
  });

  it('does not retry auth endpoints on 401', async () => {
    const { apiClient } = loadApiClient();
    const rejectedHandler = getRejectedHandler(apiClient);

    const loginError = create401Error('/api/admin-auth/login');
    await expect(rejectedHandler(loginError)).rejects.toBe(loginError);
    expect(mockRefreshHandler).not.toHaveBeenCalled();

    mockRefreshHandler.mockReset();

    const refreshError = create401Error('/api/auth/refresh');
    await expect(rejectedHandler(refreshError)).rejects.toBe(refreshError);
    expect(mockRefreshHandler).not.toHaveBeenCalled();
  });

  it('rejects when refresh handler returns null', async () => {
    const { apiClient } = loadApiClient();
    mockRefreshHandler.mockResolvedValue(null);

    const rejectedHandler = getRejectedHandler(apiClient);
    const error = create401Error('/api/orders');
    await expect(rejectedHandler(error)).rejects.toBe(error);
  });

  it('identifies unauthorized errors', () => {
    const { isApiUnauthorizedError } = loadApiClient();
    const error = create401Error('/api/orders');

    expect(isApiUnauthorizedError(error)).toBe(true);
    expect(isApiUnauthorizedError(new Error('fail'))).toBe(false);
  });
});
