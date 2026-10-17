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
