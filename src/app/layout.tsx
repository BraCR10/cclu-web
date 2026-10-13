import type { Metadata } from 'next';
import { Red_Hat_Display, Red_Hat_Text } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { locale } from '@/i18n/messages';
import { ToastProvider } from '@/shared/components/ToastProvider';
import './globals.css';

const redHatDisplay = Red_Hat_Display({
  variable: '--font-red-hat-display',
  subsets: ['latin'],
  display: 'swap',
});

const redHatText = Red_Hat_Text({
  variable: '--font-red-hat-text',
  subsets: ['latin'],
  display: 'swap',
});

export async function generateMetadata(): Promise<Metadata> {
  const translate = await getTranslations('common');

  return { title: translate('appName') };
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang={locale}
      className={`${redHatDisplay.variable} ${redHatText.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <NextIntlClientProvider>
          <ToastProvider>{children}</ToastProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
