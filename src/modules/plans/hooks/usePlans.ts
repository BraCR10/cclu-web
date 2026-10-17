'use client';

import { useEffect, useState } from 'react';
import { readPlans, type Plan } from '../api/plans';

export type PlansState =
  { status: 'loading' } | { status: 'failed' } | { status: 'loaded'; plans: Plan[] };

export function usePlans(): PlansState {
  const [state, setState] = useState<PlansState>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;

    readPlans()
      .then((plans) => {
        if (!cancelled) {
          setState({ status: 'loaded', plans });
        }
      })
      .catch(() => {
        if (!cancelled) {
          setState({ status: 'failed' });
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
