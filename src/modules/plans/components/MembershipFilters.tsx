import { Check, Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { classNames } from '@/shared/utils/classNames';
import type { PaidPlanKey } from '../api/adminMemberships';
import type { Plan } from '../api/plans';

type MembershipFiltersProps = {
  search: string;
  onSearch: (value: string) => void;
  plans: Plan[];
  plan: PaidPlanKey | null;
  onPlan: (plan: PaidPlanKey | null) => void;
};

const MAXIMUM_SEARCH_LENGTH = 100;

function Chip({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={classNames(
        'inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full border px-4 text-label-m focus-visible:shadow-focus focus-visible:outline-none lg:min-h-9',
        selected
          ? 'border-primary bg-brand-union-soft text-fg-brand'
          : 'border-line bg-surface text-fg hover:bg-surface-hover',
      )}
    >
      {selected && <Check aria-hidden className="size-4" />}
      {label}
    </button>
  );
}

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
      <label className="relative flex-1">
        <span className="sr-only">{translate('searchLabel')}</span>
        <Search
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-fg-muted"
        />
        <input
          type="search"
          value={search}
          maxLength={MAXIMUM_SEARCH_LENGTH}
          placeholder={translate('searchPlaceholder')}
          onChange={(event) => onSearch(event.target.value)}
          className="min-h-11 w-full rounded-sm border border-line bg-surface pr-3 pl-9 text-body-m text-fg placeholder:text-fg-muted focus-visible:border-primary focus-visible:shadow-focus focus-visible:outline-none lg:min-h-10"
        />
      </label>

      {/* Scrolls sideways on a telephone rather than wrapping into rows. */}
      <div
        role="group"
        aria-label={translate('planLabel')}
        className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:mx-0 lg:px-0 lg:pb-0"
      >
        <Chip label={translate('allPlans')} selected={plan === null} onClick={() => onPlan(null)} />
        {paidPlans.map((item) => (
          <Chip
            key={item.key}
            label={item.name}
            selected={plan === item.key}
            onClick={() => onPlan(item.key)}
          />
        ))}
      </div>
    </div>
  );
}
