import { requestApi } from '@/shared/api/apiClient';

export type ActivityStatus = 'active' | 'pending' | 'inactive';

export type CatalogActivity = {
  id: string;
  name: string;
  status: ActivityStatus;
  // How many members are classified under it, which is what decides whether it
  // may be deleted at all.
  members: number;
};

export type ActivityCounts = Record<ActivityStatus, number>;

export type ActivityList = { items: CatalogActivity[]; counts: ActivityCounts };

export type ActivityFilter = { status?: ActivityStatus; search?: string };

export function readActivities(filter: ActivityFilter = {}) {
  const query = new URLSearchParams();

  if (filter.status !== undefined) {
    query.set('status', filter.status);
  }

  if (filter.search !== undefined && filter.search !== '') {
    query.set('search', filter.search);
  }

  const suffix = query.toString();

  return requestApi<ActivityList>(`/api/admin/activities${suffix === '' ? '' : `?${suffix}`}`);
}

export function createActivity(body: { name: string }) {
  return requestApi<CatalogActivity>('/api/admin/activities', { method: 'POST', body });
}

export function updateActivity(id: string, body: { name?: string; status?: ActivityStatus }) {
  return requestApi<CatalogActivity>(`/api/admin/activities/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body,
  });
}

// Only an activity nobody carries is removed; the rest are retired instead.
export function removeActivity(id: string) {
  return requestApi<void>(`/api/admin/activities/${encodeURIComponent(id)}`, { method: 'DELETE' });
}
