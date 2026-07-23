import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';

import { PermissionScreenLayout } from '@/components/permissions/permission-screen-layout';
import { NOTIFICATIONS_PERMISSION_COPY } from '@/constants/permissions';
import type { PermissionStackParamList } from '@/navigation/types';
import { permissionsStore } from '@/stores/permissions.store';

type Navigation = NativeStackNavigationProp<PermissionStackParamList, 'Notifications'>;

export function NotificationPermissionScreen() {
  const navigation = useNavigation<Navigation>();
  const [isRequesting, setIsRequesting] = useState(false);

  const finishOnboarding = async () => {
    await permissionsStore.completeOnboarding();
  };

  const handleRequest = async () => {
    if (isRequesting) {
      return;
    }

    setIsRequesting(true);
    try {
      await permissionsStore.requestPermission('notifications');
      await finishOnboarding();
    } catch {
      // Stay on screen if onboarding flag failed to persist.
    } finally {
      setIsRequesting(false);
    }
  };

  const handleLater = async () => {
    if (isRequesting) {
      return;
    }

    setIsRequesting(true);
    try {
      await finishOnboarding();
    } catch {
      // Stay on screen if onboarding flag failed to persist.
    } finally {
      setIsRequesting(false);
    }
  };

  return (
    <PermissionScreenLayout
      titleLine1={NOTIFICATIONS_PERMISSION_COPY.titleLine1}
      titleLine2={NOTIFICATIONS_PERMISSION_COPY.titleLine2}
      step={NOTIFICATIONS_PERMISSION_COPY.step}
      subtitle={NOTIFICATIONS_PERMISSION_COPY.subtitle}
      image={NOTIFICATIONS_PERMISSION_COPY.image}
      onBackPress={() => navigation.goBack()}
      onRequest={handleRequest}
      onLater={handleLater}
      isRequesting={isRequesting}
    />
  );
}
