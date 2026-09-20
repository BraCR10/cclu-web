'use client';

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Field, CONTROL_CLASS } from '@/shared/components/Field';
import { ToastStack } from '@/shared/components/ToastStack';
import { useToasts } from '@/shared/components/useToasts';
import { formatMemberCode } from '@/shared/format';
import { WithContactIcon, contactPadding } from '@/shared/components/contactFields';
import { MESSAGES, messageForError, messageForFieldCode } from '@/shared/config/messages';
import { checkField } from '@/shared/config/memberRules';
import { IDENTIFICATION_TYPE_LABELS, MEMBER_TYPE_LABELS } from '@/modules/admin/applicationRules';
import {
  fetchCantons,
  fetchSectors,
  MEMBER_TYPES,
  type Canton,
  type Sector,
} from '../api/registration';
import {
  fetchOwnProfile,
  updateOwnProfile,
  type MemberProfile,
  type ProfileChanges,
} from '../api/profile';
import { MEMBER_STATE_LABELS, MEMBER_STATE_TONE } from '../memberLabels';

type ProfileFormProps = {
  loadProfile?: () => Promise<MemberProfile>;
  loadCantons?: () => Promise<Canton[]>;
  loadSectors?: () => Promise<Sector[]>;
  saveProfile?: (changes: ProfileChanges) => Promise<MemberProfile>;
};

type Draft = Record<string, string>;

const TEXT_FIELDS: {
  name: keyof ProfileChanges;
  label: string;
  hint?: string;
  required?: boolean;
}[] = [
  { name: 'businessName', label: 'Nombre comercial', required: true },
  { name: 'phone', label: 'Teléfono', required: true },
  { name: 'location', label: 'Ubicación', hint: 'Dirección o señas del local.', required: true },
  { name: 'whatsappNumber', label: 'WhatsApp' },
  { name: 'instagram', label: 'Instagram' },
  { name: 'facebook', label: 'Facebook' },
  { name: 'linkedin', label: 'LinkedIn' },
  { name: 'website', label: 'Sitio web', hint: 'Debe empezar con https://' },
];

type FieldErrors = Partial<Record<string, string>>;

// The same codes the API answers with, so a person reads one sentence whether
// the form caught the mistake or the server did.
function findFieldErrors(draft: Draft): FieldErrors {
  const errors: FieldErrors = {};

  for (const { name, required } of TEXT_FIELDS) {
    const code = checkField(name, draft[name] ?? '', { required: required ?? false });

    if (code !== null) {
      errors[name] = messageForFieldCode(name, code);
    }
  }

  const descriptionCode = checkField('businessDescription', draft.businessDescription ?? '', {
    required: true,
  });

  if (descriptionCode !== null) {
    errors.businessDescription = messageForFieldCode('businessDescription', descriptionCode);
  }

  return errors;
}

function toDraft(profile: MemberProfile): Draft {
  return {
    businessName: profile.businessName,
    businessDescription: profile.businessDescription,
    phone: profile.phone,
    location: profile.location,
    memberType: profile.memberType,
    canton: profile.canton?._id ?? '',
    sector: profile.sector?._id ?? '',
    whatsappNumber: profile.whatsappNumber ?? '',
    instagram: profile.instagram ?? '',
    facebook: profile.facebook ?? '',
    linkedin: profile.linkedin ?? '',
    website: profile.website ?? '',
  };
}

// Only what the person actually touched is sent. A field they never opened is
// not an instruction to overwrite it with the same value.
function changedFields(draft: Draft, original: Draft): ProfileChanges {
  const changes: Record<string, string> = {};

  for (const [name, value] of Object.entries(draft)) {
    if (value !== original[name]) {
      changes[name] = value;
    }
  }

  return changes as ProfileChanges;
}

function ReadOnly({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-xs font-medium tracking-wide text-content-muted uppercase">{label}</dt>
      <dd className="text-sm">{value}</dd>
    </div>
  );
}

export function ProfileForm({
  loadProfile = fetchOwnProfile,
  loadCantons = fetchCantons,
  loadSectors = fetchSectors,
  saveProfile = updateOwnProfile,
}: ProfileFormProps) {
  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [draft, setDraft] = useState<Draft>({});
  const [original, setOriginal] = useState<Draft>({});
  const [cantons, setCantons] = useState<Canton[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loadFailed, setLoadFailed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const { toasts, show, dismiss } = useToasts();

  const read = useCallback(async () => {
    const [found, cantonList, sectorList] = await Promise.all([
      loadProfile(),
      loadCantons(),
      loadSectors(),
    ]);

    return { found, cantonList, sectorList };
    // Read once when the screen opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const accept = useCallback((found: MemberProfile) => {
    setProfile(found);
    const next = toDraft(found);
    setDraft(next);
    setOriginal(next);
  }, []);

  useEffect(() => {
    let stillMounted = true;

    read()
      .then(({ found, cantonList, sectorList }) => {
        if (stillMounted) {
          accept(found);
          setCantons(cantonList);
          setSectors(sectorList);
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
  }, [read, accept]);

  function set(name: string, value: string) {
    setDraft((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const found = findFieldErrors(draft);
    setErrors(found);

    if (Object.keys(found).length > 0) {
      show({ tone: 'problem', title: MESSAGES.form_incomplete });
      return;
    }

    const changes = changedFields(draft, original);

    if (Object.keys(changes).length === 0) {
      show({ tone: 'info', title: MESSAGES.nothing_to_change });
      return;
    }

    setSaving(true);

    try {
      accept(await saveProfile(changes));
      show({ tone: 'success', title: 'Su perfil quedó actualizado' });
    } catch (caught) {
      show({
        tone: 'problem',
        title: 'No se pudo guardar',
        detail: messageForError(caught, {
          byStatus: { 400: 'form_incomplete' },
          fallback: MESSAGES.save_unavailable,
        }),
      });
    } finally {
      setSaving(false);
    }
  }

  if (loadFailed) {
    return (
      <p role="alert" className="rounded-panel border border-border bg-surface-raised p-6 text-sm">
        No fue posible cargar su perfil. Recargue la página para intentarlo de nuevo.
      </p>
    );
  }

  if (profile === null) {
    return <p className="text-sm text-content-muted">Cargando su perfil…</p>;
  }

  const state = MEMBER_STATE_LABELS[profile.state];

  return (
    <div className="flex flex-col gap-8">
      <ToastStack toasts={toasts} onDismiss={dismiss} />

      <section className="flex flex-col gap-5 rounded-panel border border-border bg-surface-raised p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold tracking-tight">Su afiliación</h2>
            <p className="text-sm text-content-muted">{state.detail}</p>
          </div>

          <span
            className={`rounded-pill px-3 py-1 text-xs font-medium ${MEMBER_STATE_TONE[profile.state]}`}
          >
            {state.label}
          </span>
        </div>

        {/* Changing any of these is a decision the chamber makes, not the member. */}
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <ReadOnly label="Correo electrónico" value={profile.email} />
          <ReadOnly
            label={IDENTIFICATION_TYPE_LABELS[profile.identificationType]}
            value={profile.identificationNumber}
          />
          <ReadOnly
            label="Código de agremiado"
            value={profile.memberCode ? formatMemberCode(profile.memberCode) : 'Aún no asignado'}
          />
          <ReadOnly
            label="Afiliado desde"
            value={new Date(profile.createdAt).toLocaleDateString('es-CR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          />
        </dl>
      </section>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-6 rounded-panel border border-border bg-surface-raised p-6"
      >
        <h2 className="text-lg font-semibold tracking-tight">Datos que puede actualizar</h2>

        <div className="grid gap-5 sm:grid-cols-2">
          {TEXT_FIELDS.map(({ name, label, hint }) => (
            <Field key={name} id={name} label={label} hint={hint} error={errors[name]}>
              {(control) => (
                <WithContactIcon field={name}>
                  <input
                    id={name}
                    value={draft[name] ?? ''}
                    onChange={(event) => set(name, event.target.value)}
                    {...control}
                    className={`${CONTROL_CLASS} w-full ${contactPadding(name)}`}
                  />
                </WithContactIcon>
              )}
            </Field>
          ))}

          <Field id="memberType" label="Tipo de afiliación">
            {(control) => (
              <select
                {...control}
                id="memberType"
                value={draft.memberType ?? ''}
                onChange={(event) => set('memberType', event.target.value)}
                className={CONTROL_CLASS}
              >
                {Object.values(MEMBER_TYPES).map((type) => (
                  <option key={type} value={type}>
                    {MEMBER_TYPE_LABELS[type]}
                  </option>
                ))}
              </select>
            )}
          </Field>

          <Field id="canton" label="Cantón">
            {(control) => (
              <select
                {...control}
                id="canton"
                value={draft.canton ?? ''}
                onChange={(event) => set('canton', event.target.value)}
                className={CONTROL_CLASS}
              >
                {cantons.map((canton) => (
                  <option key={canton._id} value={canton._id}>
                    {canton.name}, {canton.province}
                  </option>
                ))}
              </select>
            )}
          </Field>

          <Field id="sector" label="Sector">
            {(control) => (
              <select
                {...control}
                id="sector"
                value={draft.sector ?? ''}
                onChange={(event) => set('sector', event.target.value)}
                className={CONTROL_CLASS}
              >
                {sectors.map((sector) => (
                  <option key={sector._id} value={sector._id}>
                    {sector.name}
                  </option>
                ))}
              </select>
            )}
          </Field>
        </div>

        <Field
          id="businessDescription"
          label="Descripción del negocio"
          hint="Esto es lo que verá quien lo encuentre en el directorio."
        >
          {(control) => (
            <textarea
              id="businessDescription"
              value={draft.businessDescription ?? ''}
              onChange={(event) => set('businessDescription', event.target.value)}
              {...control}
              rows={4}
              maxLength={500}
              className={`${CONTROL_CLASS} resize-y`}
            />
          )}
        </Field>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="rounded-control bg-brand px-6 py-2.5 font-medium text-on-brand disabled:opacity-50"
          >
            {saving ? 'Guardando…' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </div>
  );
}
