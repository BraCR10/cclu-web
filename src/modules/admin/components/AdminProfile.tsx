'use client';

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Field, CONTROL_CLASS } from '@/shared/components/Field';
import { PasswordSection } from '@/shared/components/PasswordSection';
import { ToastStack } from '@/shared/components/ToastStack';
import { useToasts } from '@/shared/components/useToasts';
import { checkField } from '@/shared/config/memberRules';
import { MESSAGES, messageForError, messageForFieldCode } from '@/shared/config/messages';
import { focusFirstInvalid } from '@/shared/forms';
import {
  fetchOwnAdminProfile,
  updateOwnAdminName,
  type AdminProfile as Profile,
} from '../api/adminProfile';

type AdminProfileProps = {
  loadProfile?: () => Promise<Profile>;
  saveName?: (name: string) => Promise<Profile>;
};

function ReadOnly({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-xs font-medium tracking-widest text-content-muted uppercase">{label}</dt>
      <dd className="text-sm">{value}</dd>
    </div>
  );
}

// An administrator is a post at the chamber rather than a business, so the only
// thing here they decide is what to be called. The address and the role are
// set by whoever created the account.
export function AdminProfile({
  loadProfile = fetchOwnAdminProfile,
  saveName = updateOwnAdminName,
}: AdminProfileProps) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [name, setName] = useState('');
  const [error, setError] = useState<string | undefined>(undefined);
  const [loadFailed, setLoadFailed] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toasts, show, dismiss } = useToasts();

  const read = useCallback(() => loadProfile(), [loadProfile]);

  useEffect(() => {
    let stillMounted = true;

    read()
      .then((found) => {
        if (stillMounted) {
          setProfile(found);
          setName(found.name ?? '');
        }
      })
      .catch(() => {
        if (stillMounted) {
          setLoadFailed(true);
        }
      });

    return () => {
      stillMounted = false;
    };
  }, [read]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const code = checkField('name', name, { required: true });

    if (code !== null) {
      const message = messageForFieldCode('name', code);

      setError(message);
      focusFirstInvalid(['name'], { name: message });
      return;
    }

    if (name.trim() === (profile?.name ?? '')) {
      show({ tone: 'info', title: MESSAGES.nothing_to_change });
      return;
    }

    setError(undefined);
    setSaving(true);

    try {
      setProfile(await saveName(name.trim()));
      show({ tone: 'success', title: 'Su nombre quedó actualizado' });
    } catch (caught) {
      show({
        tone: 'problem',
        title: messageForError(caught, { fallback: MESSAGES.save_unavailable }),
      });
    } finally {
      setSaving(false);
    }
  }

  if (loadFailed) {
    return (
      <p role="alert" className="rounded-panel border border-border bg-surface-raised p-6 text-sm">
        No fue posible cargar su cuenta. Recargue la página para intentarlo de nuevo.
      </p>
    );
  }

  if (profile === null) {
    return <p className="text-sm text-content-muted">Cargando su cuenta…</p>;
  }

  return (
    <div className="flex flex-col gap-8">
      <ToastStack toasts={toasts} onDismiss={dismiss} />

      <section className="flex flex-col gap-5 rounded-panel border border-border bg-surface-raised p-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold tracking-tight">Su cuenta</h2>
          <p className="text-sm text-content-muted">
            El correo y el rol los fija la Cámara al crear la cuenta.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="flex max-w-sm flex-col gap-4">
          <Field
            id="name"
            label="Nombre"
            hint="Es como lo verán en el panel quienes trabajan con usted."
            error={error}
          >
            {(control) => (
              <input
                id="name"
                autoComplete="name"
                {...control}
                className={CONTROL_CLASS}
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            )}
          </Field>

          <button
            type="submit"
            disabled={saving}
            className="w-fit rounded-control bg-brand px-5 py-2.5 font-medium text-on-brand disabled:opacity-60"
          >
            {saving ? 'Guardando…' : 'Guardar'}
          </button>
        </form>

        <dl className="grid gap-5 border-t border-border pt-5 sm:grid-cols-2">
          <ReadOnly label="Correo" value={profile.email} />
          <ReadOnly label="Rol" value="Administrador" />
        </dl>
      </section>

      <PasswordSection />
    </div>
  );
}
