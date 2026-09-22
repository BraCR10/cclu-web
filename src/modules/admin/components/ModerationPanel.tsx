'use client';

import { useCallback, useEffect, useState } from 'react';
import { CONTROL_CLASS, Field } from '@/shared/components/Field';
import { ToastStack } from '@/shared/components/ToastStack';
import { useToasts } from '@/shared/components/useToasts';
import { MESSAGES, messageForError } from '@/shared/config/messages';
import {
  fetchPublications,
  moderatePublication,
  ADMIN_STATUS_LABELS,
  PUBLICATION_TYPES,
  PUBLICATION_TYPE_LABELS,
  type ModerationAction,
  type ModerationPage,
  type PublicationType,
} from '../api/moderation';

const dateFormatter = new Intl.DateTimeFormat('es-CR', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

type ModerationPanelProps = {
  loadPublications?: (type: PublicationType, page: number) => Promise<ModerationPage>;
  moderate?: (type: PublicationType, id: string, action: ModerationAction) => Promise<unknown>;
};

export function ModerationPanel({
  loadPublications = fetchPublications,
  moderate = moderatePublication,
}: ModerationPanelProps) {
  const [type, setType] = useState<PublicationType>(PUBLICATION_TYPES.PRODUCTS);
  const [page, setPage] = useState(1);
  const [answer, setAnswer] = useState<ModerationPage | null>(null);
  const [failed, setFailed] = useState(false);
  const [confirmingBlock, setConfirmingBlock] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const { toasts, show, dismiss } = useToasts();

  const run = useCallback(
    (nextType: PublicationType, nextPage: number) => {
      // Deferred to a microtask so an effect that triggers this never sets
      // state during its own synchronous body.
      Promise.resolve()
        .then(() => {
          setFailed(false);
          setAnswer(null);

          return loadPublications(nextType, nextPage);
        })
        .then(setAnswer)
        .catch(() => setFailed(true));
    },
    [loadPublications],
  );

  useEffect(() => {
    run(type, page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, page]);

  async function act(id: string, action: ModerationAction) {
    setBusy(true);

    try {
      await moderate(type, id, action);
      show({ tone: 'success', title: 'La publicación quedó actualizada' });
      setConfirmingBlock(null);
      run(type, page);
    } catch (caught) {
      show({
        tone: 'problem',
        title: 'No se pudo aplicar la acción',
        detail: messageForError(caught, { fallback: MESSAGES.decision_unavailable }),
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <ToastStack toasts={toasts} onDismiss={dismiss} />

      <div className="max-w-xs">
        <Field id="moderation-type" label="Tipo de publicación">
          {(control) => (
            <select
              {...control}
              id="moderation-type"
              value={type}
              onChange={(event) => {
                setType(event.target.value as PublicationType);
                setPage(1);
              }}
              className={CONTROL_CLASS}
            >
              {Object.values(PUBLICATION_TYPES).map((value) => (
                <option key={value} value={value}>
                  {PUBLICATION_TYPE_LABELS[value]}
                </option>
              ))}
            </select>
          )}
        </Field>
      </div>

      {failed && (
        <p role="alert" className="text-sm text-danger">
          No fue posible cargar las publicaciones.
        </p>
      )}

      {!failed && answer === null && <p className="text-sm text-content-muted">Cargando…</p>}

      {!failed && answer !== null && answer.items.length === 0 && (
        <p className="text-sm text-content-muted">No hay publicaciones de este tipo.</p>
      )}

      {!failed && answer !== null && answer.items.length > 0 && (
        <>
          <ul className="flex flex-col gap-3">
            {answer.items.map((item) => (
              <li
                key={item.id}
                className="flex flex-col gap-3 rounded-panel border border-border bg-surface-raised p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <span className="line-clamp-1 font-medium">{item.title}</span>
                    <span className="text-xs text-content-muted">
                      {item.business.businessName} · Publicada el{' '}
                      {dateFormatter.format(new Date(item.createdAt))}
                      {item.validUntil
                        ? ` · Vigente hasta el ${dateFormatter.format(new Date(item.validUntil))}`
                        : ''}
                    </span>
                  </div>

                  <span
                    className={`rounded-pill px-3 py-1 text-xs font-medium ${
                      item.adminStatus === 'active'
                        ? item.isActive
                          ? 'bg-support text-on-support'
                          : 'border border-border text-content-muted'
                        : 'bg-highlight text-on-highlight'
                    }`}
                  >
                    {item.adminStatus === 'active' && !item.isActive
                      ? 'Retirada por el comercio'
                      : ADMIN_STATUS_LABELS[item.adminStatus]}
                  </span>
                </div>

                {confirmingBlock === item.id ? (
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-control bg-surface p-3">
                    <p className="text-sm">
                      ¿Bloquear permanentemente? El comercio no podrá reactivarla.
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setConfirmingBlock(null)}
                        className="rounded-control border border-border px-4 py-2 text-sm font-medium"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => act(item.id, 'block')}
                        className="rounded-control bg-brand px-4 py-2 text-sm font-medium text-on-brand disabled:opacity-50"
                      >
                        Confirmar bloqueo
                      </button>
                    </div>
                  </div>
                ) : (
                  item.adminStatus !== 'blocked' && (
                    <div className="flex justify-end gap-2">
                      {item.adminStatus === 'active' ? (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => act(item.id, 'deactivate')}
                          className="rounded-control border border-border px-4 py-2 text-sm font-medium disabled:opacity-50"
                        >
                          Inactivar
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => act(item.id, 'reactivate')}
                          className="rounded-control border border-border px-4 py-2 text-sm font-medium disabled:opacity-50"
                        >
                          Reactivar
                        </button>
                      )}
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => setConfirmingBlock(item.id)}
                        className="rounded-control px-4 py-2 text-sm font-medium text-danger disabled:opacity-50"
                      >
                        Bloquear
                      </button>
                    </div>
                  )
                )}
              </li>
            ))}
          </ul>

          <div className="flex items-center justify-between text-sm text-content-muted">
            <span>
              {answer.total} {answer.total === 1 ? 'publicación' : 'publicaciones'}
            </span>

            <div className="flex gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((current) => current - 1)}
                className="rounded-control border border-border px-4 py-2 disabled:opacity-50"
              >
                Anterior
              </button>
              <button
                type="button"
                disabled={!answer.hasMore}
                onClick={() => setPage((current) => current + 1)}
                className="rounded-control border border-border px-4 py-2 disabled:opacity-50"
              >
                Siguiente
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
