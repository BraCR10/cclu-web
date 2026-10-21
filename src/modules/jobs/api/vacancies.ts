import { requestApi } from '@/shared/api/apiClient';
import { pageQuery, type Paginated } from '@/shared/api/pagination';

export type Workday = 'full_time' | 'part_time' | 'temporary';

export const WORKDAYS: Workday[] = ['full_time', 'part_time', 'temporary'];

export type VacancyBranch = {
  id: string;
  name: string;
  district: string | null;
  canton: string | null;
};

export type Vacancy = {
  id: string;
  title: string;
  description: string;
  requirements: string | null;
  workday: Workday;
  howToApply: string;
  status: 'active' | 'inactive';
  inactiveReason: string | null;
  publishedAt: string;
  branch: VacancyBranch | null;
};

export type OwnVacancyList = Paginated<Vacancy> & { canPublish: boolean };

export type VacancyDraft = {
  title: string;
  description: string;
  requirements: string;
  workday: Workday | '';
  howToApply: string;
  branch: string;
};

export const OWN_VACANCY_PAGE_SIZE = 10;

export function readOwnVacancies(page: number) {
  return requestApi<OwnVacancyList>(
    `/api/members/me/vacancies?${pageQuery(page, OWN_VACANCY_PAGE_SIZE)}`,
  );
}

export function createVacancy(draft: VacancyDraft) {
  return requestApi<Vacancy>('/api/members/me/vacancies', { method: 'POST', body: draft });
}

export function deleteVacancy(vacancyId: string) {
  return requestApi<void>(`/api/members/me/vacancies/${encodeURIComponent(vacancyId)}`, {
    method: 'DELETE',
  });
}

type BranchOption = {
  id: string;
  name: string;
  district: string;
  canton: { name: string } | null;
};

// Only what a vacancy needs to name where the job is.
export async function readBranchOptions(): Promise<VacancyBranch[]> {
  const { items } = await requestApi<{ items: BranchOption[] }>('/api/members/me/branches');

  return items.map((branch) => ({
    id: branch.id,
    name: branch.name,
    district: branch.district,
    canton: branch.canton?.name ?? null,
  }));
}
