import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, Image, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FlashlightIcon } from '@/components/bookings/flashlight-icon';
import { QrCameraPreview } from '@/components/bookings/qr-camera-preview';
import { AppButton } from '@/components/ui/app-button';
import { AppText } from '@/components/ui/app-text';
import { Icon } from '@/components/ui/icon';
import { theme } from '@/constants/theme';
import type { MainStackParamList } from '@/navigation/types';
import { bookingsStore } from '@/stores/bookings.store';
import { permissionsStore } from '@/stores/permissions.store';
import { getQrScanErrorMessage } from '@/utils/booking-confirm-error';
import { parseBookingQrPayload } from '@/utils/booking-qr-payload';

type Navigation = NativeStackNavigationProp<MainStackParamList, 'QrScan'>;
type QrScanRoute = RouteProp<MainStackParamList, 'QrScan'>;

const scanFrame = require('@/assets/images/qr/scan-frame.png');
const scanFrameError = require('@/assets/images/qr/scan-frame-error.png');

const FRAME_COLOR = '#A3A09E';
const ERROR_COLOR = '#D8182E';
const WRONG_BOOKING_MESSAGE = 'QR-код относится к другой записи';

function resetScanSession(
  confirmingRef: React.MutableRefObject<boolean>,
  blockedScanRef: React.MutableRefObject<string | null>,
  setIsConfirming: (value: boolean) => void,
): void {
  confirmingRef.current = false;
  blockedScanRef.current = null;
  setIsConfirming(false);
}

export function QrScanScreen() {
  const navigation = useNavigation<Navigation>();
  const route = useRoute<QrScanRoute>();
  const bookingUuid = route.params?.bookingUuid;
  const [cameraGranted, setCameraGranted] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [cameraAvailable, setCameraAvailable] = useState(false);
  const confirmingRef = useRef(false);
  const blockedScanRef = useRef<string | null>(null);

  const requestCamera = useCallback(async () => {
    const granted = await permissionsStore.ensurePermission('camera');
    setCameraGranted(granted);
    return granted;
  }, []);

  useEffect(() => {
    requestCamera().catch(() => undefined);
  }, [requestCamera]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        requestCamera().catch(() => undefined);
      }
    });

    return () => subscription.remove();
  }, [requestCamera]);

  useFocusEffect(
    useCallback(() => {
      resetScanSession(confirmingRef, blockedScanRef, setIsConfirming);
      setErrorMessage(null);
    }, []),
  );

  const showCameraPreview = cameraGranted && cameraAvailable;
  const showPermissionPrompt = !cameraGranted;

  const finishConfirmed = (uuid: string) => {
    resetScanSession(confirmingRef, blockedScanRef, setIsConfirming);
    navigation.navigate('BookingConfirmed', { bookingUuid: uuid });
  };

  const handleCodeScanned = async (raw: string) => {
    const normalized = raw.trim();

    if (!normalized) {
      return;
    }

    if (blockedScanRef.current === normalized) {
      return;
    }

    if (blockedScanRef.current && blockedScanRef.current !== normalized) {
      blockedScanRef.current = null;
    }

    if (confirmingRef.current) {
      return;
    }

    const payload = parseBookingQrPayload(normalized);

    if (!payload) {
      setErrorMessage(getQrScanErrorMessage());
      return;
    }

    if (bookingUuid && payload.uuid !== bookingUuid) {
      setErrorMessage(WRONG_BOOKING_MESSAGE);
      return;
    }

    confirmingRef.current = true;
    setIsConfirming(true);
    setErrorMessage(null);

    const result = await bookingsStore.confirmBooking(payload.uuid, payload.code);

    if (result.ok) {
      finishConfirmed(payload.uuid);
      return;
    }

    blockedScanRef.current = normalized;
    confirmingRef.current = false;
    setIsConfirming(false);
    setErrorMessage(result.message);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12} style={styles.backButton}>
          <Icon name="direction-left" size={24} color={theme.colors.gray[900]} />
        </Pressable>
      </View>

      <View style={styles.content}>
        <View style={styles.copy}>
          <AppText weight="medium" style={styles.title}>
            Отсканируйте QR-код клиента
          </AppText>
          <AppText weight="regular" style={styles.subtitle}>
            Попросите показать и наведите камеру
          </AppText>
        </View>

        <View
          style={[
            styles.frame,
            !showCameraPreview && !showPermissionPrompt
              ? styles.frameIllustration
              : { borderColor: errorMessage ? ERROR_COLOR : FRAME_COLOR },
            showPermissionPrompt ? styles.framePermission : null,
          ]}>
          {showPermissionPrompt ? (
            <View style={styles.permissionFallback}>
              <AppText weight="regular" style={styles.permissionText}>
                Для сканирования QR нужен доступ к камере
              </AppText>
              <AppButton
                label="Разрешить камеру"
                variant="secondary"
                onPress={() => {
                  requestCamera().catch(() => undefined);
                }}
                style={styles.permissionButton}
              />
            </View>
          ) : null}

          {!showCameraPreview && !showPermissionPrompt ? (
            <Image
              source={errorMessage ? scanFrameError : scanFrame}
              style={styles.frameImage}
              resizeMode="cover"
            />
          ) : null}

          {cameraGranted ? (
            <QrCameraPreview
              active={!isConfirming}
              torchOn={torchOn}
              onCameraAvailable={setCameraAvailable}
              onCodeScanned={(value) => {
                handleCodeScanned(value).catch(() => undefined);
              }}
            />
          ) : null}

          {showCameraPreview ? (
            <Pressable
              style={styles.torchButton}
              onPress={() => setTorchOn((current) => !current)}
              accessibilityRole="button"
              accessibilityLabel="Фонарик">
              <FlashlightIcon />
            </Pressable>
          ) : null}
        </View>

        {errorMessage ? (
          <AppText weight="regular" style={styles.error}>
            {errorMessage}
          </AppText>
        ) : null}
      </View>

      <AppButton
        label="Подтвердить по 4-х значному коду заказа"
        variant="secondary"
        onPress={() => navigation.navigate('BookingCode', { bookingUuid })}
        style={styles.codeButton}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.gray[50],
    paddingHorizontal: 16,
  },
  header: {
    paddingVertical: 2,
  },
  backButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingTop: 24,
    gap: 24,
    alignItems: 'center',
  },
  copy: {
    gap: 8,
    width: '100%',
  },
  title: {
    fontSize: 24,
    lineHeight: 28.8,
    textAlign: 'center',
    color: theme.colors.gray[900],
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 19.2,
    textAlign: 'center',
    color: theme.colors.gray[900],
  },
  frame: {
    width: '100%',
    aspectRatio: 1,
    maxWidth: 358,
    maxHeight: 358,
    borderRadius: 20,
    borderWidth: 4,
    borderStyle: 'dashed',
    overflow: 'hidden',
    backgroundColor: theme.colors.gray[100],
  },
  frameIllustration: {
    borderWidth: 0,
    backgroundColor: 'transparent',
  },
  framePermission: {
    borderWidth: 0,
    backgroundColor: theme.colors.gray[100],
  },
  frameImage: {
    width: '100%',
    height: '100%',
  },
  permissionFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 16,
  },
  permissionText: {
    fontSize: 16,
    lineHeight: 19.2,
    textAlign: 'center',
    color: theme.colors.gray[900],
  },
  permissionButton: {
    width: '100%',
    maxWidth: 280,
    height: 52,
    backgroundColor: '#E7E5E4',
    borderWidth: 0,
    shadowOpacity: 0,
    elevation: 0,
  },
  torchButton: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: '#E7E5E4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  error: {
    fontSize: 15,
    lineHeight: 18,
    color: ERROR_COLOR,
    textAlign: 'center',
  },
  codeButton: {
    marginTop: 'auto',
    marginBottom: 20,
    width: '100%',
    height: 52,
    paddingHorizontal: 12,
    backgroundColor: '#E7E5E4',
    borderWidth: 0,
    shadowOpacity: 0,
    elevation: 0,
  },
});
