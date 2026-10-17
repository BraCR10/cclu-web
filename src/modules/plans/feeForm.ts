import type { Plan, PlanKey } from './api/plans';

export type FeeDrafts = Partial<Record<PlanKey, number | null>>;

// Whatever was typed, the digits are the amount: the field shows ₡5.000, and
// the symbol and the dots are presentation. An empty field is no amount yet.
export function parseFeeInput(typed: string): number | null {
  const digits = typed.replace(/\D/g, '');

  return digits === '' ? null : Number(digits);
}

export function draftsFrom(plans: readonly Plan[]): FeeDrafts {
  return Object.fromEntries(plans.map((plan) => [plan.key, plan.monthlyFee]));
}

// Only what moved is sent. Gratuita is never sent, since its fee is not the
// chamber's to change, and an emptied field is sent as it is so the API names
// the field that needs an amount.
export function changedFees(
  plans: readonly Plan[],
  drafts: FeeDrafts,
): Partial<Record<PlanKey, number | null>> {
  return Object.fromEntries(
    plans
      .filter((plan) => plan.key !== 'free' && plan.key in drafts)
      .filter((plan) => drafts[plan.key] !== plan.monthlyFee)
      .map((plan) => [plan.key, drafts[plan.key] ?? null]),
  );
}

// The same ceiling the API applies, so a mistyped extra zero is caught before
// the request instead of after it.
export const MAXIMUM_MONTHLY_FEE = 1_000_000;

export type FeeErrorCode = 'required' | 'invalid_format';

// Checked before sending, with the codes the API answers, so the message under
// a field is the same whichever side refused it.
export function feeErrors(
  fees: Partial<Record<PlanKey, number | null>>,
): Partial<Record<PlanKey, FeeErrorCode>> {
  const errors: Partial<Record<PlanKey, FeeErrorCode>> = {};

  for (const [key, fee] of Object.entries(fees) as [PlanKey, number | null][]) {
    if (fee === null) {
      errors[key] = 'required';
    } else if (!Number.isInteger(fee) || fee <= 0 || fee > MAXIMUM_MONTHLY_FEE) {
      errors[key] = 'invalid_format';
    }
  }

  return errors;
}
