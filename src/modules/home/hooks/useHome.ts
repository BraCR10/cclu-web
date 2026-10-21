'use client';

import { useEffect, useState } from 'react';
import { readPlans, type Plan } from '@/modules/plans/api/plans';
import { readHome, type Home } from '../api/home';

export type HomeState =
  { status: 'loading' } | { status: 'failed' } | { status: 'loaded'; home: Home; plans: Plan[] };

export function useHome(): HomeState {
  const [state, setState] = useState<HomeState>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;

    Promise.all([readHome(), readPlans()])
      .then(([home, plans]) => {
        if (!cancelled) {
          setState({ status: 'loaded', home, plans });
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
