import { requestApi } from '@/shared/api/request';
import type { PublicationBusiness } from './business';
import { publicationQuery, type PromotionSearch } from './promotions';

// A discount has no name of its own in the ERS: the description is what a
// member reads to decide whether it applies to them.
export type Discount = {
  id: string;
  description: string;
  conditions: string;
  validUntil: string;
  createdAt: string;
  business: PublicationBusiness | null;
};

export type OwnDiscount = Discount & {
  isActive: boolean;
  adminStatus: 'active' | 'inactive' | 'blocked';
  expired: boolean;
};

export type DiscountPage = {
  items: Discount[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
};

export type DiscountSearch = PromotionSearch;

export type DiscountChanges = Partial<{
  description: string;
  conditions: string;
  validUntil: string;
  isActive: boolean;
}>;

// Reads require a session: discounts are a benefit between affiliates, never
// shown to the anonymous public.
export function listDiscounts(search: DiscountSearch = {}): Promise<DiscountPage> {
  return requestApi<DiscountPage>(`/api/discounts${publicationQuery(search)}`);
}

export function fetchDiscount(id: string): Promise<Discount> {
  return requestApi<Discount>(`/api/discounts/${encodeURIComponent(id)}`);
}

export function fetchOwnDiscounts(): Promise<OwnDiscount[]> {
  return requestApi<OwnDiscount[]>('/api/members/me/discounts');
}

export function createDiscount(changes: DiscountChanges): Promise<OwnDiscount> {
  return requestApi<OwnDiscount>('/api/discounts', {
    method: 'POST',
    body: JSON.stringify(changes),
  });
}

export function updateDiscount(id: string, changes: DiscountChanges): Promise<OwnDiscount> {
  return requestApi<OwnDiscount>(`/api/discounts/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(changes),
  });
}

export function closeDiscount(id: string): Promise<void> {
  return requestApi<void>(`/api/discounts/${encodeURIComponent(id)}`, { method: 'DELETE' });
}
