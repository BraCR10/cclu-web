import Link from 'next/link';
import { CircleCheck, Lock } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { JOIN_HREF } from '@/shared/layouts/publicNavigation';
import { classNames } from '@/shared/utils/classNames';
import { formatColones } from '@/shared/utils/formatColones';
import type { Plan } from '../api/plans';
import { cardBenefitsFor } from '../planBenefits';

export type PlanCardAction = { href: string; label: string };

type PlanCardProps = {
  plan: Plan;
  current?: boolean;
  // Joining by default, as the public page offers. Null leaves the card without
  // one, for a plan nobody moves to by choice.
  action?: PlanCardAction | null;
};

export function PlanCard({ plan, current = false, action }: PlanCardProps) {
  const translate = useTranslations('plans');
  const isFree = plan.key === 'free';
  const shownAction =
    action === undefined
      ? { href: JOIN_HREF, label: translate(`cards.${plan.key}.action`) }
      : action;
  const isFeatured = plan.key === 'premium';
  const headingId = `plan-${plan.key}`;

  return (
    <article
      aria-labelledby={headingId}
      className={classNames(
        'flex h-full flex-col rounded-lg border border-line-subtle bg-surface p-6 shadow-raised',
        isFeatured && 'border-t-4 border-t-brand-sol',
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <h2 id={headingId} className="font-display text-heading-m text-fg">
          {plan.name}
        </h2>
        {current && <StatusBadge tone="success" label={translate('cards.yourPlan')} />}
      </div>
      <p className="mt-1 text-label-s text-fg-brand">{translate(`cards.${plan.key}.tagline`)}</p>
      <p className="mt-2 text-body-s text-fg-secondary">
        {translate(`cards.${plan.key}.description`)}
      </p>

      <p className="mt-4 flex items-baseline gap-1 border-b border-line-subtle pb-4">
        <span className="font-display text-metric-l text-fg">{formatColones(plan.monthlyFee)}</span>
        <span className="text-body-s text-fg-muted">
          {isFree ? translate('cards.onApproval') : translate('cards.perMonth')}
        </span>
      </p>

      <ul
        aria-label={translate('cards.benefitsOf', { plan: plan.name })}
        className="mt-4 flex flex-1 flex-col gap-3"
      >
        {cardBenefitsFor(plan.entitlements).map((benefit) => {
          const isLocked = benefit.value === 'locked';
          const Icon = isLocked ? Lock : CircleCheck;

          return (
            <li
              key={benefit.id}
              className={classNames(
                'flex gap-2 text-body-s',
                isLocked ? 'text-fg-muted' : 'text-fg',
              )}
            >
              <Icon
                aria-hidden
                className={classNames('mt-0.5 size-4 shrink-0', !isLocked && 'text-success')}
              />
              <span>
                {translate(`cardBenefits.${benefit.label}`)}
                {isLocked && (
                  <span className="sr-only">{`, ${translate('comparison.values.locked')}`}</span>
                )}
              </span>
            </li>
          );
        })}
      </ul>

      {current ? (
        <p className="mt-6 inline-flex min-h-11 items-center justify-center rounded-sm border border-line-subtle bg-surface-subtle px-4 text-label-m text-fg-muted lg:min-h-10">
          {translate('cards.currentPlan')}
        </p>
      ) : (
        shownAction !== null && (
          <Link
            href={shownAction.href}
            className="mt-6 inline-flex min-h-11 items-center justify-center rounded-sm border border-secondary-border bg-surface px-4 text-label-m text-fg hover:bg-surface-hover focus-visible:shadow-focus focus-visible:outline-none lg:min-h-10"
          >
            {shownAction.label}
          </Link>
        )
      )}
    </article>
  );
}
