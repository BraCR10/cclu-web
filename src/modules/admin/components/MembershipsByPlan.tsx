import { useTranslations } from 'next-intl';
import type { PlanKey } from '@/shared/api/planKey';
import type { AdminSummary } from '../api/summary';
import { percentOf } from '../greeting';

const BAR_CLASSES: Record<PlanKey, string> = {
  free: 'bg-plan-free-fg',
  lite: 'bg-plan-lite',
  pro: 'bg-plan-pro',
  premium: 'bg-plan-premium',
};

export function MembershipsByPlan({ plans }: { plans: AdminSummary['membershipsByPlan'] }) {
  const translate = useTranslations('admin.summary.byPlan');
  const total = plans.reduce((sum, plan) => sum + plan.count, 0);

  return (
    <section className="flex flex-col gap-4 rounded-lg border border-line-subtle bg-surface p-4 shadow-raised lg:p-6">
      <h2 className="text-heading-m text-fg">{translate('title')}</h2>
      <ul className="flex flex-col gap-4">
        {plans.map((plan) => {
          const percent = percentOf(plan.count, total);

          return (
            <li key={plan.key} className="flex flex-col gap-1.5">
              <div className="flex items-baseline justify-between gap-3 text-body-m">
                <span className="text-fg">{plan.name}</span>
                <span className="text-fg">
                  {plan.count}{' '}
                  <span className="text-body-s text-fg-muted">
                    {translate('percent', { percent })}
                  </span>
                </span>
              </div>
              <div
                role="meter"
                aria-label={plan.name}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={percent}
                className="h-2.5 overflow-hidden rounded-full bg-surface-subtle"
              >
                <div
                  className={`h-full rounded-full ${BAR_CLASSES[plan.key]}`}
                  style={{ width: `${percent}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
