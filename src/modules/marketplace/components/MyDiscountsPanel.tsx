'use client';

import { useCallback, useEffect, useState } from 'react';
import { ToastStack } from '@/shared/components/ToastStack';
import { useToasts } from '@/shared/components/useToasts';
import { PaidGateNotice } from '@/shared/components/PaidGateNotice';
import {
  fetchOwnMembership,
  MEMBERSHIP_TYPES,
  type Membership,
} from '@/modules/members/api/membership';
import {
  fetchOwnDiscounts,
  closeDiscount as closeDiscountApi,
  type OwnDiscount,
} from '../api/discounts';
import { describeOwnPublication } from '../publicationState';
import { DiscountForm } from './DiscountForm';

const dateFormatter = new Intl.DateTimeFormat('es-CR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

type MyDiscountsPanelProps = {
  loadDiscounts?: () => Promise<OwnDiscount[]>;
  loadMembership?: () => Promise<Membership>;
  removeDiscount?: (id: string) => Promise<void>;
};

type Editing = { discount: OwnDiscount | null; reactivate: boolean } | null;

export function MyDiscountsPanel({
  loadDiscounts = fetchOwnDiscounts,
  loadMembership = fetchOwnMembership,
  removeDiscount = closeDiscountApi,
}: MyDiscountsPanelProps) {
  const [discounts, setDiscounts] = useState<OwnDiscount[] | null>(null);
  const [membership, setMembership] = useState<Membership | null>(null);
  const [failed, setFailed] = useState(false);
  const [editing, setEditing] = useState<Editing>(null);
  const { toasts, show, dismiss } = useToasts();

  const refresh = useCallback(() => {
    loadDiscounts()
      .then(setDiscounts)
      .catch(() => setFailed(true));
  }, [loadDiscounts]);

  useEffect(() => {
    let stillMounted = true;

    Promise.all([loadDiscounts(), loadMembership()])
      .then(([foundDiscounts, foundMembership]) => {
        if (stillMounted) {
          setDiscounts(foundDiscounts);
          setMembership(foundMembership);
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
  }, [loadDiscounts, loadMembership]);

  function handleSaved() {
    setEditing(null);
    refresh();
    show({ tone: 'success', title: 'El descuento quedó guardado' });
  }

  async function handleClose(discount: OwnDiscount) {
    try {
      await removeDiscount(discount.id);
      refresh();
      show({ tone: 'success', title: 'El descuento fue retirado' });
    } catch {
      show({ tone: 'problem', title: 'No se pudo retirar el descuento' });
    }
  }

  if (failed) {
    return (
      <p role="alert" className="rounded-panel border border-border bg-surface-raised p-6 text-sm">
        No fue posible cargar sus descuentos.
      </p>
    );
  }

  if (discounts === null || membership === null) {
    return <p className="text-sm text-content-muted">Cargando…</p>;
  }

  if (editing !== null) {
    return (
      <DiscountForm
        discount={editing.discount ?? undefined}
        reactivate={editing.reactivate}
        onSaved={handleSaved}
        onCancel={() => setEditing(null)}
      />
    );
  }

  const isFree = membership.type === MEMBERSHIP_TYPES.FREE;

  return (
    <div className="flex flex-col gap-6">
      <ToastStack toasts={toasts} onDismiss={dismiss} />

      {isFree ? (
        <PaidGateNotice />
      ) : (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setEditing({ discount: null, reactivate: false })}
            className="rounded-control bg-brand px-6 py-2.5 font-medium text-on-brand"
          >
            Publicar descuento
          </button>
        </div>
      )}

      {discounts.length === 0 ? (
        <p className="text-sm text-content-muted">Todavía no ha publicado ningún descuento.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {discounts.map((discount) => {
            const state = describeOwnPublication(discount);

            return (
              <li
                key={discount.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-panel border border-border bg-surface-raised p-4"
              >
                <div className="flex min-w-0 flex-col gap-1">
                  <span className="line-clamp-1 font-medium">{discount.description}</span>
                  <span className="text-xs text-content-muted">
                    Vigente hasta {dateFormatter.format(new Date(discount.validUntil))} ·{' '}
                    {state.label}
                  </span>
                </div>

                {state.blocked ? (
                  <span className="text-xs text-danger">Bloqueado por la Cámara</span>
                ) : (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setEditing({ discount, reactivate: false })}
                      className="rounded-control border border-border px-4 py-2 text-sm font-medium"
                    >
                      Editar
                    </button>
                    {state.canReactivate && (
                      <button
                        type="button"
                        onClick={() => setEditing({ discount, reactivate: true })}
                        className="rounded-control border border-border px-4 py-2 text-sm font-medium"
                      >
                        Reactivar
                      </button>
                    )}
                    {state.canClose && (
                      <button
                        type="button"
                        onClick={() => handleClose(discount)}
                        className="rounded-control border border-border px-4 py-2 text-sm font-medium text-danger"
                      >
                        Retirar
                      </button>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
