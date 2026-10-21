import { requestApi, requestFile } from '@/shared/api/apiClient';
import type { Paginated } from '@/shared/api/pagination';
import type { PagedQuery } from '@/shared/hooks/usePagedList';

export type SubscriberStatus = 'subscribed' | 'unsubscribed';

export type Subscriber = {
  id: string;
  name: string;
  email: string;
  whatsappNumber: string | null;
  canton: string | null;
  province: string | null;
  district: string;
  status: SubscriberStatus;
  subscribedAt: string;
};

export type SubscriberFilters = { canton: string; district: string; status: SubscriberStatus | '' };

export const NO_SUBSCRIBER_FILTERS: SubscriberFilters = { canton: '', district: '', status: '' };

export const SUBSCRIBER_PAGE_SIZE = 10;

function filterQuery({ search, ...filters }: SubscriberFilters & { search: string }) {
  const query = new URLSearchParams();

  for (const [name, value] of Object.entries({ search: search.trim(), ...filters })) {
    if (value !== '') {
      query.set(name, value);
    }
  }

  return query;
}

export function readSubscribers({ page, ...rest }: PagedQuery<SubscriberFilters>) {
  const query = filterQuery(rest);

  query.set('page', String(page));
  query.set('pageSize', String(SUBSCRIBER_PAGE_SIZE));

  return requestApi<Paginated<Subscriber>>(`/api/admin/subscribers?${query.toString()}`);
}

export function exportSubscribers(filters: SubscriberFilters & { search: string }) {
  return requestFile(`/api/admin/subscribers/export?${filterQuery(filters).toString()}`);
}

export function readSubscriberDistricts(canton: string) {
  const query = new URLSearchParams({ canton });

  return requestApi<{ districts: string[] }>(
    `/api/admin/subscribers/districts?${query.toString()}`,
  );
}
