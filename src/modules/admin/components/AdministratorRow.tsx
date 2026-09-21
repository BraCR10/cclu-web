'use client';

import { useState, type FormEvent } from 'react';
import { Field, CONTROL_CLASS } from '@/shared/components/Field';
import { checkField } from '@/shared/config/memberRules';
import { MESSAGES, messageForError, messageForFieldCode } from '@/shared/config/messages';
import { focusFirstInvalid } from '@/shared/forms';
import {
  updateAdministrator as updateAdministratorThroughApi,
  updateAdministratorStatus as updateStatusThroughApi,
  type AdministratorChanges,
  type AdministratorRecord,
} from '../api/administrators';

const STATUS_LABELS: Record<AdministratorRecord['accountStatus'], string> = {
  active: 'Activa',
  suspended: 'Suspendida',
  terminated: 'Terminada',
};

const EDITABLE_STATUSES = ['active', 'suspended'] as const;
type EditableStatus = (typeof EDITABLE_STATUSES)[number];

type AdministratorRowProps = {
  administrator: AdministratorRecord;
  onUpdated: (updated: AdministratorRecord) => void;
  notify: (tone: 'success' | 'info' | 'problem', title: string, detail?: string) => void;
  saveChanges?: (
    administratorId: string,
    changes: AdministratorChanges,
  ) => Promise<AdministratorRecord>;
  saveStatus?: (
    administratorId: string,
    accountStatus: EditableStatus,
  ) => Promise<AdministratorRecord>;
};

function Monogram({ name, email }: { name: string | null; email: string }) {
  const label = (name ?? email).trim().charAt(0).toUpperCase();

  return (
    <span
      aria-hidden
      className="flex size-11 shrink-0 items-center justify-center rounded-panel bg-linear-to-br from-brand to-support text-lg font-semibold text-on-brand"
    >
      {label}
    </span>
  );
}

export function AdministratorRow({
  administrator,
  onUpdated,
  notify,
  saveChanges = updateAdministratorThroughApi,
  saveStatus = updateStatusThroughApi,
}: AdministratorRowProps) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(administrator.name ?? '');
  const [email, setEmail] = useState(administrator.email);
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});
  const [saving, setSaving] = useState(false);
  const [statusBusy, setStatusBusy] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const found: { name?: string; email?: string } = {};
    const nameCode = checkField('name', name, { required: true });

    if (nameCode !== null) {
      found.name = messageForFieldCode('name', nameCode);
    }

    const emailCode = checkField('email', email, { required: true });

    if (emailCode !== null) {
      found.email = messageForFieldCode('email', emailCode);
    }

    setErrors(found);

    if (Object.keys(found).length > 0) {
      focusFirstInvalid(['name', 'email'], found);
      return;
    }

    if (name.trim() === (administrator.name ?? '') && email.trim() === administrator.email) {
      notify('info', MESSAGES.nothing_to_change);
      return;
    }

    setSaving(true);

    try {
      const updated = await saveChanges(administrator.id, {
        name: name.trim(),
        email: email.trim(),
      });

      onUpdated(updated);
      setEditing(false);
      notify('success', 'Los datos del administrador quedaron actualizados');
    } catch (caught) {
      notify('problem', messageForError(caught, { fallback: MESSAGES.save_unavailable }));
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusChange(status: EditableStatus) {
    if (status === administrator.accountStatus) {
      return;
    }

    setStatusBusy(true);

    try {
      const updated = await saveStatus(administrator.id, status);

      onUpdated(updated);
      notify(
        'success',
        `La cuenta de ${updated.name ?? updated.email} quedó ${STATUS_LABELS[
          updated.accountStatus
        ].toLowerCase()}`,
      );
    } catch (caught) {
      notify('problem', messageForError(caught, { fallback: MESSAGES.save_unavailable }));
    } finally {
      setStatusBusy(false);
    }
  }

  return (
    <article className="flex flex-col gap-5 rounded-panel border border-border bg-surface-raised p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-4">
          <Monogram name={administrator.name} email={administrator.email} />

          <div className="flex min-w-0 flex-col gap-1">
            <h3 className="truncate text-lg font-semibold tracking-tight">
              {administrator.name ?? administrator.email}
            </h3>
            <p className="truncate text-sm text-content-muted">{administrator.email}</p>
          </div>
        </div>

        <span className="rounded-pill border border-border px-3 py-1 text-xs font-medium text-content-muted">
          {STATUS_LABELS[administrator.accountStatus]}
        </span>
      </div>

      {editing ? (
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id={`name-${administrator.id}`} label="Nombre" error={errors.name}>
              {(control) => (
                <input
                  id={`name-${administrator.id}`}
                  autoComplete="name"
                  {...control}
                  className={CONTROL_CLASS}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />
              )}
            </Field>

            <Field id={`email-${administrator.id}`} label="Correo" error={errors.email}>
              {(control) => (
                <input
                  id={`email-${administrator.id}`}
                  type="email"
                  autoComplete="email"
                  {...control}
                  className={CONTROL_CLASS}
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              )}
            </Field>
          </div>

          <div className="flex flex-wrap justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setErrors({});
                setEditing(false);
              }}
              disabled={saving}
              className="rounded-control px-4 py-2 text-sm font-medium text-content-muted disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-control bg-brand px-4 py-2 text-sm font-medium text-on-brand disabled:opacity-60"
            >
              {saving ? 'Guardando…' : 'Guardar'}
            </button>
          </div>
        </form>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
          <label className="flex flex-wrap items-center gap-2 text-sm text-content-muted">
            Estado
            <select
              aria-label={`Cambiar estado de ${administrator.name ?? administrator.email}`}
              value={administrator.accountStatus}
              disabled={statusBusy}
              onChange={(event) => handleStatusChange(event.target.value as EditableStatus)}
              className={CONTROL_CLASS}
            >
              {EDITABLE_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {STATUS_LABELS[status]}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            onClick={() => setEditing(true)}
            className="rounded-control bg-brand px-4 py-2 text-sm font-medium text-on-brand"
          >
            Editar datos
          </button>
        </div>
      )}
    </article>
  );
}
