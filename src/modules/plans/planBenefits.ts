import type { PlanEntitlements } from './api/plans';

export type BenefitValue = 'included' | 'locked' | 'oneMonth' | 'unlimited';

type ComparisonRowId =
  | 'directory'
  | 'card'
  | 'discounts'
  | 'products'
  | 'promotions'
  | 'jobs'
  | 'marketplace'
  | 'banner'
  | 'workshops'
  | 'massMailing';

type CardBenefitLabel =
  | 'directory'
  | 'card'
  | 'marketplaceIncluded'
  | 'marketplaceLocked'
  | 'jobs'
  | 'bannerLocked'
  | 'bannerOneMonth'
  | 'bannerUnlimited'
  | 'workshops'
  | 'massMailing';

export type CardBenefit = { id: string; value: BenefitValue; label: CardBenefitLabel };

export type ComparisonRow = {
  id: ComparisonRowId;
  valueFor: (plan: PlanEntitlements) => BenefitValue;
};

type Flag = Exclude<keyof PlanEntitlements, 'banner'>;

const included = (): BenefitValue => 'included';

const whenAllowed =
  (flag: Flag) =>
  (entitlements: PlanEntitlements): BenefitValue =>
    entitlements[flag] ? 'included' : 'locked';

function bannerValue({ banner }: PlanEntitlements): BenefitValue {
  if (banner === 'one_month') {
    return 'oneMonth';
  }

  return banner === 'unlimited' ? 'unlimited' : 'locked';
}

const BANNER_LABELS: Record<BenefitValue, CardBenefitLabel> = {
  included: 'bannerUnlimited',
  locked: 'bannerLocked',
  oneMonth: 'bannerOneMonth',
  unlimited: 'bannerUnlimited',
};

// What a plan card lists, read from the plan's entitlements, so a plan changed
// in the API is shown as it now is. A locked right keeps its row and says so.
export function cardBenefitsFor(entitlements: PlanEntitlements): CardBenefit[] {
  const marketplace = whenAllowed('publishInMarketplace')(entitlements);
  const banner = bannerValue(entitlements);

  return [
    { id: 'directory', value: 'included', label: 'directory' },
    { id: 'card', value: 'included', label: 'card' },
    {
      id: 'marketplace',
      value: marketplace,
      label: marketplace === 'included' ? 'marketplaceIncluded' : 'marketplaceLocked',
    },
    { id: 'jobs', value: whenAllowed('publishJobs')(entitlements), label: 'jobs' },
    { id: 'banner', value: banner, label: BANNER_LABELS[banner] },
    { id: 'workshops', value: whenAllowed('onlineWorkshops')(entitlements), label: 'workshops' },
    { id: 'massMailing', value: whenAllowed('massMailing')(entitlements), label: 'massMailing' },
  ];
}

// The comparison splits what the cards group, so each right can be checked on
// its own.
export const comparisonRows: readonly ComparisonRow[] = [
  { id: 'directory', valueFor: included },
  { id: 'card', valueFor: included },
  { id: 'discounts', valueFor: whenAllowed('publishInMarketplace') },
  { id: 'products', valueFor: whenAllowed('publishInMarketplace') },
  { id: 'promotions', valueFor: whenAllowed('publishInMarketplace') },
  { id: 'jobs', valueFor: whenAllowed('publishJobs') },
  { id: 'marketplace', valueFor: whenAllowed('publishInMarketplace') },
  { id: 'banner', valueFor: bannerValue },
  { id: 'workshops', valueFor: whenAllowed('onlineWorkshops') },
  { id: 'massMailing', valueFor: whenAllowed('massMailing') },
];
