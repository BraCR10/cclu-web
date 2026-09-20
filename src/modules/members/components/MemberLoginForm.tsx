'use client';

import { useState, type FormEvent } from 'react';
import { CONTROL_CLASS, Field } from '@/shared/components/Field';
import { signInMember, type MemberCredentials } from '../api/memberSession';
import { messageFor } from '../memberLabels';

type MemberLoginFormProps = {
  onSignedIn: () => void;
  signIn?: (credentials: MemberCredentials) => Promise<void>;
};

export function MemberLoginForm({ onSignedIn, signIn = signInMember }: MemberLoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await signIn({ email, password });
      onSignedIn();
    } catch (caught) {
      setError(messageFor(caught));
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex w-full flex-col gap-5">
      <Field id="email" label="Correo electrónico">
        {() => (
          <input
            id="email"
            type="email"
            autoComplete="username"
            required
            className={CONTROL_CLASS}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        )}
      </Field>

      <Field id="password" label="Contraseña">
        {() => (
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            className={CONTROL_CLASS}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        )}
      </Field>

      {error !== null && (
        <p
          role="alert"
          className="rounded-control bg-highlight px-3 py-2 text-sm text-on-highlight"
        >
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="rounded-control bg-brand px-4 py-2 font-medium text-on-brand disabled:opacity-60"
      >
        {submitting ? 'Ingresando…' : 'Ingresar'}
      </button>
    </form>
  );
}
