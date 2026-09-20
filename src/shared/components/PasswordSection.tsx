'use client';

import { useState, type FormEvent } from 'react';
import { MESSAGES, messageForError } from '@/shared/config/messages';
import { requestResetLink } from '@/shared/auth/passwordReset';
import { focusFirstInvalid } from '@/shared/forms';
import { Field, CONTROL_CLASS } from './Field';
import { ToastStack } from './ToastStack';
import { useToasts } from './useToasts';
import { CheckCircleIcon } from './icons';

type PasswordSectionProps = {
  requestLink?: (currentPassword: string) => Promise<{ minutesValid: number }>;
};

// One section, the same for both roles. The new password is not typed here: it
// is set from a link sent to the address on the account, so a session somebody
// walked away from cannot be turned into a password change.
export function PasswordSection({ requestLink = requestResetLink }: PasswordSectionProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [error, setError] = useState<string | undefined>(undefined);
  const [sent, setSent] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const { toasts, show, dismiss } = useToasts();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // The button stays pressable so the form can say what is missing.
    if (currentPassword === '') {
      setError(MESSAGES.required);
      focusFirstInvalid(['currentPassword'], { currentPassword: MESSAGES.required });
      return;
    }

    setError(undefined);
    setBusy(true);

    try {
      const answer = await requestLink(currentPassword);

      setSent(answer.minutesValid);
      setCurrentPassword('');
    } catch (caught) {
      // A wrong current password belongs beside the field; anything else came
      // back from the API and belongs in the corner.
      const message = messageForError(caught, {
        fallback: MESSAGES.password_change_unavailable,
      });

      if (message === MESSAGES.invalid_current_password) {
        setError(message);
        focusFirstInvalid(['currentPassword'], { currentPassword: message });
      } else {
        show({ tone: 'problem', title: message });
      }
    } finally {
      setBusy(false);
    }
  }

  if (sent !== null) {
    return (
      <section className="flex flex-col gap-3 rounded-panel border border-support bg-surface-raised p-6">
        <CheckCircleIcon className="size-6 text-support" />
        <h2 className="text-lg font-semibold tracking-tight">Le enviamos el enlace</h2>
        <p className="max-w-prose text-sm text-content-muted">
          Revise el correo de su cuenta. El enlace vence en {sent} minutos y sirve una sola vez.
        </p>
        <button
          type="button"
          onClick={() => setSent(null)}
          className="w-fit text-sm font-medium text-brand hover:underline"
        >
          Pedir otro
        </button>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-5 rounded-panel border border-border bg-surface-raised p-6">
      <ToastStack toasts={toasts} onDismiss={dismiss} />

      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold tracking-tight">Contraseña</h2>
        <p className="max-w-prose text-sm text-content-muted">
          Confirme la contraseña que usa hoy y le enviaremos un enlace al correo de su cuenta para
          establecer una nueva.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="flex max-w-sm flex-col gap-4">
        <Field id="currentPassword" label="Contraseña actual" error={error} requirements={[]}>
          {(control) => (
            <input
              id="currentPassword"
              type="password"
              autoComplete="current-password"
              {...control}
              className={CONTROL_CLASS}
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
            />
          )}
        </Field>

        <button
          type="submit"
          disabled={busy}
          className="w-fit rounded-control bg-brand px-5 py-2.5 font-medium text-on-brand disabled:opacity-60"
        >
          {busy ? 'Enviando…' : 'Enviarme el enlace'}
        </button>
      </form>
    </section>
  );
}
