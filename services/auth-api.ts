import type {
  AdminAuthResponse,
  AdminSendCodeResponse,
  AdminUser,
} from '@/types/auth';

import { apiClient } from './api-client';

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
  const response = await apiClient.post<AdminSendCodeResponse>(
    '/api/admin-auth/send-code',
    { phone },
  );

  return response.data;
}

export async function loginWithAdminAuthCode(
  phone: string,
  code: string,
): Promise<AdminAuthResponse> {
  const response = await apiClient.post<AdminAuthResponse>(
    '/api/admin-auth/login',
    { phone, code },
  );

  return response.data;
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
