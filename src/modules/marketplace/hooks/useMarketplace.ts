'use client';

import { useEffect, useState } from 'react';
import type { Paginated } from '@/shared/api/pagination';
import { usePagedList } from '@/shared/hooks/usePagedList';
import {
  NO_MARKETPLACE_FILTERS,
  readMarketplace,
  readMarketplaceItem,
  type MarketplaceFilters,
  type MarketplacePublication,
} from '../api/marketplace';

export function useMarketplace() {
  return usePagedList<MarketplaceFilters, Paginated<MarketplacePublication>>(
    readMarketplace,
    NO_MARKETPLACE_FILTERS,
  );
}

export type ItemState =
  | { status: 'loading' }
  | { status: 'failed' }
  | { status: 'ready'; publication: MarketplacePublication };

// What one publication shows, read by its id from the address, so a link can be
// shared straight to it.
export function useMarketplaceItem(publicationId: string): ItemState {
  const [state, setState] = useState<ItemState>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;

    readMarketplaceItem(publicationId)
      .then((publication) => {
        if (!cancelled) {
          setState({ status: 'ready', publication });
        }
      })
      .catch(() => {
        if (!cancelled) {
          setState({ status: 'failed' });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [publicationId]);

  return state;
}
