import { PermissionsStorageService } from '@/services/permissions-storage.service';
import { PermissionsStore } from '@/stores/permissions.store';

jest.mock('@/services/permissions.service', () => ({
  PermissionsService: {
    requestCamera: jest.fn(async () => ({ status: 'granted', canRequestAgain: false })),
    requestNotifications: jest.fn(async () => ({ status: 'granted', canRequestAgain: false })),
    getCameraState: jest.fn(async () => ({ status: 'granted', canRequestAgain: false })),
    getNotificationsState: jest.fn(async () => ({ status: 'granted', canRequestAgain: false })),
    isGranted: jest.fn(() => true),
    openAppSettings: jest.fn(async () => undefined),
  },
}));

jest.mock('@/services/permissions-storage.service', () => ({
  PermissionsStorageService: {
    getOnboardingCompleted: jest.fn(),
    saveOnboardingCompleted: jest.fn(),
    clearOnboardingCompleted: jest.fn(),
  },
}));

describe('PermissionsStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('loads device-scoped onboarding flag on initialize', async () => {
    jest.spyOn(PermissionsStorageService, 'getOnboardingCompleted').mockResolvedValue(true);

    const store = new PermissionsStore();
    await store.initialize();

    expect(store.hasCompletedOnboarding).toBe(true);
    expect(store.isInitialized).toBe(true);
  });

  it('marks onboarding as completed', async () => {
    jest.spyOn(PermissionsStorageService, 'getOnboardingCompleted').mockResolvedValue(false);
    const saveSpy = jest
      .spyOn(PermissionsStorageService, 'saveOnboardingCompleted')
      .mockResolvedValue(undefined);

    const store = new PermissionsStore();
    await store.initialize();
    await store.completeOnboarding();

    expect(saveSpy).toHaveBeenCalledWith(true);
    expect(store.hasCompletedOnboarding).toBe(true);
  });

  it('does not mark onboarding completed when storage save fails', async () => {
    jest.spyOn(PermissionsStorageService, 'getOnboardingCompleted').mockResolvedValue(false);
    jest
      .spyOn(PermissionsStorageService, 'saveOnboardingCompleted')
      .mockRejectedValue(new Error('storage failed'));

    const store = new PermissionsStore();
    await store.initialize();

    await expect(store.completeOnboarding()).rejects.toThrow('storage failed');
    expect(store.hasCompletedOnboarding).toBe(false);
  });

  it('requests camera permission without throwing', async () => {
    jest.spyOn(PermissionsStorageService, 'getOnboardingCompleted').mockResolvedValue(false);

    const store = new PermissionsStore();
    await store.initialize();

    await expect(store.requestPermission('camera')).resolves.toBeUndefined();
  });
});
