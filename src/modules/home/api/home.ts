import { requestApi } from '@/shared/api/apiClient';
import type { BoardVacancy } from '@/modules/jobs/api/vacancies';
import type { DirectoryListing } from '@/modules/marketplace/api/directory';

export type Home = {
  featured: DirectoryListing[];
  vacancies: BoardVacancy[];
  counts: { members: number; vacancies: number };
};

export function readHome() {
  return requestApi<Home>('/api/home');
}
