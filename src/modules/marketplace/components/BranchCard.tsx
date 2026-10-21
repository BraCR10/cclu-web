import { Clock, MapPin, Navigation, Phone } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { PublicBranch, ShopDayHours } from '../api/directory';
import { callHref, formatPhoneNumber } from '../phoneNumber';
import { hasHours } from '../weekHours';
import { WeekHours } from './WeekHours';

function directionsHref(branch: PublicBranch) {
  const place = [branch.address, branch.district, branch.canton, 'Costa Rica']
    .filter((part) => part !== null && part !== '')
    .join(', ');

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place)}`;
}

type BranchCardProps = { branch: PublicBranch; shopWeek: ShopDayHours[] };

// A branch keeps its own hours when it wrote them; otherwise it keeps the shop's.
export function BranchCard({ branch, shopWeek }: BranchCardProps) {
  const translate = useTranslations('public.directory.profile');
  const place = [branch.address, branch.district, branch.canton].filter(Boolean).join(', ');

  return (
    <article className="flex flex-col gap-3 rounded-md border border-line-subtle p-4">
      <header className="flex items-start justify-between gap-2">
        <h3 className="text-label-l text-fg">{branch.name}</h3>
        {branch.isPrimary && (
          <span className="rounded-xs bg-brand-union-soft px-2 py-0.5 text-label-s text-fg-brand">
            {translate('primaryBranch')}
          </span>
        )}
      </header>

      {place !== '' && (
        <p className="flex gap-2 text-body-s text-fg-secondary">
          <MapPin aria-hidden className="mt-0.5 size-4 shrink-0" />
          {place}
        </p>
      )}

      {branch.phone !== null && (
        <a
          href={callHref(branch.phone)}
          className="flex items-center gap-2 text-body-s text-fg-link hover:underline"
        >
          <Phone aria-hidden className="size-4 shrink-0" />
          {formatPhoneNumber(branch.phone)}
        </a>
      )}

      {(branch.schedule !== null || hasHours(shopWeek)) && (
        <div className="flex flex-col gap-2 rounded-sm bg-surface-subtle p-3">
          <p className="flex items-center gap-2 text-label-s text-fg-secondary">
            <Clock aria-hidden className="size-4" />
            {translate('hours')}
          </p>
          {branch.schedule !== null ? (
            <p className="text-body-s text-fg">{branch.schedule}</p>
          ) : (
            <WeekHours week={shopWeek} />
          )}
        </div>
      )}

      {place !== '' && (
        <a
          href={directionsHref(branch)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-10 items-center justify-center gap-2 self-start rounded-sm border border-secondary-border px-4 text-label-m text-fg hover:bg-surface-hover focus-visible:shadow-focus focus-visible:outline-none"
        >
          <Navigation aria-hidden className="size-4" />
          {translate('directions')}
        </a>
      )}
    </article>
  );
}
