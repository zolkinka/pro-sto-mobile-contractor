import {
  Linking,
  PermissionsAndroid,
  Platform,
} from 'react-native';

export type AppPermissionKind = 'camera' | 'notifications';

export type PermissionStatus =
  | 'unavailable'
  | 'blocked'
  | 'denied'
  | 'granted'
  | 'limited';

export interface PermissionState {
  status: PermissionStatus;
  canRequestAgain: boolean;
}

const RESULTS = {
  UNAVAILABLE: 'unavailable',
  BLOCKED: 'blocked',
  DENIED: 'denied',
  GRANTED: 'granted',
  LIMITED: 'limited',
} as const;

type PermissionsModule = typeof import('react-native-permissions');

let permissionsModule: PermissionsModule | null | undefined;

function loadPermissionsModule(): PermissionsModule | null {
  if (permissionsModule !== undefined) {
    return permissionsModule;
  }

  try {
    permissionsModule = require('react-native-permissions') as PermissionsModule;
    return permissionsModule;
  } catch {
    permissionsModule = null;
    return null;
  }
}

function mapCanRequestAgain(status: PermissionStatus): boolean {
  return status === RESULTS.DENIED;
}

function mapAndroidPermissionResult(result: string): PermissionStatus {
  switch (result) {
    case PermissionsAndroid.RESULTS.GRANTED:
      return RESULTS.GRANTED;
    case PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN:
      return RESULTS.BLOCKED;
    case PermissionsAndroid.RESULTS.DENIED:
    default:
      return RESULTS.DENIED;
  }
}

function isAndroid13OrAbove(): boolean {
  return Platform.OS === 'android' && Platform.Version >= 33;
}

export class PermissionsService {
  static isNativeModuleAvailable(): boolean {
    return loadPermissionsModule() != null;
  }

  static async getCameraState(): Promise<PermissionState> {
    const module = loadPermissionsModule();

    if (module) {
      try {
        const permission =
          Platform.OS === 'ios'
            ? module.PERMISSIONS.IOS.CAMERA
            : module.PERMISSIONS.ANDROID.CAMERA;
        const status = await module.check(permission);

        return {
          status,
          canRequestAgain: mapCanRequestAgain(status),
        };
      } catch {
        // Fall through to platform fallback.
      }
    }

    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.CAMERA);

      return {
        status: granted ? RESULTS.GRANTED : RESULTS.DENIED,
        canRequestAgain: !granted,
      };
    }

    return { status: RESULTS.UNAVAILABLE, canRequestAgain: false };
  }

  static async getNotificationsState(): Promise<PermissionState> {
    const module = loadPermissionsModule();

    if (module) {
      try {
        const { status } = await module.checkNotifications();

        return {
          status,
          canRequestAgain: mapCanRequestAgain(status),
        };
      } catch {
        // Fall through to platform fallback.
      }
    }

    if (isAndroid13OrAbove()) {
      const granted = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      );

      return {
        status: granted ? RESULTS.GRANTED : RESULTS.DENIED,
        canRequestAgain: !granted,
      };
    }

    return { status: RESULTS.UNAVAILABLE, canRequestAgain: false };
  }

  static async requestCamera(): Promise<PermissionState> {
    const current = await this.getCameraState();

    if (current.status === RESULTS.GRANTED || current.status === RESULTS.LIMITED) {
      return current;
    }

    if (current.status === RESULTS.BLOCKED) {
      await this.openAppSettings();
      return this.getCameraState();
    }

    const module = loadPermissionsModule();

    if (module) {
      try {
        const permission =
          Platform.OS === 'ios'
            ? module.PERMISSIONS.IOS.CAMERA
            : module.PERMISSIONS.ANDROID.CAMERA;
        const status = await module.request(permission);

        return {
          status,
          canRequestAgain: mapCanRequestAgain(status),
        };
      } catch {
        // Fall through to platform fallback.
      }
    }

    if (Platform.OS === 'android') {
      const result = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA);
      const status = mapAndroidPermissionResult(result);

      return {
        status,
        canRequestAgain: mapCanRequestAgain(status),
      };
    }

    return { status: RESULTS.UNAVAILABLE, canRequestAgain: false };
  }

  static async requestNotifications(): Promise<PermissionState> {
    const current = await this.getNotificationsState();

    if (current.status === RESULTS.GRANTED || current.status === RESULTS.LIMITED) {
      return current;
    }

    if (current.status === RESULTS.BLOCKED) {
      await this.openAppSettings();
      return this.getNotificationsState();
    }

    const module = loadPermissionsModule();

    if (module) {
      try {
        const { status } = await module.requestNotifications(
          Platform.OS === 'ios' ? ['alert', 'badge', 'sound'] : [],
        );

        return {
          status,
          canRequestAgain: mapCanRequestAgain(status),
        };
      } catch {
        // Fall through to platform fallback.
      }
    }

    if (isAndroid13OrAbove()) {
      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      );
      const status = mapAndroidPermissionResult(result);

      return {
        status,
        canRequestAgain: mapCanRequestAgain(status),
      };
    }

    return { status: RESULTS.UNAVAILABLE, canRequestAgain: false };
  }

  static async openAppSettings(): Promise<void> {
    const module = loadPermissionsModule();

    try {
      if (module) {
        await module.openSettings();
        return;
      }
    } catch {
      // Fall through to Linking.
    }

    await Linking.openSettings();
  }

  static isGranted(state: PermissionState): boolean {
    return state.status === RESULTS.GRANTED || state.status === RESULTS.LIMITED;
  }
}
