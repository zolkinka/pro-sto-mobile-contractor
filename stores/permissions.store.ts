import { makeAutoObservable, runInAction } from 'mobx';

import { PermissionsService, type AppPermissionKind } from '@/services/permissions.service';
import { PermissionsStorageService } from '@/services/permissions-storage.service';

/**
 * Permissions onboarding flow (camera → notifications).
 *
 * `hasCompletedOnboarding` is device-scoped: once the user passes both screens,
 * the flow is not shown again for any account on this device. Logout does not reset it.
 * Use `resetOnboarding()` only in dev/debug flows.
 *
 * Repeat OS permission prompts happen contextually via `ensurePermission()` when a
 * feature needs camera or push (QR scanner, notifications screen, etc.).
 */
export class PermissionsStore {
  hasCompletedOnboarding = false;
  isInitialized = false;

  private initPromise: Promise<void> | null = null;

  constructor() {
    makeAutoObservable(this);
    this.initialize().catch(() => undefined);
  }

  async initialize(): Promise<void> {
    if (!this.initPromise) {
      this.initPromise = this.runInitialize();
    }

    return this.initPromise;
  }

  private async runInitialize(): Promise<void> {
    try {
      const completed = await PermissionsStorageService.getOnboardingCompleted();

      runInAction(() => {
        this.hasCompletedOnboarding = completed;
        this.isInitialized = true;
      });
    } catch {
      runInAction(() => {
        this.hasCompletedOnboarding = false;
        this.isInitialized = true;
      });
    }
  }

  async completeOnboarding(): Promise<void> {
    try {
      await PermissionsStorageService.saveOnboardingCompleted(true);

      runInAction(() => {
        this.hasCompletedOnboarding = true;
      });
    } catch (error) {
      console.warn('[PermissionsStore] completeOnboarding failed:', error);
      throw error;
    }
  }

  /** Dev / debug only — not called on logout. */
  async resetOnboarding(): Promise<void> {
    await PermissionsStorageService.clearOnboardingCompleted();

    runInAction(() => {
      this.hasCompletedOnboarding = false;
    });
  }

  async requestPermission(kind: AppPermissionKind): Promise<void> {
    try {
      if (kind === 'camera') {
        await PermissionsService.requestCamera();
      } else {
        await PermissionsService.requestNotifications();
      }
    } catch (error) {
      console.warn('[PermissionsStore] requestPermission failed:', error);
    }
  }

  async ensurePermission(kind: AppPermissionKind): Promise<boolean> {
    try {
      const state =
        kind === 'camera'
          ? await PermissionsService.getCameraState()
          : await PermissionsService.getNotificationsState();

      if (PermissionsService.isGranted(state)) {
        return true;
      }

      if (state.canRequestAgain) {
        if (kind === 'camera') {
          const next = await PermissionsService.requestCamera();
          return PermissionsService.isGranted(next);
        }

        const next = await PermissionsService.requestNotifications();
        return PermissionsService.isGranted(next);
      }

      await PermissionsService.openAppSettings();
      return false;
    } catch (error) {
      console.warn('[PermissionsStore] ensurePermission failed:', error);
      return false;
    }
  }
}

export const permissionsStore = new PermissionsStore();
