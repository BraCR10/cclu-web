'use client';

import { useEffect, useState } from 'react';
import { readCantons, type CatalogCanton } from '@/shared/api/catalogs';
import type { Paginated } from '@/shared/api/pagination';
import { usePagedList } from '@/shared/hooks/usePagedList';
import {
  NO_BOARD_FILTERS,
  readBoard,
  type BoardFilters,
  type BoardVacancy,
} from '../api/vacancies';

export function useJobBoard() {
  return usePagedList<BoardFilters, Paginated<BoardVacancy>>(readBoard, NO_BOARD_FILTERS);
}

// A filter with nothing to offer still works as "Todos", so a catalog that
// fails to load leaves its select with that single choice.
export function useCantons() {
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
