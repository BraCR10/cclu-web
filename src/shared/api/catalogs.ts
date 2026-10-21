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
