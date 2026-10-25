'use client';

import { useCallback, useState } from 'react';
import { useTranslations } from 'next-intl';
import { usePagedList } from '@/shared/hooks/usePagedList';
import { useToast } from '@/shared/components/useToast';
import { saveFile } from '@/shared/utils/saveFile';
import type { Paginated } from '@/shared/api/pagination';
import {
  exportMembers,
  readMembers,
  NO_MEMBER_FILTERS,
  type MemberFilters,
  type MemberRow,
} from '../api/members';

// The list is read from a filter object and a query, while usePagedList hands
// back one flat object. Defined here, outside the component, so its identity
// never changes and the list is not refetched on every render.
function readPage(query: MemberFilters & { search: string; page: number }) {
  const { search, page, accountStatus, memberType, plan } = query;

  return readMembers(
    {
      ...(accountStatus === undefined ? {} : { accountStatus }),
      ...(memberType === undefined ? {} : { memberType }),
      ...(plan === undefined ? {} : { plan }),
    },
    { page, search },
  );
}

export function useMembers() {
  const translate = useTranslations('admin.members');
  const { showToast } = useToast();
  const [exporting, setExporting] = useState(false);

  const list = usePagedList<MemberFilters, Paginated<MemberRow>>(readPage, NO_MEMBER_FILTERS);

  // The export answers every match, not the page on screen, so it is asked for
  // with the filters and search the list is holding.
  const exportAll = useCallback(async () => {
    setExporting(true);

    try {
      const { search, page, ...filters } = list.query;
      void page;

      saveFile(await exportMembers(filters, search), 'agremiados.csv');
    } catch {
      showToast({ tone: 'error', title: translate('exportFailed') });
    } finally {
      setExporting(false);
    }
  }, [list.query, showToast, translate]);

  return { ...list, exporting, exportAll };
}
