import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

import { BookingsListScreen } from '@/screens/bookings/BookingsListScreen';
import { authStore } from '@/stores/auth.store';
import { bookingsStore } from '@/stores/bookings.store';

const mockNavigate = jest.fn();

jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  const { View } = require('react-native');

  return {
    SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children,
    SafeAreaView: View,
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  };
});

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
  useFocusEffect: (callback: () => void) => callback(),
}));

jest.mock('@/stores/auth.store', () => ({
  authStore: {
    user: { serviceCenterUuid: 'sc-1' },
    checkTokenValidity: jest.fn(async () => undefined),
  },
}));

jest.mock('@/stores/bookings.store', () => ({
  bookingsStore: {
    selectedDate: new Date('2026-06-29T12:00:00.000Z'),
    nearestBookingDate: null,
    isLoadingList: false,
    error: null,
    bookings: [],
    sortedBookings: [],
    setServiceCenterUuid: jest.fn(),
    fetchBookings: jest.fn(async () => undefined),
    clearError: jest.fn(),
    setSelectedDate: jest.fn(),
    goToNearestBookingDate: jest.fn(),
    getCardBackgroundColor: jest.fn(() => '#E8E4FF'),
  },
}));

describe('BookingsListScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    bookingsStore.isLoadingList = false;
    bookingsStore.error = null;
    bookingsStore.sortedBookings = [];
  });

  it('loads bookings on focus without token re-validation', async () => {
    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(<BookingsListScreen />);
    });

    expect(authStore.checkTokenValidity).not.toHaveBeenCalled();
    expect(bookingsStore.setServiceCenterUuid).toHaveBeenCalledWith('sc-1');
    expect(bookingsStore.fetchBookings).toHaveBeenCalled();
  });

  it('renders booking cards sorted from store', async () => {
    bookingsStore.sortedBookings = [
      {
        uuid: 'booking-1',
        start_time: '2026-06-29T10:30:00.000Z',
        end_time: '2026-06-29T11:30:00.000Z',
        status: 'pending_confirmation',
        total_cost: 1500,
        client: { uuid: 'c1', name: 'Денис', phone: '+79991234567' },
        car: {
          uuid: 'car-1',
          make: 'Toyota',
          model: 'Land Cruiser Prado',
          license_plate: 'C789K077',
        },
        service: {
          uuid: 's1',
          name: 'Эконом мойка',
          duration_minutes: 60,
          price: 1500,
        },
        post: { uuid: 'p1', orderNumber: 4 },
      },
    ];

    let tree: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      tree = ReactTestRenderer.create(<BookingsListScreen />);
    });

    expect(JSON.stringify(tree!.toJSON())).toContain('Toyota Land Cruiser Prado');
  });
});
