'use client';

import { useCallback, useEffect, useState } from 'react';
import { ToastStack } from '@/shared/components/ToastStack';
import { useToasts } from '@/shared/components/useToasts';
import { PaidGateNotice } from '@/shared/components/PaidGateNotice';
import {
  fetchOwnMembership,
  MEMBERSHIP_TYPES,
  type Membership,
} from '@/modules/members/api/membership';
import { fetchOwnListings, closeListing as closeListingApi, type Listing } from '../api/listings';
import { ListingForm } from './ListingForm';

const priceFormatter = new Intl.NumberFormat('es-CR', {
  style: 'currency',
  currency: 'CRC',
  maximumFractionDigits: 0,
});

type MyListingsPanelProps = {
  loadListings?: () => Promise<Listing[]>;
  loadMembership?: () => Promise<Membership>;
  removeListing?: (id: string) => Promise<void>;
};

export function MyListingsPanel({
  loadListings = fetchOwnListings,
  loadMembership = fetchOwnMembership,
  removeListing = closeListingApi,
}: MyListingsPanelProps) {
  const [listings, setListings] = useState<Listing[] | null>(null);
  const [membership, setMembership] = useState<Membership | null>(null);
  const [failed, setFailed] = useState(false);
  const [editing, setEditing] = useState<Listing | 'new' | null>(null);
  const { toasts, show, dismiss } = useToasts();

  const refresh = useCallback(() => {
    loadListings()
      .then(setListings)
      .catch(() => setFailed(true));
  }, [loadListings]);

  useEffect(() => {
    let stillMounted = true;

    Promise.all([loadListings(), loadMembership()])
      .then(([found, foundMembership]) => {
        if (stillMounted) {
          setListings(found);
          setMembership(foundMembership);
        }
      })
      .catch(() => {
        if (stillMounted) {
          setFailed(true);
        }
      });

    return () => {
      stillMounted = false;
    };
  }, [loadListings, loadMembership]);

  // Stays open on the listing just saved, rather than closing: a brand new
  // listing only gets an id here, and that id is what its image is attached
  // to. Closing immediately would mean creating, then reopening, to add one.
  function handleSaved(saved: Listing) {
    setEditing(saved);
    refresh();
    show({ tone: 'success', title: 'La publicación quedó guardada' });
  }

  function handleDone() {
    setEditing(null);
    refresh();
  }

  async function handleClose(listing: Listing) {
    try {
      await removeListing(listing.id);
      refresh();
      show({ tone: 'success', title: 'La publicación fue retirada' });
    } catch {
      show({ tone: 'problem', title: 'No se pudo retirar la publicación' });
    }
  }

  if (editing !== null) {
    return (
      <ListingForm
        listing={editing === 'new' ? undefined : editing}
        onSaved={handleSaved}
        onDone={handleDone}
      />
    );
  }

  const isFree = membership !== null && membership.type === MEMBERSHIP_TYPES.FREE;

  return (
    <div className="flex flex-col gap-6">
      <ToastStack toasts={toasts} onDismiss={dismiss} />

      {isFree ? (
        <PaidGateNotice />
      ) : (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setEditing('new')}
            className="rounded-control bg-brand px-6 py-2.5 font-medium text-on-brand"
          >
            Publicar
          </button>
        </div>
      )}

      {failed && (
        <p role="alert" className="text-sm text-danger">
          No fue posible cargar sus publicaciones.
        </p>
      )}

      {!failed && listings === null && <p className="text-sm text-content-muted">Cargando…</p>}

      {!failed && listings !== null && listings.length === 0 && (
        <p className="text-sm text-content-muted">
          Todavía no ha publicado nada en el marketplace.
        </p>
      )}

      {!failed && listings !== null && listings.length > 0 && (
        <ul className="flex flex-col gap-3">
          {listings.map((listing) => (
            <li
              key={listing.id}
              className="flex items-center justify-between gap-4 rounded-panel border border-border bg-surface-raised p-4"
            >
              <div className="flex flex-col gap-1">
                <span className="font-medium">{listing.title}</span>
                <span className="text-xs text-content-muted">
                  {listing.price !== null ? priceFormatter.format(listing.price) : 'Sin precio'} ·{' '}
                  {listing.isActive ? 'Activa' : 'Retirada'}
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditing(listing)}
                  className="rounded-control border border-border px-4 py-2 text-sm font-medium"
                >
                  Editar
                </button>
                {listing.isActive && (
                  <button
                    type="button"
                    onClick={() => handleClose(listing)}
                    className="rounded-control border border-border px-4 py-2 text-sm font-medium text-danger"
                  >
                    Retirar
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
