'use client';

import { useState, type FormEvent } from 'react';
import { CONTROL_CLASS, Field } from '@/shared/components/Field';
import { CharacterCount } from '@/shared/components/CharacterCount';
import { checkField } from '@/shared/config/memberRules';
import { messageForError, messageForFieldCode, MESSAGES } from '@/shared/config/messages';
import { focusFirstInvalid } from '@/shared/forms';
import {
  createJob as createJobApi,
  updateJob as updateJobApi,
  type Job,
  type JobChanges,
} from '../api/jobs';
import { CONTRACT_TYPES, CONTRACT_TYPE_LABELS, type ContractType } from '../jobsRules';

type JobFormProps = {
  job?: Job;
  onSaved: (job: Job) => void;
  onCancel?: () => void;
  create?: (changes: JobChanges) => Promise<Job>;
  update?: (id: string, changes: JobChanges) => Promise<Job>;
};

type Draft = {
  title: string;
  description: string;
  requirements: string;
  howToApply: string;
  contractType: ContractType;
  location: string;
  contactEmail: string;
  contactPhone: string;
};

function toDraft(job?: Job): Draft {
  return {
    title: job?.title ?? '',
    description: job?.description ?? '',
    requirements: job?.requirements ?? '',
    howToApply: job?.howToApply ?? '',
    contractType: job?.contractType ?? CONTRACT_TYPES.FULL_TIME,
    location: job?.location ?? '',
    contactEmail: job?.contactEmail ?? '',
    contactPhone: job?.contactPhone ?? '',
  };
}

type FieldErrors = Partial<Record<string, string>>;

// The draft's own keys double as the rule name where the two happen to match,
// and as the DOM id every Field below is given: focusFirstInvalid finds a
// refused control by that id, and the two must agree.
const REQUIRED_FIELDS = [
  { name: 'title', ruleField: 'jobTitle' },
  { name: 'description', ruleField: 'jobDescription' },
  { name: 'requirements', ruleField: 'jobRequirements' },
  { name: 'howToApply', ruleField: 'jobHowToApply' },
] as const;

const OPTIONAL_FIELDS = ['location', 'contactEmail', 'contactPhone'] as const;

function findErrors(draft: Draft): FieldErrors {
  const errors: FieldErrors = {};

  for (const { name, ruleField } of REQUIRED_FIELDS) {
    const code = checkField(ruleField, draft[name], { required: true });

    if (code !== null) {
      errors[name] = messageForFieldCode(ruleField, code);
    }
  }

  for (const name of OPTIONAL_FIELDS) {
    const code = checkField(name, draft[name], { required: false });

    if (code !== null) {
      errors[name] = messageForFieldCode(name, code);
    }
  }

  return errors;
}

export function JobForm({
  job,
  onSaved,
  onCancel,
  create = createJobApi,
  update = updateJobApi,
}: JobFormProps) {
  const [draft, setDraft] = useState<Draft>(toDraft(job));
  const [errors, setErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);

  function set<K extends keyof Draft>(name: K, value: Draft[K]) {
    setDraft((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFailure(null);

    const found = findErrors(draft);
    setErrors(found);

    if (Object.keys(found).length > 0) {
      focusFirstInvalid([...REQUIRED_FIELDS.map(({ name }) => name), ...OPTIONAL_FIELDS], found);
      return;
    }

    const changes: JobChanges = {
      title: draft.title.trim(),
      description: draft.description.trim(),
      requirements: draft.requirements.trim(),
      howToApply: draft.howToApply.trim(),
      contractType: draft.contractType,
      location: draft.location.trim(),
      contactEmail: draft.contactEmail.trim(),
      contactPhone: draft.contactPhone.trim(),
    };

    setSaving(true);

    try {
      onSaved(job ? await update(job.id, changes) : await create(changes));
    } catch (caught) {
      setFailure(
        messageForError(caught, {
          byStatus: { 400: 'form_incomplete' },
          fallback: MESSAGES.save_unavailable,
        }),
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-5 rounded-panel border border-border bg-surface-raised p-6"
    >
      <Field id="title" label="Puesto" error={errors.title}>
        {(control) => (
          <input
            {...control}
            id="title"
            value={draft.title}
            onChange={(event) => set('title', event.target.value)}
            className={`${CONTROL_CLASS} w-full`}
          />
        )}
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="contractType" label="Jornada">
          {(control) => (
            <select
              {...control}
              id="contractType"
              value={draft.contractType}
              onChange={(event) => set('contractType', event.target.value as ContractType)}
              className={CONTROL_CLASS}
            >
              {Object.values(CONTRACT_TYPES).map((type) => (
                <option key={type} value={type}>
                  {CONTRACT_TYPE_LABELS[type]}
                </option>
              ))}
            </select>
          )}
        </Field>

        <Field id="location" label="Ubicación" error={errors.location}>
          {(control) => (
            <input
              {...control}
              id="location"
              value={draft.location}
              onChange={(event) => set('location', event.target.value)}
              className={`${CONTROL_CLASS} w-full`}
            />
          )}
        </Field>
      </div>

      <Field id="description" label="Descripción" error={errors.description}>
        {(control) => (
          <div className="flex flex-col gap-1.5">
            <textarea
              id="description"
              value={draft.description}
              onChange={(event) => set('description', event.target.value)}
              {...control}
              rows={5}
              maxLength={2000}
              className={`${CONTROL_CLASS} resize-y`}
            />
            <CharacterCount field="jobDescription" value={draft.description} />
          </div>
        )}
      </Field>

      <Field id="requirements" label="Requisitos" error={errors.requirements}>
        {(control) => (
          <div className="flex flex-col gap-1.5">
            <textarea
              id="requirements"
              value={draft.requirements}
              onChange={(event) => set('requirements', event.target.value)}
              {...control}
              rows={4}
              maxLength={2000}
              className={`${CONTROL_CLASS} resize-y`}
            />
            <CharacterCount field="jobRequirements" value={draft.requirements} />
          </div>
        )}
      </Field>

      <Field
        id="howToApply"
        label="Cómo aplicar"
        hint="Indique los pasos que debe seguir la persona interesada."
        error={errors.howToApply}
      >
        {(control) => (
          <div className="flex flex-col gap-1.5">
            <textarea
              id="howToApply"
              value={draft.howToApply}
              onChange={(event) => set('howToApply', event.target.value)}
              {...control}
              rows={3}
              maxLength={1000}
              className={`${CONTROL_CLASS} resize-y`}
            />
            <CharacterCount field="jobHowToApply" value={draft.howToApply} />
          </div>
        )}
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          id="contactEmail"
          label="Correo de contacto"
          hint="Si lo deja vacío, se usará el correo de su perfil."
          error={errors.contactEmail}
        >
          {(control) => (
            <input
              {...control}
              id="contactEmail"
              value={draft.contactEmail}
              onChange={(event) => set('contactEmail', event.target.value)}
              className={`${CONTROL_CLASS} w-full`}
            />
          )}
        </Field>

        <Field id="contactPhone" label="Teléfono de contacto" error={errors.contactPhone}>
          {(control) => (
            <input
              {...control}
              id="contactPhone"
              value={draft.contactPhone}
              onChange={(event) => set('contactPhone', event.target.value)}
              className={`${CONTROL_CLASS} w-full`}
            />
          )}
        </Field>
      </div>

      {failure !== null && (
        <p role="alert" className="text-sm text-danger">
          {failure}
        </p>
      )}

      <div className="flex justify-end gap-3">
        {onCancel !== undefined && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-control border border-border px-6 py-2.5 font-medium"
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          disabled={saving}
          className="rounded-control bg-brand px-6 py-2.5 font-medium text-on-brand disabled:opacity-50"
        >
          {saving ? 'Guardando…' : job ? 'Guardar cambios' : 'Publicar vacante'}
        </button>
      </div>
    </form>
  );
}
