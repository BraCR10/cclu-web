'use client';

import { useEffect, useState } from 'react';
import { readPlans, type Plan } from '../api/plans';
import { readOwnMembership, type Membership } from '../api/membership';
import { readPaymentEligibility, type PaymentEligibility } from '../api/payments';

export type MembershipState =
  | { status: 'loading' }
  | { status: 'failed' }
  | { status: 'loaded'; membership: Membership; plans: Plan[]; eligibility: PaymentEligibility };

export function useMembership(): MembershipState {
  const [state, setState] = useState<MembershipState>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;

    Promise.all([readOwnMembership(), readPlans(), readPaymentEligibility()])
      .then(([membership, plans, eligibility]) => {
        if (!cancelled) {
          setState({ status: 'loaded', membership, plans, eligibility });
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
