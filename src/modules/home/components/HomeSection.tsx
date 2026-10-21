import Link from 'next/link';
import type { ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';

type HomeSectionProps = {
  id: string;
  title: string;
  link?: { href: string; label: string };
  children: ReactNode;
};

// One block of the home page: its title, the way to see all of it, and what it
// shows. Every section reads the same, so the page scans as a list.
export function HomeSection({ id, title, link, children }: HomeSectionProps) {
  return (
    <section aria-labelledby={id} className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <h2 id={id} className="font-display text-heading-l text-fg lg:text-heading-xl">
          {title}
        </h2>
        {link !== undefined && (
          <Link
            href={link.href}
            className="inline-flex min-h-11 shrink-0 items-center gap-1 text-label-m text-fg-link hover:underline focus-visible:shadow-focus focus-visible:outline-none"
          >
            {link.label}
            <ChevronRight aria-hidden className="size-4" />
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

// A row that scrolls sideways on a telephone and lays out as a grid with room.
export function CardRow({ children }: { children: ReactNode }) {
  return (
    <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 lg:mx-0 lg:grid lg:grid-cols-4 lg:overflow-visible lg:px-0 lg:pb-0 [&>*]:w-[78%] [&>*]:shrink-0 [&>*]:snap-start md:[&>*]:w-[45%] lg:[&>*]:w-auto">
      {children}
    </div>
  );
}

export function EmptySection({ message }: { message: string }) {
  return (
    <p className="rounded-lg border border-dashed border-line bg-surface-subtle p-6 text-center text-body-m text-fg-secondary">
      {message}
    </p>
  );
}
