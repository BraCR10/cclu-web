'use client';

import { useEffect, useState } from 'react';
import {
  readActivities,
  readCantons,
  type CatalogActivity,
  type CatalogCanton,
} from '@/shared/api/catalogs';
import { readDistricts } from '../api/directory';

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

type Districts = { canton: string; districts: string[] };

// The districts where a listed business is, for the canton chosen. They follow
// the canton, including one only chosen in the sheet and not yet applied.
export function useDistricts(canton: string) {
  const [answer, setAnswer] = useState<Districts | null>(null);

  useEffect(() => {
    if (canton === '') {
      return;
    }

    let cancelled = false;

    readDistricts(canton)
      .then(({ districts }) => {
        if (!cancelled) {
          setAnswer({ canton, districts });
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [canton]);

  return answer !== null && answer.canton === canton ? answer.districts : [];
}
