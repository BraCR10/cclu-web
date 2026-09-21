'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchListing, type Listing } from '../api/listings';
import { BusinessContact } from './BusinessContact';

const priceFormatter = new Intl.NumberFormat('es-CR', {
  style: 'currency',
  currency: 'CRC',
  maximumFractionDigits: 0,
});

type ListingDetailProps = {
  id: string;
  loadListing?: (id: string) => Promise<Listing>;
};

export function ListingDetail({ id, loadListing = fetchListing }: ListingDetailProps) {
  const [listing, setListing] = useState<Listing | null>(null);
  const [missing, setMissing] = useState(false);

  const read = useCallback(() => loadListing(id), [loadListing, id]);

  useEffect(() => {
    let stillMounted = true;

    read()
      .then((found) => {
        if (stillMounted) {
          setListing(found);
        }
      })
      .catch(() => {
        if (stillMounted) {
          setMissing(true);
        }
      });

    return () => {
      stillMounted = false;
    };
  }, [read]);

  if (missing) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-panel border border-dashed border-border p-12 text-center">
        <p className="font-medium">Esta publicación ya no está disponible</p>
        <p className="max-w-sm text-sm text-content-muted">
          Puede que haya sido retirada por quien la publicó.
        </p>
        <Link href="/marketplace" className="text-sm font-medium text-brand">
          Volver al marketplace
        </Link>
      </div>
    );
  }

  if (listing === null) {
    return <p className="text-sm text-content-muted">Cargando la publicación…</p>;
  }

  return (
    <article className="animate-panel-in flex flex-col gap-6 rounded-panel border border-border bg-surface-raised p-6 sm:p-8">
      {listing.imageUrl !== null && (
        <div className="h-56 w-full overflow-hidden rounded-control border border-border bg-surface">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={listing.imageUrl} alt="" className="h-full w-full object-cover" />
        </div>
      )}

      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold tracking-tight text-balance">{listing.title}</h1>
        {listing.business !== null && (
          <p className="text-sm text-content-muted">{listing.business.businessName}</p>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {listing.price !== null && (
          <span className="rounded-pill bg-surface px-3 py-1 text-xs font-medium">
            {priceFormatter.format(listing.price)}
          </span>
        )}
        {listing.category !== null && (
          <span className="rounded-pill bg-surface px-3 py-1 text-xs font-medium">
            {listing.category}
          </span>
        )}
      </div>

      <p className="border-l-2 border-border pl-4 leading-relaxed whitespace-pre-line text-content-muted">
        {listing.description}
      </p>

      {listing.business !== null && <BusinessContact business={listing.business} />}
    </article>
  );
}
