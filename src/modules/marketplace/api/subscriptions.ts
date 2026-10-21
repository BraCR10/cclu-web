import { requestApi } from '@/shared/api/apiClient';

export type SubscriptionDraft = {
  name: string;
  email: string;
  whatsappNumber: string;
  canton: string;
  district: string;
  acceptsPromotions: boolean;
};

export function subscribe(draft: SubscriptionDraft) {
  return requestApi<{ subscribed: boolean }>('/api/subscribers', { method: 'POST', body: draft });
}
