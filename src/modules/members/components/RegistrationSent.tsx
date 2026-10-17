import Link from 'next/link';
import { CircleCheck } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Card } from '@/shared/components/Card';
import { DescriptionList } from '@/shared/components/DescriptionList';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { Timeline, type TimelineStep } from '@/shared/components/Timeline';
import type { SentRegistration } from '../hooks/useRegistrationWizard';

const REVIEW_DAYS = 5;

const MOMENT = new Intl.DateTimeFormat('es-CR', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
});

// The screen the applicant keeps. It says what was received, what happens next
// and when, and it repeats the address the chamber will write to, because that
// is the one thing they cannot check anywhere else yet.
export function RegistrationSent({ sent }: { sent: SentRegistration }) {
  const translate = useTranslations('registration.sent');

  const steps: TimelineStep[] = [
    {
      title: translate('steps.received.title'),
      detail: translate('steps.received.detail'),
      statusLabel: translate('steps.received.note'),
      state: 'done',
      moment: MOMENT.format(sent.sentAt),
    },
    {
      title: translate('steps.review.title'),
      detail: translate('steps.review.detail'),
      statusLabel: translate('steps.review.status'),
      state: 'current',
    },
    {
      title: translate('steps.approval.title'),
      detail: translate('steps.approval.detail'),
      statusLabel: translate('steps.approval.status'),
      state: 'pending',
    },
    {
      title: translate('steps.plan.title'),
      detail: translate('steps.plan.detail'),
      statusLabel: translate('steps.plan.status'),
      state: 'pending',
    },
  ];

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-start">
      <Card className="p-6 lg:p-8">
        <CircleCheck aria-hidden="true" className="h-10 w-10 text-success" />
        <h1 className="mt-4 text-heading-xl text-fg">{translate('title')}</h1>
        <p className="mt-2 text-body-l text-fg-secondary">
          {sent.name === ''
            ? translate('thanksWithoutName', {
                businessName: sent.businessName,
                email: sent.email,
                days: REVIEW_DAYS,
              })
            : translate('thanks', {
                name: sent.name,
                businessName: sent.businessName,
                email: sent.email,
                days: REVIEW_DAYS,
              })}
        </p>

        <div className="mt-6 border-y border-line-subtle py-4">
          <DescriptionList
            items={[
              {
                term: translate('state'),
                detail: <StatusBadge tone="info" label={translate('stateValue')} />,
              },
              { term: translate('business'), detail: sent.businessName },
              { term: translate('sentAt'), detail: MOMENT.format(sent.sentAt) },
            ]}
          />
        </div>

        <h2 className="mt-6 text-heading-s text-fg">{translate('next')}</h2>
        <div className="mt-4">
          <Timeline steps={steps} />
        </div>

        <div className="mt-2 flex flex-col gap-3 md:flex-row md:items-center">
          <Link
            href="/"
            className="flex min-h-11 items-center justify-center rounded-sm bg-primary px-6 text-label-m text-on-primary"
          >
            {translate('goHome')}
          </Link>
          <Link
            href="/plans"
            className="flex min-h-11 items-center justify-center rounded-sm border border-secondary-border px-6 text-label-m text-fg"
          >
            {translate('viewPlans')}
          </Link>
          <Link href="/login" className="text-label-m text-fg-link">
            {translate('signIn')}
          </Link>
        </div>
      </Card>

      <Card as="aside" className="p-6">
        <h2 className="text-heading-s text-fg">{translate('wrong.title')}</h2>
        <p className="mt-2 text-body-m text-fg-secondary">{translate('wrong.message')}</p>
        <Link
          href="https://wa.me/50661282812"
          className="mt-4 flex min-h-11 items-center justify-center rounded-sm border border-secondary-border px-4 text-label-m text-fg"
        >
          {translate('wrong.action')}
        </Link>
      </Card>
    </div>
  );
}
