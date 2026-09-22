'use client';

import { useState, type FormEvent } from 'react';
import { CONTROL_CLASS, Field } from '@/shared/components/Field';
import { CharacterCount } from '@/shared/components/CharacterCount';
import { checkField } from '@/shared/config/memberRules';
import { MESSAGES, messageForError, messageForFieldCode } from '@/shared/config/messages';
import { focusFirstInvalid } from '@/shared/forms';
import {
  createDiscount as createDiscountApi,
  updateDiscount as updateDiscountApi,
  type OwnDiscount,
  type DiscountChanges,
} from '../api/discounts';

type DiscountFormProps = {
  discount?: OwnDiscount;
  reactivate?: boolean;
  onSaved: (discount: OwnDiscount) => void;
  onCancel?: () => void;
  create?: (changes: DiscountChanges) => Promise<OwnDiscount>;
  update?: (id: string, changes: DiscountChanges) => Promise<OwnDiscount>;
};

type Draft = { description: string; conditions: string; validUntil: string };

type FieldErrors = Partial<Record<string, string>>;

function toDraft(discount?: OwnDiscount): Draft {
  return {
    description: discount?.description ?? '',
    conditions: discount?.conditions ?? '',
    validUntil: discount?.validUntil ? discount.validUntil.slice(0, 10) : '',
  };
}

function findErrors(draft: Draft, reactivate: boolean): FieldErrors {
  const errors: FieldErrors = {};

  const descriptionCode = checkField('discountDescription', draft.description, { required: true });

  if (descriptionCode !== null) {
    errors.description = messageForFieldCode('discountDescription', descriptionCode);
  }

  const conditionsCode = checkField('discountConditions', draft.conditions, { required: true });

  if (conditionsCode !== null) {
    errors.conditions = messageForFieldCode('discountConditions', conditionsCode);
  }

  if (draft.validUntil.trim() === '' || Number.isNaN(new Date(draft.validUntil).getTime())) {
    errors.validUntil = MESSAGES.required;
  } else if (reactivate && new Date(draft.validUntil) <= new Date()) {
    errors.validUntil = MESSAGES.expired_needs_new_validity;
  }

  return errors;
}

export function DiscountForm({
  discount,
  reactivate = false,
  onSaved,
  onCancel,
  create = createDiscountApi,
  update = updateDiscountApi,
}: DiscountFormProps) {
  const [draft, setDraft] = useState<Draft>(toDraft(discount));
  const [errors, setErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);

  function set<K extends keyof Draft>(name: K, value: Draft[K]) {
    setDraft((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFailure(null);

    const found = findErrors(draft, reactivate);
    setErrors(found);

    if (Object.keys(found).length > 0) {
      focusFirstInvalid(['description', 'conditions', 'validUntil'], found);
      return;
    }

    const changes: DiscountChanges = {
      description: draft.description.trim(),
      conditions: draft.conditions.trim(),
      validUntil: draft.validUntil,
      ...(reactivate ? { isActive: true } : {}),
    };

    setSaving(true);

    try {
      onSaved(discount ? await update(discount.id, changes) : await create(changes));
    } catch (caught) {
      setFailure(
        messageForError(caught, {
          byStatus: { 400: 'form_incomplete' },
          fallback: MESSAGES.save_unavailable,
        }),
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-5 rounded-panel border border-border bg-surface-raised p-6"
    >
      <Field
        id="description"
        label="Descripción del descuento"
        hint="Qué ofrece y a quiénes aplica dentro de la Cámara."
        error={errors.description}
      >
        {(control) => (
          <div className="flex flex-col gap-1.5">
            <textarea
              id="description"
              value={draft.description}
              onChange={(event) => set('description', event.target.value)}
              {...control}
              rows={4}
              maxLength={2000}
              className={`${CONTROL_CLASS} resize-y`}
            />
            <CharacterCount field="discountDescription" value={draft.description} />
          </div>
        )}
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="conditions" label="Condiciones" error={errors.conditions}>
          {(control) => (
            <textarea
              id="conditions"
              value={draft.conditions}
              onChange={(event) => set('conditions', event.target.value)}
              {...control}
              rows={3}
              maxLength={1000}
              className={`${CONTROL_CLASS} resize-y`}
            />
          )}
        </Field>

        <Field
          id="validUntil"
          label="Vigente hasta"
          hint={reactivate ? 'Indique la nueva fecha de vigencia.' : undefined}
          error={errors.validUntil}
        >
          {(control) => (
            <input
              {...control}
              id="validUntil"
              type="date"
              value={draft.validUntil}
              onChange={(event) => set('validUntil', event.target.value)}
              className={CONTROL_CLASS}
            />
          )}
        </Field>
      </div>

      {failure !== null && (
        <p role="alert" className="text-sm text-danger">
          {failure}
        </p>
      )}

      <div className="flex justify-end gap-3">
        {onCancel !== undefined && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-control border border-border px-6 py-2.5 font-medium"
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          disabled={saving}
          className="rounded-control bg-brand px-6 py-2.5 font-medium text-on-brand disabled:opacity-50"
        >
          {saving
            ? 'Guardando…'
            : reactivate
              ? 'Reactivar descuento'
              : discount
                ? 'Guardar cambios'
                : 'Publicar descuento'}
        </button>
      </div>
    </form>
  );
}
