'use client';

import { useTranslations } from 'next-intl';
import { PagedList } from '@/shared/components/PagedList';
import { MEMBERSHIP_PAGE_SIZE } from '../api/adminMemberships';
import { useAdminMemberships } from '../hooks/useAdminMemberships';
import { usePlans } from '../hooks/usePlans';
import { MembershipCounts } from './MembershipCounts';
import { MembershipFilters } from './MembershipFilters';
import { MembershipList } from './MembershipList';

export function AdminMembershipsPage() {
  const translate = useTranslations('admin.memberships');
  const memberships = useAdminMemberships();
  const plans = usePlans();
  const { list } = memberships;

  const from = list === null ? 0 : (list.page - 1) * MEMBERSHIP_PAGE_SIZE + 1;
  const to = list === null ? 0 : from + list.items.length - 1;
  const summary =
    list === null || list.total === 0
      ? undefined
      : translate('summary', { from, to, total: list.total });

  return (
    <div className="flex flex-col gap-6 px-4 py-6 lg:gap-8 lg:px-8 lg:py-8">
      <MembershipCounts
        counts={list?.counts ?? null}
        noticeDays={list?.noticeDays ?? null}
        view={memberships.query.view}
        onSelect={memberships.showView}
      />

      <MembershipFilters
        search={memberships.searchDraft}
        onSearch={memberships.search}
        plans={plans.status === 'loaded' ? plans.plans : []}
        plan={memberships.query.plan}
        onPlan={memberships.filterPlan}
      />

      <PagedList
        list={list}
        loading={memberships.loading}
        failed={memberships.failed}
        emptyMessage={translate(`empty.${memberships.query.view}`)}
        summary={summary}
        onPageChange={memberships.showPage}
      >
        <MembershipList items={list?.items ?? []} />
      </PagedList>
    </div>
  );
}
