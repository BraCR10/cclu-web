import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Card } from '@/shared/components/Card';
import { useDates } from '@/shared/hooks/useDates';
import type { Membership } from '../api/membership';
import type { PaymentEligibility } from '../api/payments';
import { paymentHref } from '../paymentHref';
import { cardBenefitsFor } from '../planBenefits';
import { termProgress } from '../termProgress';
import { PlanBenefitList } from './PlanBenefitList';

type MemberPlanSummaryProps = {
  membership: Membership;
  eligibility: PaymentEligibility;
};

type NextStep =
  | { kind: 'reviewing' }
  | { kind: 'renewLapsed'; planName: string; href: string }
  | { kind: 'upgrade' }
  | { kind: 'renew'; href: string }
  | { kind: 'renewsFrom'; opensOn: string }
  | { kind: 'none' };

const PRIMARY_LINK_CLASSES =
  'inline-flex min-h-11 items-center justify-center rounded-sm bg-primary px-4 text-label-m text-on-primary hover:bg-primary-hover focus-visible:shadow-focus focus-visible:outline-none lg:min-h-10';
const SECONDARY_LINK_CLASSES =
  'inline-flex min-h-11 items-center justify-center rounded-sm border border-secondary-border bg-surface px-4 text-label-m text-fg hover:bg-surface-hover focus-visible:shadow-focus focus-visible:outline-none lg:min-h-10';

// The one thing the member can do about their plan from here. A payment under
// review comes first, because offering another one would only duplicate it.
function nextStepFor(membership: Membership, eligibility: PaymentEligibility): NextStep {
  if (eligibility.reason === 'payment_pending') {
    return { kind: 'reviewing' };
  }

  if (membership.lapsed !== null) {
    return {
      kind: 'renewLapsed',
      planName: membership.lapsed.plan.name,
      href: paymentHref(membership.lapsed.plan.key),
    };
  }

  if (membership.plan.key === 'free') {
    return { kind: 'upgrade' };
  }

  if (eligibility.canSubmit) {
    return { kind: 'renew', href: paymentHref(membership.plan.key) };
  }

  if (eligibility.reason === 'renewal_not_open' && eligibility.opensOn !== null) {
    return { kind: 'renewsFrom', opensOn: eligibility.opensOn };
  }

  return { kind: 'none' };
}

// The card already names the plan and its end date. This says what the card
// cannot: how long is left, what to do next and what the plan lets the member do.
export function MemberPlanSummary({ membership, eligibility }: MemberPlanSummaryProps) {
  const translate = useTranslations('member.card.plan');
  const translateCard = useTranslations('member.card');
  const dates = useDates();
  const step = nextStepFor(membership, eligibility);
  const isFree = membership.plan.key === 'free' && membership.lapsed === null;
  const progress =
    membership.lapsed === null
      ? termProgress(membership.startedAt, membership.expiresAt, new Date())
      : null;
  // The card itself is the one right this screen needs no reminder of.
  const benefits = cardBenefitsFor(membership.plan.entitlements).filter(
    (benefit) => benefit.id !== 'card',
  );

  return (
    <Card as="section" aria-labelledby="card-plan" className="flex flex-col gap-5">
      <h2 id="card-plan" className="font-display text-heading-m text-fg">
        {isFree
          ? translateCard('freeNoticeTitle', { plan: membership.plan.name })
          : translate('title')}
      </h2>

      {progress !== null && (
        <div className="flex flex-col gap-2">
          <p className="text-label-m text-fg">
            {translate('daysLeft', { days: progress.daysLeft })}
          </p>
          <div aria-hidden className="h-2 overflow-hidden rounded-full bg-surface-hover">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${Math.round((1 - progress.elapsed) * 100)}%` }}
            />
          </div>
        </div>
      )}

      {step.kind === 'reviewing' && (
        <p className="text-body-m text-fg-secondary">{translate('reviewing')}</p>
      )}
      {step.kind === 'renewLapsed' && (
        <p className="text-body-m text-fg-secondary">
          {translate('lapsed', { plan: step.planName })}
        </p>
      )}
      {step.kind === 'renewsFrom' && (
        <p className="text-body-s text-fg-secondary">
          {translate('renewsFrom', { date: dates.calendarDay(step.opensOn) })}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        {step.kind === 'renewLapsed' && (
          <Link href={step.href} className={PRIMARY_LINK_CLASSES}>
            {translate('renewLapsed', { plan: step.planName })}
          </Link>
        )}
        {step.kind === 'renew' && (
          <Link href={step.href} className={PRIMARY_LINK_CLASSES}>
            {translate('renew')}
          </Link>
        )}
        {step.kind === 'upgrade' && (
          <Link href="/member/membership#change-plan" className={PRIMARY_LINK_CLASSES}>
            {translate('upgrade')}
          </Link>
        )}
        {step.kind === 'reviewing' ? (
          <Link href="/member/payments" className={SECONDARY_LINK_CLASSES}>
            {translate('viewPayments')}
          </Link>
        ) : (
          <Link href="/member/membership" className={SECONDARY_LINK_CLASSES}>
            {translate('viewMembership')}
          </Link>
        )}
      </div>

      <div className="flex flex-col gap-3 border-t border-line-subtle pt-5">
        <h3 className="text-label-m text-fg">{translate('includes')}</h3>
        <PlanBenefitList benefits={benefits} label={translate('includes')} />
      </div>
    </Card>
  );
}
