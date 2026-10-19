'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Package } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Alert } from '@/shared/components/Alert';
import { Button } from '@/shared/components/Button';
import { Card } from '@/shared/components/Card';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { useDates } from '@/shared/hooks/useDates';
import type { Payment } from '../api/payments';
import { useHomeSummary } from '../hooks/useHomeSummary';
import { useMembership } from '../hooks/useMembership';
import { paymentHref } from '../paymentHref';
import { PaymentReceiptModal } from './PaymentReceiptModal';

export function MemberHome() {
  const translate = useTranslations('member.home');
  const dates = useDates();
  const state = useMembership();
  const summary = useHomeSummary();
  const [openedPayment, setOpenedPayment] = useState<Payment | null>(null);

  if (state.status === 'loading' || summary.status === 'loading') {
    return (
      <div aria-hidden className="grid gap-6 px-4 py-6 lg:grid-cols-3 lg:px-8 lg:py-8">
        <div className="h-44 animate-pulse rounded-lg bg-surface-hover lg:col-span-2" />
        <div className="h-44 animate-pulse rounded-lg bg-surface-hover" />
      </div>
    );
  }

  if (state.status === 'failed') {
    return (
      <div className="px-4 py-6 lg:px-8 lg:py-8">
        <Alert tone="danger" title={translate('failed')} />
      </div>
    );
  }

  const { membership } = state;
  const paid = membership.plan.key !== 'free';
  const rejected = summary.status === 'loaded' ? summary.rejected : null;
  const inReview = summary.status === 'loaded' ? summary.inReview : 0;

  return (
    <div className="flex flex-col gap-6 px-4 py-6 lg:gap-8 lg:px-8 lg:py-8">
      <div className="grid gap-6 lg:grid-cols-3 lg:items-start">
        <Card
          as="section"
          aria-labelledby="home-plan"
          className="flex flex-col gap-3 lg:col-span-2"
        >
          <p className="text-caption text-fg-muted">{translate('planCaption')}</p>

          <div className="flex flex-wrap items-center gap-2">
            <h2 id="home-plan" className="font-display text-heading-l text-fg">
              {membership.plan.name}
            </h2>
            <StatusBadge
              tone={membership.lapsed === null ? 'success' : 'warning'}
              label={translate(membership.lapsed === null ? 'active' : 'lapsed')}
            />
          </div>

          <p className="text-body-m text-fg-secondary">
            {membership.expiresAt === null
              ? translate('noExpiry')
              : translate('validUntil', { date: dates.termEnd(membership.expiresAt) })}
          </p>

          {membership.lapsed !== null && (
            <Alert
              tone="warning"
              title={translate('lapsedTitle', { plan: membership.lapsed.plan.name })}
              message={translate('lapsedMessage')}
            />
          )}

          <div className="mt-1 flex flex-wrap gap-3">
            <Link
              href="/member/membership"
              className="inline-flex min-h-11 items-center justify-center rounded-sm bg-primary px-4 text-label-m text-on-primary lg:min-h-10"
            >
              {translate(paid ? 'renew' : 'upgrade')}
            </Link>
            <Link
              href="/member/membership"
              className="inline-flex min-h-11 items-center justify-center rounded-sm border border-secondary-border px-4 text-label-m text-fg lg:min-h-10"
            >
              {translate('viewMembership')}
            </Link>
          </div>
        </Card>

        {/* What the member has to do something about, and nothing else. */}
        <Card as="section" aria-labelledby="home-pending" className="flex flex-col gap-3">
          <h2 id="home-pending" className="font-display text-heading-m text-fg">
            {translate('pendingTitle')}
          </h2>

          {rejected === null && inReview === 0 && (
            <p className="text-body-m text-fg-secondary">{translate('nothingPending')}</p>
          )}

          {rejected !== null && (
            <>
              <Alert
                tone="warning"
                title={translate('rejectedTitle', { plan: rejected.plan.name })}
                message={
                  rejected.rejectionReason === null
                    ? translate('rejectedMessage')
                    : translate('rejectedBecause', { reason: rejected.rejectionReason })
                }
              />
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setOpenedPayment(rejected)}
                >
                  {translate('openPayment')}
                </Button>
                <Link
                  href={paymentHref(rejected.plan.key, rejected.id)}
                  className="inline-flex min-h-11 items-center justify-center rounded-sm px-4 text-label-m text-fg-brand lg:min-h-10"
                >
                  {translate('sendAgain')}
                </Link>
              </div>
            </>
          )}

          {inReview > 0 && (
            <p className="text-body-m text-fg-secondary">
              {inReview === 1
                ? translate('inReview')
                : translate('inReviewOther', { count: inReview })}
            </p>
          )}

          <Link
            href="/member/payments"
            className="mt-auto inline-flex min-h-11 items-center text-label-m text-fg-brand lg:min-h-10"
          >
            {translate('viewPayments')}
          </Link>
        </Card>
      </div>

      <Card as="section" aria-labelledby="home-publications" className="flex flex-col gap-4">
        <div>
          <h2 id="home-publications" className="font-display text-heading-m text-fg">
            {translate('publicationsTitle')}
          </h2>
          <p className="mt-1 text-body-s text-fg-muted">
            {translate(paid ? 'publicationsPaid' : 'publicationsFree')}
          </p>
        </div>

        {paid ? (
          // Two columns of what they publish. Empty until publishing exists,
          // and one message across the grid reads better than four empty slots.
          <ul className="grid grid-cols-2 gap-3">
            <li className="col-span-2 flex flex-col items-center justify-center gap-2 rounded-md border border-dashed border-line-subtle p-8 text-fg-muted">
              <Package aria-hidden className="size-5" />
              <span className="text-body-s">{translate('noPublications')}</span>
            </li>
          </ul>
        ) : (
          <Link
            href="/plans"
            className="inline-flex min-h-11 w-fit items-center justify-center rounded-sm bg-primary px-4 text-label-m text-on-primary lg:min-h-10"
          >
            {translate('seePlans')}
          </Link>
        )}
      </Card>

      <PaymentReceiptModal payment={openedPayment} onClose={() => setOpenedPayment(null)} />
    </div>
  );
}
