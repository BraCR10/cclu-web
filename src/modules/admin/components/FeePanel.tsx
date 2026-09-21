'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { CONTROL_CLASS, Field } from '@/shared/components/Field';
import { ToastStack } from '@/shared/components/ToastStack';
import { useToasts } from '@/shared/components/useToasts';
import { MESSAGES, messageForError } from '@/shared/config/messages';
import { fetchFee, updateFee as updateFeeApi } from '../api/payments';

const amountFormatter = new Intl.NumberFormat('es-CR', {
  style: 'currency',
  currency: 'CRC',
  maximumFractionDigits: 0,
});

type FeePanelProps = {
  loadFee?: () => Promise<{ amount: number | null }>;
  saveFee?: (amount: number) => Promise<{ amount: number }>;
};

export function FeePanel({ loadFee = fetchFee, saveFee = updateFeeApi }: FeePanelProps) {
  const [current, setCurrent] = useState<number | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState<string | undefined>(undefined);
  const [saving, setSaving] = useState(false);
  const { toasts, show, dismiss } = useToasts();

  useEffect(() => {
    let stillMounted = true;

    loadFee()
      .then(({ amount }) => {
        if (stillMounted) {
          setCurrent(amount);
          setLoaded(true);
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
  }, [loadFee]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const amount = Number(draft);

    if (draft.trim() === '' || !Number.isFinite(amount) || amount <= 0) {
      setError('Indique un monto mayor que cero.');
      return;
    }

    setError(undefined);
    setSaving(true);

    try {
      const saved = await saveFee(amount);
      setCurrent(saved.amount);
      setDraft('');
      show({
        tone: 'success',
        title: 'La cuota quedó actualizada',
        detail: 'El monto aplica desde este momento.',
      });
    } catch (caught) {
      show({
        tone: 'problem',
        title: 'No se pudo actualizar la cuota',
        detail: messageForError(caught, { fallback: MESSAGES.save_unavailable }),
      });
    } finally {
      setSaving(false);
    }
  }

  if (failed) {
    return (
      <p role="alert" className="rounded-panel border border-border bg-surface-raised p-6 text-sm">
        No fue posible cargar la cuota configurada.
      </p>
    );
  }

  if (!loaded) {
    return <p className="text-sm text-content-muted">Cargando…</p>;
  }

  return (
    <div className="flex max-w-xl flex-col gap-6">
      <ToastStack toasts={toasts} onDismiss={dismiss} />

      <div className="flex flex-col gap-1 rounded-panel border border-border bg-surface-raised p-6">
        <span className="text-xs font-medium tracking-widest text-content-muted uppercase">
          Cuota mensual vigente
        </span>
        <span className="text-2xl font-semibold tabular-nums">
          {current === null ? 'Sin configurar' : amountFormatter.format(current)}
        </span>
        <p className="text-sm text-content-muted">
          Es el monto que verá cada agremiado al registrar su pago.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 rounded-panel border border-border bg-surface-raised p-6"
      >
        <Field id="fee-amount" label="Nuevo monto (₡)" error={error}>
          {(control) => (
            <input
              {...control}
              id="fee-amount"
              inputMode="numeric"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              className={`${CONTROL_CLASS} w-full`}
            />
          )}
        </Field>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="rounded-control bg-brand px-6 py-2.5 font-medium text-on-brand disabled:opacity-50"
          >
            {saving ? 'Guardando…' : 'Actualizar cuota'}
          </button>
        </div>
      </form>
    </div>
  );
}
