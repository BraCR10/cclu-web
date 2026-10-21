import { requestApi } from '@/shared/api/apiClient';

export type BranchReference = { _id: string; name: string };
export type BranchCanton = { _id: string; name: string; province: string };

export type Branch = {
  id: string;
  name: string;
  isPrimary: boolean;
  canton: BranchCanton | null;
  district: string;
  address: string;
  phone: string | null;
  schedule: string | null;
  // The chamber's own: the screen shows it with that note and the public profile
  // never does.
  municipalPermit: string | null;
  activity: BranchReference | null;
};

export type BranchList = { items: Branch[] };

// What a popup sends. The API takes the three required fields on a new branch
// and only the ones present on an edit, so an optional one left empty is a
// removal.
export type BranchDraft = {
  name: string;
  isPrimary: boolean;
  canton: string;
  district: string;
  address: string;
  phone: string;
  schedule: string;
  municipalPermit: string;
  activity: string;
};

export function readBranches() {
  return requestApi<BranchList>('/api/members/me/branches');
}

export function createBranch(body: BranchDraft) {
  return requestApi<Branch>('/api/members/me/branches', { method: 'POST', body });
}

export function updateBranch(branchId: string, body: Partial<BranchDraft>) {
  return requestApi<Branch>(`/api/members/me/branches/${encodeURIComponent(branchId)}`, {
    method: 'PATCH',
    body,
  });
}

// The answer is the branches that are left, so the screen does not guess which
// one became primary.
export function deleteBranch(branchId: string) {
  return requestApi<BranchList>(`/api/members/me/branches/${encodeURIComponent(branchId)}`, {
    method: 'DELETE',
  });
}
