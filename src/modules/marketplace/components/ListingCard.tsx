import Link from 'next/link';
import type { Listing } from '../api/listings';

const priceFormatter = new Intl.NumberFormat('es-CR', {
  style: 'currency',
  currency: 'CRC',
  maximumFractionDigits: 0,
});

type ListingCardProps = { listing: Listing };

export function ListingCard({ listing }: ListingCardProps) {
  return (
    <Link
      href={`/marketplace/${listing.id}`}
      className="flex flex-col gap-3 rounded-panel border border-border bg-surface-raised p-5 transition-colors hover:border-brand"
    >
      <div className="flex h-32 items-center justify-center overflow-hidden rounded-control border border-border bg-surface">
        {listing.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={listing.imageUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="text-xs text-content-muted">Sin imagen</span>
        )}
      </div>

      <div className="flex items-start justify-between gap-3">
        <h3 className="font-semibold tracking-tight">{listing.title}</h3>
        {listing.price !== null && (
          <span className="shrink-0 text-sm font-medium">
            {priceFormatter.format(listing.price)}
          </span>
        )}
      </div>

      {listing.business !== null && (
        <p className="text-sm text-content-muted">{listing.business.businessName}</p>
      )}

      <p className="line-clamp-2 text-sm text-content-muted">{listing.description}</p>

      {listing.category !== null && (
        <span className="w-fit rounded-pill bg-surface px-2.5 py-0.5 text-xs font-medium text-content-muted">
          {listing.category}
        </span>
      )}
    </Link>
  );
}
