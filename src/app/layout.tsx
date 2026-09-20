import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { THEME_BOOTSTRAP_SCRIPT } from '@/shared/theme/themeChoice';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Cámara de Comercio, Turismo, Industria y Afines del Cantón de La Unión',
  description:
    'Directorio de comercios afiliados, marketplace y bolsa de empleo de la Cámara de Comercio, Turismo, Industria y Afines del Cantón de La Unión.',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <head>
        {/* Before the first paint, so a chosen theme never flashes the other one. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP_SCRIPT }} />
      </head>
      <body className="flex min-h-full flex-col bg-surface text-content">{children}</body>
    </html>
  );
}
