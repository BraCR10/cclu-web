'use client';

import { useState, type FormEvent } from 'react';
import { ApiError } from '@/shared/api/request';
import { Field, CONTROL_CLASS } from '@/shared/components/Field';
import { ToastStack } from '@/shared/components/ToastStack';
import { useToasts } from '@/shared/components/useToasts';
import { BackLink } from '@/shared/components/BackLink';
import { CheckCircleIcon } from '@/shared/components/icons';
import { checkPassword } from '@/shared/config/memberRules';
import { MESSAGES, PASSWORD_HINT, messageForCode, messageForError } from '@/shared/config/messages';
import { focusFirstInvalid } from '@/shared/forms';
import { acceptAdministratorInvitation } from '../api/administrators';

type AdminInvitationFormProps = {
  invitationId: string;
  accept?: (
    invitationId: string,
    password: string,
  ) => Promise<{
    id: string;
    email: string;
    accountStatus: string;
  }>;
};

const FIELD_ORDER = ['newPassword', 'passwordConfirmation'];

export function AdminInvitationForm({
  invitationId,
  accept = acceptAdministratorInvitation,
}: AdminInvitationFormProps) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [state, setState] = useState<'open' | 'spent' | 'changed'>('open');
  const [busy, setBusy] = useState(false);
  const { toasts, show, dismiss } = useToasts();

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
      await accept(invitationId, newPassword);
      setState('changed');
    } catch (caught) {
      if (caught instanceof ApiError && caught.code === 'invalid_code') {
        setState('spent');
      } else if (caught instanceof ApiError && caught.field === 'password' && caught.code) {
        setErrors({ newPassword: messageForCode(caught.code) });
        focusFirstInvalid(['newPassword'], { newPassword: messageForCode(caught.code) });
      } else {
        show({
          tone: 'problem',
          title: messageForError(caught, { fallback: MESSAGES.password_change_unavailable }),
        });
      }
    } finally {
      setBusy(false);
    }
  }

  if (state === 'spent') {
    return (
      <div className="flex flex-col gap-4 rounded-panel border border-dashed border-border p-8">
        <h1 className="text-xl font-semibold tracking-tight">Este enlace ya no sirve</h1>
        <p className="max-w-prose text-sm text-content-muted">
          Las invitaciones vencen y sirven una sola vez. Pídale a quien le invitó que le envíe otra.
        </p>
        <BackLink href="/admin/login" label="Ir a iniciar sesión" />
      </div>
    );
  }

  if (state === 'changed') {
    return (
      <div className="flex flex-col gap-4 rounded-panel border border-support bg-surface-raised p-8">
        <CheckCircleIcon className="size-6 text-support" />
        <h1 className="text-xl font-semibold tracking-tight">Su cuenta quedó activada</h1>
        <p className="max-w-prose text-sm text-content-muted">
          Ya puede ingresar al panel con el correo de la invitación y la contraseña que estableció.
        </p>
        <BackLink href="/admin/login" label="Ir a iniciar sesión" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex max-w-sm flex-col gap-5">
      <ToastStack toasts={toasts} onDismiss={dismiss} />

      <p className="text-sm text-content-muted">
        Establezca la contraseña con la que ingresará al panel administrativo.
      </p>

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
