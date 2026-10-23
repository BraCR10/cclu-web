'use client';

import Link from 'next/link';
import { ImageOff } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Alert } from '@/shared/components/Alert';
import { Card } from '@/shared/components/Card';
import { PageHeader } from '@/shared/components/PageHeader';
import { useDates } from '@/shared/hooks/useDates';
import { formatColones } from '@/shared/utils/formatColones';
import { useMarketplaceItem } from '../hooks/useMarketplace';

// One publication as its own page, so a link can be shared straight to it.
export function PublicationPage({ publicationId }: { publicationId: string }) {
  const translate = useTranslations('public.marketplace');
  const dates = useDates();
  const state = useMarketplaceItem(publicationId);

  if (state.status === 'loading') {
    return (
      <div aria-hidden className="flex w-full flex-col gap-6 py-6 lg:py-12">
        <div className="h-72 animate-pulse rounded-lg bg-surface-hover" />
        <div className="h-40 animate-pulse rounded-lg bg-surface-hover" />
      </div>
    );
  }

  if (state.status === 'failed') {
    return (
      <div className="flex w-full flex-col gap-6 py-6 lg:py-12">
        <PageHeader
          title={translate('detailFailedTitle')}
          backHref="/marketplace"
          backLabel={translate('back')}
        />
        <Alert tone="danger" title={translate('detailFailed')} />
      </div>
    );
  }

  const publication = state.publication;
  const value =
    publication.type === 'discount' && publication.percentage !== null
      ? translate('percentOff', { percentage: publication.percentage })
      : publication.price === null
        ? null
        : formatColones(publication.price);
  const directoryHref =
    publication.business?.memberCode === null || publication.business?.memberCode === undefined
      ? null
      : `/directory/${publication.business.memberCode}`;

  return (
    <div className="flex w-full flex-col gap-6 py-6 lg:gap-8 lg:py-12">
      <PageHeader title={publication.title} backHref="/marketplace" backLabel={translate('back')} />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:items-start">
        <div className="flex flex-col gap-6">
          <div className="flex h-72 items-center justify-center overflow-hidden rounded-lg border border-line-subtle bg-surface-subtle">
            {publication.imageUrl === null ? (
              <ImageOff aria-hidden className="size-10 text-fg-muted" />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={publication.imageUrl}
                alt=""
                className="size-full object-cover"
                loading="lazy"
              />
            )}
          </div>

          <Card className="flex flex-col gap-3">
            <p className="text-body-l text-fg-secondary">{publication.description}</p>

            {publication.condition !== null && (
              <p className="text-body-m text-fg">
                {translate('condition', { condition: publication.condition })}
              </p>
            )}
          </Card>
        </div>

        <Card className="flex flex-col gap-4">
          <span className="inline-flex w-fit items-center rounded-full bg-brand-union-soft px-2 py-0.5 text-label-s text-fg-brand">
            {translate(`types.${publication.type}`)}
          </span>

          {value !== null && <p className="font-display text-heading-xl text-fg">{value}</p>}

          {publication.endsAt !== null && (
            <p className="text-body-m text-fg-secondary">
              {translate('validUntil', { date: dates.calendarDay(publication.endsAt) })}
            </p>
          )}

          {publication.business !== null && (
            <div className="border-t border-line-subtle pt-4">
              <p className="text-caption text-fg-muted">{translate('soldBy')}</p>
              <p className="text-heading-s text-fg">{publication.business.businessName}</p>
              {[publication.business.canton, publication.business.district]
                .filter((part) => part !== null && part !== '')
                .map((part) => (
                  <p key={part} className="text-body-s text-fg-secondary">
                    {part}
                  </p>
                ))}
              {directoryHref !== null && (
                <Link
                  href={directoryHref}
                  className="mt-3 inline-flex min-h-11 items-center text-label-m text-fg-link underline-offset-4 hover:underline lg:min-h-10"
                >
                  {translate('seeBusiness')}
                </Link>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
