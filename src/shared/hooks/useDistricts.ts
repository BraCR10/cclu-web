'use client';

import { useEffect, useState } from 'react';
import { readDistricts } from '@/shared/api/catalogs';

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
