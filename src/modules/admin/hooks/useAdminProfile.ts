'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useToast } from '@/shared/components/useToast';
import { useErrorPresenter } from '@/shared/errors/useErrorPresenter';
import {
  changeOwnPassword,
  readAdminProfile,
  updateAdminProfile,
  type AdminProfile,
} from '../api/profile';

export type ProfileState = 'loading' | 'failed' | 'ready';

export type ProfileOutcome = { ok: true } | { ok: false; message: string; field?: string };

export function useAdminProfile() {
  const translate = useTranslations('admin.profile');
  const { showToast } = useToast();
  const present = useErrorPresenter();
  // The presenter is rebuilt on every render; holding it in a ref keeps the read
  // from running again each time this screen changes.
  const presenter = useRef(present);

  useEffect(() => {
    presenter.current = present;
  });

  const [state, setState] = useState<ProfileState>('loading');
  const [failureMessage, setFailureMessage] = useState<string | undefined>(undefined);
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    readAdminProfile()
      .then((answer) => {
        if (!cancelled) {
          setProfile(answer);
          setState('ready');
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setFailureMessage(presenter.current(error).message);
          setState('failed');
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const saveName = useCallback(async (name: string): Promise<ProfileOutcome> => {
    setSaving(true);

    try {
      const saved = await updateAdminProfile({ name });
      setProfile(saved);

      return { ok: true };
    } catch (error) {
      const shown = presenter.current(error);

      return shown.placement === 'field'
        ? { ok: false, field: shown.field, message: shown.message }
        : { ok: false, message: shown.message };
    } finally {
      setSaving(false);
    }
  }, []);

  // The form is emptied by the caller on success, so a changed password is not
  // left sitting in a field.
  const savePassword = useCallback(
    async (currentPassword: string, newPassword: string): Promise<ProfileOutcome> => {
      setSaving(true);

      try {
        await changeOwnPassword({ currentPassword, newPassword });

        return { ok: true };
      } catch (error) {
        const shown = presenter.current(error);

        return shown.placement === 'field'
          ? { ok: false, field: shown.field, message: shown.message }
          : { ok: false, message: shown.message };
      } finally {
        setSaving(false);
      }
    },
    [],
  );

  const confirmName = useCallback(() => {
    showToast({ tone: 'success', title: translate('savedName') });
  }, [showToast, translate]);

  const confirmPassword = useCallback(() => {
    showToast({ tone: 'success', title: translate('savedPassword') });
  }, [showToast, translate]);

  return {
    state,
    failureMessage,
    profile,
    saving,
    saveName,
    savePassword,
    confirmName,
    confirmPassword,
  };
}
