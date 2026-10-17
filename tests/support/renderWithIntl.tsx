import type { ReactElement, ReactNode } from 'react';
import { render, renderHook } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { formats, timeZone } from '@/i18n/formats';
import { locale, messages } from '@/i18n/messages';

// The same time zone and formats the application is configured with, so a
// test reads dates the way a person would.
function IntlProvider({ children }: { children: ReactNode }) {
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
}

export function renderWithIntl(element: ReactElement) {
  return render(element, { wrapper: IntlProvider });
}

export function renderHookWithIntl<Result>(hook: () => Result) {
  return renderHook(hook, { wrapper: IntlProvider });
}
