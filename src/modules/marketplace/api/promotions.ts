import { requestApi } from '@/shared/api/request';
import type { PublicationBusiness } from './business';

// The same shape wherever a promotion is read: on the public marketplace, on
// its own page, or in a member's own list.
export type Promotion = {
  id: string;
  title: string;
  description: string;
  conditions: string;
  validUntil: string;
  createdAt: string;
  business: PublicationBusiness | null;
};

// A member reads more of their own promotion than the public does: whether it
// is open, whether the chamber intervened, and whether its validity ran out.
export type OwnPromotion = Promotion & {
  isActive: boolean;
  adminStatus: 'active' | 'inactive' | 'blocked';
  expired: boolean;
};

export type PromotionPage = {
  items: Promotion[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
};

export type PromotionSearch = {
  name?: string;
  canton?: string;
  sector?: string;
  page?: number;
};

export type PromotionChanges = Partial<{
  title: string;
  description: string;
  conditions: string;
  validUntil: string;
  isActive: boolean;
}>;

export function publicationQuery(search: PromotionSearch): string {
  const params = new URLSearchParams();

  if (search.name) {
    params.set('name', search.name);
  }

  if (search.canton) {
    params.set('canton', search.canton);
  }

  if (search.sector) {
    params.set('sector', search.sector);
  }

  if (search.page) {
    params.set('page', String(search.page));
  }

  const query = params.toString();

  return query === '' ? '' : `?${query}`;
}

export function listPromotions(search: PromotionSearch = {}): Promise<PromotionPage> {
  return requestApi<PromotionPage>(`/api/promotions${publicationQuery(search)}`);
}

export function fetchPromotion(id: string): Promise<Promotion> {
  return requestApi<Promotion>(`/api/promotions/${encodeURIComponent(id)}`);
}

export function fetchOwnPromotions(): Promise<OwnPromotion[]> {
  return requestApi<OwnPromotion[]>('/api/members/me/promotions');
}

export function createPromotion(changes: PromotionChanges): Promise<OwnPromotion> {
  return requestApi<OwnPromotion>('/api/promotions', {
    method: 'POST',
    body: JSON.stringify(changes),
  });
}

export function updatePromotion(id: string, changes: PromotionChanges): Promise<OwnPromotion> {
  return requestApi<OwnPromotion>(`/api/promotions/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(changes),
  });
}

export function closePromotion(id: string): Promise<void> {
  return requestApi<void>(`/api/promotions/${encodeURIComponent(id)}`, { method: 'DELETE' });
}
