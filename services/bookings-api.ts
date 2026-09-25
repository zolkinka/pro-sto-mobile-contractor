import axios from 'axios';

import { apiClient } from '@/services/api-client';
import type {
  BookingDetails,
  BookingListResponse,
  BookingStatus,
  ConfirmBookingResult,
  ServiceCatalogItem,
} from '@/types/bookings';

/**
 * Contractors app list: master API (contractor scope).
 * Booking details stay on admin routes (same admin-auth token).
 */
export interface FetchBookingsListParams {
  serviceCenterUuid?: string | null;
  dateFrom?: string;
  dateTo?: string;
  status?: BookingStatus[];
  limit?: number;
  offset?: number;
}

function buildBookingsListQuery(params: FetchBookingsListParams) {
  return {
    ...(params.serviceCenterUuid ? { service_center_uuid: params.serviceCenterUuid } : {}),
    ...(params.dateFrom ? { date_from: params.dateFrom } : {}),
    ...(params.dateTo ? { date_to: params.dateTo } : {}),
    status: params.status,
    limit: params.limit ?? 100,
    offset: params.offset ?? 0,
  };
}

function normalizeBookingListResponse(payload: unknown): BookingListResponse {
  if (Array.isArray(payload)) {
    return {
      data: payload as BookingListResponse['data'],
      total: payload.length,
      limit: 100,
      offset: 0,
    };
  }

  const response = payload as Partial<BookingListResponse>;
  const data = response.data ?? [];

  return {
    data,
    total: response.total ?? data.length,
    limit: response.limit ?? 100,
    offset: response.offset ?? 0,
  };
}

async function getBookingsFromEndpoint(
  endpoint: 'admin' | 'master',
  params: FetchBookingsListParams,
): Promise<BookingListResponse> {
  const url = endpoint === 'admin' ? '/api/admin/bookings' : '/api/master/bookings';
  const response = await apiClient.get(url, {
    params: buildBookingsListQuery(params),
  });

  return normalizeBookingListResponse(response.data);
}

export async function fetchBookingsList(
  params: FetchBookingsListParams & { serviceCenterUuid: string },
): Promise<BookingListResponse> {
  return getBookingsFromEndpoint('admin', params);
}

export async function fetchMasterBookingsList(
  params: FetchBookingsListParams,
): Promise<BookingListResponse> {
  return getBookingsFromEndpoint('master', params);
}

function shouldTryNextBookingsSource(error: unknown): boolean {
  if (!axios.isAxiosError(error)) {
    return false;
  }

  const status = error.response?.status;
  return status === 403 || status === 404;
}

/**
 * Tries admin list for a service center, then master list (scoped and all contractor SCs).
 */
export async function fetchBookingsListForDay(
  params: FetchBookingsListParams & { dateFrom: string; dateTo: string },
): Promise<BookingListResponse> {
  const attempts: Array<() => Promise<BookingListResponse>> = [];

  if (params.serviceCenterUuid) {
    attempts.push(() =>
      fetchBookingsList({
        ...params,
        serviceCenterUuid: params.serviceCenterUuid!,
      }),
    );
    attempts.push(() =>
      fetchMasterBookingsList({
        ...params,
        serviceCenterUuid: params.serviceCenterUuid,
      }),
    );
  }

  attempts.push(() =>
    fetchMasterBookingsList({
      ...params,
      serviceCenterUuid: undefined,
    }),
  );

  let lastError: unknown;
  let lastEmptyResponse: BookingListResponse | null = null;

  for (const attempt of attempts) {
    try {
      const response = await attempt();

      if (response.total > 0 || response.data.length > 0) {
        return response;
      }

      lastEmptyResponse = response;
    } catch (error) {
      lastError = error;

      if (!shouldTryNextBookingsSource(error)) {
        throw error;
      }
    }
  }

  if (lastEmptyResponse) {
    return lastEmptyResponse;
  }

  throw lastError ?? new Error('Failed to fetch bookings list');
}

export async function fetchBookingsListFlexible(
  params: FetchBookingsListParams,
): Promise<BookingListResponse> {
  const attempts: Array<() => Promise<BookingListResponse>> = [];

  if (params.serviceCenterUuid) {
    attempts.push(() =>
      fetchBookingsList({
        ...params,
        serviceCenterUuid: params.serviceCenterUuid!,
      }),
    );
    attempts.push(() =>
      fetchMasterBookingsList({
        ...params,
        serviceCenterUuid: params.serviceCenterUuid,
      }),
    );
  }

  attempts.push(() =>
    fetchMasterBookingsList({
      ...params,
      serviceCenterUuid: undefined,
    }),
  );

  let lastError: unknown;

  for (const attempt of attempts) {
    try {
      return await attempt();
    } catch (error) {
      lastError = error;

      if (!shouldTryNextBookingsSource(error)) {
        throw error;
      }
    }
  }

  throw lastError ?? new Error('Failed to fetch bookings list');
}

export async function fetchBookingDetails(uuid: string): Promise<BookingDetails> {
  const response = await apiClient.get<BookingDetails>(`/api/admin/bookings/${uuid}`);
  return response.data;
}

export async function confirmBookingByCode(
  uuid: string,
  code: string,
): Promise<ConfirmBookingResult> {
  const response = await apiClient.post<ConfirmBookingResult>(
    `/api/master/bookings/${uuid}/confirm`,
    { code },
  );

  return response.data;
}

export async function fetchServicesCatalog(): Promise<ServiceCatalogItem[]> {
  const response = await apiClient.get<ServiceCatalogItem[]>('/api/admin/services');
  return response.data;
}
