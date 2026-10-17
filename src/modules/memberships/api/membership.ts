import { requestApi } from '@/shared/api/apiClient';
import type { Plan, PlanKey } from '@/modules/plans/api/plans';

export type LapsedPlan = {
  plan: { key: PlanKey; name: string };
  expiredAt: string;
};

export type Membership = {
  memberCode: string;
  plan: Plan;
  startedAt: string;
  expiresAt: string | null;
  lapsed: LapsedPlan | null;
};

export function readOwnMembership() {
  return requestApi<Membership>('/api/members/me/membership');
}
