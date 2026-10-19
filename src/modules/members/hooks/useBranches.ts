'use client';

import { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useToast } from '@/shared/components/useToast';
import { useErrorPresenter } from '@/shared/errors/useErrorPresenter';
import {
  createBranch,
  deleteBranch,
  readBranches,
  updateBranch,
  type Branch,
  type BranchDraft,
} from '../api/branches';
import {
  readActivities,
  readCantons,
  type CatalogActivity,
  type CatalogCanton,
} from '../api/registration';

export type BranchesState = 'loading' | 'failed' | 'ready';

// A refusal that names a field belongs under that field; anything else belongs in
// a toast. The popup decides where, so this only says which it is.
export type BranchOutcome = { ok: true } | { ok: false; message: string; field?: string };

export function useBranches() {
  const present = useErrorPresenter();
  const { showToast } = useToast();
  const translate = useTranslations('member.branches');

  const [state, setState] = useState<BranchesState>('loading');
  const [failureMessage, setFailureMessage] = useState<string | undefined>(undefined);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [cantons, setCantons] = useState<CatalogCanton[]>([]);
  const [activities, setActivities] = useState<CatalogActivity[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    Promise.all([readBranches(), readCantons(), readActivities()])
      .then(([list, cantonList, activityList]) => {
        if (!cancelled) {
          setBranches(list.items);
          setCantons(cantonList);
          setActivities(activityList);
          setState('ready');
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setFailureMessage(present(error).message);
          setState('failed');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [present]);

  // Every write answers with what the API now holds, so the list never has to be
  // guessed at from the body that was sent.
  const run = useCallback(
    async (write: () => Promise<unknown>, toast: string): Promise<BranchOutcome> => {
      setSaving(true);

      try {
        await write();
        showToast({ tone: 'success', title: toast });

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
    [present, showToast],
  );

  const add = useCallback(
    (draft: BranchDraft) =>
      run(async () => {
        await createBranch(draft);
        setBranches((await readBranches()).items);
      }, translate('added')),
    [run, translate],
  );

  const edit = useCallback(
    (branchId: string, changes: Partial<BranchDraft>) =>
      run(async () => {
        const updated = await updateBranch(branchId, changes);
        setBranches((current) =>
          current.map((branch) => (branch.id === updated.id ? updated : branch)),
        );
      }, translate('saved')),
    [run, translate],
  );

  const close = useCallback(
    (branchId: string) =>
      run(async () => {
        setBranches((await deleteBranch(branchId)).items);
      }, translate('closed')),
    [run, translate],
  );

  return {
    state,
    failureMessage,
    branches,
    cantons,
    activities,
    saving,
    add,
    edit,
    close,
  };
}
