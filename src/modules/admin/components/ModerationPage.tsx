'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/shared/components/Button';
import { DataList, NameCell, type DataColumn } from '@/shared/components/DataList';
import { ListCard } from '@/shared/components/ListCard';
import { PageHeader } from '@/shared/components/PageHeader';
import { PagedList } from '@/shared/components/PagedList';
import { ReasonDialog } from '@/shared/components/ReasonDialog';
import { SearchField } from '@/shared/components/SearchField';
import { SegmentedControl } from '@/shared/components/SegmentedControl';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { useDates } from '@/shared/hooks/useDates';
import { useModeration } from '../hooks/useModeration';
import type { ModeratedContent, ModerationKind } from '../api/moderation';

const KINDS: ModerationKind[] = ['products', 'promotions', 'discounts', 'vacancies'];
const REASON_LENGTH = { minimum: 10, maximum: 500 };

// Four tabs, one per kind the chamber moderates. Taking something down keeps it
// and its reason; putting it back clears both, and nothing here deletes.
export function ModerationPage() {
  const translate = useTranslations('admin.moderation');
  const dates = useDates();
  const [kind, setKind] = useState<ModerationKind>('products');
  const moderation = useModeration(kind);
  const [takingDown, setTakingDown] = useState<ModeratedContent | null>(null);

  const columns: DataColumn<ModeratedContent>[] = [
    {
      id: 'item',
      header: translate('columns.item'),
      cell: (content) => (
        <NameCell name={content.title} detail={content.member ?? translate('noMember')} />
      ),
    },
    {
      id: 'status',
      header: translate('columns.status'),
      cell: (content) => (
        <StatusBadge
          tone={content.status === 'active' ? 'success' : 'neutral'}
          label={translate(`statuses.${content.status}`)}
        />
      ),
    },
    {
      id: 'reason',
      header: translate('columns.reason'),
      cell: (content) => content.reason ?? '—',
    },
    {
      id: 'published',
      header: translate('columns.published'),
      cell: (content) => dates.instant(content.publishedAt),
    },
    {
      id: 'actions',
      header: translate('columns.actions'),
      hideHeader: true,
      align: 'end',
      cell: (content) => (
        <div className="flex items-center justify-end gap-2">
          {content.status === 'active' ? (
            <Button
              variant="danger"
              size="s"
              disabled={moderation.saving}
              onClick={() => setTakingDown(content)}
            >
              {translate('takeDown')}
            </Button>
          ) : (
            <Button
              variant="secondary"
              size="s"
              disabled={moderation.saving}
              onClick={() => void moderation.restore(content.id)}
            >
              {translate('restore')}
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6 px-4 py-6 lg:gap-8 lg:px-8 lg:py-8">
      <PageHeader title={translate('title')} legend={translate('description')} />

      <SegmentedControl
        legend={translate('tabsLegend')}
        name="tipo"
        value={kind}
        onChange={(value) => setKind(value as ModerationKind)}
        options={KINDS.map((option) => ({ value: option, label: translate(`kinds.${option}`) }))}
      />

      <div className="sm:w-80">
        <SearchField
          label={translate('searchLabel')}
          placeholder={translate('searchPlaceholder')}
          value={moderation.searchDraft}
          onChange={moderation.search}
        />
      </div>

      <PagedList
        list={moderation.list}
        loading={moderation.loading}
        failed={moderation.failed}
        emptyMessage={translate(`empty.${kind}`)}
        onPageChange={moderation.showPage}
      >
        <DataList
          label={translate(`kinds.${kind}`)}
          items={moderation.list?.items ?? []}
          keyOf={(content) => content.id}
          columns={columns}
          card={(content) => (
            <ListCard
              name={content.title}
              line={content.member ?? translate('noMember')}
              badges={
                <StatusBadge
                  tone={content.status === 'active' ? 'success' : 'neutral'}
                  label={translate(`statuses.${content.status}`)}
                />
              }
              action={
                content.status === 'active' ? (
                  <Button variant="danger" size="s" onClick={() => setTakingDown(content)}>
                    {translate('takeDown')}
                  </Button>
                ) : (
                  <Button
                    variant="secondary"
                    size="s"
                    onClick={() => void moderation.restore(content.id)}
                  >
                    {translate('restore')}
                  </Button>
                )
              }
            />
          )}
        />
      </PagedList>

      <ReasonDialog
        open={takingDown !== null}
        title={translate('takeDownTitle')}
        description={translate('takeDownHelp')}
        label={translate('reasonLabel')}
        confirmLabel={translate('takeDown')}
        length={REASON_LENGTH}
        onClose={() => setTakingDown(null)}
        onConfirm={async (reason) => {
          if (takingDown === null) {
            return;
          }

          const outcome = await moderation.takeDown(takingDown.id, reason);

          if (outcome.ok) {
            setTakingDown(null);
          }
        }}
      />
    </div>
  );
}
