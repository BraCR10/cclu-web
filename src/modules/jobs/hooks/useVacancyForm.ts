'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useToast } from '@/shared/components/useToast';
import { useErrorFeedback, type FieldError } from '@/shared/errors/useErrorFeedback';
import {
  createVacancy,
  readBranchOptions,
  type VacancyBranch,
  type VacancyDraft,
} from '../api/vacancies';

const EMPTY_DRAFT: VacancyDraft = {
  title: '',
  description: '',
  requirements: '',
  workday: '',
  howToApply: '',
  branch: '',
};

const REQUIRED: Array<keyof VacancyDraft> = [
  'title',
  'description',
  'workday',
  'howToApply',
  'branch',
];

// The fields a person left empty, checked before anything is sent so each one
// is named under its own input. The API checks the same again.
export function missingFields(draft: VacancyDraft): Array<keyof VacancyDraft> {
  return REQUIRED.filter((field) => draft[field].trim() === '');
}

export function useVacancyForm() {
  const translate = useTranslations('member.vacancies');
  const router = useRouter();
  const { showToast } = useToast();
  const showError = useErrorFeedback();
  const [draft, setDraft] = useState<VacancyDraft>(EMPTY_DRAFT);
  const [branches, setBranches] = useState<VacancyBranch[]>([]);
  const [errors, setErrors] = useState<Partial<Record<keyof VacancyDraft, string>>>({});
  const [sending, setSending] = useState(false);

  useEffect(() => {
    let cancelled = false;

    readBranchOptions()
      .then((options) => {
        if (!cancelled) {
          setBranches(options);
          // A member with one branch has nothing to choose.
          if (options.length === 1) {
            setDraft((current) => ({ ...current, branch: current.branch || options[0].id }));
          }
        }
      })
      // Without branches the select stays empty and the API names the field.
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  function change<Field extends keyof VacancyDraft>(field: Field, value: VacancyDraft[Field]) {
    setDraft((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  async function submit() {
    const missing = missingFields(draft);

    if (missing.length > 0) {
      setErrors(Object.fromEntries(missing.map((field) => [field, translate('form.required')])));
      return;
    }

    setSending(true);

    try {
      await createVacancy(draft);
      showToast({ tone: 'success', title: translate('published') });
      router.push('/member/vacancies');
    } catch (error) {
      const fieldError: FieldError | null = showError(error);

      if (fieldError !== null) {
        setErrors({ [fieldError.field]: fieldError.message });
      }
    } finally {
      setSending(false);
    }
  }

  return { draft, branches, errors, sending, change, submit };
}
