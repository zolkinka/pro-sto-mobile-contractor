import { apiClient } from '@/services/api-client';

export interface SubmitFeedbackPayload {
  email: string;
  message: string;
  name?: string;
}

export async function submitFeedback(payload: SubmitFeedbackPayload): Promise<void> {
  await apiClient.post('/api/feedback', {
    email: payload.email.trim(),
    message: payload.message.trim(),
    ...(payload.name?.trim() ? { name: payload.name.trim() } : {}),
  });
}
