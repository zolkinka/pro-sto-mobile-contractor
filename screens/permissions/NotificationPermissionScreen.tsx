import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Alert } from 'react-native';

import { PermissionScreenLayout } from '@/components/permissions/permission-screen-layout';
import { NOTIFICATIONS_PERMISSION_COPY } from '@/constants/permissions';
import type { PermissionStackParamList } from '@/navigation/types';
import { permissionsStore } from '@/stores/permissions.store';

type Navigation = NativeStackNavigationProp<PermissionStackParamList, 'Notifications'>;

function showOnboardingSaveError(error: unknown): void {
  console.warn('[NotificationPermissionScreen] completeOnboarding failed:', error);
  Alert.alert(
    'Не удалось продолжить',
    'Не получилось сохранить настройки. Попробуйте ещё раз или перезапустите приложение.',
  );
}

export function NotificationPermissionScreen() {
  const navigation = useNavigation<Navigation>();
  const [isRequesting, setIsRequesting] = useState(false);

  const completeOnboardingWithFeedback = async (): Promise<boolean> => {
    try {
      await permissionsStore.completeOnboarding();
      return true;
    } catch (error) {
      showOnboardingSaveError(error);
      return false;
    }
  };

  const handleRequest = async () => {
    if (isRequesting) {
      return;
    }

    setIsRequesting(true);
    try {
      await permissionsStore.requestPermission('notifications');
      await completeOnboardingWithFeedback();
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
      await completeOnboardingWithFeedback();
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
