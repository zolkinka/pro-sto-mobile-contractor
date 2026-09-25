import { BookingsStore } from '@/stores/bookings.store';

const mockListItem = {
  uuid: 'booking-1',
  start_time: '2026-06-29T10:30:00.000Z',
  end_time: '2026-06-29T11:30:00.000Z',
  status: 'pending_confirmation' as const,
  total_cost: 1500,
  client: {
    uuid: 'client-1',
    name: 'Денис',
    phone: '+79991234567',
  },
  car: {
    uuid: 'car-1',
    make: 'Toyota',
    model: 'Land Cruiser Prado',
    license_plate: 'C789K077',
  },
  service: {
    uuid: 'service-1',
    name: 'Эконом мойка',
    duration_minutes: 60,
    price: 1500,
  },
  post: {
    uuid: 'post-1',
    orderNumber: 4,
  },
};

const mockDetails = {
  uuid: 'booking-1',
  start_time: '2026-06-29T10:30:00.000Z',
  end_time: '2026-06-29T11:30:00.000Z',
  status: 'pending_confirmation' as const,
  total_cost: 1500,
  client_comment: 'Комментарий клиента',
  client: mockListItem.client,
  car: mockListItem.car,
  service: mockListItem.service,
  additionalServices: [
    {
      uuid: 'service-2',
      name: 'Полировка',
      duration_minutes: 30,
      price: 500,
    },
  ],
  post_uuid: 'post-1',
};

const mockListResponse = {
  data: [mockListItem],
  total: 1,
  limit: 100,
  offset: 0,
};

jest.mock('@/services/bookings-api', () => ({
  fetchBookingsList: jest.fn(async () => mockListResponse),
  fetchMasterBookingsList: jest.fn(async () => mockListResponse),
  fetchBookingsListForDay: jest.fn(async () => mockListResponse),
  fetchBookingsListFlexible: jest.fn(async () => mockListResponse),
  fetchBookingDetails: jest.fn(async () => mockDetails),
  confirmBookingByCode: jest.fn(async () => ({
    uuid: 'booking-1',
    status: 'confirmed',
    updated_at: '2026-06-29T10:40:00.000Z',
  })),
  fetchServicesCatalog: jest.fn(async () => [
    {
      uuid: 'service-1',
      name: 'Эконом мойка',
      description: 'Быстрая мойка кузова и стекол',
      duration_minutes: 60,
      business_type: 'car_wash',
      service_type: 'main',
    },
    {
      uuid: 'service-2',
      name: 'Полировка',
      description: 'Полировка кузова',
      duration_minutes: 30,
      business_type: 'car_wash',
      service_type: 'additional',
    },
  ]),
}));

import {
  confirmBookingByCode,
  fetchBookingDetails,
  fetchBookingsListFlexible,
  fetchBookingsListForDay,
  fetchServicesCatalog,
} from '@/services/bookings-api';

describe('BookingsStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('loads bookings for selected day', async () => {
    const store = new BookingsStore();
    store.setServiceCenterUuid('sc-1');
    store.setSelectedDate(new Date('2026-06-29T12:00:00.000Z'));

    await store.fetchBookings();

    expect(fetchBookingsListForDay).toHaveBeenCalledWith(
      expect.objectContaining({
        serviceCenterUuid: 'sc-1',
      }),
    );
    expect(store.bookings).toHaveLength(1);
    expect(store.sortedBookings[0].uuid).toBe('booking-1');
    expect(store.isLoadingList).toBe(false);
  });

  it('fetches list via master API when service center uuid is missing', async () => {
    const store = new BookingsStore();
    store.setSelectedDate(new Date('2026-06-29T12:00:00.000Z'));

    await store.fetchBookings();

    expect(fetchBookingsListForDay).toHaveBeenCalledWith(
      expect.objectContaining({
        serviceCenterUuid: null,
      }),
    );
    expect(store.bookings).toHaveLength(1);
  });

  it('opens booking details with post number from list context', async () => {
    const store = new BookingsStore();

    await store.openBookingDetails('booking-1', { postOrderNumber: 4 });

    expect(fetchBookingDetails).toHaveBeenCalledWith('booking-1');
    expect(fetchServicesCatalog).toHaveBeenCalledTimes(1);
    expect(store.selectedBookingView?.postOrderNumber).toBe(4);
    expect(store.selectedBookingView?.client.name).toBe('Денис');
  });

  it('maps service descriptions from catalog like service-admin', async () => {
    const store = new BookingsStore();

    await store.openBookingDetails('booking-1', { postOrderNumber: 4 });

    const services = store.getServiceViews(store.selectedBooking);

    expect(services[0].description).toBe('Быстрая мойка кузова и стекол');
    expect(services[1].description).toBe('Полировка кузова');
  });

  it('returns status-based card background colors from project constants', () => {
    const store = new BookingsStore();

    expect(store.getCardBackgroundColor('pending_confirmation')).toBe('#E8E4FF');
    expect(store.getCardBackgroundColor('confirmed')).toBe('#DDF4E8');
  });

  it('sorts pending bookings before confirmed', () => {
    const store = new BookingsStore();
    store.bookings = [
      { ...mockListItem, uuid: 'confirmed-1', status: 'confirmed' },
      { ...mockListItem, uuid: 'pending-1', status: 'pending_confirmation' },
    ];

    expect(store.sortedBookings.map((item) => item.uuid)).toEqual(['pending-1', 'confirmed-1']);
    expect(store.pendingBookings).toHaveLength(1);
  });

  it('uses at most two list requests when selected day is empty', async () => {
    const store = new BookingsStore();
    store.setSelectedDate(new Date('2026-06-29T12:00:00.000Z'));

    (fetchBookingsListForDay as jest.Mock).mockResolvedValueOnce({
      data: [],
      total: 0,
      limit: 100,
      offset: 0,
    });
    (fetchBookingsListFlexible as jest.Mock).mockResolvedValueOnce({
      data: [mockListItem],
      total: 1,
      limit: 200,
      offset: 0,
    });

    await store.fetchBookings();

    expect(fetchBookingsListForDay).toHaveBeenCalledTimes(1);
    expect(fetchBookingsListFlexible).toHaveBeenCalledTimes(1);
    expect(store.bookings).toHaveLength(0);
    expect(store.nearestBookingDate).not.toBeNull();
  });

  it('confirms a booking by code and updates its status', async () => {
    const store = new BookingsStore();
    store.bookings = [{ ...mockListItem }];
    store.selectedBooking = { ...mockDetails };

    const result = await store.confirmBooking('booking-1', '0421');

    expect(result).toEqual({ ok: true });
    expect(confirmBookingByCode).toHaveBeenCalledWith('booking-1', '0421');
    expect(store.bookings[0].status).toBe('confirmed');
    expect(store.selectedBooking?.status).toBe('confirmed');
  });
});
