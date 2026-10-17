'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useErrorFeedback } from '@/shared/errors/useErrorFeedback';
import { useErrorPresenter } from '@/shared/errors/useErrorPresenter';
import {
  draftFrom,
  readCorrection,
  submitCorrection,
  type Correction,
  type OpenedCorrection,
} from '../api/correction';
import {
  EMPTY_DRAFT,
  OTHER_ACTIVITY,
  readActivities,
  readCantons,
  type CatalogActivity,
  type CatalogCanton,
  type RegistrationDraft,
} from '../api/registration';
import { problemsInCorrection } from '../validation/correctionRules';
import type { FieldName, Problem } from '../validation/registrationRules';

export type CorrectionState = 'loading' | 'failed' | 'ready' | 'sent';

// What the link opens, and what sending it back leaves behind. The screen that
// is still waiting is the one that cannot say anything until the answer arrives,
// which is why the states are named rather than inferred from what is null.
export function useCorrectionForm(token: string) {
  const showError = useErrorFeedback();
  const present = useErrorPresenter();
  const translateErrors = useTranslations('errors');

  const [state, setState] = useState<CorrectionState>('loading');
  const [failure, setFailure] = useState<unknown>(null);
  const [opened, setOpened] = useState<OpenedCorrection | null>(null);
  const [draft, setDraft] = useState<RegistrationDraft>(EMPTY_DRAFT);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [checked, setChecked] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<{ field: string; message: string } | null>(null);
  const [cantons, setCantons] = useState<CatalogCanton[]>([]);
  const [activities, setActivities] = useState<CatalogActivity[]>([]);
  const [catalogsFailed, setCatalogsFailed] = useState(false);

  // The link is the whole screen: without what it opens there is nothing to
  // correct, so a failure of any kind is the answer rather than a detail.
  useEffect(() => {
    let cancelled = false;

    readCorrection(token)
      .then((correction) => {
        if (!cancelled) {
          setOpened(correction);
          setDraft(draftFrom(correction));
          setState('ready');
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setFailure(error);
          setState('failed');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  // The lists make the form quicker, not possible, so a failure here is said out
  // loud rather than left as a select that quietly offers nothing.
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

  const shown = useMemo(() => (checked ? problems : []), [checked, problems]);

  // The sentence for each code, written out so a code without one stops
  // compiling rather than rendering its own name. Only the codes the fields this
  // screen shows can raise are here.
  const sentenceFor = useCallback(
    (problem: Problem): string => {
      switch (problem.code) {
        case 'required':
          return translateErrors('required');
        case 'not_allowed':
          return translateErrors('not_allowed');
        case 'too_long':
          return translateErrors('too_long');
        default:
          return translateErrors('invalid_format');
      }
    },
    [translateErrors],
  );

  const named = useMemo(() => opened?.fields ?? [], [opened]);

  // What the field says under itself: what the person has just typed if the rules
  // refused it, and otherwise what the chamber said about it when it asked. The
  // chamber's reason is the reason the screen exists, so it stays until something
  // of their own takes its place.
  const errorFor = useCallback(
    (field: FieldName): string | undefined => {
      if (serverError !== null && serverError.field === field) {
        return serverError.message;
      }

      const found = shown.find((problem) => problem.field === field);

      if (found !== undefined) {
        return sentenceFor(found);
      }

      return named.find((correction: Correction) => correction.field === field)?.message;
    },
    [named, sentenceFor, serverError, shown],
  );

  const submit = useCallback(async () => {
    const found = problemsInCorrection(draft);

    setProblems(found);
    setChecked(true);

    if (found.length > 0) {
      return;
    }

    setSubmitting(true);
    setServerError(null);

    try {
      await submitCorrection(token, draft);
      setState('sent');
    } catch (error) {
      setServerError(showError(error));
    } finally {
      setSubmitting(false);
    }
  }, [draft, showError, token]);

  return {
    state,
    failureMessage: failure === null ? null : present(failure).message,
    reason: opened?.reason ?? null,
    named,
    applicationStatus: opened?.applicationStatus ?? null,
    reviewedAt: opened?.reviewedAt ?? null,
    reviewedBy: opened?.reviewedBy ?? null,
    draft,
    change,
    errorFor,
    otherActivity: OTHER_ACTIVITY,
    cantons,
    activities,
    catalogsFailed,
    submit,
    submitting,
    sent: { businessName: draft.businessName, email: draft.email },
  };
}
