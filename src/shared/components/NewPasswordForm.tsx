'use client';

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { checkPassword } from '@/shared/config/memberRules';
import { MESSAGES, PASSWORD_HINT, messageForCode, messageForError } from '@/shared/config/messages';
import { checkResetLink, completePasswordReset } from '@/shared/auth/passwordReset';
import { focusFirstInvalid } from '@/shared/forms';
import { Field, CONTROL_CLASS } from './Field';
import { ToastStack } from './ToastStack';
import { useToasts } from './useToasts';
import { BackLink } from './BackLink';
import { CheckCircleIcon } from './icons';

type NewPasswordFormProps = {
  token: string;
  check?: (token: string) => Promise<{ valid: true; minutesValid: number }>;
  complete?: (token: string, newPassword: string) => Promise<{ changed: true }>;
};

const FIELD_ORDER = ['newPassword', 'passwordConfirmation'];

export function NewPasswordForm({
  token,
  check = checkResetLink,
  complete = completePasswordReset,
}: NewPasswordFormProps) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [state, setState] = useState<'checking' | 'open' | 'spent' | 'changed'>('checking');
  const [busy, setBusy] = useState(false);
  const { toasts, show, dismiss } = useToasts();

  const read = useCallback(() => check(token), [check, token]);

  // Asked before the form is shown, so nobody fills in a password only to be
  // told the link had already expired.
  useEffect(() => {
    let stillMounted = true;

    read()
      .then(() => {
        if (stillMounted) {
          setState('open');
        }
      })
      .catch(() => {
        if (stillMounted) {
          setState('spent');
        }
      });

    return () => {
      stillMounted = false;
    };
  }, [read]);

  function findErrors(): Record<string, string> {
    const found: Record<string, string> = {};
    const code = checkPassword(newPassword);

    if (newPassword === '') {
      found.newPassword = MESSAGES.required;
    } else if (code !== null) {
      found.newPassword = messageForCode(code);
    }

    if (confirmation !== newPassword) {
      found.passwordConfirmation = MESSAGES.confirmation_mismatch;
    }

    return found;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const found = findErrors();
    setErrors(found);

    if (Object.keys(found).length > 0) {
      focusFirstInvalid(FIELD_ORDER, found);
      return;
    }

    setBusy(true);

    try {
      await complete(token, newPassword);
      setState('changed');
    } catch (caught) {
      show({
        tone: 'problem',
        title: messageForError(caught, { fallback: MESSAGES.password_change_unavailable }),
      });
      setBusy(false);
    }
  }

  if (state === 'checking') {
    return <p className="text-sm text-content-muted">Comprobando el enlace…</p>;
  }

  if (state === 'spent') {
    return (
      <div className="flex flex-col gap-4 rounded-panel border border-dashed border-border p-8">
        <h1 className="text-xl font-semibold tracking-tight">Este enlace ya no sirve</h1>
        <p className="max-w-prose text-sm text-content-muted">
          Los enlaces vencen y sirven una sola vez. Pida uno nuevo desde la pantalla de ingreso.
        </p>
        <BackLink href="/login" label="Ir a iniciar sesión" />
      </div>
    );
  }

  if (state === 'changed') {
    return (
      <div className="flex flex-col gap-4 rounded-panel border border-support bg-surface-raised p-8">
        <CheckCircleIcon className="size-6 text-support" />
        <h1 className="text-xl font-semibold tracking-tight">Su contraseña quedó cambiada</h1>
        <p className="max-w-prose text-sm text-content-muted">
          Ya puede ingresar con la nueva. El enlace que usó no vuelve a servir.
        </p>
        <BackLink href="/login" label="Ir a iniciar sesión" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex max-w-sm flex-col gap-5">
      <ToastStack toasts={toasts} onDismiss={dismiss} />

      <Field
        id="newPassword"
        label="Contraseña nueva"
        hint={PASSWORD_HINT}
        error={errors.newPassword}
        requirements={[]}
      >
        {(control) => (
          <input
            id="newPassword"
            type="password"
            autoComplete="new-password"
            {...control}
            className={CONTROL_CLASS}
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
          />
        )}
      </Field>

      <Field
        id="passwordConfirmation"
        label="Confirme la contraseña"
        error={errors.passwordConfirmation}
        requirements={[]}
      >
        {(control) => (
          <input
            id="passwordConfirmation"
            type="password"
            autoComplete="new-password"
            {...control}
            className={CONTROL_CLASS}
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
          />
        )}
      </Field>

      <button
        type="submit"
        disabled={busy}
        className="rounded-control bg-brand px-4 py-2.5 font-medium text-on-brand disabled:opacity-60"
      >
        {busy ? 'Guardando…' : 'Establecer la contraseña'}
      </button>
    </form>
  );
}
