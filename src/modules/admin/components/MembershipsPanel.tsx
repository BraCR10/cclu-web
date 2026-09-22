'use client';

import { useCallback, useEffect, useState } from 'react';
import { formatMemberCode } from '@/shared/format';
import type { Payment } from '@/modules/members/api/membership';
import { fetchMemberships, fetchMemberPayments, type MembershipRow } from '../api/payments';

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

const PAYMENT_STATUS_LABELS: Record<Payment['status'], string> = {
  pending_review: 'Pendiente de revisión',
  approved: 'Aprobado',
  rejected: 'Rechazado',
};

type StateFilter = 'all' | 'active' | 'inactive';

const STATE_TABS: { value: StateFilter; label: string }[] = [
  { value: 'all', label: 'Todas' },
  { value: 'active', label: 'Pagas al día' },
  { value: 'inactive', label: 'No pagas' },
];

type MembershipsPanelProps = {
  loadMemberships?: (state?: 'active' | 'inactive') => Promise<MembershipRow[]>;
  loadMemberPayments?: (memberId: string) => Promise<Payment[]>;
};

function PaymentHistory({
  memberId,
  loadMemberPayments,
}: {
  memberId: string;
  loadMemberPayments: (memberId: string) => Promise<Payment[]>;
}) {
  const [payments, setPayments] = useState<Payment[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let stillMounted = true;

    loadMemberPayments(memberId)
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
  }, [memberId, loadMemberPayments]);

  if (failed) {
    return <p className="text-xs text-danger">No fue posible cargar el historial.</p>;
  }

  if (payments === null) {
    return <p className="text-xs text-content-muted">Cargando el historial…</p>;
  }

  if (payments.length === 0) {
    return <p className="text-xs text-content-muted">Este agremiado no ha registrado pagos.</p>;
  }

  return (
    <ul className="flex flex-col gap-2">
      {payments.map((payment) => (
        <li
          key={payment.id}
          className="flex flex-wrap items-center justify-between gap-2 rounded-control bg-surface px-3 py-2 text-xs"
        >
          <span className="tabular-nums">
            {amountFormatter.format(payment.amount)} ·{' '}
            {dateFormatter.format(new Date(payment.paidAt))}
          </span>

          <span className="flex items-center gap-3">
            {payment.receiptUrl !== null && (
              <a
                href={payment.receiptUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-brand"
              >
                Comprobante
              </a>
            )}
            <span className="text-content-muted">{PAYMENT_STATUS_LABELS[payment.status]}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

export function MembershipsPanel({
  loadMemberships = fetchMemberships,
  loadMemberPayments = fetchMemberPayments,
}: MembershipsPanelProps) {
  const [state, setState] = useState<StateFilter>('all');
  const [rows, setRows] = useState<MembershipRow[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [openMemberId, setOpenMemberId] = useState<string | null>(null);

  const run = useCallback(
    (filter: StateFilter) => {
      // Deferred to a microtask so an effect that triggers this never sets
      // state during its own synchronous body.
      Promise.resolve()
        .then(() => {
          setFailed(false);
          setRows(null);

          return loadMemberships(filter === 'all' ? undefined : filter);
        })
        .then(setRows)
        .catch(() => setFailed(true));
    },
    [loadMemberships],
  );

  useEffect(() => {
    run(state);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <div className="flex flex-col gap-6">
      <div role="tablist" aria-label="Estado de las membresías" className="flex gap-2">
        {STATE_TABS.map((tab) => {
          const selected = tab.value === state;

          return (
            <button
              key={tab.value}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setState(tab.value)}
              className={`rounded-pill px-4 py-2 text-sm font-medium transition-colors ${
                selected
                  ? 'bg-brand text-on-brand'
                  : 'border border-border text-content-muted hover:border-content-muted'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {failed && (
        <p role="alert" className="text-sm text-danger">
          No fue posible cargar las membresías.
        </p>
      )}

      {!failed && rows === null && <p className="text-sm text-content-muted">Cargando…</p>}

      {!failed && rows !== null && rows.length === 0 && (
        <p className="text-sm text-content-muted">No hay agremiados en esta vista.</p>
      )}

      {!failed && rows !== null && rows.length > 0 && (
        <ul className="flex flex-col gap-3">
          {rows.map((row) => (
            <li
              key={row.member.id}
              className="flex flex-col gap-3 rounded-panel border border-border bg-surface-raised p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-col gap-0.5">
                  <span className="font-medium">{row.member.businessName}</span>
                  <span className="text-xs text-content-muted">
                    {row.member.memberCode ? formatMemberCode(row.member.memberCode) : 'Sin código'}{' '}
                    · {row.member.email}
                    {row.member.canton === null ? '' : ` · ${row.member.canton}`}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`rounded-pill px-3 py-1 text-xs font-medium ${
                      row.type === 'paid'
                        ? 'bg-support text-on-support'
                        : 'border border-border text-content-muted'
                    }`}
                  >
                    {row.type === 'paid' && row.paidUntil !== null
                      ? `Paga hasta el ${dateFormatter.format(new Date(row.paidUntil))}`
                      : 'Gratuita'}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      setOpenMemberId((current) =>
                        current === row.member.id ? null : row.member.id,
                      )
                    }
                    className="text-xs font-medium text-brand"
                  >
                    {openMemberId === row.member.id ? 'Ocultar pagos' : 'Ver pagos'}
                  </button>
                </div>
              </div>

              {openMemberId === row.member.id && (
                <PaymentHistory memberId={row.member.id} loadMemberPayments={loadMemberPayments} />
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
