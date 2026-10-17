import { requestApi } from '@/shared/api/apiClient';
import type { Plan, PlanKey } from './plans';

// validUntil is the last day a plan is valid, as YYYY-MM-DD in Costa Rica. It
// is a calendar day, not an instant, and is shown exactly as written.
export type LapsedPlan = {
  plan: { key: PlanKey; name: string };
  validUntil: string | null;
};

export type Membership = {
  memberCode: string;
  plan: Plan;
  startedAt: string | null;
  validUntil: string | null;
  lapsed: LapsedPlan | null;
};

export function readOwnMembership() {
  return requestApi<Membership>('/api/members/me/membership');
}
