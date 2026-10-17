import { requestApi } from '@/shared/api/apiClient';
import type { Paginated } from '@/shared/api/pagination';
import type { PlanKey } from './plans';

// A paid membership either still grants its plan or it does not. Expiring
// soon is a count over the active ones, not a state of its own.
export type MembershipListStatus = 'active' | 'inactive';
export type PaidPlanKey = Exclude<PlanKey, 'free'>;
export type PaymentFrequency = 'monthly' | 'quarterly' | 'semiannual' | 'annual';

export type AdminMembership = {
  memberId: string;
  memberCode: string;
  businessName: string;
  plan: { key: PlanKey; name: string } | null;
  frequency: PaymentFrequency | null;
  lastPaymentAt: string | null;
  expiresAt: string | null;
  validUntil: string | null;
  status: MembershipListStatus;
};

export type AdminMembershipList = Paginated<AdminMembership> & {
  counts: { active: number; expiring: number; inactive: number };
  noticeDays: number;
};

export type MembershipListQuery = {
  status: MembershipListStatus;
  plan: PaidPlanKey | null;
  search: string;
  page: number;
};

export const MEMBERSHIP_PAGE_SIZE = 8;

export function readAdminMemberships({ status, plan, search, page }: MembershipListQuery) {
  const query = new URLSearchParams({
    status,
    page: String(page),
    pageSize: String(MEMBERSHIP_PAGE_SIZE),
  });

  if (plan !== null) {
    query.set('plan', plan);
  }

  if (search.trim() !== '') {
    query.set('search', search.trim());
  }

  return requestApi<AdminMembershipList>(`/api/admin/memberships?${query.toString()}`);
}

export type MembershipPolicy = {
  expiryNoticeDays: number;
  minimum: number;
  maximum: number;
};

export function readMembershipPolicy() {
  return requestApi<MembershipPolicy>('/api/admin/plans/policy');
}

export function updateMembershipPolicy(expiryNoticeDays: number) {
  return requestApi<MembershipPolicy>('/api/admin/plans/policy', {
    method: 'PATCH',
    body: { expiryNoticeDays },
  });
}
