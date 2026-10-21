'use client';

import { useEffect, useState } from 'react';
import { readDistricts } from '@/shared/api/catalogs';

type Districts = { canton: string; districts: string[] };

type ReadDistricts = (canton: string) => Promise<{ districts: string[] }>;

// The districts on offer for the canton chosen: by default where a listed
// business is. They follow the canton, including one only chosen in the sheet
// and not yet applied. `read` must be defined outside the component.
export function useDistricts(canton: string, read: ReadDistricts = readDistricts) {
  const [answer, setAnswer] = useState<Districts | null>(null);

  useEffect(() => {
    if (canton === '') {
      return;
    }

    let cancelled = false;

    read(canton)
      .then(({ districts }) => {
        if (!cancelled) {
          setAnswer({ canton, districts });
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [canton, read]);

  return answer !== null && answer.canton === canton ? answer.districts : [];
}
