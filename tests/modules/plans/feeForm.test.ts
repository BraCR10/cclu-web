import { describe, expect, it } from 'vitest';
import type { Plan } from '@/modules/plans/api/plans';
import {
  MAXIMUM_MONTHLY_FEE,
  changedFees,
  draftsFrom,
  feeErrors,
  parseFeeInput,
} from '@/modules/plans/feeForm';

const ENTITLEMENTS = {
  publishInMarketplace: true,
  publishJobs: true,
  banner: 'none',
  onlineWorkshops: false,
  massMailing: false,
} as const;

const PLANS: Plan[] = [
  { key: 'free', name: 'Gratuita', monthlyFee: 0, entitlements: ENTITLEMENTS },
  { key: 'lite', name: 'Lite MiPyme', monthlyFee: 5000, entitlements: ENTITLEMENTS },
  { key: 'pro', name: 'Pro Pymex', monthlyFee: 10000, entitlements: ENTITLEMENTS },
];

describe('parseFeeInput', () => {
  it('reads the amount from what the field shows', () => {
    expect(parseFeeInput('₡5.000')).toBe(5000);
    expect(parseFeeInput('12000')).toBe(12000);
  });

  it('treats an emptied field as no amount rather than zero', () => {
    expect(parseFeeInput('')).toBeNull();
    expect(parseFeeInput('₡')).toBeNull();
  });
});

describe('changedFees', () => {
  it('sends nothing while every fee is as stored', () => {
    expect(changedFees(PLANS, draftsFrom(PLANS))).toEqual({});
  });

  it('sends only the fees that moved', () => {
    expect(changedFees(PLANS, { ...draftsFrom(PLANS), pro: 12000 })).toEqual({ pro: 12000 });
  });

  it('never sends Gratuita', () => {
    expect(changedFees(PLANS, { ...draftsFrom(PLANS), free: 1000 })).toEqual({});
  });

  it('sends an emptied fee so the API can name the field', () => {
    expect(changedFees(PLANS, { ...draftsFrom(PLANS), lite: null })).toEqual({ lite: null });
  });
});

describe('feeErrors', () => {
  it('asks for an amount in an emptied field', () => {
    expect(feeErrors({ lite: null })).toEqual({ lite: 'required' });
  });

  it('refuses zero and anything above the ceiling, as the API does', () => {
    expect(feeErrors({ lite: 0, pro: MAXIMUM_MONTHLY_FEE + 1 })).toEqual({
      lite: 'invalid_format',
      pro: 'invalid_format',
    });
  });

  it('accepts whole amounts within range', () => {
    expect(feeErrors({ lite: 1, premium: MAXIMUM_MONTHLY_FEE })).toEqual({});
  });
});
