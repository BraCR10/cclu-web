'use client';

import { useState, type FormEvent } from 'react';
import { ApiError } from '@/shared/api/request';
import { checkPassword, messageForCode, PASSWORD_HINT } from '@/shared/config/memberRules';
import { confirmPasswordChange, requestPasswordCode } from '@/shared/auth/passwordChange';
import { Field, CONTROL_CLASS } from './Field';
import { ToastStack } from './ToastStack';
import { useToasts } from './useToasts';
import { CheckCircleIcon } from './icons';

type PasswordChangeFormProps = {
  requestCode?: (currentPassword: string) => Promise<{ minutesValid: number }>;
  confirmChange?: (code: string, newPassword: string) => Promise<{ changed: true }>;
};

const CONFIRMATION_MESSAGE = 'Las contraseñas no coinciden.';
const UNAVAILABLE = 'No fue posible completar el cambio. Intente de nuevo en unos momentos.';

function messageFor(error: unknown): string {
  if (!(error instanceof ApiError)) {
    return UNAVAILABLE;
  }

  if (error.status === 429) {
    return 'Demasiados intentos. Espere unos minutos e intente de nuevo.';
  }

  return error.reason === undefined && error.code === undefined
    ? UNAVAILABLE
    : messageForCode(error.code);
}

export function PasswordChangeForm({
  requestCode = requestPasswordCode,
  confirmChange = confirmPasswordChange,
}: PasswordChangeFormProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [minutesValid, setMinutesValid] = useState<number | null>(null);
  const [changed, setChanged] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const { toasts, show, dismiss } = useToasts();

  async function askForCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrors({});
    setBusy(true);

    try {
      const answer = await requestCode(currentPassword);

      setMinutesValid(answer.minutesValid);
      show({
        tone: 'info',
        title: 'Le enviamos un código',
        detail: `Revise su correo. Vence en ${answer.minutesValid} minutos.`,
      });
    } catch (caught) {
      const message = messageFor(caught);

      setErrors(
        caught instanceof ApiError && caught.status === 401 ? { currentPassword: message } : {},
      );

      if (!(caught instanceof ApiError) || caught.status !== 401) {
        show({ tone: 'problem', title: 'No se pudo enviar el código', detail: message });
      }
    } finally {
      setBusy(false);
    }
  }

  async function applyChange(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // Checked here with the same rule the API uses, so the person is told
    // before spending their code on a password that would be refused.
    const passwordCode = checkPassword(newPassword);
    const found: Record<string, string> = {};

    if (passwordCode !== null) {
      found.newPassword = messageForCode(passwordCode);
    }

    if (newPassword !== confirmation) {
      found.confirmation = CONFIRMATION_MESSAGE;
    }

    setErrors(found);

    if (Object.keys(found).length > 0) {
      return;
    }

    setBusy(true);

    try {
      await confirmChange(code, newPassword);
      setChanged(true);
    } catch (caught) {
      const message = messageFor(caught);

      setErrors(
        caught instanceof ApiError && caught.code === 'invalid_code' ? { code: message } : {},
      );

      if (!(caught instanceof ApiError) || caught.code !== 'invalid_code') {
        show({ tone: 'problem', title: 'No se pudo cambiar', detail: message });
      }
    } finally {
      setBusy(false);
    }
  }

  if (changed) {
    return (
      <div
        role="status"
        className="animate-panel-in flex items-start gap-3 rounded-panel border border-support bg-surface-raised p-6"
      >
        <CheckCircleIcon className="mt-0.5 size-6 text-support" />
        <div className="flex flex-col gap-1">
          <p className="font-medium">Su contraseña quedó cambiada</p>
          <p className="text-sm text-content-muted">
            Úsela la próxima vez que inicie sesión. Su sesión actual sigue abierta.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex max-w-xl flex-col gap-6">
      <ToastStack toasts={toasts} onDismiss={dismiss} />

      <form
        onSubmit={askForCode}
        className="flex flex-col gap-5 rounded-panel border border-border bg-surface-raised p-6"
      >
        <div className="flex flex-col gap-1">
          <h2 className="font-semibold tracking-tight">1. Confirme quién es</h2>
          <p className="text-sm text-content-muted">
            Escriba su contraseña actual. Le enviaremos un código a su correo.
          </p>
        </div>

        <Field id="currentPassword" label="Contraseña actual" error={errors.currentPassword}>
          {(describedBy) => (
            <input
              id="currentPassword"
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              aria-describedby={describedBy}
              disabled={minutesValid !== null}
              required
              className={`${CONTROL_CLASS} disabled:opacity-60`}
            />
          )}
        </Field>

        <div>
          <button
            type="submit"
            disabled={busy || currentPassword === ''}
            className="rounded-control bg-brand px-5 py-2.5 text-sm font-medium text-on-brand disabled:opacity-50"
          >
            {minutesValid === null ? 'Enviarme el código' : 'Enviar otro código'}
          </button>
        </div>
      </form>

      <form
        onSubmit={applyChange}
        className={`flex flex-col gap-5 rounded-panel border border-border bg-surface-raised p-6 ${
          minutesValid === null ? 'opacity-50' : ''
        }`}
      >
        <div className="flex flex-col gap-1">
          <h2 className="font-semibold tracking-tight">2. Escriba la nueva</h2>
          <p className="text-sm text-content-muted">
            {minutesValid === null
              ? 'Disponible una vez que reciba el código.'
              : `El código vence en ${minutesValid} minutos.`}
          </p>
        </div>

        <Field id="code" label="Código de verificación" error={errors.code}>
          {(describedBy) => (
            <input
              id="code"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={code}
              onChange={(event) => setCode(event.target.value.replace(/[^0-9]/g, ''))}
              aria-describedby={describedBy}
              disabled={minutesValid === null}
              required
              className={`${CONTROL_CLASS} font-mono text-lg tracking-[0.4em] tabular-nums`}
            />
          )}
        </Field>

        <Field
          id="newPassword"
          label="Nueva contraseña"
          hint={PASSWORD_HINT}
          error={errors.newPassword}
        >
          {(describedBy) => (
            <input
              id="newPassword"
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              aria-describedby={describedBy}
              disabled={minutesValid === null}
              required
              className={CONTROL_CLASS}
            />
          )}
        </Field>

        <Field id="confirmation" label="Repita la nueva contraseña" error={errors.confirmation}>
          {(describedBy) => (
            <input
              id="confirmation"
              type="password"
              autoComplete="new-password"
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
              aria-describedby={describedBy}
              disabled={minutesValid === null}
              required
              className={CONTROL_CLASS}
            />
          )}
        </Field>

        <div>
          <button
            type="submit"
            disabled={busy || minutesValid === null}
            className="rounded-control bg-brand px-5 py-2.5 text-sm font-medium text-on-brand disabled:opacity-50"
          >
            {busy ? 'Cambiando…' : 'Cambiar contraseña'}
          </button>
        </div>
      </form>
    </div>
  );
}
