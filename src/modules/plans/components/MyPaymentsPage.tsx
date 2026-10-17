'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Check, CreditCard, Eye, Upload } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Alert } from '@/shared/components/Alert';
import { Pagination } from '@/shared/components/Pagination';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { useDates } from '@/shared/hooks/useDates';
import { classNames } from '@/shared/utils/classNames';
import { formatColones } from '@/shared/utils/formatColones';
import type { Payment, PaymentStatus } from '../api/payments';
import { useOwnPayments } from '../hooks/useOwnPayments';
import { paymentHref } from '../paymentHref';
import { PAYMENT_STATUS_TONES } from '../paymentStatus';
import { PaymentReceiptModal } from './PaymentReceiptModal';

const FILTERS: (PaymentStatus | null)[] = [null, 'approved', 'pending_review', 'rejected'];

const LINK_BUTTON =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-sm px-4 text-label-m focus-visible:shadow-focus focus-visible:outline-none lg:min-h-10';

function useDetail() {
  const translate = useTranslations('member.payments');
  const dates = useDates();

  return (payment: Payment) => {
    if (payment.status === 'approved' && payment.decidedAt !== null) {
      return translate('approvedBy', {
        name: payment.decidedBy ?? '',
        date: dates.instant(payment.decidedAt),
      });
    }

    if (payment.status === 'rejected') {
      return translate('rejectedBecause', { reason: payment.rejectionReason ?? '' });
    }

    return translate('inReview');
  };
}

// M-06: every payment the member handed in, with its state and its receipt.
export function MyPaymentsPage() {
  const translate = useTranslations('member.payments');
  const translateErrors = useTranslations('errors');
  const dates = useDates();
  const payments = useOwnPayments();
  const detailOf = useDetail();
  const [opened, setOpened] = useState<Payment | null>(null);
  const { list } = payments;

  return (
    <div className="flex flex-col gap-6 px-4 py-6 lg:gap-8 lg:px-8 lg:py-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div
          role="group"
          aria-label={translate('filterLabel')}
          className="-mx-4 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:px-0"
        >
          {FILTERS.map((status) => {
            const selected = payments.query.status === status;

            return (
              <button
                key={status ?? 'all'}
                type="button"
                aria-pressed={selected}
                onClick={() => payments.filter(status)}
                className={classNames(
                  'inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full border px-4 text-label-m focus-visible:shadow-focus focus-visible:outline-none lg:min-h-9',
                  selected
                    ? 'border-primary bg-brand-union-soft text-fg-brand'
                    : 'border-line bg-surface text-fg hover:bg-surface-hover',
                )}
              >
                {selected && <Check aria-hidden className="size-4" />}
                {translate(`filters.${status ?? 'all'}`)}
              </button>
            );
          })}
        </div>
        <Link
          href="/member/payments/new"
          className={`${LINK_BUTTON} bg-primary text-on-primary hover:bg-primary-hover`}
        >
          <CreditCard aria-hidden className="size-4" />
          {translate('register')}
        </Link>
      </div>

      {payments.failed && <Alert tone="danger" title={translateErrors('network_error')} />}

      {list === null && payments.loading && (
        <div aria-hidden className="h-80 animate-pulse rounded-lg bg-surface-hover" />
      )}

      {list !== null && list.total === 0 && (
        <p className="rounded-lg border border-line-subtle bg-surface p-6 text-body-m text-fg-secondary">
          {translate('empty')}
        </p>
      )}

      {list !== null && list.total > 0 && (
        <div aria-busy={payments.loading} className="flex flex-col gap-4">
          <ul aria-label={translate('title')} className="flex flex-col gap-3 lg:hidden">
            {list.items.map((payment) => (
              <li
                key={payment.id}
                className="flex flex-col gap-2 rounded-lg border border-line-subtle bg-surface p-4 shadow-raised"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-label-m text-fg">{payment.plan.name}</p>
                  <StatusBadge
                    tone={PAYMENT_STATUS_TONES[payment.status]}
                    label={translate(`status.${payment.status}`)}
                  />
                </div>
                <p className="text-body-s text-fg-muted">
                  {translate('cardLine', {
                    date: dates.instant(payment.submittedAt, 'short'),
                    amount: formatColones(payment.amount),
                  })}
                </p>
                <p className="text-body-s text-fg-secondary">{detailOf(payment)}</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setOpened(payment)}
                    className={`${LINK_BUTTON} text-fg-link hover:bg-surface-hover`}
                  >
                    <Eye aria-hidden className="size-4" />
                    {translate('viewReceipt')}
                  </button>
                  {payment.status === 'rejected' && (
                    <Link
                      href={paymentHref(payment.plan.key, payment.id)}
                      className={`${LINK_BUTTON} border border-secondary-border bg-surface text-fg hover:bg-surface-hover`}
                    >
                      <Upload aria-hidden className="size-4" />
                      {translate('submitAgain')}
                    </Link>
                  )}
                </div>
              </li>
            ))}
          </ul>

          <div className="hidden overflow-hidden rounded-lg border border-line-subtle bg-surface shadow-raised lg:block">
            <table className="w-full border-collapse text-left">
              <caption className="sr-only">{translate('title')}</caption>
              <thead className="bg-surface-subtle">
                <tr>
                  {(
                    ['date', 'plan', 'frequency', 'amount', 'status', 'detail', 'receipt'] as const
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
                </tr>
              </thead>
              <tbody>
                {list.items.map((payment) => (
                  <tr key={payment.id} className="border-t border-line-subtle align-top">
                    <td className="px-4 py-4 text-body-m text-fg">
                      {dates.instant(payment.submittedAt, 'short')}
                    </td>
                    <td className="px-4 py-4 text-body-m text-fg">{payment.plan.name}</td>
                    <td className="px-4 py-4 text-body-m text-fg">
                      {translate(`frequencies.${payment.frequency}`)}
                    </td>
                    <td className="px-4 py-4 text-right text-body-m text-fg">
                      {formatColones(payment.amount)}
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge
                        tone={PAYMENT_STATUS_TONES[payment.status]}
                        label={translate(`status.${payment.status}`)}
                      />
                    </td>
                    <td className="max-w-xs px-4 py-4 text-body-s text-fg-secondary">
                      <p>{detailOf(payment)}</p>
                      {payment.status === 'rejected' && (
                        <Link
                          href={paymentHref(payment.plan.key, payment.id)}
                          className={`${LINK_BUTTON} mt-2 border border-secondary-border bg-surface text-fg hover:bg-surface-hover`}
                        >
                          <Upload aria-hidden className="size-4" />
                          {translate('submitAgain')}
                        </Link>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <button
                        type="button"
                        onClick={() => setOpened(payment)}
                        className={`${LINK_BUTTON} text-fg-link hover:bg-surface-hover`}
                      >
                        <Eye aria-hidden className="size-4" />
                        {translate('viewReceipt')}
                      </button>
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

      <PaymentReceiptModal payment={opened} onClose={() => setOpened(null)} />
    </div>
  );
}
