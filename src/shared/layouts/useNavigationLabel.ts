'use client';

import { useTranslations } from 'next-intl';

// Navigation lists keep their message keys as data, so the lookup is by a key
// the compiler cannot narrow; the message files are what keep it valid.
export function useNavigationLabel(): (key: string) => string {
  const translate = useTranslations();

  return (key) => translate(key as Parameters<typeof translate>[0]);
}
