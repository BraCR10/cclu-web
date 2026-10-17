import Link from 'next/link';
import { ArrowUpDown, RefreshCw } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Card } from '@/shared/components/Card';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { formatColones } from '@/shared/utils/formatColones';
import { useDates } from '@/shared/hooks/useDates';
import type { Membership } from '../api/membership';
import { paymentHref } from '../paymentHref';

const ACTION_CLASSES =
  'inline-flex min-h-11 items-center gap-2 rounded-sm px-4 text-label-m focus-visible:shadow-focus focus-visible:outline-none lg:min-h-10';

export function CurrentPlan({ membership }: { membership: Membership }) {
  const translate = useTranslations('member.membership');
  const dates = useDates();
  const { plan, validUntil, startedAt, lapsed } = membership;
  const isFree = plan.key === 'free';
  // Gratuita after a lapse began on a known day; Gratuita from approval did not
  // need one.
  const showsStart = !isFree || lapsed !== null;

  return (
    <Card as="section" aria-labelledby="current-plan" className="flex flex-col gap-4">
      <p className="text-caption text-fg-muted">{translate('currentPlan')}</p>
      <div className="flex flex-wrap items-center gap-2">
        <h2 id="current-plan" className="font-display text-heading-l text-fg">
          {plan.name}
        </h2>
        <StatusBadge tone="success" label={translate('active')} />
      </div>

      <p className="font-display text-heading-m text-fg">
        {isFree
          ? translate('noCost')
          : translate('monthly', { fee: formatColones(plan.monthlyFee) })}
      </p>

      <div>
        <p className="text-label-m text-fg">
          {validUntil === null
            ? translate('noExpiry')
            : translate('validUntil', { date: dates.calendarDay(validUntil) })}
        </p>
        <p className="text-body-s text-fg-secondary">
          {showsStart && startedAt !== null
            ? translate('activeSince', { date: dates.instant(startedAt) })
            : translate('activeSinceApproval')}
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <a
          href="#change-plan"
          className={`${ACTION_CLASSES} bg-primary text-on-primary hover:bg-primary-hover`}
        >
          <ArrowUpDown aria-hidden className="size-4" />
          {translate('changePlan')}
        </a>
        {!isFree && (
          <Link
            href={paymentHref(plan.key)}
            className={`${ACTION_CLASSES} border border-secondary-border bg-surface text-fg hover:bg-surface-hover`}
          >
            <RefreshCw aria-hidden className="size-4" />
            {translate('renew')}
          </Link>
        )}
      </div>
    </Card>
  );
}
