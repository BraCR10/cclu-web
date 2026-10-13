import type { ReactElement, ReactNode } from 'react';
import { render, renderHook } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { locale, messages } from '@/i18n/messages';

function IntlProvider({ children }: { children: ReactNode }) {
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
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
