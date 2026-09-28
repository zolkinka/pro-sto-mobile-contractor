import React, { type ReactNode } from 'react';
import ReactTestRenderer from 'react-test-renderer';

import { OrderDetailsScreen } from '@/screens/bookings/OrderDetailsScreen';
import { bookingsStore } from '@/stores/bookings.store';
import type { BookingsStore } from '@/stores/bookings.store';
import type { BookingDetails, BookingDetailsView } from '@/types/bookings';

const mockGoBack = jest.fn();

type MockOrderDetailsStore = jest.Mocked<
  Pick<
    BookingsStore,
    'openBookingDetails' | 'clearSelectedBooking' | 'clearError' | 'getServiceViews'
  >
> & {
  isLoadingDetails: boolean;
  error: string | null;
  selectedBooking: BookingDetails | null;
  selectedBookingView: BookingDetailsView | null;
};

const mockBookingsStore = bookingsStore as unknown as MockOrderDetailsStore;

jest.mock('react-native-safe-area-context', () => {
  const { View } = require('react-native');

  return {
    SafeAreaProvider: ({ children }: { children: ReactNode }) => children,
    SafeAreaView: View,
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  };
});

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ goBack: mockGoBack }),
  useRoute: () => ({
    params: {
      bookingUuid: 'booking-1',
      postOrderNumber: 4,
    },
  }),
}));

jest.mock('@/stores/bookings.store', () => ({
  bookingsStore: {
    isLoadingDetails: false,
    error: null,
    selectedBooking: null,
    selectedBookingView: null,
    openBookingDetails: jest.fn(async () => undefined),
    clearSelectedBooking: jest.fn(),
    clearError: jest.fn(),
    getServiceViews: jest.fn(() => []),
  },
}));

describe('OrderDetailsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders confirm footer for pending booking', async () => {
    mockBookingsStore.selectedBookingView = {
      uuid: 'booking-1',
      start_time: '2026-06-29T10:30:00.000Z',
      end_time: '2026-06-29T11:30:00.000Z',
      status: 'pending_confirmation',
      total_cost: 1500,
      client_comment: null,
      client: { uuid: 'c1', name: 'Денис', phone: '+79991234567' },
      car: {
        uuid: 'car-1',
        make: 'Toyota',
        model: 'Prado',
        license_plate: 'C789K077',
      },
      service: {
        uuid: 's1',
        name: 'Мойка',
        duration_minutes: 60,
        price: 1500,
      },
      postOrderNumber: 4,
    };

    let tree: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      tree = ReactTestRenderer.create(<OrderDetailsScreen />);
    });

    const output = tree!.toJSON();
    const serialized = JSON.stringify(output);

    expect(serialized).toContain('Подтвердить через QR');
    expect(serialized).toContain('Подтвердить по 4-х значному коду заказа');
  });

  it('renders confirm footer for confirmed booking', async () => {
    mockBookingsStore.selectedBookingView = {
      uuid: 'booking-1',
      start_time: '2026-06-29T10:30:00.000Z',
      end_time: '2026-06-29T11:30:00.000Z',
      status: 'confirmed',
      total_cost: 1500,
      client_comment: null,
      client: { uuid: 'c1', name: 'Денис', phone: '+79991234567' },
      car: {
        uuid: 'car-1',
        make: 'Toyota',
        model: 'Prado',
        license_plate: 'C789K077',
      },
      service: {
        uuid: 's1',
        name: 'Мойка',
        duration_minutes: 60,
        price: 1500,
      },
      postOrderNumber: 4,
    };

    let tree: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      tree = ReactTestRenderer.create(<OrderDetailsScreen />);
    });

    const serialized = JSON.stringify(tree!.toJSON());

    expect(serialized).not.toContain('Подтвердить через QR');
    expect(serialized).not.toContain('Подтвердить по 4-х значному коду заказа');
    expect(serialized).toContain('Клиент:');
  });
});
