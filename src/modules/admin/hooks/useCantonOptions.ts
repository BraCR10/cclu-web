'use client';

import { useEffect, useState } from 'react';
import { readCantons, type CatalogCanton } from '@/shared/api/catalogs';

// A filter with nothing to offer still works as "Todos", so a catalog that
// fails to load leaves its select with that single choice.
export function useCantonOptions() {
  const [cantons, setCantons] = useState<CatalogCanton[]>([]);

  useEffect(() => {
    let cancelled = false;

    readCantons()
      .then((list) => !cancelled && setCantons(list))
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  return cantons;
}
