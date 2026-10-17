'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Button } from '@/shared/components/Button';
import { DescriptionList } from '@/shared/components/DescriptionList';
import { Modal } from '@/shared/components/Modal';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { useDates } from '@/shared/hooks/useDates';
import { formatColones } from '@/shared/utils/formatColones';
import { ownReceiptUrl, type Payment } from '../api/payments';
import { paymentHref } from '../paymentHref';
import { PAYMENT_STATUS_TONES } from '../paymentStatus';
import { ReceiptViewer } from './ReceiptViewer';

type PaymentReceiptModalProps = {
  payment: Payment | null;
  onClose: () => void;
};

// M-06b and M-06c: the receipt beside what was paid and how it was decided.
// A rejected payment offers to be sent again with the same plan.
export function PaymentReceiptModal({ payment, onClose }: PaymentReceiptModalProps) {
  const translate = useTranslations('member.payments');
  const dates = useDates();

  if (payment === null) {
    return null;
  }

  const details = [
    { term: translate('columns.plan'), detail: payment.plan.name },
    { term: translate('columns.frequency'), detail: translate(`frequencies.${payment.frequency}`) },
    { term: translate('columns.amount'), detail: formatColones(payment.amount) },
    { term: translate('reference'), detail: payment.reference },
    { term: translate('columns.date'), detail: dates.instant(payment.submittedAt, 'moment') },
    ...(payment.term === null
      ? []
      : [{ term: translate('validUntil'), detail: dates.termEnd(payment.term.expiresAt) }]),
    ...(payment.rejectionReason === null
      ? []
      : [{ term: translate('reason'), detail: payment.rejectionReason }]),
  ];

  return (
    <Modal
      open
      title={translate('receipt.title')}
      onClose={onClose}
      footer={
        <div className="flex flex-col gap-3 lg:flex-row lg:justify-end">
          <Button variant="secondary" onClick={onClose}>
            {translate('receipt.close')}
          </Button>
          {payment.status === 'rejected' && (
            <Link
              href={paymentHref(payment.plan.key, payment.id)}
              className="inline-flex min-h-11 items-center justify-center rounded-sm bg-primary px-4 text-label-m text-on-primary hover:bg-primary-hover focus-visible:shadow-focus focus-visible:outline-none lg:min-h-10"
            >
              {translate('submitAgain')}
            </Link>
          )}
        </div>
      }
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <ReceiptViewer
          url={ownReceiptUrl(payment.id)}
          contentType={payment.receipt.contentType}
          title={translate('receipt.title')}
        />
        <div className="flex flex-col gap-4">
          <StatusBadge
            tone={PAYMENT_STATUS_TONES[payment.status]}
            label={translate(`status.${payment.status}`)}
          />
          <DescriptionList items={details} />
        </div>
      </div>
    </Modal>
  );
}
