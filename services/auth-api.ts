import type {
  AdminAuthResponse,
  AdminSendCodeResponse,
  AdminUser,
} from '@/types/auth';

import { apiClient } from './api-client';
import { fetchJsonGet, fetchJsonPost } from './fetch-json';

export function mapAdminUserToStoredUser(user: AdminUser) {
  return {
    uuid: user.uuid,
    phone: user.phone,
    name: user.name,
    email: user.email,
    serviceCenterUuid: user.service_center_uuid,
  };
}

export async function sendAdminAuthCode(phone: string): Promise<AdminSendCodeResponse> {
  return fetchJsonPost<AdminSendCodeResponse>('/api/admin-auth/send-code', { phone });
}

export async function loginWithAdminAuthCode(
  phone: string,
  code: string,
): Promise<AdminAuthResponse> {
  return fetchJsonPost<AdminAuthResponse>('/api/admin-auth/login', { phone, code });
}

export async function refreshAdminAuthToken(refreshToken: string): Promise<{
  accessToken: string;
  refreshToken: string;
}> {
  const response = await apiClient.post<{
    accessToken: string;
    refreshToken: string;
  }>(
    '/api/auth/refresh',
    {},
    {
      headers: {
        Authorization: `Bearer ${refreshToken}`,
      },
    },
  );

  return response.data;
}

export async function getCurrentAdminUser(): Promise<AdminUser> {
  const response = await apiClient.get<AdminUser>('/api/auth/me');
  return response.data;
}
