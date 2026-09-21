'use client';

import { useEffect, useState } from 'react';
import { ToastStack } from '@/shared/components/ToastStack';
import { useToasts } from '@/shared/components/useToasts';
import {
  fetchOwnMembership,
  fetchOwnPayments,
  MEMBERSHIP_TYPES,
  type Membership,
  type Payment,
  type PaymentStatus,
} from '../api/membership';
import { PaymentForm } from './PaymentForm';

const dateFormatter = new Intl.DateTimeFormat('es-CR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

const amountFormatter = new Intl.NumberFormat('es-CR', {
  style: 'currency',
  currency: 'CRC',
  maximumFractionDigits: 0,
});

const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pending_review: 'Pendiente de revisión',
  approved: 'Aprobado',
  rejected: 'Rechazado',
};

const PAYMENT_STATUS_TONE: Record<PaymentStatus, string> = {
  pending_review: 'border border-border text-content-muted',
  approved: 'bg-support text-on-support',
  rejected: 'bg-highlight text-on-highlight',
};

type MembershipPanelProps = {
  loadMembership?: () => Promise<Membership>;
  loadPayments?: () => Promise<Payment[]>;
  registerPayment?: Parameters<typeof PaymentForm>[0]['register'];
};

function LockIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      aria-hidden
      className="size-4 shrink-0"
    >
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

export function MembershipPanel({
  loadMembership = fetchOwnMembership,
  loadPayments = fetchOwnPayments,
  registerPayment,
}: MembershipPanelProps) {
  const [membership, setMembership] = useState<Membership | null>(null);
  const [payments, setPayments] = useState<Payment[] | null>(null);
  const [failed, setFailed] = useState(false);
  const { toasts, show, dismiss } = useToasts();

  useEffect(() => {
    let stillMounted = true;

    Promise.all([loadMembership(), loadPayments()])
      .then(([foundMembership, foundPayments]) => {
        if (stillMounted) {
          setMembership(foundMembership);
          setPayments(foundPayments);
        }
      })
      .catch(() => {
        if (stillMounted) {
          setFailed(true);
        }
      });

    return () => {
      stillMounted = false;
    };
  }, [loadMembership, loadPayments]);

  function handleRegistered(payment: Payment) {
    setPayments((current) => (current === null ? [payment] : [payment, ...current]));
    show({
      tone: 'success',
      title: 'Su pago quedó registrado',
      detail: 'La Cámara lo revisará y le avisará por correo.',
    });
  }

  if (failed) {
    return (
      <p role="alert" className="rounded-panel border border-border bg-surface-raised p-6 text-sm">
        No fue posible cargar su membresía. Recargue la página para intentarlo de nuevo.
      </p>
    );
  }

  if (membership === null || payments === null) {
    return <p className="text-sm text-content-muted">Cargando su membresía…</p>;
  }

  const isPaid = membership.type === MEMBERSHIP_TYPES.PAID;

  return (
    <div className="flex flex-col gap-8">
      <ToastStack toasts={toasts} onDismiss={dismiss} />

      <section className="flex flex-col gap-4 rounded-panel border border-border bg-surface-raised p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold tracking-tight">Su membresía</h2>
            <p className="text-sm text-content-muted">
              {isPaid && membership.paidUntil !== null
                ? `Membresía paga al día, vigente hasta el ${dateFormatter.format(new Date(membership.paidUntil))}.`
                : 'Membresía gratuita. Registre su pago para acceder a los beneficios de la membresía paga.'}
            </p>
          </div>

          <span
            className={`rounded-pill px-3 py-1 text-xs font-medium ${
              isPaid ? 'bg-support text-on-support' : 'border border-border text-content-muted'
            }`}
          >
            {isPaid ? 'Membresía paga' : 'Membresía gratuita'}
          </span>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-medium">Beneficios de su membresía</h3>
            <ul className="flex flex-col gap-1.5 text-sm text-content-muted">
              {membership.benefits.free.map((benefit) => (
                <li key={benefit} className="flex items-start gap-2">
                  <span aria-hidden className="mt-0.5 text-brand">
                    ✓
                  </span>
                  {benefit}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-medium">
              {isPaid ? 'Beneficios adicionales incluidos' : 'Con la membresía paga'}
            </h3>
            <ul className="flex flex-col gap-1.5 text-sm text-content-muted">
              {membership.benefits.paid.map((benefit) => (
                <li key={benefit} className="flex items-start gap-2">
                  {isPaid ? (
                    <span aria-hidden className="mt-0.5 text-brand">
                      ✓
                    </span>
                  ) : (
                    <span className="mt-0.5" title="Requiere membresía paga">
                      <LockIcon />
                    </span>
                  )}
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <PaymentForm
        feeAmount={membership.feeAmount}
        onRegistered={handleRegistered}
        {...(registerPayment === undefined ? {} : { register: registerPayment })}
      />

      <section className="flex flex-col gap-4 rounded-panel border border-border bg-surface-raised p-6">
        <h3 className="font-semibold tracking-tight">Historial de pagos</h3>

        {payments.length === 0 ? (
          <p className="text-sm text-content-muted">Todavía no ha registrado ningún pago.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {payments.map((payment) => (
              <li
                key={payment.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-control border border-border p-4"
              >
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium">
                    {amountFormatter.format(payment.amount)} ·{' '}
                    {dateFormatter.format(new Date(payment.paidAt))}
                  </span>
                  {payment.detail !== null && payment.detail !== '' && (
                    <span className="text-xs text-content-muted">{payment.detail}</span>
                  )}
                  {payment.status === 'rejected' &&
                    payment.statusReason !== null &&
                    payment.statusReason !== '' && (
                      <span className="text-xs text-danger">Motivo: {payment.statusReason}</span>
                    )}
                </div>

                <div className="flex items-center gap-3">
                  {payment.receiptUrl !== null && (
                    <a
                      href={payment.receiptUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-medium text-brand"
                    >
                      Ver comprobante
                    </a>
                  )}
                  <span
                    className={`rounded-pill px-3 py-1 text-xs font-medium ${PAYMENT_STATUS_TONE[payment.status]}`}
                  >
                    {PAYMENT_STATUS_LABELS[payment.status]}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
