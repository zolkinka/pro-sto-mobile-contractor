import { apiClient } from '@/services/api-client';

export interface FaqItem {
  uuid: string;
  question: string;
  answer: string;
}

export async function fetchFaq(): Promise<FaqItem[]> {
  const response = await apiClient.get<FaqItem[]>('/api/faq');
  return response.data ?? [];
}
