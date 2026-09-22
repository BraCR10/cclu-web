'use client';

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { CONTROL_CLASS, Field } from '@/shared/components/Field';
import { ToastStack } from '@/shared/components/ToastStack';
import { useToasts } from '@/shared/components/useToasts';
import { MESSAGES, messageForError, leftListStale } from '@/shared/config/messages';
import { formatMemberCode } from '@/shared/format';
import {
  fetchPendingPayments,
  approvePayment as approvePaymentApi,
  rejectPayment as rejectPaymentApi,
  type PendingPayment,
} from '../api/payments';

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

type PendingPaymentsPanelProps = {
  loadPayments?: () => Promise<PendingPayment[]>;
  approve?: (id: string) => Promise<unknown>;
  reject?: (id: string, reason: string) => Promise<unknown>;
};

export function PendingPaymentsPanel({
  loadPayments = fetchPendingPayments,
  approve = approvePaymentApi,
  reject = rejectPaymentApi,
}: PendingPaymentsPanelProps) {
  const [payments, setPayments] = useState<PendingPayment[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [rejecting, setRejecting] = useState<PendingPayment | null>(null);
  const [reason, setReason] = useState('');
  const [reasonError, setReasonError] = useState<string | undefined>(undefined);
  const [busy, setBusy] = useState(false);
  const { toasts, show, dismiss } = useToasts();

  const refresh = useCallback(() => {
    loadPayments()
      .then(setPayments)
      .catch(() => setFailed(true));
  }, [loadPayments]);

  useEffect(() => {
    let stillMounted = true;

    loadPayments()
      .then((found) => {
        if (stillMounted) {
          setPayments(found);
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
  }, [loadPayments]);

  async function handleApprove(payment: PendingPayment) {
    setBusy(true);

    try {
      await approve(payment.id);
      show({
        tone: 'success',
        title: 'Pago aprobado',
        detail: 'La membresía del agremiado quedó al día.',
      });
      refresh();
    } catch (caught) {
      show({
        tone: 'problem',
        title: 'No se pudo aprobar el pago',
        detail: messageForError(caught, { fallback: MESSAGES.decision_unavailable }),
      });

      if (leftListStale(caught)) {
        refresh();
      }
    } finally {
      setBusy(false);
    }
  }

  async function handleReject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (rejecting === null) {
      return;
    }

    if (reason.trim() === '') {
      setReasonError(MESSAGES.required);
      return;
    }

    setReasonError(undefined);
    setBusy(true);

    try {
      await reject(rejecting.id, reason.trim());
      show({ tone: 'success', title: 'Pago rechazado', detail: 'Se avisará al agremiado.' });
      setRejecting(null);
      setReason('');
      refresh();
    } catch (caught) {
      show({
        tone: 'problem',
        title: 'No se pudo rechazar el pago',
        detail: messageForError(caught, { fallback: MESSAGES.decision_unavailable }),
      });

      if (leftListStale(caught)) {
        setRejecting(null);
        refresh();
      }
    } finally {
      setBusy(false);
    }
  }

  if (failed) {
    return (
      <p role="alert" className="rounded-panel border border-border bg-surface-raised p-6 text-sm">
        No fue posible cargar los pagos pendientes.
      </p>
    );
  }

  if (payments === null) {
    return <p className="text-sm text-content-muted">Cargando los pagos pendientes…</p>;
  }

  if (payments.length === 0) {
    return (
      <p className="rounded-panel border border-dashed border-border p-8 text-center text-sm text-content-muted">
        No hay pagos pendientes de revisión.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <ToastStack toasts={toasts} onDismiss={dismiss} />

      <ul className="flex flex-col gap-4">
        {payments.map((payment) => (
          <li
            key={payment.id}
            className="flex flex-col gap-4 rounded-panel border border-border bg-surface-raised p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex flex-col gap-1">
                <span className="font-semibold tracking-tight">{payment.member.businessName}</span>
                <span className="text-xs text-content-muted">
                  {payment.member.memberCode
                    ? formatMemberCode(payment.member.memberCode)
                    : 'Sin código'}{' '}
                  · {payment.member.email}
                </span>
              </div>

              <div className="flex flex-col items-end gap-1">
                <span className="font-medium tabular-nums">
                  {amountFormatter.format(payment.amount)}
                </span>
                <span className="text-xs text-content-muted">
                  Pagado el {dateFormatter.format(new Date(payment.paidAt))}
                </span>
              </div>
            </div>

            {payment.detail !== null && payment.detail !== '' && (
              <p className="text-sm text-content-muted">{payment.detail}</p>
            )}

            {rejecting !== null && rejecting.id === payment.id ? (
              <form onSubmit={handleReject} className="flex flex-col gap-3">
                <Field
                  id={`reject-reason-${payment.id}`}
                  label="Motivo del rechazo"
                  error={reasonError}
                >
                  {(control) => (
                    <textarea
                      {...control}
                      id={`reject-reason-${payment.id}`}
                      value={reason}
                      onChange={(event) => setReason(event.target.value)}
                      rows={2}
                      className={`${CONTROL_CLASS} resize-y`}
                    />
                  )}
                </Field>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setRejecting(null)}
                    className="rounded-control border border-border px-4 py-2 text-sm font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={busy}
                    className="rounded-control bg-brand px-4 py-2 text-sm font-medium text-on-brand disabled:opacity-50"
                  >
                    {busy ? 'Rechazando…' : 'Confirmar rechazo'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-3">
                {payment.receiptUrl !== null ? (
                  <a
                    href={payment.receiptUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-brand"
                  >
                    Ver comprobante
                  </a>
                ) : (
                  <span className="text-sm text-content-muted">Sin comprobante</span>
                )}

                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => {
                      setRejecting(payment);
                      setReason('');
                      setReasonError(undefined);
                    }}
                    className="rounded-control px-4 py-2 text-sm font-medium text-content-muted transition-colors hover:text-content disabled:opacity-50"
                  >
                    Rechazar
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => handleApprove(payment)}
                    className="rounded-control bg-support px-5 py-2 text-sm font-medium text-on-support transition-opacity disabled:opacity-50"
                  >
                    {busy ? 'Aprobando…' : 'Aprobar'}
                  </button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
