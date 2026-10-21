import { requestApi } from './apiClient';

export type CatalogCanton = {
  _id: string;
  name: string;
  province: string;
};

export type CatalogActivity = {
  _id: string;
  name: string;
};

export function readCantons() {
  return requestApi<CatalogCanton[]>('/api/cantons');
}

export function readActivities() {
  return requestApi<CatalogActivity[]>('/api/activities');
}

// The districts where a listed business is, for one canton. A district is typed
// at registration rather than picked, so this is the list worth offering.
export function readDistricts(canton: string) {
  const query = new URLSearchParams({ canton });

  return requestApi<{ districts: string[] }>(`/api/directory/districts?${query.toString()}`);
}
