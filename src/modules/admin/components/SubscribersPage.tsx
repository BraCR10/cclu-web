'use client';

import { Download } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { CatalogCanton } from '@/shared/api/catalogs';
import { Button } from '@/shared/components/Button';
import { DataList, type DataColumn } from '@/shared/components/DataList';
import { FilterSheet } from '@/shared/components/FilterSheet';
import { ListCard } from '@/shared/components/ListCard';
import { PagedList } from '@/shared/components/PagedList';
import { SearchField } from '@/shared/components/SearchField';
import { Select } from '@/shared/components/Select';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { useDates } from '@/shared/hooks/useDates';
import { useDistricts } from '@/shared/hooks/useDistricts';
import {
  NO_SUBSCRIBER_FILTERS,
  readSubscriberDistricts,
  SUBSCRIBER_PAGE_SIZE,
  type Subscriber,
  type SubscriberFilters,
  type SubscriberStatus,
} from '../api/subscribers';
import { useCantonOptions } from '../hooks/useCantonOptions';
import { useSubscribers } from '../hooks/useSubscribers';

const STATUSES: SubscriberStatus[] = ['subscribed', 'unsubscribed'];

function SubscriberFilterFields({
  filters,
  change,
  cantons,
}: {
  filters: SubscriberFilters;
  change: (changes: Partial<SubscriberFilters>) => void;
  cantons: CatalogCanton[];
}) {
  const translate = useTranslations('admin.subscribers.filters');
  const translateStatus = useTranslations('admin.subscribers.status');
  const districts = useDistricts(filters.canton, readSubscriberDistricts);

  return (
    <>
      <Select
        className="lg:w-52"
        label={translate('canton')}
        value={filters.canton}
        options={[
          { value: '', label: translate('allCantons') },
          ...cantons.map((canton) => ({ value: canton._id, label: canton.name })),
        ]}
        onChange={(event) => change({ canton: event.target.value, district: '' })}
      />
      <Select
        className="lg:w-52"
        label={translate('district')}
        value={filters.district}
        disabled={filters.canton === ''}
        options={[
          { value: '', label: translate('allDistricts') },
          ...districts.map((district) => ({ value: district, label: district })),
        ]}
        onChange={(event) => change({ district: event.target.value })}
      />
      <Select
        className="lg:w-44"
        label={translate('status')}
        value={filters.status}
        options={[
          { value: '', label: translate('allStatuses') },
          ...STATUSES.map((status) => ({ value: status, label: translateStatus(status) })),
        ]}
        onChange={(event) => change({ status: event.target.value as SubscriberStatus | '' })}
      />
    </>
  );
}

// A-15: who asked for the chamber's promotions, and the file to reach them.
export function SubscribersPage() {
  const translate = useTranslations('admin.subscribers');
  const translateStatus = useTranslations('admin.subscribers.status');
  const dates = useDates();
  const subscribers = useSubscribers();
  const cantons = useCantonOptions();
  const { list, query } = subscribers;

  const status = (subscriber: Subscriber) => (
    <StatusBadge
      tone={subscriber.status === 'subscribed' ? 'success' : 'neutral'}
      label={translateStatus(subscriber.status)}
    />
  );
  const place = (subscriber: Subscriber) =>
    [subscriber.canton, subscriber.province].filter(Boolean).join(', ');

  const columns: DataColumn<Subscriber>[] = [
    { id: 'name', header: translate('columns.name'), cell: (subscriber) => subscriber.name },
    {
      id: 'place',
      header: translate('columns.place'),
      cell: (subscriber) => (
        <div>
          <p className="text-body-m text-fg">{subscriber.district}</p>
          <p className="text-body-s text-fg-muted">{place(subscriber)}</p>
        </div>
      ),
    },
    { id: 'email', header: translate('columns.email'), cell: (subscriber) => subscriber.email },
    {
      id: 'whatsapp',
      header: translate('columns.whatsapp'),
      cell: (subscriber) => subscriber.whatsappNumber ?? '—',
    },
    {
      id: 'subscribed',
      header: translate('columns.subscribedAt'),
      cell: (subscriber) => dates.instant(subscriber.subscribedAt, 'short'),
    },
    { id: 'status', header: translate('columns.status'), cell: status },
  ];

  const summary =
    list === null || list.total === 0
      ? undefined
      : translate('summary', {
          from: (list.page - 1) * SUBSCRIBER_PAGE_SIZE + 1,
          to: (list.page - 1) * SUBSCRIBER_PAGE_SIZE + list.items.length,
          total: list.total,
        });

  return (
    <div className="flex flex-col gap-6 px-4 py-6 lg:gap-8 lg:px-8 lg:py-8">
      <div>
        <Button
          onClick={() => void subscribers.exportAll()}
          loading={subscribers.exporting}
          disabled={list === null || list.total === 0}
        >
          <Download aria-hidden className="size-4" />
          {translate('export')}
        </Button>
      </div>

      <div className="flex gap-3 lg:items-end">
        <div className="flex flex-1 lg:self-end">
          <SearchField
            label={translate('searchLabel')}
            placeholder={translate('searchPlaceholder')}
            value={subscribers.searchDraft}
            onChange={subscribers.search}
          />
        </div>
        <FilterSheet<SubscriberFilters>
          title={translate('filters.title')}
          value={{ canton: query.canton, district: query.district, status: query.status }}
          empty={NO_SUBSCRIBER_FILTERS}
          onApply={subscribers.filter}
          renderFields={(draft, change) => (
            <SubscriberFilterFields filters={draft} change={change} cantons={cantons} />
          )}
        />
      </div>

      <PagedList
        list={list}
        loading={subscribers.loading}
        failed={subscribers.failed}
        emptyMessage={translate('empty')}
        summary={summary}
        onPageChange={subscribers.showPage}
      >
        <DataList
          label={translate('title')}
          items={list?.items ?? []}
          keyOf={(subscriber) => subscriber.id}
          columns={columns}
          card={(subscriber) => (
            <ListCard
              name={subscriber.name}
              line={[subscriber.email, subscriber.district, subscriber.whatsappNumber]
                .filter(Boolean)
                .join(' · ')}
              badges={status(subscriber)}
            />
          )}
        />
      </PagedList>
    </div>
  );
}
