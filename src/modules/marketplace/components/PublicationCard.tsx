'use client';

import Link from 'next/link';
import { ImageOff, MapPin, Tag } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useDates } from '@/shared/hooks/useDates';
import { formatColones } from '@/shared/utils/formatColones';
import type { MarketplacePublication } from '../api/marketplace';

type PublicationCardProps = {
  publication: MarketplacePublication;
  href: string;
};

// What a client sees in the grid: the picture, what it is, who sells it and what
// it costs. A promotion says what it takes off instead of a price.
export function PublicationCard({ publication, href }: PublicationCardProps) {
  const translate = useTranslations('public.marketplace');
  const dates = useDates();

  const value =
    publication.type === 'discount' && publication.percentage !== null
      ? translate('percentOff', { percentage: publication.percentage })
      : publication.price === null
        ? null
        : formatColones(publication.price);

  return (
    <Link
      href={href}
      className="flex h-full flex-col overflow-hidden rounded-lg border border-line-subtle bg-surface shadow-raised focus-visible:shadow-focus focus-visible:outline-none"
    >
      <div className="flex h-40 items-center justify-center bg-surface-subtle">
        {publication.imageUrl === null ? (
          <ImageOff aria-hidden className="size-8 text-fg-muted" />
        ) : (
          // The picture is whatever address the member gave; next/image would
          // need every host allowlisted first.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={publication.imageUrl}
            alt=""
            className="size-full object-cover"
            loading="lazy"
          />
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <span className="inline-flex w-fit items-center gap-1 rounded-full bg-brand-union-soft px-2 py-0.5 text-label-s text-fg-brand">
          <Tag aria-hidden className="size-3.5" />
          {translate(`types.${publication.type}`)}
        </span>

        <p className="text-heading-s text-fg">{publication.title}</p>

        {publication.business !== null && (
          <p className="flex items-center gap-1 text-body-s text-fg-muted">
            <MapPin aria-hidden className="size-3.5" />
            {[publication.business.businessName, publication.business.canton]
              .filter((part) => part !== null && part !== '')
              .join(' · ')}
          </p>
        )}

        {publication.endsAt !== null && (
          <p className="text-body-s text-fg-muted">
            {translate('until', { date: dates.calendarDay(publication.endsAt) })}
          </p>
        )}

        {value !== null && <p className="mt-auto font-display text-heading-m text-fg">{value}</p>}
      </div>
    </Link>
  );
}
