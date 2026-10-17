import type { PlanKey } from './api/plans';

// Registering a payment is where every upgrade and renewal begins. A payment
// sent again after a rejection names the one it answers.
export function paymentHref(planKey: PlanKey, resubmissionOf?: string): string {
  const query = new URLSearchParams({ plan: planKey });

  if (resubmissionOf !== undefined) {
    query.set('resubmissionOf', resubmissionOf);
  }

  return `/member/payments/new?${query.toString()}`;
}
