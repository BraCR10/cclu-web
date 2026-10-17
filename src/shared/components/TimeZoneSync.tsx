'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTimeZone } from 'next-intl';
import { TIME_ZONE_COOKIE, isTimeZone } from '@/i18n/timeZone';

const ONE_YEAR_IN_SECONDS = 60 * 60 * 24 * 365;

// Tells the server which zone this browser is in, once. When the page was
// rendered in another zone, it is rendered again so every date on it moves to
// the viewer's clock.
export function TimeZoneSync() {
  const renderedIn = useTimeZone();
  const router = useRouter();

  useEffect(() => {
    const browserZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    if (!isTimeZone(browserZone) || browserZone === renderedIn) {
      return;
    }

    const secure = window.location.protocol === 'https:' ? '; secure' : '';

    document.cookie = `${TIME_ZONE_COOKIE}=${encodeURIComponent(browserZone)}; path=/; max-age=${ONE_YEAR_IN_SECONDS}; samesite=lax${secure}`;
    router.refresh();
  }, [renderedIn, router]);

  return null;
}
