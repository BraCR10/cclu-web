'use client';

import { useState } from 'react';
import { FileText } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Alert } from '@/shared/components/Alert';
import { Button } from '@/shared/components/Button';
import { ChipGroup } from '@/shared/components/ChipGroup';
import { DataList, NameCell, type DataColumn } from '@/shared/components/DataList';
import { ListCard } from '@/shared/components/ListCard';
import { PagedList } from '@/shared/components/PagedList';
import { SearchField } from '@/shared/components/SearchField';
import { useDates } from '@/shared/hooks/useDates';
import { formatColones } from '@/shared/utils/formatColones';
import type { AdminPayment, PaymentStatus } from '../api/payments';
import { useAdminPayments } from '../hooks/useAdminPayments';
import { PaymentReviewModal } from './PaymentReviewModal';
import { PlanBadge } from '@/shared/components/PlanBadge';

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
  const dates = useDates();
  const payments = useAdminPayments();
  const [reviewing, setReviewing] = useState<string | null>(null);
  const { list, query } = payments;
  const isPendingTab = query.status === 'pending_review';

  const whenOf = (payment: AdminPayment) =>
    isPendingTab
      ? translate('waiting', { days: daysWaiting(payment.submittedAt) })
      : dates.instant(payment.decidedAt ?? payment.submittedAt, 'short');

  const reviewButton = (payment: AdminPayment) => (
    <Button variant="secondary" size="s" onClick={() => setReviewing(payment.id)}>
      {translate(isPendingTab ? 'reviewAction' : 'view')}
    </Button>
  );

  const columns: DataColumn<AdminPayment>[] = [
    {
      id: 'member',
      header: translate('columns.member'),
      cell: (payment) => (
        <NameCell name={payment.member.businessName} detail={payment.member.memberCode} />
      ),
    },
    {
      id: 'plan',
      header: translate('columns.plan'),
      cell: (payment) => <PlanBadge planKey={payment.plan.key} name={payment.plan.name} />,
    },
    {
      id: 'amount',
      header: translate('columns.amount'),
      align: 'end',
      cell: (payment) => formatColones(payment.amount),
    },
    {
      id: 'when',
      header: translate(isPendingTab ? 'columns.waiting' : 'columns.decided'),
      cell: whenOf,
    },
    {
      id: 'receipt',
      header: translate('columns.receipt'),
      cell: (payment) => (
        <span className="inline-flex items-center gap-2 text-body-s text-fg-muted">
          <FileText aria-hidden className="size-4" />
          {translate(payment.receipt.contentType === 'application/pdf' ? 'pdf' : 'image')}
        </span>
      ),
    },
    {
      id: 'actions',
      header: translate('columns.actions'),
      hideHeader: true,
      align: 'end',
      cell: reviewButton,
    },
  ];

  return (
    <div className="flex flex-col gap-6 px-4 py-6 lg:gap-8 lg:px-8 lg:py-8">
      <ChipGroup
        label={translate('tabsLabel')}
        chips={TABS.map((status) => ({
          value: status,
          label: translate(`tabs.${status}`, { count: list?.counts[status] ?? 0 }),
        }))}
        selected={query.status}
        onSelect={payments.showStatus}
      />

      {isPendingTab && (
        <Alert
          tone="info"
          title={translate('referenceNote.title')}
          message={translate('referenceNote.message')}
        />
      )}

      <SearchField
        label={translate('searchLabel')}
        placeholder={translate('searchPlaceholder')}
        value={payments.searchDraft}
        onChange={payments.search}
      />

      <PagedList
        list={list}
        loading={payments.loading}
        failed={payments.failed}
        emptyMessage={translate(`empty.${query.status}`)}
        summary={list === null ? undefined : translate('summary', { total: list.total })}
        onPageChange={payments.showPage}
      >
        <DataList
          label={translate('title')}
          items={list?.items ?? []}
          keyOf={(payment) => payment.id}
          columns={columns}
          card={(payment) => (
            <ListCard
              name={payment.member.businessName}
              line={translate('cardLine', {
                code: payment.member.memberCode,
                amount: formatColones(payment.amount),
                when: whenOf(payment),
              })}
              badges={<PlanBadge planKey={payment.plan.key} name={payment.plan.name} />}
              action={reviewButton(payment)}
            />
          )}
        />
      </PagedList>

      <PaymentReviewModal
        paymentId={reviewing}
        onClose={() => setReviewing(null)}
        onDecided={payments.reload}
      />
    </div>
  );
}
