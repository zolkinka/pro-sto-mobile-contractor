import { makeAutoObservable, runInAction } from 'mobx';

import {
  getCurrentAdminUser,
  loginWithAdminAuthCode,
  mapAdminUserToStoredUser,
  refreshAdminAuthToken,
  sendAdminAuthCode,
} from '@/services/auth-api';
import {
  getApiErrorMessage,
  isApiUnauthorizedError,
  setAuthAccessToken,
  setTokenRefreshHandler,
} from '@/services/api-client';
import { TokenStorageService } from '@/services/token-storage.service';
import type { StoredUser } from '@/types/auth';
import { toE164Phone } from '@/utils/phone-mask';

export class AuthStore {
  accessToken: string | null = null;
  refreshToken: string | null = null;
  user: StoredUser | null = null;
  phone: string | null = null;
  isLoading = false;
  isInitialized = false;
  error: string | null = null;

  private refreshTokenPromise: Promise<boolean> | null = null;
  private authInitPromise: Promise<void> | null = null;

  constructor() {
    makeAutoObservable(this);
    setTokenRefreshHandler(() => this.refreshAccessToken().then((ok) => (ok ? this.accessToken : null)));
    this.initializeAuth().catch(() => undefined);
  }

  async initializeAuth(): Promise<void> {
    if (!this.authInitPromise) {
      this.authInitPromise = this.runInitializeAuth();
    }

    return this.authInitPromise;
  }

  private async runInitializeAuth(): Promise<void> {
    try {
      const authData = await TokenStorageService.getAuthData();

      if (authData.accessToken && authData.refreshToken && authData.user) {
        const storedUser = authData.user;

        runInAction(() => {
          this.accessToken = authData.accessToken;
          this.refreshToken = authData.refreshToken;
          this.user = storedUser;
          this.phone = storedUser.phone;
        });

        setAuthAccessToken(authData.accessToken);

        const sessionValid = await this.restoreSessionFromStoredTokens();
        if (!sessionValid) {
          await this.logout();
        }
      }
    } catch {
      await this.logout();
    } finally {
      runInAction(() => {
        this.isInitialized = true;
      });
    }
  }

  private async restoreSessionFromStoredTokens(): Promise<boolean> {
    const validity = await this.checkTokenValidity();

    if (validity === 'valid') {
      return true;
    }

    if (validity === 'unauthorized') {
      const refreshed = await this.refreshAccessToken();
      if (!refreshed) {
        return false;
      }

      return (await this.checkTokenValidity()) === 'valid';
    }

    // Network/server unavailable — keep cached session for offline use.
    return true;
  }

  async checkTokenValidity(): Promise<'valid' | 'unauthorized' | 'unavailable'> {
    try {
      const currentUser = await getCurrentAdminUser();
      runInAction(() => {
        this.user = mapAdminUserToStoredUser(currentUser);
        this.phone = currentUser.phone;
      });
      return 'valid';
    } catch (error) {
      if (isApiUnauthorizedError(error)) {
        return 'unauthorized';
      }

      return 'unavailable';
    }
  }

  async sendCode(phone: string): Promise<boolean> {
    this.isLoading = true;
    this.error = null;

    try {
      const normalizedPhone = toE164Phone(phone);
      await sendAdminAuthCode(normalizedPhone);

      runInAction(() => {
        this.phone = normalizedPhone;
        this.isLoading = false;
      });

      return true;
    } catch (error) {
      runInAction(() => {
        this.isLoading = false;
        this.error = getApiErrorMessage(error);
      });
      return false;
    }
  }

  async login(code: string): Promise<boolean> {
    if (!this.phone) {
      this.error = 'Номер телефона не указан';
      return false;
    }

    this.isLoading = true;
    this.error = null;

    try {
      const response = await loginWithAdminAuthCode(this.phone, code);
      const mappedUser = mapAdminUserToStoredUser(response.user);

      runInAction(() => {
        this.accessToken = response.accessToken;
        this.refreshToken = response.refreshToken;
        this.user = mappedUser;
        this.phone = mappedUser.phone;
        this.isLoading = false;
        this.error = null;
      });

      await TokenStorageService.saveAuthData(
        response.accessToken,
        response.refreshToken,
        mappedUser,
      );

      return true;
    } catch (error) {
      runInAction(() => {
        this.isLoading = false;
        this.error = getApiErrorMessage(error);
      });
      return false;
    }
  }

  async refreshAccessToken(): Promise<boolean> {
    if (this.refreshTokenPromise) {
      return this.refreshTokenPromise;
    }

    if (!this.refreshToken || !this.user) {
      await this.logout();
      return false;
    }

    this.refreshTokenPromise = this.performTokenRefresh();

    try {
      return await this.refreshTokenPromise;
    } finally {
      this.refreshTokenPromise = null;
    }
  }

  private async performTokenRefresh(): Promise<boolean> {
    try {
      const response = await refreshAdminAuthToken(this.refreshToken!);

      runInAction(() => {
        this.accessToken = response.accessToken;
        this.refreshToken = response.refreshToken;
      });

      if (this.user) {
        await TokenStorageService.saveAuthData(
          response.accessToken,
          response.refreshToken,
          this.user,
        );
      }

      return true;
    } catch {
      await this.logout();
      return false;
    }
  }

  async logout(): Promise<void> {
    runInAction(() => {
      this.accessToken = null;
      this.refreshToken = null;
      this.user = null;
      this.phone = null;
      this.error = null;
    });

    setAuthAccessToken(null);
    await TokenStorageService.clearAuthData();
  }

  clearError(): void {
    this.error = null;
  }

  get isAuthenticated(): boolean {
    return !!this.accessToken && !!this.user;
  }
}

export const authStore = new AuthStore();
