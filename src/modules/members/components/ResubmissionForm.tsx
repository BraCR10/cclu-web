'use client';

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Field, CONTROL_CLASS } from '@/shared/components/Field';
import { AlertIcon, CheckCircleIcon } from '@/shared/components/icons';
import { checkField, messageForCode } from '@/shared/config/memberRules';
import { ApiError } from '@/shared/api/request';
import {
  fetchRejectedRegistration,
  resubmitRegistration,
  type Corrections,
  type RejectedRegistration,
} from '../api/resubmission';

type ResubmissionFormProps = {
  token: string;
  loadRegistration?: (token: string) => Promise<RejectedRegistration>;
  resubmit?: (token: string, corrections: Corrections) => Promise<{ applicationStatus: string }>;
};

const REQUIRED: (keyof Corrections)[] = [
  'businessName',
  'businessDescription',
  'phone',
  'location',
];

const OPTIONAL: (keyof Corrections)[] = [
  'whatsappNumber',
  'instagram',
  'facebook',
  'linkedin',
  'website',
];

const LABELS: Record<string, string> = {
  businessName: 'Nombre comercial',
  businessDescription: 'Descripción del negocio',
  phone: 'Teléfono',
  location: 'Ubicación',
  whatsappNumber: 'WhatsApp',
  instagram: 'Instagram',
  facebook: 'Facebook',
  linkedin: 'LinkedIn',
  website: 'Sitio web',
};

type Draft = Record<string, string>;

export function ResubmissionForm({
  token,
  loadRegistration = fetchRejectedRegistration,
  resubmit = resubmitRegistration,
}: ResubmissionFormProps) {
  const [registration, setRegistration] = useState<RejectedRegistration | null>(null);
  const [draft, setDraft] = useState<Draft>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [expired, setExpired] = useState(false);
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  const read = useCallback(() => loadRegistration(token), [loadRegistration, token]);

  useEffect(() => {
    let stillMounted = true;

    read()
      .then((found) => {
        if (!stillMounted) {
          return;
        }

        setRegistration(found);
        setDraft({
          businessName: found.businessName,
          businessDescription: found.businessDescription,
          phone: found.phone,
          location: found.location,
          whatsappNumber: found.whatsappNumber ?? '',
          instagram: found.instagram ?? '',
          facebook: found.facebook ?? '',
          linkedin: found.linkedin ?? '',
          website: found.website ?? '',
        });
      })
      .catch(() => {
        if (stillMounted) {
          setExpired(true);
        }
      });

    return () => {
      stillMounted = false;
    };
  }, [read]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const found: Record<string, string> = {};

    for (const field of [...REQUIRED, ...OPTIONAL]) {
      const code = checkField(field, draft[field] ?? '', { required: REQUIRED.includes(field) });

      if (code !== null) {
        found[field] = messageForCode(code);
      }
    }

    setErrors(found);

    if (Object.keys(found).length > 0) {
      return;
    }

    setBusy(true);

    try {
      const corrections = {} as Record<string, string>;

      for (const field of REQUIRED) {
        corrections[field] = (draft[field] ?? '').trim();
      }

      // An optional field left empty is sent as empty, which is how the API is
      // told to drop what was there before.
      for (const field of OPTIONAL) {
        corrections[field] = (draft[field] ?? '').trim();
      }

      await resubmit(token, corrections as unknown as Corrections);
      setSent(true);
    } catch (caught) {
      setErrors({
        form:
          caught instanceof ApiError && caught.code !== undefined
            ? messageForCode(caught.code)
            : 'No fue posible enviar la solicitud. Intente de nuevo en unos momentos.',
      });
    } finally {
      setBusy(false);
    }
  }

  if (expired) {
    return (
      <div className="flex flex-col items-start gap-3 rounded-panel border border-border bg-surface-raised p-8">
        <AlertIcon className="size-6 text-content-muted" />
        <p className="font-medium">Este enlace ya no sirve</p>
        <p className="max-w-md text-sm text-content-muted">
          Puede que haya vencido, que ya lo haya usado, o que su solicitud esté de nuevo en
          revisión. Comuníquese con la Cámara si necesita ayuda.
        </p>
      </div>
    );
  }

  if (sent) {
    return (
      <div
        role="status"
        className="animate-panel-in flex flex-col items-start gap-3 rounded-panel border border-support bg-surface-raised p-8"
      >
        <CheckCircleIcon className="size-6 text-support" />
        <p className="font-medium">Su solicitud quedó enviada de nuevo</p>
        <p className="max-w-md text-sm text-content-muted">
          La Cámara la revisará y le escribirá al mismo correo cuando haya una respuesta.
        </p>
      </div>
    );
  }

  if (registration === null) {
    return <p className="text-sm text-content-muted">Cargando su solicitud…</p>;
  }

  return (
    <div className="flex flex-col gap-8">
      {registration.reason !== null && (
        <div className="flex flex-col gap-2 rounded-panel bg-highlight p-5 text-on-highlight">
          <p className="text-xs font-medium tracking-wide uppercase">Motivo del rechazo</p>
          <p>{registration.reason}</p>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-6 rounded-panel border border-border bg-surface-raised p-6"
      >
        <div className="flex flex-col gap-1">
          <h2 className="font-semibold tracking-tight">Corrija lo indicado</h2>
          <p className="text-sm text-content-muted">
            Su solicitud se envía con el mismo correo, {registration.email}, que no se puede cambiar
            aquí.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          {[...REQUIRED, ...OPTIONAL]
            .filter((field) => field !== 'businessDescription')
            .map((field) => (
              <Field key={field} id={field} label={LABELS[field]} error={errors[field]}>
                {(describedBy) => (
                  <input
                    id={field}
                    value={draft[field] ?? ''}
                    onChange={(event) =>
                      setDraft((current) => ({ ...current, [field]: event.target.value }))
                    }
                    aria-describedby={describedBy}
                    className={CONTROL_CLASS}
                  />
                )}
              </Field>
            ))}
        </div>

        <Field
          id="businessDescription"
          label={LABELS.businessDescription}
          error={errors.businessDescription}
        >
          {(describedBy) => (
            <textarea
              id="businessDescription"
              value={draft.businessDescription ?? ''}
              onChange={(event) =>
                setDraft((current) => ({ ...current, businessDescription: event.target.value }))
              }
              aria-describedby={describedBy}
              rows={4}
              maxLength={500}
              className={`${CONTROL_CLASS} resize-y`}
            />
          )}
        </Field>

        {errors.form !== undefined && (
          <p
            role="alert"
            className="rounded-control bg-highlight px-4 py-3 text-sm text-on-highlight"
          >
            {errors.form}
          </p>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={busy}
            className="rounded-control bg-brand px-6 py-2.5 font-medium text-on-brand disabled:opacity-50"
          >
            {busy ? 'Enviando…' : 'Enviar de nuevo'}
          </button>
        </div>
      </form>
    </div>
  );
}
