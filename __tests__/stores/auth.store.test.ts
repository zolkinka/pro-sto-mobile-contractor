jest.unmock('@/stores/auth.store');

jest.mock('@/services/api-client', () => ({
  setAuthAccessToken: jest.fn(),
  setTokenRefreshHandler: jest.fn(),
  isApiUnauthorizedError: jest.fn((error: unknown) => {
    const axios = require('axios');
    return axios.isAxiosError(error) && error.response?.status === 401;
  }),
  getApiErrorMessage: jest.fn(() => 'API error'),
}));

jest.mock('@/services/token-storage.service', () => ({
  TokenStorageService: {
    getAuthData: jest.fn(),
    saveAuthData: jest.fn(),
    clearAuthData: jest.fn(),
    saveLastVerifiedAt: jest.fn(),
    getLastVerifiedAt: jest.fn(),
    clearLastVerifiedAt: jest.fn(),
    savePendingPhone: jest.fn(),
    getPendingPhone: jest.fn(),
    clearPendingPhone: jest.fn(),
  },
}));

jest.mock('@/services/auth-api', () => ({
  sendAdminAuthCode: jest.fn(),
  loginWithAdminAuthCode: jest.fn(),
  refreshAdminAuthToken: jest.fn(),
  getCurrentAdminUser: jest.fn(),
  mapAdminUserToStoredUser: jest.fn((user: {
    uuid: string;
    phone: string;
    name: string;
    email: string;
    service_center_uuid: string | null;
  }) => ({
    uuid: user.uuid,
    phone: user.phone,
    name: user.name,
    email: user.email,
    serviceCenterUuid: user.service_center_uuid,
  })),
}));

import axios from 'axios';

import {
  getCurrentAdminUser,
  loginWithAdminAuthCode,
  refreshAdminAuthToken,
  sendAdminAuthCode,
} from '@/services/auth-api';
import { setAuthAccessToken } from '@/services/api-client';
import { TokenStorageService } from '@/services/token-storage.service';
import { AuthStore } from '@/stores/auth.store';

const mockSetAuthAccessToken = setAuthAccessToken as jest.Mock;

const mockUser = {
  uuid: 'user-1',
  phone: '+79991234567',
  name: 'Test User',
  email: 'test@example.com',
  serviceCenterUuid: 'sc-1',
};

const mockAdminUser = {
  uuid: 'user-1',
  phone: '+79991234567',
  name: 'Test User',
  email: 'test@example.com',
  service_center_uuid: 'sc-1',
  role: { uuid: 'r1', name: 'Admin', key: 'admin', type: 'admin', permissions: [] },
  auth_panel: 'service_center' as const,
};

const mockAuthResponse = {
  success: true,
  message: 'ok',
  accessToken: 'access-token',
  refreshToken: 'refresh-token',
  user: mockAdminUser,
};

function createUnauthorizedError() {
  return new axios.AxiosError('Unauthorized', undefined, undefined, undefined, {
    status: 401,
    data: {},
    headers: {},
    config: {},
    statusText: 'Unauthorized',
  });
}

function createNetworkError() {
  return new axios.AxiosError('Network Error');
}

describe('AuthStore', () => {
  let store: AuthStore;

  beforeEach(() => {
    jest.clearAllMocks();
    (TokenStorageService.getAuthData as jest.Mock).mockResolvedValue({
      accessToken: null,
      refreshToken: null,
      user: null,
    });
    (TokenStorageService.getLastVerifiedAt as jest.Mock).mockResolvedValue(null);
    (TokenStorageService.getPendingPhone as jest.Mock).mockResolvedValue(null);
    store = new AuthStore();
  });

  describe('login', () => {
    it('saves tokens and sets access token on success', async () => {
      store.phone = '+79991234567';
      (loginWithAdminAuthCode as jest.Mock).mockResolvedValue(mockAuthResponse);

      const result = await store.login('1234');

      expect(result).toBe(true);
      expect(TokenStorageService.saveAuthData).toHaveBeenCalledWith(
        'access-token',
        'refresh-token',
        mockUser,
      );
      expect(mockSetAuthAccessToken).toHaveBeenCalledWith('access-token');
      expect(TokenStorageService.saveLastVerifiedAt).toHaveBeenCalled();
      expect(TokenStorageService.clearPendingPhone).toHaveBeenCalled();
    });

    it('sets error and does not save tokens on failure', async () => {
      store.phone = '+79991234567';
      (loginWithAdminAuthCode as jest.Mock).mockRejectedValue(createNetworkError());

      const result = await store.login('1234');

      expect(result).toBe(false);
      expect(store.error).toBeTruthy();
      expect(TokenStorageService.saveAuthData).not.toHaveBeenCalled();
    });
  });

  describe('sendCode', () => {
    it('saves pending phone on success', async () => {
      (sendAdminAuthCode as jest.Mock).mockResolvedValue({ success: true, message: 'ok' });

      const result = await store.sendCode('+7 (999) 123-45-67');

      expect(result).toBe(true);
      expect(TokenStorageService.savePendingPhone).toHaveBeenCalledWith('+79991234567');
      expect(store.phone).toBe('+79991234567');
    });
  });

  describe('refreshAccessToken', () => {
    it('returns false without logout when session is missing', async () => {
      const logoutSpy = jest.spyOn(store, 'logout').mockResolvedValue();

      const result = await store.refreshAccessToken();

      expect(result).toBe(false);
      expect(logoutSpy).not.toHaveBeenCalled();
    });
  });

  describe('restoreSessionFromStoredTokens', () => {
    beforeEach(() => {
      store.accessToken = 'access-token';
      store.refreshToken = 'refresh-token';
      store.user = mockUser;
    });

    it('keeps session and saves lastVerifiedAt when token is valid', async () => {
      (getCurrentAdminUser as jest.Mock).mockResolvedValue(mockAdminUser);

      const result = await (store as unknown as {
        restoreSessionFromStoredTokens: () => Promise<boolean>;
      }).restoreSessionFromStoredTokens();

      expect(result).toBe(true);
      expect(TokenStorageService.saveLastVerifiedAt).toHaveBeenCalled();
    });

    it('refreshes and keeps session when unauthorized then valid', async () => {
      (getCurrentAdminUser as jest.Mock)
        .mockRejectedValueOnce(createUnauthorizedError())
        .mockResolvedValueOnce(mockAdminUser);
      (refreshAdminAuthToken as jest.Mock).mockResolvedValue({
        accessToken: 'new-access',
        refreshToken: 'new-refresh',
      });

      const result = await (store as unknown as {
        restoreSessionFromStoredTokens: () => Promise<boolean>;
      }).restoreSessionFromStoredTokens();

      expect(result).toBe(true);
      expect(refreshAdminAuthToken).toHaveBeenCalled();
      expect(TokenStorageService.saveLastVerifiedAt).toHaveBeenCalled();
    });

    it('returns false when unauthorized and refresh fails', async () => {
      (getCurrentAdminUser as jest.Mock).mockRejectedValue(createUnauthorizedError());
      (refreshAdminAuthToken as jest.Mock).mockRejectedValue(createUnauthorizedError());

      const result = await (store as unknown as {
        restoreSessionFromStoredTokens: () => Promise<boolean>;
      }).restoreSessionFromStoredTokens();

      expect(result).toBe(false);
    });

    it('keeps session when unavailable and within offline grace', async () => {
      (getCurrentAdminUser as jest.Mock).mockRejectedValue(createNetworkError());
      (TokenStorageService.getLastVerifiedAt as jest.Mock).mockResolvedValue(Date.now() - 1000);

      const result = await (store as unknown as {
        restoreSessionFromStoredTokens: () => Promise<boolean>;
      }).restoreSessionFromStoredTokens();

      expect(result).toBe(true);
    });

    it('returns false when unavailable and no lastVerifiedAt', async () => {
      (getCurrentAdminUser as jest.Mock).mockRejectedValue(createNetworkError());
      (TokenStorageService.getLastVerifiedAt as jest.Mock).mockResolvedValue(null);

      const result = await (store as unknown as {
        restoreSessionFromStoredTokens: () => Promise<boolean>;
      }).restoreSessionFromStoredTokens();

      expect(result).toBe(false);
    });

    it('returns false when unavailable and offline grace expired', async () => {
      (getCurrentAdminUser as jest.Mock).mockRejectedValue(createNetworkError());
      const eightDaysAgo = Date.now() - 8 * 24 * 60 * 60 * 1000;
      (TokenStorageService.getLastVerifiedAt as jest.Mock).mockResolvedValue(eightDaysAgo);

      const result = await (store as unknown as {
        restoreSessionFromStoredTokens: () => Promise<boolean>;
      }).restoreSessionFromStoredTokens();

      expect(result).toBe(false);
    });
  });

  describe('performTokenRefresh', () => {
    beforeEach(() => {
      store.accessToken = 'access-token';
      store.refreshToken = 'refresh-token';
      store.user = mockUser;
    });

    it('logs out on 401 refresh error', async () => {
      (refreshAdminAuthToken as jest.Mock).mockRejectedValue(createUnauthorizedError());
      const logoutSpy = jest.spyOn(store, 'logout').mockResolvedValue();

      const result = await (store as unknown as {
        performTokenRefresh: () => Promise<boolean>;
      }).performTokenRefresh();

      expect(result).toBe(false);
      expect(logoutSpy).toHaveBeenCalled();
    });

    it('does not logout on network error', async () => {
      (refreshAdminAuthToken as jest.Mock).mockRejectedValue(createNetworkError());
      const logoutSpy = jest.spyOn(store, 'logout').mockResolvedValue();

      const result = await (store as unknown as {
        performTokenRefresh: () => Promise<boolean>;
      }).performTokenRefresh();

      expect(result).toBe(false);
      expect(logoutSpy).not.toHaveBeenCalled();
    });

    it('updates tokens and lastVerifiedAt on success', async () => {
      (refreshAdminAuthToken as jest.Mock).mockResolvedValue({
        accessToken: 'new-access',
        refreshToken: 'new-refresh',
      });

      const result = await (store as unknown as {
        performTokenRefresh: () => Promise<boolean>;
      }).performTokenRefresh();

      expect(result).toBe(true);
      expect(mockSetAuthAccessToken).toHaveBeenCalledWith('new-access');
      expect(TokenStorageService.saveLastVerifiedAt).toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('clears auth data, lastVerifiedAt and pending phone', async () => {
      store.accessToken = 'access-token';
      store.refreshToken = 'refresh-token';
      store.user = mockUser;

      await store.logout();

      expect(mockSetAuthAccessToken).toHaveBeenCalledWith(null);
      expect(TokenStorageService.clearAuthData).toHaveBeenCalled();
      expect(TokenStorageService.clearLastVerifiedAt).toHaveBeenCalled();
      expect(TokenStorageService.clearPendingPhone).toHaveBeenCalled();
      expect(store.accessToken).toBeNull();
    });
  });
});
