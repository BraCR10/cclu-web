import { requestApi } from '@/shared/api/apiClient';

export type ShopDay =
  'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export const SHOP_DAYS: ShopDay[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];

// A closed day carries no hours, which is why the two are one shape rather than
// a flag beside a pair that may or may not be there.
export type ShopScheduleDay = {
  day: ShopDay;
  closed: boolean;
  opensAt?: string | null;
  closesAt?: string | null;
};

export type Store = {
  businessDescription: string | null;
  categories: { _id: string; name: string }[];
  instagram: string | null;
  facebook: string | null;
  linkedin: string | null;
  website: string | null;
  schedule: ShopScheduleDay[];
};

export type StoreChanges = {
  businessDescription?: string;
  categories?: string[];
  instagram?: string;
  facebook?: string;
  linkedin?: string;
  website?: string;
  schedule?: ShopScheduleDay[];
};

export function readStore() {
  return requestApi<Store>('/api/members/me/store');
}

export function saveStore(changes: StoreChanges) {
  return requestApi<Store>('/api/members/me/store', { method: 'PATCH', body: changes });
}
