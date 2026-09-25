import { makeAutoObservable, runInAction } from 'mobx';

import {
  BOOKING_STATUS_SORT_ORDER,
  getBookingCardBackgroundColor,
} from '@/constants/bookings';
import {
  confirmBookingByCode,
  fetchBookingDetails,
  fetchBookingsListFlexible,
  fetchBookingsListForDay,
  fetchServicesCatalog,
} from '@/services/bookings-api';
import type {
  BookingDetails,
  BookingDetailsView,
  BookingListItem,
  BookingServiceView,
  BookingStatus,
  ServiceCatalogItem,
} from '@/types/bookings';
import {
  getDayRangeIso,
  startOfDay,
} from '@/utils/booking-date';
import { getBookingConfirmErrorMessage } from '@/utils/booking-confirm-error';
import { parseClientComment, getBookingServiceItems } from '@/utils/booking-format';

export class BookingsStore {
  bookings: BookingListItem[] = [];
  selectedBooking: BookingDetails | null = null;
  selectedPostOrderNumber: number | null = null;

  selectedDate = new Date();
  serviceCenterUuid: string | null = null;

  isLoadingList = false;
  isLoadingDetails = false;
  isLoadingServices = false;

  error: string | null = null;
  nearestBookingDate: Date | null = null;

  total = 0;
  limit = 100;
  offset = 0;

  private servicesCatalog: ServiceCatalogItem[] = [];
  private servicesCatalogLoaded = false;
  private listRequestId = 0;
  private detailsRequestId = 0;

  constructor() {
    makeAutoObservable(this);
  }

  get sortedBookings(): BookingListItem[] {
    return [...this.bookings].sort((left, right) => {
      const statusDiff =
        BOOKING_STATUS_SORT_ORDER[left.status] - BOOKING_STATUS_SORT_ORDER[right.status];

      if (statusDiff !== 0) {
        return statusDiff;
      }

      return new Date(left.start_time).getTime() - new Date(right.start_time).getTime();
    });
  }

  get pendingBookings(): BookingListItem[] {
    return this.sortedBookings.filter((booking) => booking.status === 'pending_confirmation');
  }

  get selectedBookingView(): BookingDetailsView | null {
    if (!this.selectedBooking) {
      return null;
    }

    return {
      ...this.selectedBooking,
      client_comment: parseClientComment(this.selectedBooking.client_comment),
      postOrderNumber: this.selectedPostOrderNumber,
    };
  }

  getServiceViews(booking: BookingDetails | null): BookingServiceView[] {
    if (!booking) {
      return [];
    }

    const items = getBookingServiceItems(booking);

    return items.map((item) => {
      const catalogItem = this.servicesCatalog.find((service) => service.uuid === item.uuid);

      return {
        ...item,
        description: catalogItem?.description?.trim() || null,
      };
    });
  }

  setServiceCenterUuid(uuid: string | null): void {
    if (this.serviceCenterUuid === uuid) {
      return;
    }

    this.serviceCenterUuid = uuid;
    this.bookings = [];
    this.total = 0;
    this.clearSelectedBooking();
  }

  setSelectedDate(date: Date): void {
    this.selectedDate = startOfDay(date);
    this.nearestBookingDate = null;
  }

  goToNearestBookingDate(): void {
    if (!this.nearestBookingDate) {
      return;
    }

    const targetDate = this.nearestBookingDate;
    this.nearestBookingDate = null;
    this.selectedDate = startOfDay(targetDate);
    this.fetchBookings().catch(() => undefined);
  }

  private findNearestBookingDate(items: BookingListItem[]): Date | null {
    if (items.length === 0) {
      return null;
    }

    const anchor = startOfDay(this.selectedDate).getTime();
    const uniqueDayTimestamps = new Set<number>();

    for (const item of items) {
      uniqueDayTimestamps.add(startOfDay(new Date(item.start_time)).getTime());
    }

    const dayTimestamps = [...uniqueDayTimestamps].sort((left, right) => left - right);
    const futureOrSameDays = dayTimestamps.filter((day) => day >= anchor);

    if (futureOrSameDays.length > 0) {
      return startOfDay(new Date(futureOrSameDays[0]));
    }

    const pastDays = dayTimestamps.filter((day) => day < anchor);

    if (pastDays.length === 0) {
      return null;
    }

    return startOfDay(new Date(pastDays[pastDays.length - 1]));
  }

  private async loadBookingsForSelectedDay(): Promise<{
    data: BookingListItem[];
    total: number;
  }> {
    const dayRange = getDayRangeIso(this.selectedDate);
    const listParams = {
      serviceCenterUuid: this.serviceCenterUuid,
      limit: this.limit,
      offset: this.offset,
    };

    const dayResponse = await fetchBookingsListForDay({
      ...listParams,
      ...dayRange,
    });

    if (dayResponse.total > 0) {
      return {
        data: dayResponse.data,
        total: dayResponse.total,
      };
    }

    const discoveryResponse = await fetchBookingsListFlexible({
      ...listParams,
      limit: 200,
    });

    runInAction(() => {
      this.nearestBookingDate = this.findNearestBookingDate(discoveryResponse.data);
    });

    return {
      data: [],
      total: 0,
    };
  }

  async fetchBookings(options?: { silent?: boolean }): Promise<void> {
    const silent = options?.silent ?? false;
    const requestId = ++this.listRequestId;

    if (!silent) {
      this.isLoadingList = true;
    }
    this.error = null;

    try {
      const response = await this.loadBookingsForSelectedDay();

      if (requestId !== this.listRequestId) {
        return;
      }

      runInAction(() => {
        this.bookings = response.data;
        this.total = response.total;
        this.isLoadingList = false;
      });
    } catch (error) {
      console.warn('[BookingsStore] fetchBookings failed:', error);

      if (requestId !== this.listRequestId) {
        return;
      }

      runInAction(() => {
        this.error = 'Не удалось загрузить список записей';
        this.isLoadingList = false;
      });
    }
  }

  getCardBackgroundColor(status: BookingStatus): string {
    return getBookingCardBackgroundColor(status);
  }

  async ensureServicesCatalog(): Promise<void> {
    if (this.servicesCatalogLoaded || this.isLoadingServices) {
      return;
    }

    this.isLoadingServices = true;

    try {
      const services = await fetchServicesCatalog();

      runInAction(() => {
        this.servicesCatalog = services;
        this.servicesCatalogLoaded = true;
        this.isLoadingServices = false;
      });
    } catch (error) {
      console.warn('[BookingsStore] ensureServicesCatalog failed:', error);
      runInAction(() => {
        this.isLoadingServices = false;
      });
    }
  }

  async openBookingDetails(
    uuid: string,
    context?: { postOrderNumber?: number | null },
  ): Promise<void> {
    const listItem = this.bookings.find((item) => item.uuid === uuid);

    this.selectedBooking = null;
    this.selectedPostOrderNumber =
      context?.postOrderNumber ?? listItem?.post?.orderNumber ?? null;

    const requestId = ++this.detailsRequestId;
    this.isLoadingDetails = true;
    this.error = null;

    try {
      await this.ensureServicesCatalog();

      const booking = await fetchBookingDetails(uuid);

      if (requestId !== this.detailsRequestId) {
        return;
      }

      runInAction(() => {
        const hasClientName = Boolean(booking.client?.name?.trim());
        const hasCarData = Boolean(
          `${booking.car?.make ?? ''} ${booking.car?.model ?? ''}`.trim(),
        );

        this.selectedBooking = {
          ...booking,
          client: hasClientName ? booking.client : (listItem?.client ?? booking.client),
          car: hasCarData ? booking.car : (listItem?.car ?? booking.car),
        };
        if (this.selectedPostOrderNumber == null && listItem?.post?.orderNumber != null) {
          this.selectedPostOrderNumber = listItem.post.orderNumber;
        }
        this.isLoadingDetails = false;
      });
    } catch (error) {
      console.warn('[BookingsStore] openBookingDetails failed:', error);

      if (requestId !== this.detailsRequestId) {
        return;
      }

      runInAction(() => {
        this.error = 'Не удалось загрузить детали заказа';
        this.isLoadingDetails = false;
      });
    }
  }

  clearSelectedBooking(): void {
    this.selectedBooking = null;
    this.selectedPostOrderNumber = null;
    this.isLoadingDetails = false;
  }

  clearError(): void {
    this.error = null;
  }

  async confirmBooking(
    uuid: string,
    code: string,
  ): Promise<{ ok: true } | { ok: false; message: string }> {
    try {
      const result = await confirmBookingByCode(uuid, code);

      runInAction(() => {
        const status = result.status as BookingStatus;
        const listItem = this.bookings.find((item) => item.uuid === uuid);

        if (listItem) {
          listItem.status = status;
        }

        if (this.selectedBooking?.uuid === uuid) {
          this.selectedBooking = {
            ...this.selectedBooking,
            status,
          };
        }
      });

      return { ok: true };
    } catch (error) {
      return { ok: false, message: getBookingConfirmErrorMessage(error) };
    }
  }
}

export const bookingsStore = new BookingsStore();
