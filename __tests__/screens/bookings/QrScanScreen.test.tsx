import React, { type ReactNode } from 'react';
import ReactTestRenderer from 'react-test-renderer';

import { QrScanScreen } from '@/screens/bookings/QrScanScreen';

const mockNavigate = jest.fn();
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
  useNavigation: () => ({ navigate: mockNavigate, goBack: mockGoBack }),
  useRoute: () => ({ params: { bookingUuid: 'booking-1' } }),
}));

jest.mock('@/stores/permissions.store', () => ({
  permissionsStore: {
    ensurePermission: jest.fn(async () => false),
  },
}));

describe('QrScanScreen', () => {
  it('renders the scan copy and the code fallback', async () => {
    let tree: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      tree = ReactTestRenderer.create(<QrScanScreen />);
    });

    const serialized = JSON.stringify(tree!.toJSON());

    expect(serialized).toContain('Отсканируйте QR-код клиента');
    expect(serialized).toContain('Попросите показать и наведите камеру');
    expect(serialized).toContain('Подтвердить по 4-х значному коду заказа');
  });
});
