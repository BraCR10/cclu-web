import { requestApi } from '@/shared/api/apiClient';
import type { Paginated } from '@/shared/api/pagination';
import type { PlanKey } from './plans';

// The list holds paid plans in force only: every one of them, or the part that
// ends within the notice. A plan that ran out is back on Gratuita, which is not
// listed.
export type MembershipListView = 'active' | 'expiring';
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
};

export type AdminMembershipList = Paginated<AdminMembership> & {
  counts: { active: number; expiring: number };
  noticeDays: number;
};

export type MembershipListQuery = {
  view: MembershipListView;
  plan: PaidPlanKey | null;
  search: string;
  page: number;
};

export const MEMBERSHIP_PAGE_SIZE = 8;

export function readAdminMemberships({ view, plan, search, page }: MembershipListQuery) {
  const query = new URLSearchParams({
    view,
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
