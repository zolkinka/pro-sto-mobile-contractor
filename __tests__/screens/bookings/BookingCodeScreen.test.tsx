import React, { type ReactNode } from 'react';
import ReactTestRenderer from 'react-test-renderer';

import { BookingCodeScreen } from '@/screens/bookings/BookingCodeScreen';

jest.mock('react-native-safe-area-context', () => {
  const { View } = require('react-native');

  return {
    SafeAreaProvider: ({ children }: { children: ReactNode }) => children,
    SafeAreaView: View,
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  };
});

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: jest.fn(), goBack: jest.fn() }),
  useRoute: () => ({ params: { bookingUuid: 'booking-1' } }),
}));

describe('BookingCodeScreen', () => {
  it('renders the 4-digit code form', () => {
    let tree: ReactTestRenderer.ReactTestRenderer;

    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(<BookingCodeScreen />);
    });

    const serialized = JSON.stringify(tree!.toJSON());

    expect(serialized).toContain('Введите 4-х значный код заказа для начала мойки');
    expect(serialized).toContain('Подтвердить через QR');
    expect(serialized.match(/Цифра/g)).toHaveLength(4);
  });
});
