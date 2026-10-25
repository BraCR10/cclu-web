'use client';

import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Alert } from '@/shared/components/Alert';
import { Button } from '@/shared/components/Button';
import { DataList, NameCell, type DataColumn } from '@/shared/components/DataList';
import { Input } from '@/shared/components/Input';
import { Modal } from '@/shared/components/Modal';
import { PageHeader } from '@/shared/components/PageHeader';
import { SearchField } from '@/shared/components/SearchField';
import { SegmentedControl } from '@/shared/components/SegmentedControl';
import { StatusBadge, type StatusTone } from '@/shared/components/StatusBadge';
import { useActivities } from '../hooks/useActivities';
import type { ActivityStatus, CatalogActivity } from '../api/activities';

const TONES: Record<ActivityStatus, StatusTone> = {
  active: 'success',
  pending: 'warning',
  inactive: 'neutral',
};

const SEARCH_DELAY_MS = 300;

export function ActivitiesPage() {
  const translate = useTranslations('admin.activities');
  const {
    state,
    failureMessage,
    items,
    counts,
    filter,
    setFilter,
    saving,
    create,
    rename,
    setStatus,
    remove,
  } = useActivities();

  const [searchDraft, setSearchDraft] = useState('');
  const [adding, setAdding] = useState(false);
  const [nameDraft, setNameDraft] = useState('');
  const [formError, setFormError] = useState<{ message: string; field?: string } | null>(null);
  const [renaming, setRenaming] = useState<CatalogActivity | null>(null);
  const [renameDraft, setRenameDraft] = useState('');

  // Typing is not a request; the filter follows the draft once it settles.
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilter((current) => ({ ...current, search: searchDraft }));
    }, SEARCH_DELAY_MS);

    return () => clearTimeout(timer);
  }, [searchDraft, setFilter]);

  const closeAdd = () => {
    setAdding(false);
    setNameDraft('');
    setFormError(null);
  };

  const submitAdd = async () => {
    const outcome = await create(nameDraft.trim());

    if (outcome.ok) {
      closeAdd();
      return;
    }

    setFormError({ message: outcome.message, field: outcome.field });
  };

  const submitRename = async () => {
    if (renaming === null) {
      return;
    }

    const outcome = await rename(renaming, renameDraft.trim());

    if (outcome.ok) {
      setRenaming(null);
      setRenameDraft('');
      setFormError(null);
      return;
    }

    setFormError({ message: outcome.message, field: outcome.field });
  };

  const columns: DataColumn<CatalogActivity>[] = [
    {
      id: 'activity',
      header: translate('columns.activity'),
      cell: (activity) => (
        <NameCell name={activity.name} detail={translate('members', { count: activity.members })} />
      ),
    },
    {
      id: 'status',
      header: translate('columns.status'),
      cell: (activity) => (
        <StatusBadge
          tone={TONES[activity.status]}
          label={translate(`statuses.${activity.status}`)}
        />
      ),
    },
    {
      id: 'actions',
      header: translate('columns.actions'),
      hideHeader: true,
      align: 'end',
      cell: (activity) => <RowActions activity={activity} />,
    },
  ];

  function RowActions({ activity }: { activity: CatalogActivity }) {
    return (
      <div className="flex flex-wrap items-center justify-end gap-2">
        {activity.status === 'pending' ? (
          <Button
            variant="secondary"
            size="s"
            disabled={saving}
            onClick={() => void setStatus(activity, 'active')}
          >
            {translate('accept')}
          </Button>
        ) : null}
        <Button
          variant="ghost"
          size="s"
          disabled={saving}
          onClick={() => {
            setRenaming(activity);
            setRenameDraft(activity.name);
            setFormError(null);
          }}
        >
          {translate('rename')}
        </Button>
        {activity.status === 'inactive' ? (
          <Button
            variant="secondary"
            size="s"
            disabled={saving}
            onClick={() => void setStatus(activity, 'active')}
          >
            {translate('reactivate')}
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="s"
            disabled={saving}
            onClick={() => void setStatus(activity, 'inactive')}
          >
            {translate('retire')}
          </Button>
        )}
        {/* Deleting is only offered for one nobody carries: the API refuses the
            rest, and retiring is the answer there. */}
        {activity.members === 0 ? (
          <Button variant="ghost" size="s" disabled={saving} onClick={() => void remove(activity)}>
            {translate('remove')}
          </Button>
        ) : null}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 px-4 py-6 lg:gap-8 lg:px-8 lg:py-8">
      <PageHeader title={translate('title')} legend={translate('description')} />

      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="sm:w-72">
            <SearchField
              label={translate('searchLabel')}
              placeholder={translate('searchPlaceholder')}
              value={searchDraft}
              onChange={setSearchDraft}
            />
          </div>
          <div className="sm:w-96">
            <SegmentedControl
              legend={translate('filterLegend')}
              name="estado"
              value={filter.status ?? 'all'}
              onChange={(value) =>
                setFilter((current) => ({
                  ...current,
                  status: value === 'all' ? undefined : (value as ActivityStatus),
                }))
              }
              options={[
                { value: 'all', label: translate('filters.all') },
                {
                  value: 'pending',
                  label: translate('filters.pending', { count: counts.pending }),
                },
                { value: 'active', label: translate('filters.active', { count: counts.active }) },
                {
                  value: 'inactive',
                  label: translate('filters.inactive', { count: counts.inactive }),
                },
              ]}
            />
          </div>
        </div>

        <Button onClick={() => setAdding(true)}>
          <Plus aria-hidden="true" className="h-4 w-4" />
          {translate('add')}
        </Button>
      </div>

      {state === 'failed' ? (
        <Alert tone="danger" title={translate('loadFailed')} message={failureMessage} />
      ) : null}

      {state === 'loading' ? (
        <div aria-hidden className="h-40 animate-pulse rounded-lg bg-surface-hover" />
      ) : null}

      {state === 'ready' ? (
        <DataList
          label={translate('title')}
          items={items}
          keyOf={(activity) => activity.id}
          columns={columns}
          card={(activity) => (
            <div className="flex flex-col gap-2">
              <NameCell
                name={activity.name}
                detail={translate('members', { count: activity.members })}
              />
              <StatusBadge
                tone={TONES[activity.status]}
                label={translate(`statuses.${activity.status}`)}
              />
              <RowActions activity={activity} />
            </div>
          )}
        />
      ) : null}

      {state === 'ready' && items.length === 0 ? (
        <p className="text-body-m text-fg-muted">{translate('empty')}</p>
      ) : null}

      <Modal
        open={adding}
        title={translate('addTitle')}
        onClose={closeAdd}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={closeAdd}>
              {translate('cancel')}
            </Button>
            <Button disabled={saving} onClick={() => void submitAdd()}>
              {translate('save')}
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          <p className="text-body-m text-fg-muted">{translate('addHelp')}</p>
          <Input
            label={translate('name')}
            value={nameDraft}
            error={formError?.field === 'name' ? formError.message : undefined}
            onChange={(event) => setNameDraft(event.target.value)}
          />
          {formError !== null && formError.field === undefined ? (
            <Alert tone="danger" title={formError.message} />
          ) : null}
        </div>
      </Modal>

      <Modal
        open={renaming !== null}
        title={translate('renameTitle')}
        onClose={() => setRenaming(null)}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setRenaming(null)}>
              {translate('cancel')}
            </Button>
            <Button disabled={saving} onClick={() => void submitRename()}>
              {translate('save')}
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          <p className="text-body-m text-fg-muted">{translate('renameHelp')}</p>
          <Input
            label={translate('name')}
            value={renameDraft}
            error={formError?.field === 'name' ? formError.message : undefined}
            onChange={(event) => setRenameDraft(event.target.value)}
          />
          {formError !== null && formError.field === undefined ? (
            <Alert tone="danger" title={formError.message} />
          ) : null}
        </div>
      </Modal>
    </div>
  );
}
