'use client';

import { useEffect, useState } from 'react';
import type { Paginated } from '@/shared/api/pagination';
import { readOwnPayments, type Payment, type PaymentStatus } from '../api/payments';

type Query = { status: PaymentStatus | null; page: number };
type Answer = { query: Query; list: Paginated<Payment> | null; failed: boolean };

export function useOwnPayments() {
  const [query, setQuery] = useState<Query>({ status: null, page: 1 });
  const [answer, setAnswer] = useState<Answer | null>(null);

  useEffect(() => {
    let cancelled = false;

    readOwnPayments(query.status, query.page)
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

  return {
    query,
    list: answer?.list ?? null,
    loading: answer === null || answer.query !== query,
    failed: answer?.failed === true && answer.query === query,
    filter: (status: PaymentStatus | null) => setQuery({ status, page: 1 }),
    showPage: (page: number) => setQuery((current) => ({ ...current, page })),
  };
}
