'use client';

import { useEffect, useState } from 'react';
import { readOwnPayments, type Payment } from '../api/payments';

// What waits on the member, which is what the home is for. A rejected payment is
// the one thing they have to act on, so it travels whole; a payment under review
// only needs to be counted, because there is nothing to do about it yet.
export type HomeSummary =
  | { status: 'loading' }
  | { status: 'failed' }
  | { status: 'loaded'; rejected: Payment | null; inReview: number };

export function useHomeSummary(): HomeSummary {
  const [summary, setSummary] = useState<HomeSummary>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;

    Promise.all([readOwnPayments('rejected', 1), readOwnPayments('pending_review', 1)])
      .then(([rejected, pending]) => {
        if (!cancelled) {
          setSummary({
            status: 'loaded',
            rejected: rejected.items[0] ?? null,
            inReview: pending.total,
          });
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSummary({ status: 'failed' });
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return summary;
}
