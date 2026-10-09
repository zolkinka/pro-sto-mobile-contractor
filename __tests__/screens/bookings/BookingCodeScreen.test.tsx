import React, { type ReactNode } from 'react';
import ReactTestRenderer from 'react-test-renderer';

import { BookingCodeScreen } from '@/screens/bookings/BookingCodeScreen';
import { bookingsStore } from '@/stores/bookings.store';

jest.mock('react-native-safe-area-context', () => {
  const { View } = require('react-native');

  return {
    SafeAreaProvider: ({ children }: { children: ReactNode }) => children,
    SafeAreaView: View,
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  };
});

const mockReplace = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: jest.fn(), replace: mockReplace, goBack: jest.fn() }),
  useRoute: () => ({ params: { bookingUuid: 'booking-1', fromMenu: true } }),
}));

describe('BookingCodeScreen', () => {
  beforeEach(() => {
    bookingsStore.confirmationLockouts = {};
  });

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

  it('switches back to QR in place instead of pushing another screen', () => {
    let tree: ReactTestRenderer.ReactTestRenderer;

    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(<BookingCodeScreen />);
    });

    const qrButton = tree!.root.findByProps({ label: 'Подтвердить через QR' });

    ReactTestRenderer.act(() => {
      qrButton.props.onPress();
    });

    expect(mockReplace).toHaveBeenCalledWith('QrScan', {
      bookingUuid: 'booking-1',
      fromMenu: true,
    });
  });

  it('shows a stored lockout and hides the QR switch without another request', () => {
    bookingsStore.markConfirmationBlocked(
      'booking-1',
      'Превышен лимит попыток ввода кода',
    );

    let tree: ReactTestRenderer.ReactTestRenderer;

    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(<BookingCodeScreen />);
    });

    const serialized = JSON.stringify(tree!.toJSON());

    expect(serialized).toContain('Превышен лимит попыток ввода кода');
    expect(serialized).toContain('Написать в поддержку');
    expect(serialized).not.toContain('Подтвердить через QR');
  });
});
