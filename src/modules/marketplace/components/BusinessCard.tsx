import Link from 'next/link';
import { Globe, MapPin, ShieldCheck } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Avatar } from '@/shared/components/Avatar';
import { PlanBadge } from '@/shared/components/PlanBadge';
import { publicProfilePath } from '@/shared/utils/publicProfilePath';
import { logoUrl, type DirectoryListing } from '../api/directory';

function PlaceLine({ listing }: { listing: DirectoryListing }) {
  const translate = useTranslations('public.directory.card');

  if (listing.online) {
    return (
      <p className="flex items-center gap-1.5 text-body-s text-fg-secondary">
        <Globe aria-hidden className="size-4 shrink-0" />
        {translate('online')}
      </p>
    );
  }

  if (listing.branch === null) {
    return null;
  }

  return (
    <p className="flex flex-wrap items-center gap-x-1.5 text-body-s text-fg-secondary">
      <MapPin aria-hidden className="size-4 shrink-0" />
      {listing.branch.name}
      {listing.otherBranches > 0 && (
        <span className="text-fg-link">
          {translate('otherBranches', { count: listing.otherBranches })}
        </span>
      )}
    </p>
  );
}

// One business in the directory: a row on a telephone, a card in the grid on a
// desktop. The whole of it opens the business's public page.
export function BusinessCard({ listing }: { listing: DirectoryListing }) {
  const translate = useTranslations('public.directory.card');

  return (
    <Link
      href={publicProfilePath(listing.memberCode)}
      className="flex h-full gap-3 p-4 hover:bg-surface-hover focus-visible:shadow-focus focus-visible:outline-none lg:flex-col lg:gap-4 lg:rounded-lg lg:border lg:border-line-subtle lg:bg-surface lg:shadow-raised"
    >
      <div className="flex items-start justify-between gap-2">
        <Avatar
          name={listing.businessName}
          src={listing.logoFileKey === null ? undefined : logoUrl(listing.logoFileKey)}
          size="m"
        />
        {listing.plan !== null && (
          <span className="hidden lg:inline-flex">
            <PlanBadge planKey={listing.plan.key} name={listing.plan.name} />
          </span>
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="text-label-l text-fg lg:text-heading-s">{listing.businessName}</p>
        {listing.activity !== null && (
          <p className="text-body-s text-fg-secondary">{listing.activity}</p>
        )}
        <PlaceLine listing={listing} />
        <p className="mt-1 flex items-center gap-1.5 text-label-s text-success lg:mt-auto lg:border-t lg:border-line-subtle lg:pt-3">
          <ShieldCheck aria-hidden className="size-4 shrink-0" />
          {translate('verified')}
        </p>
      </div>
    </Link>
  );
}
