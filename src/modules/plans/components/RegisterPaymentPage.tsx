'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Alert } from '@/shared/components/Alert';
import { Button } from '@/shared/components/Button';
import { Card } from '@/shared/components/Card';
import { FileField } from '@/shared/components/FileField';
import { Select } from '@/shared/components/Select';
import { Textarea } from '@/shared/components/Textarea';
import { useDates } from '@/shared/hooks/useDates';
import { formatColones } from '@/shared/utils/formatColones';
import type { PaidPlanKey } from '../api/adminMemberships';
import { useRegisterPayment } from '../hooks/useRegisterPayment';
import { RECEIPT_ACCEPT } from '../paymentStatus';
import { HowToPay } from './HowToPay';
import { PaymentSent } from './PaymentSent';

const MAXIMUM_COMMENT_LENGTH = 300;

type RegisterPaymentPageProps = {
  requestedPlan?: string;
  resubmissionOf: string | null;
};

// M-05c. The form asks only for the plan and the receipt; what to pay and how
// is shown, not typed. Whether a payment can be made at all is the API's
// answer, read before the form is offered.
export function RegisterPaymentPage({ requestedPlan, resubmissionOf }: RegisterPaymentPageProps) {
  const translate = useTranslations('member.payments.form');
  const translateErrors = useTranslations('errors');
  const dates = useDates();
  const form = useRegisterPayment(requestedPlan, resubmissionOf);
  const { loaded } = form;

  if (form.sent !== null) {
    return (
      <div className="px-4 py-6 lg:px-8 lg:py-8">
        <PaymentSent payment={form.sent} />
      </div>
    );
  }

  const plans = loaded?.plans.filter((plan) => plan.key !== 'free') ?? [];
  const chosen = plans.find((plan) => plan.key === form.plan);
  const isRunning =
    loaded !== null &&
    loaded.membership.plan.key !== 'free' &&
    loaded.membership.expiresAt !== null;

  return (
    <div className="flex flex-col gap-6 px-4 py-6 lg:px-8 lg:py-8">
      {form.failed && <Alert tone="danger" title={translateErrors('network_error')} />}

      {loaded !== null && loaded.eligibility.reason === 'payment_pending' && (
        <Alert
          tone="info"
          title={translate('pending.title')}
          message={
            <span>
              {translate('pending.message')}{' '}
              <Link href="/member/payments" className="text-fg-link underline">
                {translate('pending.link')}
              </Link>
            </span>
          }
        />
      )}

      {loaded !== null && loaded.eligibility.reason === 'renewal_not_open' && (
        <Alert
          tone="info"
          title={translate('notOpen.title')}
          message={
            <span>
              {translate('notOpen.message', {
                date:
                  loaded.eligibility.opensOn === null
                    ? ''
                    : dates.calendarDay(loaded.eligibility.opensOn),
              })}{' '}
              <Link href="/member/membership" className="text-fg-link underline">
                {translate('notOpen.link')}
              </Link>
            </span>
          }
        />
      )}

      {loaded !== null && loaded.eligibility.canSubmit && (
        <div className="grid gap-6 lg:grid-cols-3">
          <form
            className="flex flex-col gap-6 lg:col-span-2"
            onSubmit={(event) => {
              event.preventDefault();
              void form.submit();
            }}
          >
            {resubmissionOf !== null && (
              <Alert
                tone="warning"
                title={translate('resubmitting')}
                message={translate('resubmittingMessage')}
              />
            )}

            <Card as="section" aria-labelledby="payment-plan" className="flex flex-col gap-4">
              <h2 id="payment-plan" className="font-display text-heading-m text-fg">
                {translate('steps.plan')}
              </h2>
              <Select
                label={translate('plan')}
                value={form.plan}
                error={form.errorFor('plan')}
                onChange={(event) => form.choosePlan(event.target.value as PaidPlanKey)}
                options={plans.map((plan) => ({
                  value: plan.key,
                  label: translate('planOption', {
                    name: plan.name,
                    fee: formatColones(plan.monthlyFee),
                  }),
                }))}
              />
              <div className="flex flex-col gap-2 rounded-md bg-surface-subtle p-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-caption text-fg-muted">{translate('total')}</p>
                  <p className="font-display text-metric-l text-fg">
                    {formatColones(chosen?.monthlyFee ?? 0)}
                  </p>
                  <p className="text-body-s text-fg-secondary">{translate('frequency')}</p>
                </div>
                <p className="max-w-sm text-body-s text-fg-secondary">
                  {isRunning ? translate('termRunning') : translate('termNew')}
                </p>
              </div>
            </Card>

            <HowToPay reference={loaded.eligibility.reference} />

            <Card as="section" aria-labelledby="payment-receipt" className="flex flex-col gap-4">
              <h2 id="payment-receipt" className="font-display text-heading-m text-fg">
                {translate('steps.receipt')}
              </h2>
              <FileField
                label={translate('receiptLabel')}
                hint={translate('receiptHint')}
                acceptedFormats={translate('receiptFormats')}
                accept={RECEIPT_ACCEPT}
                status={form.receipt === null ? 'empty' : 'stored'}
                file={
                  form.receipt === null
                    ? undefined
                    : { name: form.receipt.name, sizeInBytes: form.receipt.size }
                }
                error={form.errorFor('receipt')}
                onSelect={form.chooseReceipt}
                onRemove={form.removeReceipt}
              />
              {resubmissionOf !== null && (
                <Textarea
                  label={translate('comment')}
                  help={translate('commentHelp')}
                  maxLength={MAXIMUM_COMMENT_LENGTH}
                  value={form.comment}
                  error={form.errorFor('comment')}
                  onChange={(event) => form.changeComment(event.target.value)}
                />
              )}
              <div className="flex flex-col gap-3 lg:flex-row lg:justify-end">
                <Link
                  href="/member/membership"
                  className="inline-flex min-h-11 items-center justify-center rounded-sm border border-secondary-border bg-surface px-4 text-label-m text-fg hover:bg-surface-hover focus-visible:shadow-focus focus-visible:outline-none lg:min-h-10"
                >
                  {translate('cancel')}
                </Link>
                <Button type="submit" loading={form.submitting}>
                  {translate('submit')}
                </Button>
              </div>
            </Card>
          </form>

          <Card as="aside" aria-labelledby="payment-summary" className="flex h-fit flex-col gap-3">
            <h2 id="payment-summary" className="text-heading-s text-fg">
              {translate('summaryTitle')}
            </h2>
            <p className="text-body-s text-fg-muted">{loaded.eligibility.reference}</p>
            <p className="text-label-m text-fg">{chosen?.name}</p>
            <p className="font-display text-heading-l text-fg">
              {formatColones(chosen?.monthlyFee ?? 0)}
            </p>
            <p className="text-body-s text-fg-secondary">{translate('reviewNote')}</p>
          </Card>
        </div>
      )}
    </div>
  );
}
