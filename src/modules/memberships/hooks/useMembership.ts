'use client';

import { useEffect, useState } from 'react';
import { readPlans, type Plan } from '@/modules/plans/api/plans';
import { readOwnMembership, type Membership } from '../api/membership';

export type MembershipState =
  | { status: 'loading' }
  | { status: 'failed' }
  | { status: 'loaded'; membership: Membership; plans: Plan[] };

export function useMembership(): MembershipState {
  const [state, setState] = useState<MembershipState>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;

    Promise.all([readOwnMembership(), readPlans()])
      .then(([membership, plans]) => {
        if (!cancelled) {
          setState({ status: 'loaded', membership, plans });
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
