'use client';

import { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useToast } from '@/shared/components/useToast';
import { useErrorPresenter } from '@/shared/errors/useErrorPresenter';
import {
  requestEmailChange,
  requestPasswordLink,
  readProfile,
  saveProfile,
  type MemberProfile,
  type ProfileChanges,
} from '../api/profile';
import {
  readActivities,
  readCantons,
  type CatalogActivity,
  type CatalogCanton,
} from '../api/registration';

export type ProfileState = 'loading' | 'failed' | 'ready';

// A refusal that names a field belongs under that field; anything else belongs in
// a toast. The popup decides where, so this only says which it is.
export type SaveOutcome = { ok: true } | { ok: false; message: string; field?: string };

export function useMemberProfile() {
  const present = useErrorPresenter();
  const { showToast } = useToast();
  const translate = useTranslations('member.profile');

  const [state, setState] = useState<ProfileState>('loading');
  const [failure, setFailure] = useState<unknown>(null);
  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [cantons, setCantons] = useState<CatalogCanton[]>([]);
  const [activities, setActivities] = useState<CatalogActivity[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    readProfile()
      .then((member) => {
        if (!cancelled) {
          setProfile(member);
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
  }, []);

  // The lists make the popups quicker, not possible, except for the cantón and
  // the activity, which are references the API has to resolve.
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
          setCantons([]);
          setActivities([]);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const save = useCallback(
    async (changes: ProfileChanges): Promise<SaveOutcome> => {
      setSaving(true);

      try {
        setProfile(await saveProfile(changes));
        showToast({ tone: 'success', title: translate('saved') });

        return { ok: true };
      } catch (error) {
        const presented = present(error);

        if (presented.placement === 'field') {
          return { ok: false, field: presented.field, message: presented.message };
        }

        return { ok: false, message: presented.message };
      } finally {
        setSaving(false);
      }
    },
    [present, showToast, translate],
  );

  const askForEmailChange = useCallback(
    async (email: string): Promise<SaveOutcome> => {
      setSaving(true);

      try {
        await requestEmailChange(email);
        showToast({ tone: 'success', title: translate('emailLinkSent') });

        return { ok: true };
      } catch (error) {
        const presented = present(error);

        if (presented.placement === 'field') {
          return { ok: false, field: presented.field, message: presented.message };
        }

        return { ok: false, message: presented.message };
      } finally {
        setSaving(false);
      }
    },
    [present, showToast, translate],
  );

  // The link is the whole operation: nothing about the password changes here, so
  // what the screen says is that the link went out.
  const askForPasswordLink = useCallback(async () => {
    if (profile === null) {
      return;
    }

    try {
      await requestPasswordLink(profile.email);
      showToast({ tone: 'success', title: translate('passwordLinkSent') });
    } catch (error) {
      showToast({ tone: 'error', title: present(error).message });
    }
  }, [present, profile, showToast, translate]);

  return {
    state,
    failureMessage: failure === null ? null : present(failure).message,
    profile,
    cantons,
    activities,
    saving,
    save,
    askForEmailChange,
    askForPasswordLink,
  };
}
