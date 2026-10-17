import { describe, expect, it } from 'vitest';
import type { PlanEntitlements } from '@/modules/plans/api/plans';
import { cardBenefitsFor, comparisonRows } from '@/modules/plans/planBenefits';

const FREE: PlanEntitlements = {
  publishInMarketplace: false,
  publishJobs: false,
  banner: 'none',
  onlineWorkshops: false,
  massMailing: false,
};

const PRO: PlanEntitlements = {
  publishInMarketplace: true,
  publishJobs: true,
  banner: 'one_month',
  onlineWorkshops: true,
  massMailing: true,
};

function valuesOf(entitlements: PlanEntitlements) {
  return Object.fromEntries(
    cardBenefitsFor(entitlements).map((benefit) => [benefit.id, benefit.value]),
  );
}

describe('the benefits a plan card lists', () => {
  it('lock what the plan does not unlock but keep the row', () => {
    expect(valuesOf(FREE)).toEqual({
      directory: 'included',
      card: 'included',
      marketplace: 'locked',
      jobs: 'locked',
      banner: 'locked',
      workshops: 'locked',
      massMailing: 'locked',
    });
  });

  it('name the banner by how long the plan allows it', () => {
    const banner = (entitlements: PlanEntitlements) =>
      cardBenefitsFor(entitlements).find((benefit) => benefit.id === 'banner');

    expect(banner(PRO)).toMatchObject({ value: 'oneMonth', label: 'bannerOneMonth' });
    expect(banner({ ...PRO, banner: 'unlimited' })).toMatchObject({
      value: 'unlimited',
      label: 'bannerUnlimited',
    });
  });

  it('describe what publishing allows only once it is unlocked', () => {
    const marketplace = (entitlements: PlanEntitlements) =>
      cardBenefitsFor(entitlements).find((benefit) => benefit.id === 'marketplace')?.label;

    expect(marketplace(FREE)).toBe('marketplaceLocked');
    expect(marketplace(PRO)).toBe('marketplaceIncluded');
  });
});

describe('the comparison', () => {
  it('follows the same entitlements as the cards', () => {
    const value = (id: string, entitlements: PlanEntitlements) =>
      comparisonRows.find((row) => row.id === id)?.valueFor(entitlements);

    expect(value('discounts', FREE)).toBe('locked');
    expect(value('discounts', PRO)).toBe('included');
    expect(value('banner', PRO)).toBe('oneMonth');
    expect(value('directory', FREE)).toBe('included');
  });
});
