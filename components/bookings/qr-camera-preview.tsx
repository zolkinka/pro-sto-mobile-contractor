import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { Camera, useCameraDevice, useCodeScanner } from 'react-native-vision-camera';

interface QrCameraPreviewProps {
  active: boolean;
  torchOn: boolean;
  onCodeScanned: (value: string) => void;
  onCameraAvailable: (available: boolean) => void;
}

export function QrCameraPreview({
  active,
  torchOn,
  onCodeScanned,
  onCameraAvailable,
}: QrCameraPreviewProps) {
  const device = useCameraDevice('back');

  useEffect(() => {
    onCameraAvailable(Boolean(device));
  }, [device, onCameraAvailable]);
  const codeScanner = useCodeScanner({
    codeTypes: ['qr'],
    onCodeScanned: (codes) => {
      const value = codes[0]?.value;

      if (value) {
        onCodeScanned(value);
      }
    },
  });

  if (!device) {
    return null;
  }

  return (
    <Camera
      style={StyleSheet.absoluteFill}
      device={device}
      isActive={active}
      codeScanner={codeScanner}
      torch={torchOn ? 'on' : 'off'}
    />
  );
}
