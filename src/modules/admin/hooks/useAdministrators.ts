'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useToast } from '@/shared/components/useToast';
import { useErrorPresenter } from '@/shared/errors/useErrorPresenter';
import {
  inviteAdministrator,
  readAdministrators,
  resendInvitation,
  setAdministratorStatus,
  type Administrator,
} from '../api/administrators';

export type DirectoryState = 'loading' | 'failed' | 'ready';

export type DirectoryOutcome = { ok: true } | { ok: false; message: string; field?: string };

export function useAdministrators() {
  const translate = useTranslations('admin.administrators');
  const { showToast } = useToast();
  const present = useErrorPresenter();
  // Held in a ref: the presenter is a new function each render, and depending on
  // it would reload the directory on every change of the screen.
  const presenter = useRef(present);

  useEffect(() => {
    presenter.current = present;
  });

  const [state, setState] = useState<DirectoryState>('loading');
  const [failureMessage, setFailureMessage] = useState<string | undefined>(undefined);
  const [administrators, setAdministrators] = useState<Administrator[]>([]);
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => readAdministrators().then((answer) => answer.items), []);

  useEffect(() => {
    let cancelled = false;

    load()
      .then((items) => {
        if (!cancelled) {
          setAdministrators(items);
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
  }, [load]);

  // Every write answers with what the API now holds, so the row that changed is
  // the row the API answered with rather than a guess from the body.
  const run = useCallback(
    async (write: () => Promise<Administrator>, toast: string): Promise<DirectoryOutcome> => {
      setSaving(true);

      try {
        const saved = await write();

        setAdministrators((current) =>
          current.map((administrator) => (administrator.id === saved.id ? saved : administrator)),
        );
        showToast({ tone: 'success', title: toast });

        return { ok: true };
      } catch (error) {
        const shown = present(error);

        return shown.placement === 'field'
          ? { ok: false, field: shown.field, message: shown.message }
          : { ok: false, message: shown.message };
      } finally {
        setSaving(false);
      }
    },
    [present, showToast],
  );

  const invite = useCallback(
    async (draft: { name: string; email: string }): Promise<DirectoryOutcome> => {
      setSaving(true);

      try {
        const created = await inviteAdministrator(draft);

        setAdministrators((current) => [created, ...current]);
        showToast({ tone: 'success', title: translate('invited') });

        return { ok: true };
      } catch (error) {
        const shown = present(error);

        return shown.placement === 'field'
          ? { ok: false, field: shown.field, message: shown.message }
          : { ok: false, message: shown.message };
      } finally {
        setSaving(false);
      }
    },
    [present, showToast, translate],
  );

  const resend = useCallback(
    (adminId: string) => run(() => resendInvitation(adminId), translate('resent')),
    [run, translate],
  );

  const setStatus = useCallback(
    (adminId: string, status: 'active' | 'inactive') =>
      run(
        () => setAdministratorStatus(adminId, status),
        translate(status === 'active' ? 'reactivated' : 'inactivated'),
      ),
    [run, translate],
  );

  return {
    state,
    failureMessage,
    administrators,
    saving,
    invite,
    resend,
    setStatus,
  };
}
