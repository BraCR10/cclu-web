import { requestApi } from '@/shared/api/apiClient';
import type { Plan, PlanKey } from './plans';

export type FeeChange = {
  id: string;
  occurredAt: string;
  plan: { key: PlanKey | null; name: string };
  previousFee: number;
  newFee: number;
  changedBy: string;
};

export function updateFees(fees: Partial<Record<PlanKey, number | null>>) {
  return requestApi<Plan[]>('/api/admin/plans/fees', { method: 'PATCH', body: { fees } });
}

export function readFeeChanges() {
  return requestApi<FeeChange[]>('/api/admin/plans/fee-changes');
}
