'use client';

import { TriangleAlert } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Alert } from '@/shared/components/Alert';
import { Button } from '@/shared/components/Button';
import { DescriptionList } from '@/shared/components/DescriptionList';
import { Modal } from '@/shared/components/Modal';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { Textarea } from '@/shared/components/Textarea';
import { useDates } from '@/shared/hooks/useDates';
import { formatColones } from '@/shared/utils/formatColones';
import { adminReceiptUrl } from '../api/payments';
import { usePaymentReview } from '../hooks/usePaymentReview';
import { PAYMENT_STATUS_TONES } from '../paymentStatus';
import { ReceiptViewer } from './ReceiptViewer';

type PaymentReviewModalProps = {
  paymentId: string | null;
  onClose: () => void;
  onDecided: () => void;
};

// A-05 and A-05b: the receipt beside what it should show, what came before it,
// and the decision. A payment already decided is shown without actions.
export function PaymentReviewModal({ paymentId, onClose, onDecided }: PaymentReviewModalProps) {
  const translate = useTranslations('admin.payments.review');
  const translateStatus = useTranslations('member.payments.status');
  const dates = useDates();
  const decision = usePaymentReview(paymentId, () => {
    onDecided();
    onClose();
  });
  const { review } = decision;

  if (paymentId === null || review === null) {
    return null;
  }

  const isPending = review.status === 'pending_review';
  const repeatedReceipt = review.sameReceipt.length > 0;

  const details = [
    { term: translate('business'), detail: review.member.businessName },
    { term: translate('code'), detail: review.member.memberCode },
    { term: translate('plan'), detail: review.plan.name },
    { term: translate('amount'), detail: formatColones(review.amount) },
    { term: translate('reference'), detail: review.reference },
    { term: translate('submitted'), detail: dates.instant(review.submittedAt, 'moment') },
    ...(review.comment === null ? [] : [{ term: translate('comment'), detail: review.comment }]),
    ...(review.rejectionReason === null
      ? []
      : [{ term: translate('reason'), detail: review.rejectionReason }]),
    ...(review.decidedBy === null || review.decidedAt === null
      ? []
      : [
          {
            term: translate('decidedBy'),
            detail: translate('decidedLine', {
              name: review.decidedBy,
              date: dates.instant(review.decidedAt),
            }),
          },
        ]),
  ];

  const footer = !isPending ? (
    <Button variant="secondary" onClick={onClose}>
      {translate('close')}
    </Button>
  ) : decision.rejecting ? (
    <div className="flex flex-col gap-3 lg:flex-row lg:justify-end">
      <Button variant="secondary" onClick={decision.stopRejecting} disabled={decision.deciding}>
        {translate('cancel')}
      </Button>
      <Button variant="danger" onClick={() => void decision.reject()} loading={decision.deciding}>
        {translate('reject')}
      </Button>
    </div>
  ) : (
    <div className="flex flex-col gap-3 lg:flex-row lg:justify-end">
      <Button variant="danger" onClick={decision.startRejecting} disabled={decision.deciding}>
        {translate('reject')}
      </Button>
      <Button variant="success" onClick={() => void decision.approve()} loading={decision.deciding}>
        {translate('approve')}
      </Button>
    </div>
  );

  return (
    <Modal open title={translate('title')} onClose={onClose} footer={footer}>
      <div className="grid gap-6 lg:grid-cols-2">
        <ReceiptViewer
          url={adminReceiptUrl(review.id)}
          contentType={review.receipt.contentType}
          title={translate('receipt')}
        />
        <div className="flex flex-col gap-4">
          <StatusBadge
            tone={PAYMENT_STATUS_TONES[review.status]}
            label={translateStatus(review.status)}
          />

          {repeatedReceipt && (
            <Alert
              tone="warning"
              title={translate('repeatedReceipt')}
              message={review.sameReceipt
                .map((other) =>
                  translate('repeatedLine', {
                    status: translateStatus(other.status),
                    date: dates.instant(other.submittedAt),
                  }),
                )
                .join(' ')}
            />
          )}

          <DescriptionList items={details} />

          {review.earlierAttempts.length > 0 && (
            <section
              aria-labelledby="earlier-attempts"
              className="flex flex-col gap-2 rounded-md border border-line-subtle p-3"
            >
              <h3 id="earlier-attempts" className="flex items-center gap-2 text-label-m text-fg">
                <TriangleAlert aria-hidden className="size-4 text-warning" />
                {translate('earlierAttempts')}
              </h3>
              <ul className="flex flex-col gap-2">
                {review.earlierAttempts.map((attempt) => (
                  <li key={attempt.id} className="text-body-s text-fg-secondary">
                    {translate('attemptLine', {
                      date: dates.instant(attempt.submittedAt),
                      reason: attempt.rejectionReason ?? '',
                    })}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {isPending && decision.rejecting && (
            <Textarea
              label={translate('reasonLabel')}
              help={translate('reasonHelp')}
              maxLength={decision.reasonMaximum}
              value={decision.reason}
              error={decision.reasonError}
              onChange={(event) => decision.changeReason(event.target.value)}
            />
          )}
        </div>
      </div>
    </Modal>
  );
}
