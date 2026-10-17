import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

type PageHeaderProps = {
  title: string;
  legend?: string;
  backHref?: string;
  backLabel?: string;
};

// One page title, told twice. On a telephone it belongs in a bar with the way
// back beside it; on a wide screen there is room for the sentence under it.
export function PageHeader({ title, legend, backHref, backLabel }: PageHeaderProps) {
  return (
    <>
      <div className="sticky top-0 z-20 flex items-center gap-2 border-b border-line-subtle bg-surface py-2 lg:hidden">
        {backHref !== undefined && (
          <Link
            href={backHref}
            aria-label={backLabel}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xs text-fg-secondary"
          >
            <ChevronLeft aria-hidden="true" className="h-5 w-5" />
          </Link>
        )}
        <h1 className="min-w-0 flex-1 truncate text-heading-m text-fg">{title}</h1>
      </div>

      <header className="hidden lg:block">
        <h1 className="text-display-section text-fg">{title}</h1>
        {legend !== undefined && <p className="mt-2 text-body-l text-fg-secondary">{legend}</p>}
      </header>
    </>
  );
}
