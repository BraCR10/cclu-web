'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Eye, EyeOff, Lock, Pencil, Plus, Sparkles, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/shared/components/Button';
import { DataList, type DataColumn } from '@/shared/components/DataList';
import { ListCard } from '@/shared/components/ListCard';
import { Modal } from '@/shared/components/Modal';
import { PagedList } from '@/shared/components/PagedList';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { useDates } from '@/shared/hooks/useDates';
import { formatColones } from '@/shared/utils/formatColones';
import { PUBLICATION_TYPES, type PublicationType } from '../api/marketplace';
import type { OwnPublication } from '../api/publications';
import { useOwnPublications } from '../hooks/useOwnPublications';

const LINK_BUTTON_CLASSES =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-sm px-4 text-label-m focus-visible:shadow-focus focus-visible:outline-none lg:min-h-10';

const ALL_TYPES: (PublicationType | '')[] = ['', ...PUBLICATION_TYPES];

function PlanRequired() {
  const translate = useTranslations('member.publications.locked');

  return (
    <div className="flex flex-col items-center gap-4 rounded-lg border border-line-subtle bg-surface p-8 text-center shadow-raised">
      <span className="flex size-14 items-center justify-center rounded-full bg-warning-soft text-warning">
        <Lock aria-hidden className="size-6" />
      </span>
      <h2 className="text-heading-m text-fg">{translate('title')}</h2>
      <p className="max-w-md text-body-m text-fg-secondary">{translate('message')}</p>
      <div className="flex flex-wrap items-center justify-center gap-4">
        <Link
          href="/member/membership"
          className={`${LINK_BUTTON_CLASSES} bg-primary text-on-primary hover:bg-primary-hover`}
        >
          <Sparkles aria-hidden className="size-4" />
          {translate('seePlans')}
        </Link>
        <Link href="/plans" className={`${LINK_BUTTON_CLASSES} text-fg-link hover:underline`}>
          {translate('compare')}
        </Link>
      </div>
    </div>
  );
}

// M-07: what the member publishes, a tab per kind, with the actions each one
// allows. A publication the chamber took down says why and stays down.
export function MyPublicationsPage() {
  const translate = useTranslations('member.publications');
  const dates = useDates();
  const publications = useOwnPublications();
  const [deleting, setDeleting] = useState<OwnPublication | null>(null);
  const { list } = publications;

  const validity = (publication: OwnPublication) => {
    if (publication.startsAt === null && publication.endsAt === null) {
      return null;
    }

    return publication.endsAt === null
      ? translate('from', { date: dates.calendarDay(publication.startsAt ?? '') })
      : translate('until', { date: dates.calendarDay(publication.endsAt) });
  };

  const status = (publication: OwnPublication) => (
    <div className="flex flex-col gap-1">
      <StatusBadge
        tone={publication.status === 'active' ? 'success' : 'neutral'}
        label={translate(`status.${publication.status}`)}
      />
      {publication.inactiveReason !== null && (
        <span className="text-body-s text-fg-muted">
          {translate('chamberReason', { reason: publication.inactiveReason })}
        </span>
      )}
    </div>
  );

  // The chamber's takedown is not the member's to undo, and a publication it
  // took down is only theirs to delete: the prototype draws it with one action.
  const takenDown = (publication: OwnPublication) =>
    publication.status === 'inactive' && publication.inactiveReason !== null;

  const price = (publication: OwnPublication) => {
    if (publication.type === 'discount' && publication.percentage !== null) {
      return translate('percentOff', { percentage: publication.percentage });
    }

    if (publication.price !== null) {
      return formatColones(publication.price);
    }

    return publication.type === 'promotion' ? '—' : translate('consultPrice');
  };

  const actions = (publication: OwnPublication) => (
    <div className="flex items-center justify-end gap-1">
      {!takenDown(publication) && (
        <>
          <Link
            href={`/member/publications/${publication.id}`}
            aria-label={translate('editNamed', { title: publication.title })}
            className="inline-flex size-9 items-center justify-center rounded-sm text-fg-brand hover:bg-surface-hover focus-visible:shadow-focus focus-visible:outline-none"
          >
            <Pencil aria-hidden className="size-4" />
          </Link>
          <Button
            variant="ghost"
            size="s"
            aria-label={translate(
              publication.status === 'active' ? 'deactivateNamed' : 'reactivateNamed',
              { title: publication.title },
            )}
            onClick={() => void publications.toggle(publication)}
          >
            {publication.status === 'active' ? (
              <EyeOff aria-hidden className="size-4" />
            ) : (
              <Eye aria-hidden className="size-4" />
            )}
          </Button>
        </>
      )}
      <Button
        variant="ghost"
        size="s"
        aria-label={translate('deleteNamed', { title: publication.title })}
        onClick={() => setDeleting(publication)}
      >
        <Trash2 aria-hidden className="size-4" />
      </Button>
    </div>
  );

  const columns: DataColumn<OwnPublication>[] = [
    {
      id: 'title',
      header: translate('columns.title'),
      cell: (publication) => (
        <div className="min-w-0">
          <p className="truncate text-body-m text-fg">{publication.title}</p>
          <p className="line-clamp-2 text-body-s text-fg-muted">{publication.description}</p>
        </div>
      ),
    },
    {
      id: 'price',
      header: translate('columns.price'),
      cell: price,
    },
    { id: 'status', header: translate('columns.status'), cell: status },
    {
      id: 'updated',
      header: translate('columns.updated'),
      cell: (publication) => dates.instant(publication.updatedAt, 'short'),
    },
    {
      id: 'actions',
      header: translate('columns.actions'),
      hideHeader: true,
      align: 'end',
      cell: actions,
    },
  ];

  return (
    <div className="flex flex-col gap-6 px-4 py-6 lg:gap-8 lg:px-8 lg:py-8">
      {list !== null && !list.canPublish && <PlanRequired />}

      {list !== null && list.canPublish && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div
            role="group"
            aria-label={translate('filterLabel')}
            className="-mx-4 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:px-0"
          >
            {ALL_TYPES.map((type) => {
              const selected = publications.query.type === type;

              return (
                <button
                  key={type === '' ? 'all' : type}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => publications.filter({ type })}
                  className={
                    selected
                      ? 'inline-flex min-h-9 items-center rounded-full bg-primary px-4 text-label-m text-on-primary'
                      : 'inline-flex min-h-9 items-center rounded-full bg-surface-hover px-4 text-label-m text-fg'
                  }
                >
                  {translate(type === '' ? 'types.all' : `types.${type}`)}
                </button>
              );
            })}
          </div>

          <Link
            href="/member/publications/new"
            className={`${LINK_BUTTON_CLASSES} bg-primary text-on-primary hover:bg-primary-hover`}
          >
            <Plus aria-hidden className="size-4" />
            {translate('new')}
          </Link>
        </div>
      )}

      {(list === null || list.canPublish || list.total > 0) && (
        <PagedList
          list={list}
          loading={publications.loading}
          failed={publications.failed}
          emptyMessage={translate('empty')}
          onPageChange={publications.showPage}
        >
          <DataList
            label={translate('title')}
            items={list?.items ?? []}
            keyOf={(publication) => publication.id}
            columns={columns}
            card={(publication) => (
              <ListCard
                name={publication.title}
                line={[translate(`types.${publication.type}`), validity(publication)]
                  .filter(Boolean)
                  .join(' · ')}
                badges={status(publication)}
                action={actions(publication)}
              />
            )}
          />
        </PagedList>
      )}

      <Modal
        open={deleting !== null}
        title={translate('confirmDelete.title')}
        onClose={() => setDeleting(null)}
        footer={
          <div className="flex gap-3 lg:justify-end">
            <Button
              variant="secondary"
              className="flex-1 lg:flex-none"
              onClick={() => setDeleting(null)}
            >
              {translate('confirmDelete.cancel')}
            </Button>
            <Button
              variant="danger"
              className="flex-1 lg:flex-none"
              onClick={() => {
                if (deleting !== null) {
                  void publications.remove(deleting);
                }
                setDeleting(null);
              }}
            >
              {translate('confirmDelete.confirm')}
            </Button>
          </div>
        }
      >
        <p className="text-body-m text-fg-secondary">
          {translate('confirmDelete.message', { title: deleting?.title ?? '' })}
        </p>
      </Modal>
    </div>
  );
}
