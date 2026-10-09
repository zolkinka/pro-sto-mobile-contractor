import React, { type ReactNode } from 'react';
import ReactTestRenderer from 'react-test-renderer';

import { QrScanScreen } from '@/screens/bookings/QrScanScreen';
import { bookingsStore } from '@/stores/bookings.store';

const mockNavigate = jest.fn();
const mockReplace = jest.fn();
const mockGoBack = jest.fn();

jest.mock('react-native-safe-area-context', () => {
  const { View } = require('react-native');

  return {
    SafeAreaProvider: ({ children }: { children: ReactNode }) => children,
    SafeAreaView: View,
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  };
});

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate, replace: mockReplace, goBack: mockGoBack }),
  useRoute: () => ({ params: { bookingUuid: 'booking-1' } }),
  useFocusEffect: jest.fn(),
}));

jest.mock('@/stores/permissions.store', () => ({
  permissionsStore: {
    ensurePermission: jest.fn(async () => false),
  },
}));

describe('QrScanScreen', () => {
  beforeEach(() => {
    bookingsStore.confirmationLockouts = {};
  });

  it('renders the scan copy and the code fallback', async () => {
    let tree: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      tree = ReactTestRenderer.create(<QrScanScreen />);
    });

    const serialized = JSON.stringify(tree!.toJSON());

    expect(serialized).toContain('Отсканируйте QR-код клиента');
    expect(serialized).toContain('Попросите показать и наведите камеру');
    expect(serialized).toContain('Подтвердить по 4-х значному коду заказа');
    expect(serialized).toContain('Разрешить камеру');
  });

  it('switches to code entry in place instead of pushing another screen', async () => {
    let tree: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      tree = ReactTestRenderer.create(<QrScanScreen />);
    });

    const codeButton = tree!.root.findByProps({
      label: 'Подтвердить по 4-х значному коду заказа',
    });

    await ReactTestRenderer.act(async () => {
      codeButton.props.onPress();
    });

    expect(mockReplace).toHaveBeenCalledWith('BookingCode', {
      bookingUuid: 'booking-1',
      fromMenu: undefined,
    });
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('shows a stored lockout and hides the code switch without waiting for a new scan', async () => {
    bookingsStore.markConfirmationBlocked(
      'booking-1',
      'Превышен лимит попыток ввода кода',
    );

    let tree: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      tree = ReactTestRenderer.create(<QrScanScreen />);
    });

    const serialized = JSON.stringify(tree!.toJSON());

    expect(serialized).toContain('Превышен лимит попыток ввода кода');
    expect(serialized).toContain('Написать в поддержку');
    expect(serialized).not.toContain('Подтвердить по 4-х значному коду заказа');
  });
});
