'use client';

import { useCallback } from 'react';
import { usePagedList } from '@/shared/hooks/usePagedList';
import { readApplications, type ApplicationPage, type ApplicationView } from '../api/applications';

export const APPLICATION_PAGE_SIZE = 10;

// Both lists are read the same way, so the tab decides which one is asked for and
// everything else — the search, the page, the debounce — is shared. `read` is
// memoised on the tab, so switching tabs refetches and typing does not.
export function useApplications(view: ApplicationView) {
  const read = useCallback(
    (query: { page: number; search: string }) => readApplications(view, query),
    [view],
  );

  return usePagedList<Record<string, never>, ApplicationPage>(read, {});
}
