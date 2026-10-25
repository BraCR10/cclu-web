import { requestApi } from '@/shared/api/apiClient';
import type { Paginated } from '@/shared/api/pagination';
import type { PlanKey } from './plans';

// The list holds the plans the chamber is paid for: the ones in force and the
// ones that ran out. An expired membership is back on Gratuita and keeps the
// plan it ran out of, which is the plan its row names.
export type MembershipListView = 'active' | 'expiring' | 'expired';
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
  counts: { active: number; expiring: number; expired: number };
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
