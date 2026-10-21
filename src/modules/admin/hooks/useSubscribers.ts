'use client';

import { useState } from 'react';
import type { Paginated } from '@/shared/api/pagination';
import { useErrorFeedback } from '@/shared/errors/useErrorFeedback';
import { usePagedList } from '@/shared/hooks/usePagedList';
import { saveFile } from '@/shared/utils/saveFile';
import {
  exportSubscribers,
  NO_SUBSCRIBER_FILTERS,
  readSubscribers,
  type Subscriber,
  type SubscriberFilters,
} from '../api/subscribers';

export function useSubscribers() {
  const showError = useErrorFeedback();
  const subscribers = usePagedList<SubscriberFilters, Paginated<Subscriber>>(
    readSubscribers,
    NO_SUBSCRIBER_FILTERS,
  );
  const [exporting, setExporting] = useState(false);

  // The export follows the filters on screen, but every page of them.
  async function exportAll() {
    setExporting(true);

    try {
      const { search, canton, district, status } = subscribers.query;
      saveFile(await exportSubscribers({ search, canton, district, status }), 'suscriptores.csv');
    } catch (error) {
      showError(error);
    } finally {
      setExporting(false);
    }
  }

  return { ...subscribers, exporting, exportAll };
}
