'use client';

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Field, CONTROL_CLASS } from '@/shared/components/Field';
import { ToastStack } from '@/shared/components/ToastStack';
import { useToasts } from '@/shared/components/useToasts';
import { checkField } from '@/shared/config/memberRules';
import { MESSAGES, messageForError, messageForFieldCode } from '@/shared/config/messages';
import { focusFirstInvalid } from '@/shared/forms';
import {
  fetchAdministrators,
  inviteAdministrator,
  updateAdministrator,
  updateAdministratorStatus,
  type AdministratorChanges,
  type AdministratorRecord,
} from '../api/administrators';
import { AdministratorRow } from './AdministratorRow';

type AdministratorsPanelProps = {
  loadAdministrators?: () => Promise<AdministratorRecord[]>;
  invite?: (
    email: string,
    options: { expires: boolean; expiresInDays?: number },
  ) => Promise<{ sent: true; expires: boolean; daysValid?: number }>;
  saveChanges?: (
    administratorId: string,
    changes: AdministratorChanges,
  ) => Promise<AdministratorRecord>;
  saveStatus?: (
    administratorId: string,
    accountStatus: 'active' | 'suspended',
  ) => Promise<AdministratorRecord>;
};

const DEFAULT_DAYS = '7';

export function AdministratorsPanel({
  loadAdministrators = fetchAdministrators,
  invite = inviteAdministrator,
  saveChanges = updateAdministrator,
  saveStatus = updateAdministratorStatus,
}: AdministratorsPanelProps) {
  const [administrators, setAdministrators] = useState<AdministratorRecord[] | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [email, setEmail] = useState('');
  const [expires, setExpires] = useState(false);
  const [days, setDays] = useState(DEFAULT_DAYS);
  const [inviteErrors, setInviteErrors] = useState<{ email?: string; days?: string }>({});
  const [inviting, setInviting] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(true);
  const { toasts, show, dismiss } = useToasts();

  const notify = useCallback(
    (tone: 'success' | 'info' | 'problem', title: string, detail?: string) =>
      show({ tone, title, detail }),
    [show],
  );

  const read = useCallback(() => loadAdministrators(), [loadAdministrators]);

  useEffect(() => {
    let stillMounted = true;

    read()
      .then((found) => {
        if (stillMounted) {
          setAdministrators(found);
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

  function replaceAdministrator(updated: AdministratorRecord) {
    setAdministrators((current) =>
      current === null
        ? current
        : current.map((entry) => (entry.id === updated.id ? updated : entry)),
    );
  }

  async function handleInviteSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const found: { email?: string; days?: string } = {};
    const emailCode = checkField('email', email, { required: true });

    if (emailCode !== null) {
      found.email = messageForFieldCode('email', emailCode);
    }

    const parsedDays = Number(days);

    if (expires && (!Number.isFinite(parsedDays) || parsedDays <= 0)) {
      found.days = 'Indique un número de días mayor que cero.';
    }

    setInviteErrors(found);

    if (Object.keys(found).length > 0) {
      focusFirstInvalid(['email', 'days'], found);
      return;
    }

    setInviting(true);

    try {
      const result = await invite(email.trim(), {
        expires,
        ...(expires ? { expiresInDays: parsedDays } : {}),
      });

      setEmail('');
      setDays(DEFAULT_DAYS);
      show({
        tone: 'success',
        title: `Se envió la invitación a ${email.trim()}`,
        detail: result.expires ? `Vence en ${result.daysValid} días.` : 'Sin fecha de vencimiento.',
      });

      // The new account appears in the list as soon as it was created.
      read()
        .then(setAdministrators)
        .catch(() => undefined);
    } catch (caught) {
      show({
        tone: 'problem',
        title: messageForError(caught, { fallback: MESSAGES.save_unavailable }),
      });
    } finally {
      setInviting(false);
    }
  }

  if (loadFailed) {
    return (
      <div className="flex flex-col items-start gap-4 rounded-panel border border-border bg-surface-raised p-6">
        <p role="alert" className="text-sm">
          No fue posible cargar los administradores.
        </p>
        <button
          type="button"
          onClick={() => {
            setLoadFailed(false);
            setAdministrators(null);
            read()
              .then(setAdministrators)
              .catch(() => setLoadFailed(true));
          }}
          className="rounded-control bg-brand px-4 py-2 text-sm font-medium text-on-brand"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (administrators === null) {
    return <p className="text-sm text-content-muted">Cargando administradores…</p>;
  }

  return (
    <div className="flex flex-col gap-8">
      <ToastStack toasts={toasts} onDismiss={dismiss} />

      {inviteOpen && (
        <section className="flex flex-col gap-5 rounded-panel border border-border bg-surface-raised p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-1">
              <h2 className="text-lg font-semibold tracking-tight">Invitar administrador</h2>
              <p className="max-w-prose text-sm text-content-muted">
                La persona recibe un correo con un enlace para establecer su contraseña y activar su
                cuenta.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setInviteOpen(false)}
              className="shrink-0 rounded-control px-3 py-2 text-sm font-medium text-content-muted transition-colors hover:text-content"
            >
              Cancelar
            </button>
          </div>

          <form onSubmit={handleInviteSubmit} noValidate className="flex flex-col gap-5">
            <div className="grid gap-5 lg:grid-cols-[1fr_auto]">
              <Field
                id="invite-email"
                label="Correo electrónico"
                hint="La dirección con la que trabajará esta persona."
                error={inviteErrors.email}
              >
                {(control) => (
                  <input
                    id="invite-email"
                    type="email"
                    autoComplete="email"
                    {...control}
                    className={CONTROL_CLASS}
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                  />
                )}
              </Field>

              <div className="flex flex-col gap-3">
                <label className="flex items-center gap-3 text-sm font-medium">
                  <input
                    type="checkbox"
                    checked={expires}
                    onChange={(event) => setExpires(event.target.checked)}
                    className="size-4 rounded border-border"
                  />
                  La invitación vence
                </label>

                {expires && (
                  <Field id="invite-days" label="Días de validez" error={inviteErrors.days}>
                    {(control) => (
                      <input
                        id="invite-days"
                        type="number"
                        min="1"
                        {...control}
                        className={CONTROL_CLASS}
                        value={days}
                        onChange={(event) => setDays(event.target.value)}
                      />
                    )}
                  </Field>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={inviting}
              className="w-fit rounded-control bg-brand px-5 py-2.5 font-medium text-on-brand disabled:opacity-60"
            >
              {inviting ? 'Enviando…' : 'Enviar invitación'}
            </button>
          </form>
        </section>
      )}

      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold tracking-tight">
              Administradores creados por usted
            </h2>
            <p className="text-sm text-content-muted">
              {administrators.length === 0
                ? 'Todavía no ha invitado a nadie.'
                : `${administrators.length} ${administrators.length === 1 ? 'cuenta' : 'cuentas'} creada${administrators.length === 1 ? '' : 's'}.`}
            </p>
          </div>

          {!inviteOpen && (
            <button
              type="button"
              onClick={() => setInviteOpen(true)}
              className="rounded-control bg-brand px-5 py-2.5 font-medium text-on-brand"
            >
              Invitar administrador
            </button>
          )}
        </div>

        {administrators.length === 0 ? (
          <div className="rounded-panel border border-dashed border-border p-12 text-center">
            <p className="font-medium">No hay administradores todavía.</p>
            <p className="mt-2 text-sm text-content-muted">
              Use el botón «Invitar administrador» para enviar la primera invitación.
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-4">
            {administrators.map((administrator) => (
              <li key={administrator.id}>
                <AdministratorRow
                  administrator={administrator}
                  onUpdated={replaceAdministrator}
                  notify={notify}
                  saveChanges={saveChanges}
                  saveStatus={saveStatus}
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
