import { requestApi } from '@/shared/api/request';
import type { ContractType } from '../jobsRules';

export type JobBusiness = { businessName: string; memberCode: string };

// The same shape wherever a posting is read: on the public board, on its own
// page, or in a member's own list. contactEmail/contactPhone arrive already
// resolved by the API: the posting's own contact, or the commerce's.
export type Job = {
  id: string;
  title: string;
  description: string;
  requirements: string;
  howToApply: string;
  contractType: ContractType;
  location: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  isActive: boolean;
  createdAt: string;
  business: JobBusiness | null;
};

export type JobPage = {
  items: Job[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
};

export type JobSearch = {
  page?: number;
  contractType?: ContractType;
};

// Only what a member may set. isActive is included because closing a posting
// from its own edit screen is one more field, not a separate action.
export type JobChanges = Partial<{
  title: string;
  description: string;
  requirements: string;
  howToApply: string;
  contractType: ContractType;
  location: string;
  contactEmail: string;
  contactPhone: string;
  isActive: boolean;
}>;

function jobQuery(search: JobSearch): string {
  const params = new URLSearchParams();

  if (search.page) {
    params.set('page', String(search.page));
  }

  if (search.contractType) {
    params.set('contractType', search.contractType);
  }

  const query = params.toString();

  return query === '' ? '' : `?${query}`;
}

export function listJobs(search: JobSearch = {}): Promise<JobPage> {
  return requestApi<JobPage>(`/api/jobs${jobQuery(search)}`);
}

export function fetchJob(id: string): Promise<Job> {
  return requestApi<Job>(`/api/jobs/${encodeURIComponent(id)}`);
}

export function fetchOwnJobs(): Promise<Job[]> {
  return requestApi<Job[]>('/api/members/me/jobs');
}

export function createJob(changes: JobChanges): Promise<Job> {
  return requestApi<Job>('/api/jobs', {
    method: 'POST',
    body: JSON.stringify(changes),
  });
}

export function updateJob(id: string, changes: JobChanges): Promise<Job> {
  return requestApi<Job>(`/api/jobs/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(changes),
  });
}

export function closeJob(id: string): Promise<void> {
  return requestApi<void>(`/api/jobs/${encodeURIComponent(id)}`, { method: 'DELETE' });
}
