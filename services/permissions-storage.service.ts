import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Device-scoped storage key.
 * Permissions onboarding is shown once per device (survives logout / re-login).
 * OS permission state is also tied to the device, not the user account.
 */
export const PERMISSIONS_ONBOARDING_STORAGE_KEY = 'has_completed_permissions_onboarding';

export class PermissionsStorageService {
  static async saveOnboardingCompleted(completed: boolean): Promise<void> {
    if (completed) {
      await AsyncStorage.setItem(PERMISSIONS_ONBOARDING_STORAGE_KEY, 'true');
      return;
    }

    await AsyncStorage.removeItem(PERMISSIONS_ONBOARDING_STORAGE_KEY);
  }

  static async getOnboardingCompleted(): Promise<boolean> {
    const value = await AsyncStorage.getItem(PERMISSIONS_ONBOARDING_STORAGE_KEY);
    return value === 'true';
  }

  static async clearOnboardingCompleted(): Promise<void> {
    await AsyncStorage.removeItem(PERMISSIONS_ONBOARDING_STORAGE_KEY);
  }
}
