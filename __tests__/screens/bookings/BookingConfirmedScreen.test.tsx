import React, { type ReactNode } from 'react';
import ReactTestRenderer from 'react-test-renderer';

import { BookingConfirmedScreen } from '@/screens/bookings/BookingConfirmedScreen';
import { bookingsStore } from '@/stores/bookings.store';
import type { BookingDetails } from '@/types/bookings';

const mockNavigate = jest.fn();

jest.mock('react-native-safe-area-context', () => {
  const { View } = require('react-native');

  return {
    SafeAreaProvider: ({ children }: { children: ReactNode }) => children,
    SafeAreaView: View,
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  };
});

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
  useRoute: () => ({
    params: {
      bookingUuid: 'booking-1',
    },
  }),
}));

jest.mock('@/services/bookings-api', () => ({
  fetchBookingDetails: jest.fn(async () => mockConfirmedDetails),
}));

const mockConfirmedDetails: BookingDetails = {
  uuid: 'booking-1',
  start_time: new Date(2026, 8, 25, 13, 0, 0).toISOString(),
  end_time: new Date(2026, 8, 25, 14, 0, 0).toISOString(),
  status: 'confirmed',
  total_cost: 4000,
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
    name: 'Шиномонтаж',
    duration_minutes: 60,
    price: 4000,
  },
  serviceCenterName: 'Шинка',
  serviceCenterAddress: '6-я линия Васильевского острова, 59',
  serviceBusinessType: 'tire_service',
};

describe('BookingConfirmedScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    bookingsStore.selectedBooking = mockConfirmedDetails;
    bookingsStore.bookings = [];
  });

  afterEach(() => {
    bookingsStore.selectedBooking = null;
  });

  it('shows the confirmation summary and an inactive calendar action', async () => {
    let tree: ReactTestRenderer.ReactTestRenderer;

    await ReactTestRenderer.act(async () => {
      tree = ReactTestRenderer.create(<BookingConfirmedScreen />);
    });

    const serialized = JSON.stringify(tree!.toJSON());

    expect(serialized).toContain('Запись подтверждена!');
    expect(serialized).toContain('шиномонтаж Шинка');
    expect(serialized).toContain('по адресу 6-я линия Васильевского острова, 59');
    expect(serialized).toContain('4000₽');
    expect(serialized).not.toContain('Напомнить в SMS за:');
    expect(serialized).toContain('Добавить в календарь');
    expect(serialized).not.toContain('Скоро');

    const calendar = tree!.root.findByProps({ accessibilityLabel: 'Добавить в календарь' });

    await ReactTestRenderer.act(async () => {
      calendar.props.onPress();
    });

    expect(JSON.stringify(tree!.toJSON())).toContain('Скоро');

    await ReactTestRenderer.act(async () => {
      tree!.unmount();
    });
  });
});
