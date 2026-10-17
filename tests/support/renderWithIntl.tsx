import type { ReactElement, ReactNode } from 'react';
import { render, renderHook } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { formats } from '@/i18n/formats';
import { CHAMBER_TIME_ZONE } from '@/i18n/timeZone';
import { locale, messages } from '@/i18n/messages';

// The formats the application is configured with, and the zone a first visit
// renders in unless a test names the viewer's.
function providerIn(timeZone: string) {
  return function IntlProvider({ children }: { children: ReactNode }) {
    return (
      <NextIntlClientProvider
        locale={locale}
        messages={messages}
        timeZone={timeZone}
        formats={formats}
      >
        {children}
      </NextIntlClientProvider>
    );
  };
}

export function renderWithIntl(element: ReactElement, timeZone = CHAMBER_TIME_ZONE) {
  return render(element, { wrapper: providerIn(timeZone) });
}

export function renderHookWithIntl<Result>(hook: () => Result, timeZone = CHAMBER_TIME_ZONE) {
  return renderHook(hook, { wrapper: providerIn(timeZone) });
}
