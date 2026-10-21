'use client';

import { useEffect, useState } from 'react';
import {
  readActivities,
  readCantons,
  type CatalogActivity,
  type CatalogCanton,
} from '@/shared/api/catalogs';

type Catalogs = { cantons: CatalogCanton[]; activities: CatalogActivity[] };

const EMPTY_CATALOGS: Catalogs = { cantons: [], activities: [] };

// A filter with nothing to offer is still usable as "Todos", so a catalog that
// fails to load leaves its select with that single choice rather than an error.
export function useDirectoryCatalogs() {
  const [catalogs, setCatalogs] = useState<Catalogs>(EMPTY_CATALOGS);

  useEffect(() => {
    let cancelled = false;

    Promise.all([readCantons(), readActivities()])
      .then(([cantons, activities]) => {
        if (!cancelled) {
          setCatalogs({ cantons, activities });
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  return catalogs;
}
