export type AdminAuthPanel = 'service_center' | 'superadmin';

export interface AdminRole {
  uuid: string;
  name: string;
  key: string;
  type: string;
  description?: string;
  permissions: string[];
}

export interface AdminUser {
  uuid: string;
  email: string;
  name: string;
  phone: string;
  role: AdminRole;
  service_center_uuid: string | null;
  auth_panel: AdminAuthPanel;
}

export interface AdminAuthResponse {
  success: boolean;
  message: string;
  accessToken: string;
  refreshToken: string;
  user: AdminUser;
}

export interface AdminSendCodeResponse {
  success: boolean;
  message: string;
}

export interface StoredUser {
  uuid: string;
  phone: string;
  name: string;
  email: string;
  serviceCenterUuid: string | null;
}
