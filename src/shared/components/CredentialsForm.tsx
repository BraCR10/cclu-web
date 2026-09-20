'use client';

import Link from 'next/link';
import { useState, type FormEvent, type ReactNode } from 'react';
import { CONTROL_CLASS, Field } from './Field';
import { MESSAGES, messageForError } from '@/shared/config/messages';
import { checkField } from '@/shared/config/memberRules';
import { ToastStack } from './ToastStack';
import { useToasts } from './useToasts';

type Credentials = { email: string; password: string };

// One screen for both roles: the chamber sends the same link whoever asked for
// it, and the address does not say which kind of account was behind it.
export const FORGOTTEN_PASSWORD_PATH = '/password/forgot';

type CredentialsFormProps = {
  onSignedIn: () => void;
  signIn: (credentials: Credentials) => Promise<void>;
  // What a failure means when the API named nothing more specific. A member is
  // told their application is pending; an administrator is told nothing.
  fallbackMessage?: string;
  footer?: ReactNode;
};

type FieldErrors = { email?: string; password?: string };

// A refusal the API did not explain must not become "your session lacks
// permission", which is the general meaning of 403 and is false here: nobody
// has a session yet. Only a reason the API names explicitly is shown.
export const SIGN_IN_STATUS = { 403: 'sign_in_unavailable' };

// Both roles sign in with the same two fields and the same rules, so this is
// written once. What differs is the request and what a refusal may reveal, and
// those arrive as props.
export function CredentialsForm({
  onSignedIn,
  signIn,
  fallbackMessage = MESSAGES.sign_in_unavailable,
  footer,
}: CredentialsFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const { toasts, show, dismiss } = useToasts();

  // The form is submitted with noValidate, so the browser's own bubble never
  // appears and this is the only thing that tells the person what is missing.
  function findFieldErrors(): FieldErrors {
    const found: FieldErrors = {};
    const emailCode = checkField('email', email, { required: true });

    if (emailCode !== null) {
      found.email = MESSAGES[emailCode];
    }

    if (password === '') {
      found.password = MESSAGES.required;
    }

    return found;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const found = findFieldErrors();
    setFieldErrors(found);

    // No banner here. Each field carries its own mark, and repeating it above
    // the form says less than the marks already do.
    if (Object.keys(found).length > 0) {
      return;
    }

    setSubmitting(true);

    try {
      await signIn({ email: email.trim(), password });
      onSignedIn();
    } catch (caught) {
      // The API refused, which is not something a field could have caught.
      // It belongs in the corner, not wedged into the form.
      show({
        tone: 'problem',
        title: messageForError(caught, { byStatus: SIGN_IN_STATUS, fallback: fallbackMessage }),
      });
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex w-full flex-col gap-5">
      <ToastStack toasts={toasts} onDismiss={dismiss} />

      <Field id="email" label="Correo electrónico" error={fieldErrors.email}>
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

      <Field id="password" label="Contraseña" error={fieldErrors.password}>
        {(control) => (
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            {...control}
            className={CONTROL_CLASS}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        )}
      </Field>

      <button
        type="submit"
        disabled={submitting}
        className="rounded-control bg-brand px-4 py-2 font-medium text-on-brand disabled:opacity-60"
      >
        {submitting ? 'Ingresando…' : 'Ingresar'}
      </button>

      <Link
        href={FORGOTTEN_PASSWORD_PATH}
        className="text-sm font-medium text-brand hover:underline"
      >
        ¿Olvidó su contraseña?
      </Link>

      {footer}
    </form>
  );
}
