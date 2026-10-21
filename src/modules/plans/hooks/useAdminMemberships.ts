'use client';

import { usePagedList } from '@/shared/hooks/usePagedList';
import {
  readAdminMemberships,
  type AdminMembershipList,
  type MembershipListView,
  type PaidPlanKey,
} from '../api/adminMemberships';

type MembershipFilters = { view: MembershipListView; plan: PaidPlanKey | null };

export function useAdminMemberships() {
  const memberships = usePagedList<MembershipFilters, AdminMembershipList>(readAdminMemberships, {
    view: 'active',
    plan: null,
  });

  return {
    ...memberships,
    showView: (view: MembershipListView) => memberships.filter({ view }),
    filterPlan: (plan: PaidPlanKey | null) => memberships.filter({ plan }),
  };
}
