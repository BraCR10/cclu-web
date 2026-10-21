'use client';

import { useFormatter, useNow, useTranslations } from 'next-intl';
import { Alert } from '@/shared/components/Alert';
import { useCurrentViewer } from '@/shared/hooks/useCurrentViewer';
import { greetingFor } from '../greeting';
import { useAdminSummary } from '../hooks/useAdminSummary';
import { ExpiringSoon } from './ExpiringSoon';
import { MembershipsByPlan } from './MembershipsByPlan';
import { PendingToday } from './PendingToday';
import { RecentActivity } from './RecentActivity';
import { SummaryKpis } from './SummaryKpis';

// A-01: the panel opens on the day's figures and what is waiting.
export function AdminSummaryPage() {
  const translate = useTranslations('admin.summary');
  const translateErrors = useTranslations('errors');
  const format = useFormatter();
  const now = useNow({ updateInterval: 60_000 });
  const viewer = useCurrentViewer();
  const state = useAdminSummary();
  const firstName = viewer?.name.split(' ')[0];

  return (
    <div className="flex flex-col gap-6 px-4 py-6 lg:px-8 lg:py-8">
      <header className="flex flex-col gap-1 lg:flex-row lg:items-baseline lg:justify-between">
        <h2 className="font-display text-heading-xl text-fg">
          {translate(`greeting.${greetingFor(now.getHours())}`, { name: firstName ?? '' })}
        </h2>
        <p className="text-body-l text-fg-secondary first-letter:uppercase">
          {format.dateTime(now, {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </p>
      </header>

      {state.status === 'loading' && (
        <div aria-hidden className="h-96 animate-pulse rounded-lg bg-surface-hover" />
      )}
      {state.status === 'failed' && (
        <Alert tone="danger" title={translateErrors('network_error')} />
      )}

      {state.status === 'loaded' && (
        <>
          <SummaryKpis summary={state.summary} />
          <PendingToday summary={state.summary} />
          <div className="grid items-start gap-6 lg:grid-cols-2">
            <ExpiringSoon expiring={state.summary.expiring} />
            <MembershipsByPlan plans={state.summary.membershipsByPlan} />
          </div>
          <RecentActivity />
        </>
      )}
    </div>
  );
}
