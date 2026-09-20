import type { ReactNode } from 'react';
import { SiteHeader } from '@/shared/components/SiteHeader';
import { SiteFooter } from '@/shared/components/SiteFooter';

// The chrome lives in a layout so it is mounted once and survives every move
// between public screens. Rendered inside each page, it was torn down and
// rebuilt on every click.
export default function PublicSiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SiteHeader />
      <div className="flex flex-1 flex-col">{children}</div>
      <SiteFooter />
    </>
  );
}
