'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import type { AttachedFile } from '@/shared/components/FileField';
import { useErrorFeedback } from '@/shared/errors/useErrorFeedback';
import {
  EMPTY_DRAFT,
  OTHER_ACTIVITY,
  readActivities,
  readCantons,
  submitRegistration,
  uploadFile,
  type CatalogActivity,
  type CatalogCanton,
  type RegistrationDraft,
  type UploadPurpose,
} from '../api/registration';
import { problemsInStep, type FieldName, type Problem } from '../validation/registrationRules';

export type SentRegistration = {
  name: string;
  businessName: string;
  email: string;
  sentAt: Date;
};

export type FileKind = 'certification' | 'logo';

// What a step of the registration reads. The correction screen answers to the
// same rules and the same fields, and draws its own layout.
export type RegistrationStep = {
  draft: RegistrationDraft;
  change: <Field extends keyof RegistrationDraft>(
    field: Field,
    value: RegistrationDraft[Field],
  ) => void;
  changeConsent: (consent: keyof RegistrationDraft['consents'], given: boolean) => void;
  errorFor: (field: FieldName) => string | undefined;
  summary: Problem[];
  otherActivity: string;
  cantons: CatalogCanton[];
  activities: CatalogActivity[];
  uploading: Record<FileKind, boolean>;
  uploadError: { kind: FileKind; message: string } | null;
  attached: Partial<Record<FileKind, AttachedFile>>;
  selectFile: (kind: FileKind, file: File) => Promise<void>;
  removeFile: (kind: FileKind) => void;
};

export type BusinessStepForm = Pick<
  RegistrationStep,
  | 'draft'
  | 'change'
  | 'errorFor'
  | 'otherActivity'
  | 'cantons'
  | 'activities'
  | 'uploading'
  | 'uploadError'
  | 'attached'
  | 'selectFile'
  | 'removeFile'
>;

// A correction does not ask for consent again, so the step only offers it when
// the wizard is behind it.
export type ContactStepForm = Pick<RegistrationStep, 'draft' | 'change' | 'errorFor' | 'summary'> &
  Required<Pick<RegistrationStep, 'changeConsent'>>;

const TOTAL_STEPS = 3;
const FILE_FIELD_BY_KIND: Record<FileKind, 'certificationFileKey' | 'logoFileKey'> = {
  certification: 'certificationFileKey',
  logo: 'logoFileKey',
};
const PURPOSE_BY_KIND: Record<FileKind, UploadPurpose> = {
  certification: 'membership-certifications',
  logo: 'member-logos',
};

// The form uploads before the member exists, so the file needs an owner that is
// already a valid reference. It is drawn here and used for nothing else: the
// registration carries the key, and the key carries this.
export function createOwnerId(): string {
  const bytes = new Uint8Array(12);

  crypto.getRandomValues(bytes);

  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export function useRegistrationWizard() {
  const translateErrors = useTranslations('errors');
  const translate = useTranslations('registration');
  const showError = useErrorFeedback();

  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState<RegistrationDraft>(EMPTY_DRAFT);
  const [checked, setChecked] = useState(false);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [serverError, setServerError] = useState<{ field: string; message: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState<SentRegistration | null>(null);
  const [cantons, setCantons] = useState<CatalogCanton[]>([]);
  const [activities, setActivities] = useState<CatalogActivity[]>([]);
  const [catalogsFailed, setCatalogsFailed] = useState(false);
  const [uploading, setUploading] = useState<Record<FileKind, boolean>>({
    certification: false,
    logo: false,
  });
  const [uploadError, setUploadError] = useState<{ kind: FileKind; message: string } | null>(null);
  const [attached, setAttached] = useState<Partial<Record<FileKind, AttachedFile>>>({});

  const ownerId = useMemo(() => createOwnerId(), []);

  // The lists make the form quicker, not possible, except for the canton, which
  // is a reference the API has to resolve. A failure is said out loud rather
  // than left as a select that quietly offers nothing.
  useEffect(() => {
    let cancelled = false;

    Promise.all([readCantons(), readActivities()])
      .then(([cantonList, activityList]) => {
        if (!cancelled) {
          setCantons(cantonList);
          setActivities(activityList);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setCatalogsFailed(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const change = useCallback(
    <Field extends keyof RegistrationDraft>(field: Field, value: RegistrationDraft[Field]) => {
      setDraft((current) => ({ ...current, [field]: value }));
    },
    [],
  );

  const changeConsent = useCallback(
    (consent: keyof RegistrationDraft['consents'], given: boolean) => {
      setDraft((current) => ({
        ...current,
        consents: { ...current.consents, [consent]: given },
      }));
    },
    [],
  );

  const selectFile = useCallback(
    async (kind: FileKind, file: File) => {
      setUploading((current) => ({ ...current, [kind]: true }));
      setUploadError(null);

      try {
        const { key } = await uploadFile({
          file,
          purpose: PURPOSE_BY_KIND[kind],
          ownerId,
        });

        change(FILE_FIELD_BY_KIND[kind], key);
        setAttached((current) => ({
          ...current,
          [kind]: { name: file.name, sizeInBytes: file.size },
        }));
      } catch (error) {
        const presented = showError(error);

        setUploadError({
          kind,
          message: presented?.message ?? translateErrors('generic'),
        });
      } finally {
        setUploading((current) => ({ ...current, [kind]: false }));
      }
    },
    [change, ownerId, showError, translateErrors],
  );

  const removeFile = useCallback(
    (kind: FileKind) => {
      change(FILE_FIELD_BY_KIND[kind], '');
      setAttached((current) => ({ ...current, [kind]: undefined }));
      setUploadError(null);
    },
    [change],
  );

  // The sentence for each code, written out so a code without one stops
  // compiling rather than rendering its own name.
  const sentenceFor = useCallback(
    (problem: Problem): string => {
      switch (problem.code) {
        case 'required':
          return translateErrors('required');
        case 'not_allowed':
          return translateErrors('not_allowed');
        case 'too_long':
          return translateErrors('too_long');
        case 'invalid_format':
          return translateErrors('invalid_format');
        case 'email':
          return translate('stepThree.emailInvalid');
        case 'mismatch':
          return translate('stepThree.mismatch');
        case 'password':
          return translate('stepThree.passwordRules');
        default:
          return translateErrors('consents_required');
      }
    },
    [translate, translateErrors],
  );

  const shown = useMemo(() => (checked ? problems : []), [checked, problems]);

  const errorFor = useCallback(
    (field: FieldName): string | undefined => {
      if (serverError !== null && serverError.field === field) {
        return serverError.message;
      }

      const found = shown.find((problem) => problem.field === field);

      return found === undefined ? undefined : sentenceFor(found);
    },
    [serverError, sentenceFor, shown],
  );

  function goNext() {
    const found = problemsInStep(step, draft);

    setProblems(found);
    setChecked(true);
    setServerError(null);

    if (found.length === 0) {
      setStep(step + 1);
      setChecked(false);
    }
  }

  function goBack() {
    setStep((current) => Math.max(1, current - 1));
    setChecked(false);
    setProblems([]);
    setServerError(null);
  }

  async function submit() {
    const found = problemsInStep(TOTAL_STEPS, draft);

    setProblems(found);
    setChecked(true);

    if (found.length > 0) {
      return;
    }

    setSubmitting(true);
    setServerError(null);

    try {
      await submitRegistration(draft);

      setSent({
        name: draft.name,
        businessName: draft.businessName,
        email: draft.email,
        sentAt: new Date(),
      });
    } catch (error) {
      setServerError(showError(error));
    } finally {
      setSubmitting(false);
    }
  }

  return {
    step,
    totalSteps: TOTAL_STEPS,
    draft,
    change,
    changeConsent,
    otherActivity: OTHER_ACTIVITY,
    cantons,
    activities,
    catalogsFailed,
    errorFor,
    summary: shown,
    goNext,
    goBack,
    submit,
    submitting,
    sent,
    uploading,
    uploadError,
    attached,
    selectFile,
    removeFile,
  };
}
