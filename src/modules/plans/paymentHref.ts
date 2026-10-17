import type { PlanKey } from './api/plans';

// Registering a payment is where every upgrade and renewal begins.
export function paymentHref(planKey: PlanKey): string {
  return `/member/payments/new?${new URLSearchParams({ plan: planKey }).toString()}`;
}
