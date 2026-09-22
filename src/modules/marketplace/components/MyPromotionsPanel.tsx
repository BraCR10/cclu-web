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
  fetchOwnPromotions,
  closePromotion as closePromotionApi,
  type OwnPromotion,
} from '../api/promotions';
import { describeOwnPublication } from '../publicationState';
import { PromotionForm } from './PromotionForm';

const dateFormatter = new Intl.DateTimeFormat('es-CR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

type MyPromotionsPanelProps = {
  loadPromotions?: () => Promise<OwnPromotion[]>;
  loadMembership?: () => Promise<Membership>;
  removePromotion?: (id: string) => Promise<void>;
};

type Editing = { promotion: OwnPromotion | null; reactivate: boolean } | null;

export function MyPromotionsPanel({
  loadPromotions = fetchOwnPromotions,
  loadMembership = fetchOwnMembership,
  removePromotion = closePromotionApi,
}: MyPromotionsPanelProps) {
  const [promotions, setPromotions] = useState<OwnPromotion[] | null>(null);
  const [membership, setMembership] = useState<Membership | null>(null);
  const [failed, setFailed] = useState(false);
  const [editing, setEditing] = useState<Editing>(null);
  const { toasts, show, dismiss } = useToasts();

  const refresh = useCallback(() => {
    loadPromotions()
      .then(setPromotions)
      .catch(() => setFailed(true));
  }, [loadPromotions]);

  useEffect(() => {
    let stillMounted = true;

    Promise.all([loadPromotions(), loadMembership()])
      .then(([foundPromotions, foundMembership]) => {
        if (stillMounted) {
          setPromotions(foundPromotions);
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
  }, [loadPromotions, loadMembership]);

  function handleSaved() {
    setEditing(null);
    refresh();
    show({ tone: 'success', title: 'La promoción quedó guardada' });
  }

  async function handleClose(promotion: OwnPromotion) {
    try {
      await removePromotion(promotion.id);
      refresh();
      show({ tone: 'success', title: 'La promoción fue retirada' });
    } catch {
      show({ tone: 'problem', title: 'No se pudo retirar la promoción' });
    }
  }

  if (failed) {
    return (
      <p role="alert" className="rounded-panel border border-border bg-surface-raised p-6 text-sm">
        No fue posible cargar sus promociones.
      </p>
    );
  }

  if (promotions === null || membership === null) {
    return <p className="text-sm text-content-muted">Cargando…</p>;
  }

  if (editing !== null) {
    return (
      <PromotionForm
        promotion={editing.promotion ?? undefined}
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
            onClick={() => setEditing({ promotion: null, reactivate: false })}
            className="rounded-control bg-brand px-6 py-2.5 font-medium text-on-brand"
          >
            Publicar promoción
          </button>
        </div>
      )}

      {promotions.length === 0 ? (
        <p className="text-sm text-content-muted">Todavía no ha publicado ninguna promoción.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {promotions.map((promotion) => {
            const state = describeOwnPublication(promotion);

            return (
              <li
                key={promotion.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-panel border border-border bg-surface-raised p-4"
              >
                <div className="flex flex-col gap-1">
                  <span className="font-medium">{promotion.title}</span>
                  <span className="text-xs text-content-muted">
                    Vigente hasta {dateFormatter.format(new Date(promotion.validUntil))} ·{' '}
                    {state.label}
                  </span>
                </div>

                {state.blocked ? (
                  <span className="text-xs text-danger">Bloqueada por la Cámara</span>
                ) : (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setEditing({ promotion, reactivate: false })}
                      className="rounded-control border border-border px-4 py-2 text-sm font-medium"
                    >
                      Editar
                    </button>
                    {state.canReactivate && (
                      <button
                        type="button"
                        onClick={() => setEditing({ promotion, reactivate: true })}
                        className="rounded-control border border-border px-4 py-2 text-sm font-medium"
                      >
                        Reactivar
                      </button>
                    )}
                    {state.canClose && (
                      <button
                        type="button"
                        onClick={() => handleClose(promotion)}
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
