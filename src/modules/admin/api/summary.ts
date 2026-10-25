import { requestApi } from '@/shared/api/apiClient';
import type { PlanKey } from '@/shared/api/planKey';

export type ExpiringMembership = {
  memberId: string;
  memberCode: string;
  businessName: string;
  plan: { key: PlanKey; name: string } | null;
  expiresAt: string;
  validUntil: string;
};

export type AdminSummary = {
  members: { total: number; newThisMonth: number };
  applications: { pending: number; oldestSubmittedAt: string | null };
  payments: { pending: number; oldestSubmittedAt: string | null };
  paidMemberships: { active: number; newThisMonth: number };
  membershipsByPlan: Array<{ key: PlanKey; name: string; count: number }>;
  publications: { active: number };
  vacancies: { active: number };
  expiring: { items: ExpiringMembership[]; total: number; noticeDays: number };
};

export function readAdminSummary() {
  return requestApi<AdminSummary>('/api/admin/summary');
}
