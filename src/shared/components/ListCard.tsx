import Link from 'next/link';
import type { ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';
import { Avatar } from './Avatar';

type ListCardProps = {
  name: string;
  line: string;
  badges?: ReactNode;
  // A card with an address opens it whole; otherwise it ends in its action.
  href?: string;
  linkLabel?: string;
  action?: ReactNode;
};

// One row of a panel list on a telephone. The badges get their own line, so a
// long business name is never cut to make room for them.
export function ListCard({ name, line, badges, href, linkLabel, action }: ListCardProps) {
  const content = (
    <>
      <Avatar name={name} size="m" />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="truncate text-label-m text-fg">{name}</p>
        <p className="text-body-s text-fg-muted">{line}</p>
        {badges && <div className="flex flex-wrap items-center gap-2">{badges}</div>}
      </div>
    </>
  );

  if (href !== undefined) {
    return (
      <Link
        href={href}
        aria-label={linkLabel}
        className="flex min-h-11 items-center gap-3 p-4 hover:bg-surface-hover focus-visible:shadow-focus focus-visible:outline-none"
      >
        {content}
        <ChevronRight aria-hidden className="size-5 shrink-0 text-fg-muted" />
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-3 p-4">
      {content}
      {action}
    </div>
  );
}
