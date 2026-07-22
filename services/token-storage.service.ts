import * as Keychain from 'react-native-keychain';

import type { StoredUser } from '@/types/auth';

const SERVICE_NAME = 'pro-sto-contractors-auth';

interface StoredAuthPayload {
  accessToken: string;
  refreshToken: string;
  user: StoredUser;
}

export class TokenStorageService {
  static async saveAuthData(
    accessToken: string,
    refreshToken: string,
    user: StoredUser,
  ): Promise<void> {
    const payload: StoredAuthPayload = { accessToken, refreshToken, user };

    await Keychain.setGenericPassword(
      'auth',
      JSON.stringify(payload),
      { service: SERVICE_NAME },
    );
  }

  static async getAuthData(): Promise<{
    accessToken: string | null;
    refreshToken: string | null;
    user: StoredUser | null;
  }> {
    const credentials = await Keychain.getGenericPassword({ service: SERVICE_NAME });

    if (!credentials) {
      return { accessToken: null, refreshToken: null, user: null };
    }

    try {
      const payload = JSON.parse(credentials.password) as StoredAuthPayload;
      return {
        accessToken: payload.accessToken,
        refreshToken: payload.refreshToken,
        user: payload.user,
      };
    } catch {
      return { accessToken: null, refreshToken: null, user: null };
    }
  }

  static async clearAuthData(): Promise<void> {
    await Keychain.resetGenericPassword({ service: SERVICE_NAME });
  }
}
