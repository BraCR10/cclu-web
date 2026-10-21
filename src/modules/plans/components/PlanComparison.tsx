import { Check, Lock } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { formatColones } from '@/shared/utils/formatColones';
import type { Plan } from '../api/plans';
import { comparisonRows, type BenefitValue } from '../planBenefits';
import { PlanBadge } from '@/shared/components/PlanBadge';

function ComparisonCell({ value }: { value: BenefitValue }) {
  const translate = useTranslations('plans.comparison.values');

  if (value === 'oneMonth' || value === 'unlimited') {
    return <span className="text-label-m text-fg">{translate(value)}</span>;
  }

  const Icon = value === 'included' ? Check : Lock;

  return (
    <>
      <Icon
        aria-hidden
        className={`mx-auto size-4 ${value === 'included' ? 'text-success' : 'text-fg-muted'}`}
      />
      <span className="sr-only">{translate(value)}</span>
    </>
  );
}

export function PlanComparison({ plans }: { plans: Plan[] }) {
  const translate = useTranslations('plans.comparison');

  return (
    <section aria-labelledby="plan-comparison" className="flex flex-col gap-4">
      <h2 id="plan-comparison" className="font-display text-heading-l text-fg">
        {translate('title')}
      </h2>
      <p className="text-body-s text-fg-muted lg:hidden">{translate('scrollHint')}</p>

      <div className="overflow-x-auto rounded-lg border border-line-subtle bg-surface">
        <table className="w-full min-w-[40rem] border-collapse text-left">
          <thead className="bg-surface-subtle">
            <tr>
              <th scope="col" className="px-4 py-3 text-label-s text-fg-secondary">
                {translate('benefit')}
              </th>
              {plans.map((plan) => (
                <th key={plan.key} scope="col" className="px-4 py-3 text-center">
                  <PlanBadge planKey={plan.key} name={plan.name} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {comparisonRows.map((row) => (
              <tr key={row.id} className="border-t border-line-subtle">
                <th scope="row" className="px-4 py-3 text-body-s font-normal text-fg">
                  {translate(`rows.${row.id}`)}
                </th>
                {plans.map((plan) => (
                  <td key={plan.key} className="px-4 py-3 text-center">
                    <ComparisonCell value={row.valueFor(plan.entitlements)} />
                  </td>
                ))}
              </tr>
            ))}
            <tr className="border-t border-line-subtle">
              <th scope="row" className="px-4 py-3 text-label-m text-fg">
                {translate('monthlyFee')}
              </th>
              {plans.map((plan) => (
                <td key={plan.key} className="px-4 py-3 text-center text-label-m text-fg">
                  {formatColones(plan.monthlyFee)}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}
