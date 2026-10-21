import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { PlanBadge } from '@/shared/components/PlanBadge';
import { formatColones } from '@/shared/utils/formatColones';
import type { Plan } from '@/modules/plans/api/plans';

// The four plans at a glance, with their fee as the API holds it today. The
// comparison lives on the plans page; this only says what each one costs.
export function PlansSummary({ plans }: { plans: Plan[] }) {
  const translate = useTranslations('public.home.plans');

  return (
    <section
      aria-labelledby="home-plans"
      className="grid gap-6 rounded-xl bg-surface-subtle p-4 lg:grid-cols-[1fr_1.2fr] lg:items-center lg:gap-12 lg:p-10"
    >
      <div className="flex flex-col gap-3">
        <h2 id="home-plans" className="font-display text-heading-l text-fg lg:text-heading-xl">
          {translate('title')}
        </h2>
        <p className="text-body-m text-fg-secondary">{translate('lead')}</p>
        <Link
          href="/plans"
          className="inline-flex h-11 items-center justify-center self-stretch rounded-sm bg-primary px-5 text-label-m text-on-primary hover:bg-primary-hover focus-visible:shadow-focus focus-visible:outline-none md:self-start lg:h-10"
        >
          {translate('compare')}
        </Link>
      </div>

      <ul className="flex flex-col divide-y divide-line-subtle rounded-lg border border-line-subtle bg-surface lg:grid lg:grid-cols-4 lg:gap-3 lg:divide-y-0 lg:border-0 lg:bg-transparent">
        {plans.map((plan) => (
          <li
            key={plan.key}
            className="flex items-center justify-between gap-3 px-4 py-3 lg:flex-col lg:items-start lg:rounded-lg lg:border lg:border-line-subtle lg:bg-surface lg:p-4 lg:shadow-raised"
          >
            <PlanBadge planKey={plan.key} name={plan.name} />
            <p className="flex items-baseline gap-1 text-right lg:flex-col lg:items-start lg:gap-0 lg:text-left">
              <span className="font-display text-label-l whitespace-nowrap text-fg lg:text-metric-l">
                {formatColones(plan.monthlyFee)}
              </span>
              <span className="text-body-s text-fg-secondary">
                {translate(plan.key === 'free' ? 'onApproval' : 'perMonth')}
              </span>
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
