'use client';

import Link from 'next/link';
import { useRef, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { classNames } from '@/shared/utils/classNames';

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

// A row that scrolls sideways: swiped on a telephone, moved a screenful at a
// time with the arrows once there is room for four cards.
export function CardRow({ children, label }: { children: ReactNode; label: string }) {
  const translate = useTranslations('public.home.carousel');
  const track = useRef<HTMLDivElement>(null);

  function move(direction: 1 | -1) {
    const element = track.current;

    if (element !== null) {
      element.scrollBy({ left: direction * element.clientWidth, behavior: 'smooth' });
    }
  }

  return (
    <div role="region" aria-label={label} className="relative">
      <div
        ref={track}
        className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 lg:mx-0 lg:px-0 [&>*]:w-[78%] [&>*]:shrink-0 [&>*]:snap-start md:[&>*]:w-[45%] lg:[&>*]:w-[calc((100%-3rem)/4)]"
      >
        {children}
      </div>
      {(['previous', 'next'] as const).map((direction) => (
        <button
          key={direction}
          type="button"
          aria-label={translate(direction)}
          onClick={() => move(direction === 'next' ? 1 : -1)}
          className={classNames(
            'absolute top-1/2 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full border border-line-subtle bg-surface text-fg shadow-raised hover:bg-surface-hover focus-visible:shadow-focus focus-visible:outline-none lg:flex',
            direction === 'next' ? '-right-5' : '-left-5',
          )}
        >
          {direction === 'next' ? (
            <ChevronRight aria-hidden className="size-5" />
          ) : (
            <ChevronLeft aria-hidden className="size-5" />
          )}
        </button>
      ))}
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
