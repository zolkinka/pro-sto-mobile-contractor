import { Linking, PermissionsAndroid, Platform } from 'react-native';

const mockCheck = jest.fn();
const mockRequest = jest.fn();
const mockCheckNotifications = jest.fn();
const mockRequestNotifications = jest.fn();
const mockOpenSettings = jest.fn();

jest.mock('react-native-permissions', () => ({
  PERMISSIONS: {
    IOS: { CAMERA: 'ios.permission.CAMERA' },
    ANDROID: { CAMERA: 'android.permission.CAMERA' },
  },
  RESULTS: {
    UNAVAILABLE: 'unavailable',
    BLOCKED: 'blocked',
    DENIED: 'denied',
    GRANTED: 'granted',
    LIMITED: 'limited',
  },
  check: (...args: unknown[]) => mockCheck(...args),
  request: (...args: unknown[]) => mockRequest(...args),
  checkNotifications: (...args: unknown[]) => mockCheckNotifications(...args),
  requestNotifications: (...args: unknown[]) => mockRequestNotifications(...args),
  openSettings: (...args: unknown[]) => mockOpenSettings(...args),
}));

describe('PermissionsService', () => {
  let platformVersionSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.resetModules();
    platformVersionSpy?.mockRestore();
    mockCheck.mockReset();
    mockRequest.mockReset();
    mockCheckNotifications.mockReset();
    mockRequestNotifications.mockReset();
    mockOpenSettings.mockReset();
    Platform.OS = 'ios';
    platformVersionSpy = jest.spyOn(Platform, 'Version', 'get').mockReturnValue(33);
  });

  afterEach(() => {
    platformVersionSpy.mockRestore();
  });

  function loadService() {
    return require('@/services/permissions.service').PermissionsService as typeof import('@/services/permissions.service').PermissionsService;
  }

  it('returns granted camera state from native module on iOS', async () => {
    mockCheck.mockResolvedValue('granted');
    const PermissionsService = loadService();

    const state = await PermissionsService.getCameraState();

    expect(mockCheck).toHaveBeenCalledWith('ios.permission.CAMERA');
    expect(state.status).toBe('granted');
    expect(state.canRequestAgain).toBe(false);
  });

  it('returns denied camera state with canRequestAgain on iOS', async () => {
    mockCheck.mockResolvedValue('denied');
    const PermissionsService = loadService();

    const state = await PermissionsService.getCameraState();

    expect(state.status).toBe('denied');
    expect(state.canRequestAgain).toBe(true);
  });

  it('opens settings when camera permission is blocked', async () => {
    mockCheck.mockResolvedValue('blocked');
    const PermissionsService = loadService();

    await PermissionsService.requestCamera();

    expect(mockOpenSettings).toHaveBeenCalledTimes(1);
    expect(mockRequest).not.toHaveBeenCalled();
  });

  it('requests camera via native module when denied on iOS', async () => {
    mockCheck.mockResolvedValue('denied');
    mockRequest.mockResolvedValue('granted');
    const PermissionsService = loadService();

    const state = await PermissionsService.requestCamera();

    expect(mockRequest).toHaveBeenCalledWith('ios.permission.CAMERA');
    expect(state.status).toBe('granted');
  });

  it('returns granted notifications state from native module', async () => {
    mockCheckNotifications.mockResolvedValue({ status: 'granted' });
    const PermissionsService = loadService();

    const state = await PermissionsService.getNotificationsState();

    expect(state.status).toBe('granted');
    expect(state.canRequestAgain).toBe(false);
  });

  it('requests notifications with iOS options', async () => {
    mockCheckNotifications.mockResolvedValue({ status: 'denied' });
    mockRequestNotifications.mockResolvedValue({ status: 'granted' });
    const PermissionsService = loadService();

    const state = await PermissionsService.requestNotifications();

    expect(mockRequestNotifications).toHaveBeenCalledWith(['alert', 'badge', 'sound']);
    expect(state.status).toBe('granted');
  });

  it('falls back to PermissionsAndroid for camera on Android when native module fails', async () => {
    Platform.OS = 'android';
    mockCheck.mockRejectedValue(new Error('native failure'));
    jest.spyOn(PermissionsAndroid, 'check').mockResolvedValue(true);
    const PermissionsService = loadService();

    const state = await PermissionsService.getCameraState();

    expect(PermissionsAndroid.check).toHaveBeenCalledWith('android.permission.CAMERA');
    expect(state.status).toBe('granted');
  });

  it('uses Android POST_NOTIFICATIONS fallback on API 33+', async () => {
    Platform.OS = 'android';
    platformVersionSpy.mockReturnValue(33);
    mockRequestNotifications.mockRejectedValue(new Error('native failure'));
    jest.spyOn(PermissionsAndroid, 'request').mockResolvedValue('granted');
    const PermissionsService = loadService();

    jest.spyOn(PermissionsService, 'getNotificationsState').mockResolvedValue({
      status: 'denied',
      canRequestAgain: true,
    });

    const state = await PermissionsService.requestNotifications();

    expect(PermissionsAndroid.request).toHaveBeenCalledWith(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    );
    expect(state.status).toBe('granted');
  });

  it('falls back to Linking.openSettings when module openSettings fails', async () => {
    mockOpenSettings.mockRejectedValue(new Error('settings failed'));
    const openSettingsSpy = jest.spyOn(Linking, 'openSettings').mockResolvedValue(undefined);
    const PermissionsService = loadService();

    await PermissionsService.openAppSettings();

    expect(mockOpenSettings).toHaveBeenCalledTimes(1);
    expect(openSettingsSpy).toHaveBeenCalledTimes(1);
  });

  it('returns unavailable on iOS when native module cannot be loaded', async () => {
    jest.isolateModules(() => {
      jest.doMock('react-native-permissions', () => {
        throw new Error('module missing');
      });
      const PermissionsService =
        require('@/services/permissions.service').PermissionsService;

      return PermissionsService.getCameraState().then((state: { status: string; canRequestAgain: boolean }) => {
        expect(state.status).toBe('unavailable');
        expect(state.canRequestAgain).toBe(false);
      });
    });
  });
});
