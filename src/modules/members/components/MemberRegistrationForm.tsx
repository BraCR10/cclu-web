'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { ApiError } from '@/shared/api/request';
import { CONTROL_CLASS, Field } from '@/shared/components/Field';
import {
  IDENTIFICATION_TYPES,
  MEMBER_TYPES,
  fetchCantons,
  fetchSectors,
  registerMember,
  type Canton,
  type MemberType,
  type Registration,
  type Sector,
} from '../api/registration';
import {
  LABELS,
  MINIMUM_PASSWORD_LENGTH,
  hasErrors,
  toRegistration,
  validateRegistration,
  type RegistrationDraft,
  type RegistrationErrors,
} from '../registrationRules';

const IDENTIFICATION_LABELS: Record<string, string> = {
  [IDENTIFICATION_TYPES.NATIONAL_ID]: 'Cédula física',
  [IDENTIFICATION_TYPES.LEGAL_ENTITY_ID]: 'Cédula jurídica',
  [IDENTIFICATION_TYPES.PASSPORT]: 'Pasaporte',
  [IDENTIFICATION_TYPES.DIMEX]: 'DIMEX',
};

const OPTIONAL_FIELDS: { name: keyof Registration; label: string }[] = [
  { name: 'whatsappNumber', label: 'WhatsApp' },
  { name: 'instagram', label: 'Instagram' },
  { name: 'facebook', label: 'Facebook' },
  { name: 'linkedin', label: 'LinkedIn' },
  { name: 'website', label: 'Página web' },
];

const SUBMIT_MESSAGES = {
  duplicate: 'No fue posible completar el registro. Comuníquese con la Cámara para continuar.',
  invalid: 'Revise los datos marcados e intente de nuevo.',
  unavailable: 'No fue posible enviar el registro. Intente de nuevo en unos momentos.',
};

function messageFor(error: unknown): string {
  if (error instanceof ApiError && error.status === 409) {
    return SUBMIT_MESSAGES.duplicate;
  }

  if (error instanceof ApiError && error.status === 400) {
    return SUBMIT_MESSAGES.invalid;
  }

  return SUBMIT_MESSAGES.unavailable;
}

type MemberRegistrationFormProps = {
  loadCantons?: () => Promise<Canton[]>;
  loadSectors?: () => Promise<Sector[]>;
  submit?: (registration: Registration) => Promise<{ id: string }>;
};

export function MemberRegistrationForm({
  loadCantons = fetchCantons,
  loadSectors = fetchSectors,
  submit = registerMember,
}: MemberRegistrationFormProps) {
  const [cantons, setCantons] = useState<Canton[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [draft, setDraft] = useState<RegistrationDraft>({
    memberType: MEMBER_TYPES.BUSINESS,
    identificationType: IDENTIFICATION_TYPES.LEGAL_ENTITY_ID,
  });
  const [errors, setErrors] = useState<RegistrationErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [registered, setRegistered] = useState(false);

  useEffect(() => {
    let mounted = true;

    Promise.all([loadCantons(), loadSectors()])
      .then(([loadedCantons, loadedSectors]) => {
        if (mounted) {
          setCantons(loadedCantons);
          setSectors(loadedSectors);
        }
      })
      .catch(() => {
        if (mounted) {
          setSubmitError(SUBMIT_MESSAGES.unavailable);
        }
      });

    return () => {
      mounted = false;
    };
    // Read once, when the form opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function set(field: keyof RegistrationDraft, value: string) {
    setDraft((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError(null);

    const found = validateRegistration(draft);
    setErrors(found);

    if (hasErrors(found)) {
      return;
    }

    setSubmitting(true);

    try {
      await submit(toRegistration(draft));
      setRegistered(true);
    } catch (caught) {
      setSubmitError(messageFor(caught));
      setSubmitting(false);
    }
  }

  if (registered) {
    return (
      <div role="status" className="flex flex-col gap-3 rounded-panel border border-border p-6">
        <span aria-hidden className="h-1 w-10 rounded-pill bg-support" />
        <h2 className="text-xl font-semibold tracking-tight">Registro enviado</h2>
        <p className="text-content-muted">
          La Cámara revisará su solicitud. Le escribiremos al correo que indicó cuando haya una
          respuesta.
        </p>
      </div>
    );
  }

  const memberType = (draft.memberType ?? MEMBER_TYPES.BUSINESS) as MemberType;
  const labels = LABELS[memberType];

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-8">
      <fieldset className="flex flex-col gap-3">
        <legend className="text-sm font-medium">Tipo de agremiado</legend>

        {Object.values(MEMBER_TYPES).map((type) => (
          <label key={type} className="flex items-center gap-3">
            <input
              type="radio"
              name="memberType"
              value={type}
              checked={memberType === type}
              onChange={(event) => set('memberType', event.target.value)}
            />
            {type === MEMBER_TYPES.BUSINESS ? 'Comercio' : 'Profesional independiente'}
          </label>
        ))}
      </fieldset>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="businessName" label={labels.name} error={errors.businessName}>
          {(describedBy) => (
            <input
              id="businessName"
              aria-describedby={describedBy}
              className={CONTROL_CLASS}
              value={draft.businessName ?? ''}
              onChange={(event) => set('businessName', event.target.value)}
            />
          )}
        </Field>

        <Field id="identificationType" label="Tipo de identificación">
          {() => (
            <select
              id="identificationType"
              className={CONTROL_CLASS}
              value={draft.identificationType ?? ''}
              onChange={(event) => set('identificationType', event.target.value)}
            >
              {Object.values(IDENTIFICATION_TYPES).map((type) => (
                <option key={type} value={type}>
                  {IDENTIFICATION_LABELS[type]}
                </option>
              ))}
            </select>
          )}
        </Field>

        <Field
          id="identificationNumber"
          label={labels.identification}
          error={errors.identificationNumber}
        >
          {(describedBy) => (
            <input
              id="identificationNumber"
              aria-describedby={describedBy}
              className={CONTROL_CLASS}
              value={draft.identificationNumber ?? ''}
              onChange={(event) => set('identificationNumber', event.target.value)}
            />
          )}
        </Field>

        <Field id="email" label="Correo electrónico" error={errors.email}>
          {(describedBy) => (
            <input
              id="email"
              type="email"
              autoComplete="email"
              aria-describedby={describedBy}
              className={CONTROL_CLASS}
              value={draft.email ?? ''}
              onChange={(event) => set('email', event.target.value)}
            />
          )}
        </Field>

        <Field id="phone" label="Teléfono" error={errors.phone}>
          {(describedBy) => (
            <input
              id="phone"
              aria-describedby={describedBy}
              className={CONTROL_CLASS}
              value={draft.phone ?? ''}
              onChange={(event) => set('phone', event.target.value)}
            />
          )}
        </Field>

        <Field id="canton" label="Cantón" error={errors.canton}>
          {(describedBy) => (
            <select
              id="canton"
              aria-describedby={describedBy}
              className={CONTROL_CLASS}
              value={draft.canton ?? ''}
              onChange={(event) => set('canton', event.target.value)}
            >
              <option value="">Seleccione</option>
              {cantons.map((canton) => (
                <option key={canton._id} value={canton._id}>
                  {canton.name}
                </option>
              ))}
            </select>
          )}
        </Field>

        <Field id="sector" label="Sector" error={errors.sector}>
          {(describedBy) => (
            <select
              id="sector"
              aria-describedby={describedBy}
              className={CONTROL_CLASS}
              value={draft.sector ?? ''}
              onChange={(event) => set('sector', event.target.value)}
            >
              <option value="">Seleccione</option>
              {sectors.map((sector) => (
                <option key={sector._id} value={sector._id}>
                  {sector.name}
                </option>
              ))}
            </select>
          )}
        </Field>

        <Field id="location" label="Ubicación" error={errors.location}>
          {(describedBy) => (
            <input
              id="location"
              aria-describedby={describedBy}
              className={CONTROL_CLASS}
              value={draft.location ?? ''}
              onChange={(event) => set('location', event.target.value)}
            />
          )}
        </Field>
      </div>

      <Field id="businessDescription" label="Descripción breve" error={errors.businessDescription}>
        {(describedBy) => (
          <textarea
            id="businessDescription"
            rows={3}
            aria-describedby={describedBy}
            className={CONTROL_CLASS}
            value={draft.businessDescription ?? ''}
            onChange={(event) => set('businessDescription', event.target.value)}
          />
        )}
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          id="password"
          label="Contraseña"
          hint={`Al menos ${MINIMUM_PASSWORD_LENGTH} caracteres.`}
          error={errors.password}
        >
          {(describedBy) => (
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              aria-describedby={describedBy}
              className={CONTROL_CLASS}
              value={draft.password ?? ''}
              onChange={(event) => set('password', event.target.value)}
            />
          )}
        </Field>

        <Field
          id="passwordConfirmation"
          label="Confirme la contraseña"
          error={errors.passwordConfirmation}
        >
          {(describedBy) => (
            <input
              id="passwordConfirmation"
              type="password"
              autoComplete="new-password"
              aria-describedby={describedBy}
              className={CONTROL_CLASS}
              value={draft.passwordConfirmation ?? ''}
              onChange={(event) => set('passwordConfirmation', event.target.value)}
            />
          )}
        </Field>
      </div>

      <details className="rounded-panel border border-border p-5">
        <summary className="cursor-pointer text-sm font-medium">Redes y contacto, opcional</summary>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          {OPTIONAL_FIELDS.map(({ name, label }) => (
            <Field key={name} id={name} label={label}>
              {() => (
                <input
                  id={name}
                  className={CONTROL_CLASS}
                  value={draft[name] ?? ''}
                  onChange={(event) => set(name, event.target.value)}
                />
              )}
            </Field>
          ))}
        </div>
      </details>

      {submitError !== null && (
        <p
          role="alert"
          className="rounded-control bg-highlight px-3 py-2 text-sm text-on-highlight"
        >
          {submitError}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="rounded-control bg-brand px-4 py-3 font-medium text-on-brand disabled:opacity-60"
      >
        {submitting ? 'Enviando…' : 'Enviar registro'}
      </button>
    </form>
  );
}
