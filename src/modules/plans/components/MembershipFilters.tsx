import { useTranslations } from 'next-intl';
import { ChipGroup } from '@/shared/components/ChipGroup';
import { SearchField } from '@/shared/components/SearchField';
import type { PaidPlanKey } from '../api/adminMemberships';
import type { Plan } from '../api/plans';

type MembershipFiltersProps = {
  search: string;
  onSearch: (value: string) => void;
  plans: Plan[];
  plan: PaidPlanKey | null;
  onPlan: (plan: PaidPlanKey | null) => void;
};

const ALL_PLANS = 'all';

export function MembershipFilters({
  search,
  onSearch,
  plans,
  plan,
  onPlan,
}: MembershipFiltersProps) {
  const translate = useTranslations('admin.memberships.filters');
  const paidPlans = plans.filter(
    (item): item is Plan & { key: PaidPlanKey } => item.key !== 'free',
  );

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-4">
      <SearchField
        label={translate('searchLabel')}
        placeholder={translate('searchPlaceholder')}
        value={search}
        onChange={onSearch}
      />
      <ChipGroup<PaidPlanKey | typeof ALL_PLANS>
        label={translate('planLabel')}
        chips={[
          { value: ALL_PLANS, label: translate('allPlans') },
          ...paidPlans.map((item) => ({ value: item.key, label: item.name })),
        ]}
        selected={plan ?? ALL_PLANS}
        onSelect={(value) => onPlan(value === ALL_PLANS ? null : value)}
      />
    </div>
  );
}
