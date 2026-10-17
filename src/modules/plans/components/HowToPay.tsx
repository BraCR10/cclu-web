'use client';

import { Building2, Info, Phone } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Card } from '@/shared/components/Card';
import { useToast } from '@/shared/components/useToast';
import { PAYMENT_METHODS } from '../paymentMethods';

type PaymentDetailProps = {
  label: string;
  value: string;
  prominent?: boolean;
  copyable?: boolean;
};

function PaymentDetail({ label, value, prominent = false, copyable = false }: PaymentDetailProps) {
  const translate = useTranslations('plans.howToPay');
  const { showToast } = useToast();

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      showToast({ tone: 'success', title: translate('copied', { label }) });
    } catch {
      showToast({ tone: 'error', title: translate('copyFailed') });
    }
  }

  return (
    <div className="flex items-end justify-between gap-3">
      <div className="min-w-0">
        <p className="text-caption text-fg-muted">{label}</p>
        <p className={prominent ? 'font-display text-heading-m text-fg' : 'text-label-m text-fg'}>
          {value}
        </p>
      </div>
      {copyable && (
        <button
          type="button"
          onClick={copy}
          aria-label={translate('copyNamed', { label })}
          className="inline-flex min-h-11 shrink-0 items-center rounded-sm px-2 text-label-m text-fg-link hover:bg-surface-hover focus-visible:shadow-focus focus-visible:outline-none lg:min-h-8"
        >
          {translate('copy')}
        </button>
      )}
    </div>
  );
}

const STEPS = ['choose', 'pay', 'upload'] as const;

export function HowToPay() {
  const translate = useTranslations('plans.howToPay');
  const { sinpe, transfer } = PAYMENT_METHODS;

  return (
    <Card as="section" aria-labelledby="how-to-pay" className="flex flex-col gap-6">
      <h2 id="how-to-pay" className="font-display text-heading-l text-fg">
        {translate('title')}
      </h2>

      <ol className="flex flex-col gap-3 lg:flex-row lg:gap-8">
        {STEPS.map((step, index) => (
          <li key={step} className="flex items-center gap-2 text-body-s text-fg">
            <span
              aria-hidden
              className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-label-s text-on-primary"
            >
              {index + 1}
            </span>
            {translate(`steps.${step}`)}
          </li>
        ))}
      </ol>

      <div className="grid gap-4 lg:grid-cols-2">
        <section
          aria-labelledby="pay-sinpe"
          className="flex flex-col gap-4 rounded-md bg-surface-subtle p-4"
        >
          <h3 id="pay-sinpe" className="flex items-center gap-2 text-heading-s text-fg">
            <Phone aria-hidden className="size-5 text-fg-brand" />
            {translate('sinpe.title')}
          </h3>
          <PaymentDetail
            label={translate('sinpe.number')}
            value={sinpe.number}
            prominent
            copyable
          />
          <PaymentDetail label={translate('sinpe.holder')} value={sinpe.holder} />
        </section>

        <section
          aria-labelledby="pay-transfer"
          className="flex flex-col gap-4 rounded-md bg-surface-subtle p-4"
        >
          <h3 id="pay-transfer" className="flex items-center gap-2 text-heading-s text-fg">
            <Building2 aria-hidden className="size-5 text-fg-brand" />
            {translate('transfer.title')}
          </h3>
          <PaymentDetail label={translate('transfer.bank')} value={transfer.bank} />
          <PaymentDetail label={translate('transfer.account')} value={transfer.account} copyable />
          <PaymentDetail label={translate('transfer.iban')} value={transfer.iban} copyable />
        </section>
      </div>

      <div className="flex gap-3 rounded-md bg-warning-soft p-4">
        <Info aria-hidden className="mt-0.5 size-4 shrink-0 text-fg" />
        <div>
          <p className="text-label-m text-fg">{translate('reference.title')}</p>
          <p className="text-body-s text-fg-secondary">{translate('reference.example')}</p>
        </div>
      </div>
    </Card>
  );
}
