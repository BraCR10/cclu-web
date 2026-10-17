'use client';

import { useTranslations } from 'next-intl';
import { Alert } from '@/shared/components/Alert';
import { Pagination } from '@/shared/components/Pagination';
import { MEMBERSHIP_PAGE_SIZE } from '../api/adminMemberships';
import { useAdminMemberships } from '../hooks/useAdminMemberships';
import { usePlans } from '../hooks/usePlans';
import { MembershipCounts } from './MembershipCounts';
import { MembershipFilters } from './MembershipFilters';
import { MembershipCards, MembershipTable } from './MembershipList';

export function AdminMembershipsPage() {
  const translate = useTranslations('admin.memberships');
  const translateErrors = useTranslations('errors');
  const memberships = useAdminMemberships();
  const plans = usePlans();
  const { list } = memberships;

  const from = list === null ? 0 : (list.page - 1) * MEMBERSHIP_PAGE_SIZE + 1;
  const to = list === null ? 0 : from + list.items.length - 1;
  const summary =
    list === null || list.total === 0
      ? undefined
      : translate(`summary.${memberships.query.status}`, { from, to, total: list.total });

  return (
    <div className="flex flex-col gap-6 px-4 py-6 lg:gap-8 lg:px-8 lg:py-8">
      <MembershipCounts
        counts={list?.counts ?? null}
        noticeDays={list?.noticeDays ?? null}
        status={memberships.query.status}
        onSelect={memberships.showStatus}
      />

      <MembershipFilters
        search={memberships.searchDraft}
        onSearch={memberships.search}
        plans={plans.status === 'loaded' ? plans.plans : []}
        plan={memberships.query.plan}
        onPlan={memberships.filterPlan}
      />

      {memberships.failed && <Alert tone="danger" title={translateErrors('network_error')} />}

      {list === null && memberships.loading && (
        <div aria-hidden className="h-96 animate-pulse rounded-lg bg-surface-hover" />
      )}

      {list !== null && list.total === 0 && (
        <p className="rounded-lg border border-line-subtle bg-surface p-6 text-body-m text-fg-secondary">
          {translate(`empty.${memberships.query.status}`)}
        </p>
      )}

      {list !== null && list.total > 0 && (
        <div aria-busy={memberships.loading} className="flex flex-col gap-4">
          <MembershipTable items={list.items} />
          <MembershipCards items={list.items} />
          {list.pageCount > 1 ? (
            <Pagination
              page={list.page}
              pageCount={list.pageCount}
              onPageChange={memberships.showPage}
              summary={summary}
            />
          ) : (
            <p className="text-body-s text-fg-muted">{summary}</p>
          )}
        </div>
      )}
    </div>
  );
}
