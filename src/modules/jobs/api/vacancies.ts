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

export type BoardVacancy = {
  id: string;
  title: string;
  workday: Workday;
  publishedAt: string;
  branch: (VacancyBranch & { address?: string | null }) | null;
  business: { name: string; memberCode: string };
};

export type BoardVacancyDetail = BoardVacancy & {
  description: string;
  requirements: string | null;
  howToApply: string;
  business: {
    name: string;
    memberCode: string;
    whatsappNumber: string | null;
    logoFileKey: string | null;
  };
};

export type BoardFilters = { canton: string; district: string; workday: Workday | '' };

export const NO_BOARD_FILTERS: BoardFilters = { canton: '', district: '', workday: '' };

export function readBoard({
  search,
  page,
  ...filters
}: BoardFilters & { search: string; page: number }) {
  const query = new URLSearchParams({ page: String(page) });

  for (const [name, value] of Object.entries({ search: search.trim(), ...filters })) {
    if (value !== '') {
      query.set(name, value);
    }
  }

  return requestApi<Paginated<BoardVacancy>>(`/api/vacancies?${query.toString()}`);
}

export function readBoardVacancy(vacancyId: string) {
  return requestApi<BoardVacancyDetail>(`/api/vacancies/${encodeURIComponent(vacancyId)}`);
}
