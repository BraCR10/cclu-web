import { requestApi } from '@/shared/api/apiClient';
import type { Plan, PlanKey } from './plans';

// expiresAt is the instant a term ends, shown on the viewer's clock. validUntil
// is its last day on the chamber's calendar, which messages from the chamber
// name; the screen does not need it.
export type Term = {
  expiresAt: string | null;
  validUntil: string | null;
};

export type LapsedPlan = Term & {
  plan: { key: PlanKey; name: string };
};

export type Membership = Term & {
  memberCode: string;
  plan: Plan;
  startedAt: string | null;
  lapsed: LapsedPlan | null;
};

export function readOwnMembership() {
  return requestApi<Membership>('/api/members/me/membership');
}
