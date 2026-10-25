'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { PageHeader } from '@/shared/components/PageHeader';
import { PagedList } from '@/shared/components/PagedList';
import { DataList, NameCell, type DataColumn } from '@/shared/components/DataList';
import { ListCard } from '@/shared/components/ListCard';
import { SearchField } from '@/shared/components/SearchField';
import { SegmentedControl } from '@/shared/components/SegmentedControl';
import { StatusBadge, type StatusTone } from '@/shared/components/StatusBadge';
import { useDates } from '@/shared/hooks/useDates';
import { useApplications } from '../hooks/useApplications';
import type { ApplicationStatus, ApplicationSummary, ApplicationView } from '../api/applications';

export const APPLICATION_TONES: Record<ApplicationStatus, StatusTone> = {
  pending_review: 'warning',
  changes_requested: 'info',
  approved: 'success',
  rejected: 'danger',
};

export function ApplicationStatusBadge({ status }: { status: ApplicationStatus }) {
  const translate = useTranslations('admin.applications.statuses');

  return <StatusBadge tone={APPLICATION_TONES[status]} label={translate(status)} />;
}

export function ApplicationsPage() {
  const translate = useTranslations('admin.applications');
  const dates = useDates();
  const [view, setView] = useState<ApplicationView>('pending');
  const { list, loading, failed, showPage, search, searchDraft } = useApplications(view);

  const columns: DataColumn<ApplicationSummary>[] = [
    {
      id: 'applicant',
      header: translate('columns.applicant'),
      cell: (application) => (
        <NameCell
          name={application.businessName ?? application.name ?? application.email}
          detail={application.email}
        />
      ),
    },
    {
      id: 'activity',
      header: translate('columns.activity'),
      cell: (application) =>
        application.activity?.name ?? application.activityOther ?? translate('noActivity'),
    },
    {
      id: 'received',
      header: translate('columns.received'),
      cell: (application) => dates.instant(application.createdAt),
    },
    ...(view === 'decided'
      ? [
          {
            id: 'status',
            header: translate('columns.status'),
            cell: (application: ApplicationSummary) => (
              <ApplicationStatusBadge status={application.applicationStatus} />
            ),
          },
        ]
      : []),
    {
      id: 'actions',
      header: translate('columns.actions'),
      hideHeader: true,
      align: 'end',
      cell: (application) => (
        <Link
          className="text-body-m text-link underline"
          href={`/admin/applications/${application._id}`}
        >
          {translate('review')}
        </Link>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6 px-4 py-6 lg:gap-8 lg:px-8 lg:py-8">
      <PageHeader title={translate('title')} legend={translate('description')} />

      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="sm:w-96">
          <SegmentedControl
            legend={translate('tabsLegend')}
            name="vista"
            value={view}
            onChange={(value) => setView(value as ApplicationView)}
            options={[
              { value: 'pending', label: translate('tabs.pending') },
              { value: 'decided', label: translate('tabs.decided') },
            ]}
          />
        </div>
        <div className="sm:w-72">
          <SearchField
            label={translate('searchLabel')}
            placeholder={translate('searchPlaceholder')}
            value={searchDraft}
            onChange={search}
          />
        </div>
      </div>

      <PagedList
        list={list}
        loading={loading}
        failed={failed}
        emptyMessage={translate(view === 'pending' ? 'empty.pending' : 'empty.decided')}
        onPageChange={showPage}
      >
        <DataList
          label={translate('title')}
          items={list?.items ?? []}
          keyOf={(application) => application._id}
          columns={columns}
          card={(application) => (
            <ListCard
              name={application.businessName ?? application.name ?? application.email}
              line={application.email}
              badges={
                view === 'decided' ? (
                  <ApplicationStatusBadge status={application.applicationStatus} />
                ) : undefined
              }
              href={`/admin/applications/${application._id}`}
              linkLabel={translate('review')}
            />
          )}
        />
      </PagedList>
    </div>
  );
}
