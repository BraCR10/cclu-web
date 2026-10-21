'use client';

import { useEffect, useState } from 'react';
import { readAdminSummary, type AdminSummary } from '../api/summary';

export type AdminSummaryState =
  { status: 'loading' } | { status: 'loaded'; summary: AdminSummary } | { status: 'failed' };

export function useAdminSummary(): AdminSummaryState {
  const [state, setState] = useState<AdminSummaryState>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;

    readAdminSummary()
      .then((summary) => !cancelled && setState({ status: 'loaded', summary }))
      .catch(() => !cancelled && setState({ status: 'failed' }));

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
