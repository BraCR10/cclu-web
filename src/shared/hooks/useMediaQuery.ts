'use client';

import { useSyncExternalStore } from 'react';

// Matches the lg breakpoint in globals.css, where the desktop frame starts.
export const DESKTOP_QUERY = '(min-width: 64rem)';

export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const list = window.matchMedia(query);
      list.addEventListener('change', onChange);
      return () => list.removeEventListener('change', onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

export function useIsDesktop(): boolean {
  return useMediaQuery(DESKTOP_QUERY);
}
