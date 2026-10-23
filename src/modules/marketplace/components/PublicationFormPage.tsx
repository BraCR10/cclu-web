'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Alert } from '@/shared/components/Alert';
import { Button } from '@/shared/components/Button';
import { Card } from '@/shared/components/Card';
import { Combobox } from '@/shared/components/Combobox';
import { Input } from '@/shared/components/Input';
import { PageHeader } from '@/shared/components/PageHeader';
import { SegmentedControl } from '@/shared/components/SegmentedControl';
import { Textarea } from '@/shared/components/Textarea';
import { useToast } from '@/shared/components/useToast';
import { useErrorPresenter } from '@/shared/errors/useErrorPresenter';
import { readActivities, type CatalogActivity } from '@/shared/api/catalogs';
import { PUBLICATION_TYPES, type PublicationType } from '../api/marketplace';
import {
  createPublication,
  updatePublication,
  type OwnPublication,
  type PublicationDraft,
} from '../api/publications';

const PRICED: PublicationType[] = ['product', 'service'];
const TIMED: PublicationType[] = ['promotion', 'discount'];

function draftOf(publication: OwnPublication | undefined): PublicationDraft {
  return {
    type: publication?.type ?? 'product',
    title: publication?.title ?? '',
    description: publication?.description ?? '',
    price:
      publication?.price === null || publication?.price === undefined
        ? ''
        : String(publication.price),
    imageUrl: publication?.imageUrl ?? '',
    category: publication?.category?._id ?? '',
    percentage:
      publication?.percentage === null || publication?.percentage === undefined
        ? ''
        : String(publication.percentage),
    condition: publication?.condition ?? '',
    startsAt: publication?.startsAt ?? '',
    endsAt: publication?.endsAt ?? '',
  };
}

type PublicationFormPageProps = {
  // Undefined adds one; a publication edits it, and its kind does not change.
  publication?: OwnPublication;
};

// M-08: the form of each kind of publication. What is asked for follows the
// kind, so a promotion is never asked for a price.
export function PublicationFormPage({ publication }: PublicationFormPageProps) {
  const translate = useTranslations('member.publications.form');
  const router = useRouter();
  const { showToast } = useToast();
  const present = useErrorPresenter();

  const [draft, setDraft] = useState<PublicationDraft>(() => draftOf(publication));
  const [activities, setActivities] = useState<CatalogActivity[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<{ message: string; field?: string } | null>(null);

  useEffect(() => {
    let cancelled = false;

    readActivities()
      .then((list) => !cancelled && setActivities(list))
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  const change = (field: keyof PublicationDraft, value: string) =>
    setDraft((current) => ({ ...current, [field]: value }));

  const errorFor = (field: string) => (error?.field === field ? error.message : undefined);

  const priced = PRICED.includes(draft.type);
  const timed = TIMED.includes(draft.type);
  const discounted = draft.type === 'discount';

  async function submit() {
    setError(null);
    setSaving(true);

    try {
      if (publication === undefined) {
        await createPublication(draft);
        showToast({ tone: 'success', title: translate('published') });
      } else {
        await updatePublication(publication.id, draft);
        showToast({ tone: 'success', title: translate('saved') });
      }

      router.push('/member/publications');
    } catch (thrown: unknown) {
      const shown = present(thrown);
      setError({
        message: shown.message,
        field: shown.placement === 'field' ? shown.field : undefined,
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-6 px-4 py-6 lg:gap-8 lg:px-8 lg:py-8">
      <PageHeader
        title={translate(publication === undefined ? 'newTitle' : 'editTitle')}
        legend={translate('legend')}
        backHref="/member/publications"
        backLabel={translate('back')}
      />

      {error !== null && error.field === undefined && <Alert tone="danger" title={error.message} />}

      <Card className="flex max-w-2xl flex-col gap-4">
        {publication === undefined && (
          <SegmentedControl
            legend={translate('typeLegend')}
            name="type"
            value={draft.type}
            options={PUBLICATION_TYPES.map((type) => ({
              value: type,
              label: translate(`types.${type}`),
            }))}
            onChange={(value) => change('type', value)}
          />
        )}

        <Input
          label={translate('title')}
          name="title"
          value={draft.title}
          error={errorFor('title')}
          onChange={(event) => change('title', event.target.value)}
        />

        <Textarea
          label={translate('description')}
          name="description"
          value={draft.description}
          error={errorFor('description')}
          maxLength={800}
          onChange={(event) => change('description', event.target.value)}
        />

        {priced && (
          <>
            <Input
              label={translate('price')}
              help={translate('priceHelp')}
              name="price"
              inputMode="numeric"
              value={draft.price}
              error={errorFor('price')}
              onChange={(event) => change('price', event.target.value)}
            />
            <Input
              label={translate('imageUrl')}
              help={translate('imageUrlHelp')}
              name="imageUrl"
              type="url"
              placeholder={translate('imageUrlPlaceholder')}
              value={draft.imageUrl}
              error={errorFor('imageUrl')}
              onChange={(event) => change('imageUrl', event.target.value)}
            />
          </>
        )}

        {discounted && (
          <>
            <Input
              label={translate('percentage')}
              help={translate('percentageHelp')}
              name="percentage"
              inputMode="numeric"
              value={draft.percentage}
              error={errorFor('percentage')}
              onChange={(event) => change('percentage', event.target.value)}
            />
            <Input
              label={translate('condition')}
              name="condition"
              value={draft.condition}
              error={errorFor('condition')}
              onChange={(event) => change('condition', event.target.value)}
            />
          </>
        )}

        {timed && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label={translate('startsAt')}
              name="startsAt"
              type="date"
              value={draft.startsAt}
              error={errorFor('startsAt')}
              onChange={(event) => change('startsAt', event.target.value)}
            />
            <Input
              label={translate('endsAt')}
              name="endsAt"
              type="date"
              value={draft.endsAt}
              error={errorFor('endsAt')}
              onChange={(event) => change('endsAt', event.target.value)}
            />
          </div>
        )}

        <Combobox
          label={translate('category')}
          help={translate('categoryHelp')}
          options={[
            { value: '', label: translate('categoryNone') },
            ...activities.map((activity) => ({ value: activity._id, label: activity.name })),
          ]}
          value={draft.category}
          placeholder={translate('categoryPlaceholder')}
          emptyMessage={translate('categoryEmpty')}
          error={errorFor('category')}
          onChange={(value) => change('category', value)}
        />

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Button type="button" loading={saving} onClick={() => void submit()}>
            {translate(publication === undefined ? 'publish' : 'save')}
          </Button>
          <Link
            href="/member/publications"
            className="inline-flex min-h-11 items-center px-2 text-label-m text-fg-link lg:min-h-10"
          >
            {translate('cancel')}
          </Link>
        </div>
      </Card>
    </div>
  );
}
