import * as Keychain from 'react-native-keychain';

import type { StoredUser } from '@/types/auth';

const SERVICE_NAME = 'pro-sto-contractors-auth';
const PENDING_PHONE_SERVICE = 'pro-sto-contractors-pending-phone';
const LAST_VERIFIED_SERVICE = 'pro-sto-contractors-last-verified';

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

  static async savePendingPhone(phone: string): Promise<void> {
    await Keychain.setGenericPassword(
      'pendingPhone',
      phone,
      { service: PENDING_PHONE_SERVICE },
    );
  }

  static async getPendingPhone(): Promise<string | null> {
    const credentials = await Keychain.getGenericPassword({ service: PENDING_PHONE_SERVICE });

    if (!credentials) {
      return null;
    }

    return credentials.password || null;
  }

  static async clearPendingPhone(): Promise<void> {
    await Keychain.resetGenericPassword({ service: PENDING_PHONE_SERVICE });
  }

  static async saveLastVerifiedAt(timestamp: number): Promise<void> {
    await Keychain.setGenericPassword(
      'lastVerifiedAt',
      String(timestamp),
      { service: LAST_VERIFIED_SERVICE },
    );
  }

  static async getLastVerifiedAt(): Promise<number | null> {
    const credentials = await Keychain.getGenericPassword({ service: LAST_VERIFIED_SERVICE });

    if (!credentials) {
      return null;
    }

    const parsed = Number(credentials.password);
    return Number.isFinite(parsed) ? parsed : null;
  }

  static async clearLastVerifiedAt(): Promise<void> {
    await Keychain.resetGenericPassword({ service: LAST_VERIFIED_SERVICE });
  }
}
