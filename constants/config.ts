import { API_BASE_URL as ENV_API_BASE_URL } from '@env';

const DEFAULT_DEV_API_BASE_URL = 'https://dev.prosto-app.ru';
const DEFAULT_PROD_API_BASE_URL = 'https://api.prosto-app.ru';

export const API_BASE_URL =
  ENV_API_BASE_URL?.trim() ||
  (__DEV__ ? DEFAULT_DEV_API_BASE_URL : DEFAULT_PROD_API_BASE_URL);

export const PRIVACY_POLICY_URL = 'https://prosto-app.ru/prosto_politika';

export const OTP_RESEND_SECONDS = 60;
