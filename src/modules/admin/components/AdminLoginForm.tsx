'use client';

import { useState, type FormEvent } from 'react';
import { ApiError } from '@/shared/api/request';
import { signInAdmin, type AdminCredentials } from '../api/adminSession';

const MESSAGES = {
  invalid: 'Correo o contraseña incorrectos.',
  tooManyAttempts: 'Demasiados intentos. Espere unos minutos e intente de nuevo.',
  unavailable: 'No fue posible iniciar sesión. Intente de nuevo en unos momentos.',
};

// The message never says whether the address is an account. Saying so would
// hand someone half of what they need, and an administrator account is the one
// worth guessing at.
function messageFor(error: unknown): string {
  if (error instanceof ApiError && error.status === 401) {
    return MESSAGES.invalid;
  }

  if (error instanceof ApiError && error.status === 429) {
    return MESSAGES.tooManyAttempts;
  }

  return MESSAGES.unavailable;
}

type AdminLoginFormProps = {
  onSignedIn: () => void;
  signIn?: (credentials: AdminCredentials) => Promise<void>;
};

export function AdminLoginForm({ onSignedIn, signIn = signInAdmin }: AdminLoginFormProps) {
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
      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="text-sm font-medium">
          Correo electrónico
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="rounded-control border border-border bg-surface-raised px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-brand"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="password" className="text-sm font-medium">
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="rounded-control border border-border bg-surface-raised px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-brand"
        />
      </div>

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
