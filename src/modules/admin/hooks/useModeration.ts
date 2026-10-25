'use client';

import { useCallback, useState } from 'react';
import { useTranslations } from 'next-intl';
import { usePagedList } from '@/shared/hooks/usePagedList';
import { useToast } from '@/shared/components/useToast';
import { useErrorPresenter } from '@/shared/errors/useErrorPresenter';
import type { Paginated } from '@/shared/api/pagination';
import {
  NO_MODERATION_FILTERS,
  readModeration,
  restoreContent,
  takeContentDown,
  type ModeratedContent,
  type ModerationFilters,
  type ModerationKind,
} from '../api/moderation';

export type ModerationOutcome = { ok: true } | { ok: false; message: string };

// The tab is part of the address, so switching tabs is a different list rather
// than a filter on the same one.
export function useModeration(kind: ModerationKind) {
  const translate = useTranslations('admin.moderation');
  const { showToast } = useToast();
  const present = useErrorPresenter();
  const [saving, setSaving] = useState(false);

  const list = usePagedList<ModerationFilters, Paginated<ModeratedContent>>(
    useCallback(
      (query: ModerationFilters & { search: string; page: number }) => {
        const { search, page, status } = query;

        return readModeration(
          kind,
          { ...(status === undefined ? {} : { status }) },
          { page, search },
        );
      },
      [kind],
    ),
    NO_MODERATION_FILTERS,
  );

  // The answer is the updated row, so the list is reloaded rather than patched:
  // a taken-down item belongs in the other state's list, not in this one.
  const run = useCallback(
    async (write: () => Promise<ModeratedContent>, toast: string): Promise<ModerationOutcome> => {
      setSaving(true);

      try {
        await write();
        list.reload();
        showToast({ tone: 'success', title: toast });

        return { ok: true };
      } catch (error) {
        const shown = present(error);

        return { ok: false, message: shown.message };
      } finally {
        setSaving(false);
      }
    },
    [list, present, showToast],
  );

  const takeDown = useCallback(
    (contentId: string, reason: string) =>
      run(() => takeContentDown(kind, contentId, reason), translate('takenDownToast')),
    [kind, run, translate],
  );

  const restore = useCallback(
    (contentId: string) => run(() => restoreContent(kind, contentId), translate('restoredToast')),
    [kind, run, translate],
  );

  return { ...list, saving, takeDown, restore };
}
