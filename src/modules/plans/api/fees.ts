import { requestApi } from '@/shared/api/apiClient';
import { pageQuery, type Paginated } from '@/shared/api/pagination';
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

export const FEE_HISTORY_PAGE_SIZE = 10;

export function readFeeChanges(page: number) {
  return requestApi<Paginated<FeeChange>>(
    `/api/admin/plans/fee-changes?${pageQuery(page, FEE_HISTORY_PAGE_SIZE)}`,
  );
}
