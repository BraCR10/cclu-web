'use client';

import { useEffect, useState } from 'react';
import { readAdminPayments, type AdminPaymentList, type PaymentStatus } from '../api/payments';

const SEARCH_PAUSE_IN_MILLISECONDS = 300;

type Query = { status: PaymentStatus; search: string; page: number; version: number };
type Answer = { query: Query; list: AdminPaymentList | null; failed: boolean };

export function useAdminPayments() {
  const [query, setQuery] = useState<Query>({
    status: 'pending_review',
    search: '',
    page: 1,
    version: 0,
  });
  const [searchDraft, setSearchDraft] = useState('');
  const [answer, setAnswer] = useState<Answer | null>(null);

  useEffect(() => {
    let cancelled = false;

    readAdminPayments(query.status, query.search, query.page)
      .then((list) => {
        if (!cancelled) {
          setAnswer({ query, list, failed: false });
        }
      })
      .catch(() => {
        if (!cancelled) {
          setAnswer({ query, list: null, failed: true });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [query]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setQuery((current) =>
        current.search === searchDraft ? current : { ...current, search: searchDraft, page: 1 },
      );
    }, SEARCH_PAUSE_IN_MILLISECONDS);

    return () => clearTimeout(timer);
  }, [searchDraft]);

  return {
    query,
    list: answer?.list ?? null,
    loading: answer === null || answer.query !== query,
    failed: answer?.failed === true && answer.query === query,
    searchDraft,
    search: setSearchDraft,
    showStatus: (status: PaymentStatus) => setQuery((current) => ({ ...current, status, page: 1 })),
    showPage: (page: number) => setQuery((current) => ({ ...current, page })),
    // After a decision the counts and the list both change.
    reload: () => setQuery((current) => ({ ...current, version: current.version + 1 })),
  };
}
