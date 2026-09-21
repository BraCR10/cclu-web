import Link from 'next/link';
import { MEMBER_TYPE_LABELS } from '@/shared/config/memberTypes';
import { directoryPathFor } from '../memberCard';
import type { DirectoryEntry } from '../api/directory';

type MemberDirectoryCardProps = { entry: DirectoryEntry };

// One row of the roll. The full ficha a click away carries everything else;
// this is only what helps someone decide whether to open it.
export function MemberDirectoryCard({ entry }: MemberDirectoryCardProps) {
  const kind = `${MEMBER_TYPE_LABELS[entry.memberType]}${
    entry.sector === null ? '' : ` · ${entry.sector}`
  }`;

  return (
    <Link
      href={directoryPathFor(entry.memberCode)}
      className="flex flex-col gap-3 rounded-panel border border-border bg-surface-raised p-5 transition-colors hover:border-brand"
    >
      <div className="flex items-center gap-3">
        <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-control border border-border bg-surface">
          {entry.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={entry.logoUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="text-sm font-semibold text-content-muted">
              {entry.businessName.charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        <div className="flex min-w-0 flex-col gap-0.5">
          <h3 className="truncate font-semibold tracking-tight">{entry.businessName}</h3>
          <p className="truncate text-xs text-content-muted">{kind}</p>
        </div>
      </div>

      <p className="line-clamp-2 text-sm text-content-muted">{entry.businessDescription}</p>

      <p className="text-xs text-content-muted">{entry.canton ?? 'Sin cantón'}</p>
    </Link>
  );
}
