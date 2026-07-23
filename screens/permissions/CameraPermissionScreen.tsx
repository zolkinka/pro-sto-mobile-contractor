import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';

import { PermissionScreenLayout } from '@/components/permissions/permission-screen-layout';
import { CAMERA_PERMISSION_COPY } from '@/constants/permissions';
import type { PermissionStackParamList } from '@/navigation/types';
import { permissionsStore } from '@/stores/permissions.store';

type Navigation = NativeStackNavigationProp<PermissionStackParamList, 'Camera'>;

export function CameraPermissionScreen() {
  const navigation = useNavigation<Navigation>();
  const [isRequesting, setIsRequesting] = useState(false);

  const goToNotifications = () => {
    navigation.navigate('Notifications');
  };

  const handleRequest = async () => {
    if (isRequesting) {
      return;
    }

    setIsRequesting(true);
    try {
      await permissionsStore.requestPermission('camera');
      goToNotifications();
    } finally {
      setIsRequesting(false);
    }
  };

  return (
    <PermissionScreenLayout
      titleLine1={CAMERA_PERMISSION_COPY.titleLine1}
      titleLine2={CAMERA_PERMISSION_COPY.titleLine2}
      step={CAMERA_PERMISSION_COPY.step}
      subtitle={CAMERA_PERMISSION_COPY.subtitle}
      image={CAMERA_PERMISSION_COPY.image}
      onRequest={handleRequest}
      onLater={goToNotifications}
      isRequesting={isRequesting}
    />
  );
}
