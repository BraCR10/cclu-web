'use client';

import { useState, type FormEvent } from 'react';
import { checkField } from '@/shared/config/memberRules';
import { MESSAGES, messageForError, messageForFieldCode } from '@/shared/config/messages';
import { requestForgottenPassword } from '@/shared/auth/passwordReset';
import { focusFirstInvalid } from '@/shared/forms';
import { Field, CONTROL_CLASS } from './Field';
import { ToastStack } from './ToastStack';
import { useToasts } from './useToasts';
import { CheckCircleIcon } from './icons';

type ForgottenPasswordFormProps = {
  request?: (email: string) => Promise<{ minutesValid: number }>;
};

export function ForgottenPasswordForm({
  request = requestForgottenPassword,
}: ForgottenPasswordFormProps) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | undefined>(undefined);
  const [sent, setSent] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const { toasts, show, dismiss } = useToasts();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const code = checkField('email', email, { required: true });

    if (code !== null) {
      const message = messageForFieldCode('email', code);

      setError(message);
      focusFirstInvalid(['email'], { email: message });
      return;
    }

    setError(undefined);
    setBusy(true);

    try {
      const answer = await request(email.trim());

      setSent(answer.minutesValid);
    } catch (caught) {
      show({
        tone: 'problem',
        title: messageForError(caught, { fallback: MESSAGES.password_change_unavailable }),
      });
    } finally {
      setBusy(false);
    }
  }

  // The same answer whether or not the address is an account. Told apart, this
  // form becomes a way of asking the chamber who belongs to it.
  if (sent !== null) {
    return (
      <div className="flex max-w-prose flex-col gap-3 rounded-panel border border-support bg-surface-raised p-6">
        <CheckCircleIcon className="size-6 text-support" />
        <h2 className="text-lg font-semibold tracking-tight">Revise su correo</h2>
        <p className="text-sm text-content-muted">
          Si esa dirección corresponde a una cuenta, le enviamos un enlace para establecer una
          contraseña nueva. Vence en {sent} minutos y sirve una sola vez.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex max-w-sm flex-col gap-5">
      <ToastStack toasts={toasts} onDismiss={dismiss} />

      <Field
        id="email"
        label="Correo de su cuenta"
        hint="El mismo con el que se registró."
        error={error}
      >
        {(control) => (
          <input
            id="email"
            type="email"
            autoComplete="username"
            {...control}
            className={CONTROL_CLASS}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        )}
      </Field>

      <button
        type="submit"
        disabled={busy}
        className="rounded-control bg-brand px-4 py-2.5 font-medium text-on-brand disabled:opacity-60"
      >
        {busy ? 'Enviando…' : 'Enviarme el enlace'}
      </button>
    </form>
  );
}
