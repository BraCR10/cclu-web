'use client';

import Link from 'next/link';
import { Download } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/shared/components/Button';
import { DataList, NameCell, type DataColumn } from '@/shared/components/DataList';
import { FilterSheet } from '@/shared/components/FilterSheet';
import { ListCard } from '@/shared/components/ListCard';
import { PageHeader } from '@/shared/components/PageHeader';
import { PagedList } from '@/shared/components/PagedList';
import { PlanBadge } from '@/shared/components/PlanBadge';
import { SearchField } from '@/shared/components/SearchField';
import { Select } from '@/shared/components/Select';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { useMembers } from '../hooks/useMembers';
import {
  NO_MEMBER_FILTERS,
  type AccountStatus,
  type MemberFilters,
  type MemberRow,
} from '../api/members';

function MemberFiltersFields({
  filters,
  change,
}: {
  filters: MemberFilters;
  change: (changes: Partial<MemberFilters>) => void;
}) {
  const translate = useTranslations('admin.members');

  return (
    <>
      <Select
        label={translate('filters.status')}
        value={filters.accountStatus ?? ''}
        onChange={(event) =>
          change({ accountStatus: (event.target.value || undefined) as AccountStatus | undefined })
        }
        options={[
          { value: '', label: translate('filters.allStatuses') },
          { value: 'active', label: translate('statuses.active') },
          { value: 'suspended', label: translate('statuses.suspended') },
        ]}
      />
      <Select
        label={translate('filters.memberType')}
        value={filters.memberType ?? ''}
        onChange={(event) =>
          change({ memberType: (event.target.value || undefined) as MemberFilters['memberType'] })
        }
        options={[
          { value: '', label: translate('filters.allTypes') },
          { value: 'business', label: translate('types.business') },
          { value: 'association', label: translate('types.association') },
          { value: 'independent_professional', label: translate('types.independent') },
        ]}
      />
      <Select
        label={translate('filters.plan')}
        value={filters.plan ?? ''}
        onChange={(event) =>
          change({ plan: (event.target.value || undefined) as MemberFilters['plan'] })
        }
        options={[
          { value: '', label: translate('filters.allPlans') },
          { value: 'free', label: translate('plans.free') },
          { value: 'lite', label: translate('plans.lite') },
          { value: 'pro', label: translate('plans.pro') },
          { value: 'premium', label: translate('plans.premium') },
        ]}
      />
    </>
  );
}

export function MembersPage() {
  const translate = useTranslations('admin.members');
  const members = useMembers();

  const columns: DataColumn<MemberRow>[] = [
    {
      id: 'member',
      header: translate('columns.member'),
      cell: (member) => (
        <NameCell
          name={member.businessName ?? member.name ?? member.email}
          detail={
            member.memberCode === null
              ? member.email
              : translate('codeAndEmail', { code: member.memberCode, email: member.email })
          }
        />
      ),
    },
    {
      id: 'place',
      header: translate('columns.place'),
      cell: (member) => member.canton ?? '—',
    },
    {
      id: 'plan',
      header: translate('columns.plan'),
      cell: (member) =>
        member.plan?.key === null || member.plan?.key === undefined ? (
          <PlanBadge planKey="free" name={translate('plans.free')} />
        ) : (
          <PlanBadge planKey={member.plan.key} name={member.plan.name ?? member.plan.key} />
        ),
    },
    {
      id: 'status',
      header: translate('columns.status'),
      cell: (member) => (
        <StatusBadge
          tone={member.accountStatus === 'active' ? 'success' : 'danger'}
          label={translate(`statuses.${member.accountStatus}`)}
        />
      ),
    },
    {
      id: 'actions',
      header: translate('columns.actions'),
      hideHeader: true,
      align: 'end',
      cell: (member) => (
        <Link className="text-body-m text-link underline" href={`/admin/members/${member.id}`}>
          {translate('open')}
        </Link>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6 px-4 py-6 lg:gap-8 lg:px-8 lg:py-8">
      <PageHeader title={translate('title')} legend={translate('description')} />

      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-end">
          <div className="sm:w-80">
            <SearchField
              label={translate('searchLabel')}
              placeholder={translate('searchPlaceholder')}
              value={members.searchDraft}
              onChange={members.search}
            />
          </div>
          <FilterSheet<MemberFilters>
            title={translate('filters.title')}
            value={members.query}
            empty={NO_MEMBER_FILTERS}
            onApply={members.filter}
            renderFields={(draft, change) => (
              <MemberFiltersFields filters={draft} change={change} />
            )}
          />
        </div>
        <Button
          loading={members.exporting}
          disabled={members.list === null || members.list.total === 0}
          onClick={() => void members.exportAll()}
        >
          <Download aria-hidden className="size-4" />
          {translate('export')}
        </Button>
      </div>

      <PagedList
        list={members.list}
        loading={members.loading}
        failed={members.failed}
        emptyMessage={translate('empty')}
        onPageChange={members.showPage}
      >
        <DataList
          label={translate('title')}
          items={members.list?.items ?? []}
          keyOf={(member) => member.id}
          columns={columns}
          card={(member) => (
            <ListCard
              name={member.businessName ?? member.name ?? member.email}
              line={member.email}
              badges={
                <StatusBadge
                  tone={member.accountStatus === 'active' ? 'success' : 'danger'}
                  label={translate(`statuses.${member.accountStatus}`)}
                />
              }
              href={`/admin/members/${member.id}`}
              linkLabel={translate('open')}
            />
          )}
        />
      </PagedList>
    </div>
  );
}
