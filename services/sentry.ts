/**
 * Sentry / GlitchTip error tracking
 */

import * as Sentry from '@sentry/react-native';
import type { ComponentType } from 'react';

import { SENTRY_DSN as ENV_SENTRY_DSN } from '@env';

const SENTRY_DSN = ENV_SENTRY_DSN?.trim() ?? '';

class SentryService {
  private initialized = false;

  initialize(): void {
    if (this.initialized) {
      return;
    }

    if (!SENTRY_DSN) {
      if (__DEV__) {
        console.warn(
          '⚠️ [Sentry] SENTRY_DSN не задан. Мониторинг ошибок отключён.',
        );
      }
      this.initialized = true;
      return;
    }

    Sentry.init({
      dsn: SENTRY_DSN,
      tracesSampleRate: 0.01,
      // GlitchTip does not support sessions
      enableAutoSessionTracking: false,
      debug: __DEV__,
    });

    this.initialized = true;

    if (__DEV__) {
      console.log('✅ [Sentry] initialized');
    }
  }

  wrap<T extends ComponentType<any>>(component: T): T {
    if (!SENTRY_DSN) {
      return component;
    }

    return Sentry.wrap(component) as T;
  }
}

export const sentry = new SentryService();
