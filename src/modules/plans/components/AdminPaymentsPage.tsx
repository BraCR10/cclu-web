'use client';

import { useState } from 'react';
import { Check, FileText, Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Alert } from '@/shared/components/Alert';
import { Avatar } from '@/shared/components/Avatar';
import { Button } from '@/shared/components/Button';
import { Pagination } from '@/shared/components/Pagination';
import { useDates } from '@/shared/hooks/useDates';
import { classNames } from '@/shared/utils/classNames';
import { formatColones } from '@/shared/utils/formatColones';
import type { AdminPayment, PaymentStatus } from '../api/payments';
import { useAdminPayments } from '../hooks/useAdminPayments';
import { PaymentReviewModal } from './PaymentReviewModal';
import { PlanBadge } from './PlanBadge';

const TABS: PaymentStatus[] = ['pending_review', 'approved', 'rejected'];
const DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;

// Whole days a payment has waited, so the oldest one is visibly the one to
// review first.
function daysWaiting(submittedAt: string) {
  return Math.max(
    0,
    Math.floor((Date.now() - new Date(submittedAt).getTime()) / DAY_IN_MILLISECONDS),
  );
}

// A-04: payments by state, the pending ones oldest first, each opened in the
// review.
export function AdminPaymentsPage() {
  const translate = useTranslations('admin.payments');
  const translateErrors = useTranslations('errors');
  const dates = useDates();
  const payments = useAdminPayments();
  const [reviewing, setReviewing] = useState<string | null>(null);
  const { list, query } = payments;
  const isPendingTab = query.status === 'pending_review';

  const whenOf = (payment: AdminPayment) =>
    isPendingTab
      ? translate('waiting', { days: daysWaiting(payment.submittedAt) })
      : dates.instant(payment.decidedAt ?? payment.submittedAt, 'short');

  return (
    <div className="flex flex-col gap-6 px-4 py-6 lg:gap-8 lg:px-8 lg:py-8">
      <div
        role="group"
        aria-label={translate('tabsLabel')}
        className="-mx-4 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:px-0"
      >
        {TABS.map((status) => {
          const selected = query.status === status;

          return (
            <button
              key={status}
              type="button"
              aria-pressed={selected}
              onClick={() => payments.showStatus(status)}
              className={classNames(
                'inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full border px-4 text-label-m focus-visible:shadow-focus focus-visible:outline-none lg:min-h-9',
                selected
                  ? 'border-primary bg-brand-union-soft text-fg-brand'
                  : 'border-line bg-surface text-fg hover:bg-surface-hover',
              )}
            >
              {selected && <Check aria-hidden className="size-4" />}
              {translate(`tabs.${status}`, { count: list?.counts[status] ?? 0 })}
            </button>
          );
        })}
      </div>

      {isPendingTab && (
        <Alert
          tone="info"
          title={translate('referenceNote.title')}
          message={translate('referenceNote.message')}
        />
      )}

      <label className="relative">
        <span className="sr-only">{translate('searchLabel')}</span>
        <Search
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-fg-muted"
        />
        <input
          type="search"
          value={payments.searchDraft}
          maxLength={100}
          placeholder={translate('searchPlaceholder')}
          onChange={(event) => payments.search(event.target.value)}
          className="min-h-11 w-full rounded-sm border border-line bg-surface pr-3 pl-9 text-body-m text-fg placeholder:text-fg-muted focus-visible:border-primary focus-visible:shadow-focus focus-visible:outline-none lg:min-h-10"
        />
      </label>

      {payments.failed && <Alert tone="danger" title={translateErrors('network_error')} />}

      {list === null && payments.loading && (
        <div aria-hidden className="h-80 animate-pulse rounded-lg bg-surface-hover" />
      )}

      {list !== null && list.total === 0 && (
        <p className="rounded-lg border border-line-subtle bg-surface p-6 text-body-m text-fg-secondary">
          {translate(`empty.${query.status}`)}
        </p>
      )}

      {list !== null && list.total > 0 && (
        <div aria-busy={payments.loading} className="flex flex-col gap-4">
          <ul
            aria-label={translate('title')}
            className="divide-y divide-line-subtle overflow-hidden rounded-lg border border-line-subtle bg-surface shadow-raised lg:hidden"
          >
            {list.items.map((payment) => (
              <li key={payment.id} className="flex items-center gap-3 p-4">
                <Avatar name={payment.member.businessName} size="m" />
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <p className="truncate text-label-m text-fg">{payment.member.businessName}</p>
                  <p className="text-body-s text-fg-muted">
                    {translate('cardLine', {
                      code: payment.member.memberCode,
                      amount: formatColones(payment.amount),
                      when: whenOf(payment),
                    })}
                  </p>
                  <PlanBadge planKey={payment.plan.key} name={payment.plan.name} />
                </div>
                <Button variant="secondary" size="s" onClick={() => setReviewing(payment.id)}>
                  {translate(isPendingTab ? 'reviewAction' : 'view')}
                </Button>
              </li>
            ))}
          </ul>

          <div className="hidden overflow-hidden rounded-lg border border-line-subtle bg-surface shadow-raised lg:block">
            <table className="w-full border-collapse text-left">
              <caption className="sr-only">{translate('title')}</caption>
              <thead className="bg-surface-subtle">
                <tr>
                  {(
                    [
                      'member',
                      'plan',
                      'amount',
                      isPendingTab ? 'waiting' : 'decided',
                      'receipt',
                    ] as const
                  ).map((column) => (
                    <th
                      key={column}
                      scope="col"
                      className={classNames(
                        'px-4 py-3 text-label-s text-fg-secondary',
                        column === 'amount' && 'text-right',
                      )}
                    >
                      {translate(`columns.${column}`)}
                    </th>
                  ))}
                  <th scope="col" className="px-4 py-3">
                    <span className="sr-only">{translate('columns.actions')}</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {list.items.map((payment) => (
                  <tr key={payment.id} className="border-t border-line-subtle">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={payment.member.businessName} size="s" />
                        <div className="min-w-0">
                          <p className="truncate text-body-m text-fg">
                            {payment.member.businessName}
                          </p>
                          <p className="text-body-s text-fg-muted">{payment.member.memberCode}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <PlanBadge planKey={payment.plan.key} name={payment.plan.name} />
                    </td>
                    <td className="px-4 py-3 text-right text-body-m text-fg">
                      {formatColones(payment.amount)}
                    </td>
                    <td className="px-4 py-3 text-body-m text-fg">{whenOf(payment)}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-2 text-body-s text-fg-muted">
                        <FileText aria-hidden className="size-4" />
                        {translate(
                          payment.receipt.contentType === 'application/pdf' ? 'pdf' : 'image',
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="secondary" size="s" onClick={() => setReviewing(payment.id)}>
                        {translate(isPendingTab ? 'reviewAction' : 'view')}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            page={list.page}
            pageCount={list.pageCount}
            onPageChange={payments.showPage}
            summary={translate('summary', { total: list.total })}
          />
        </div>
      )}

      <PaymentReviewModal
        paymentId={reviewing}
        onClose={() => setReviewing(null)}
        onDecided={payments.reload}
      />
    </div>
  );
}
