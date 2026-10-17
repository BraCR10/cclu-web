import Link from 'next/link';
import { CircleCheck } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Card } from '@/shared/components/Card';
import { Timeline, type TimelineStep } from '@/shared/components/Timeline';
import { useDates } from '@/shared/hooks/useDates';
import { formatColones } from '@/shared/utils/formatColones';
import type { Payment } from '../api/payments';

// M-05d: what happens to the receipt from here, as it really does. The
// approval is pending until the chamber decides.
export function PaymentSent({ payment }: { payment: Payment }) {
  const translate = useTranslations('member.payments.sent');
  const dates = useDates();

  const steps: TimelineStep[] = [
    {
      title: translate('steps.received.title'),
      detail: translate('steps.received.detail', {
        amount: formatColones(payment.amount),
        reference: payment.reference,
      }),
      statusLabel: translate('statusLabels.done'),
      state: 'done',
      moment: dates.instant(payment.submittedAt, 'moment'),
    },
    {
      title: translate('steps.review.title'),
      detail: translate('steps.review.detail'),
      statusLabel: translate('statusLabels.current'),
      state: 'current',
    },
    {
      title: translate('steps.decision.title'),
      detail: translate('steps.decision.detail'),
      statusLabel: translate('statusLabels.pending'),
      state: 'pending',
    },
  ];

  return (
    <Card as="section" aria-labelledby="payment-sent" className="flex flex-col gap-6">
      <span className="flex size-14 items-center justify-center rounded-full bg-success-soft text-success">
        <CircleCheck aria-hidden className="size-7" />
      </span>
      <h2 id="payment-sent" className="font-display text-heading-l text-fg">
        {translate('title')}
      </h2>
      <Timeline steps={steps} />
      <Link
        href="/member/payments"
        className="inline-flex min-h-11 items-center justify-center self-start rounded-sm bg-primary px-4 text-label-m text-on-primary hover:bg-primary-hover focus-visible:shadow-focus focus-visible:outline-none lg:min-h-10"
      >
        {translate('toPayments')}
      </Link>
    </Card>
  );
}
