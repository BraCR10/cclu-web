'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import QRCode from 'react-qr-code';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { useDates } from '@/shared/hooks/useDates';
import { classNames } from '@/shared/utils/classNames';
import type { Membership } from '../api/membership';
import type { PlanKey } from '../api/plans';
import { PlanBadge } from '@/shared/components/PlanBadge';

type CardAppearance = {
  surface: string;
  heading: string;
  caption: string;
  tile: string;
  artwork: string;
};

// The prototype's "Member ID card": one colour per plan, Gratuita light, Lite
// in monte green, Pro in unión blue and Premium in deep blue with sol accents.
const APPEARANCE: Record<PlanKey, CardAppearance> = {
  free: {
    surface: 'border border-line-subtle bg-surface',
    heading: 'text-fg',
    caption: 'text-fg-secondary',
    tile: 'border border-line-subtle',
    artwork: 'free',
  },
  lite: {
    surface: 'bg-brand-monte-dark',
    heading: 'text-fg-inverse',
    caption: 'text-fg-inverse',
    tile: '',
    artwork: 'lite',
  },
  pro: {
    surface: 'bg-brand-union',
    heading: 'text-fg-inverse',
    caption: 'text-fg-inverse',
    tile: '',
    artwork: 'pro',
  },
  premium: {
    surface: 'border-[1.5px] border-brand-sol bg-brand-union-deep',
    heading: 'text-fg-inverse',
    caption: 'text-fg-inverse',
    tile: '',
    artwork: 'premium',
  },
};

// The prototype sizes the code for CLU001. Anything longer, such as a code
// given before that format, is drawn smaller so it still fits on one line.
const SHORT_CODE_LENGTH = 7;

type MemberCardProps = {
  membership: Membership;
  // Empty until the page knows which address it is being served from.
  publicUrl: string;
};

function CardArtwork({ planKey }: { planKey: PlanKey }) {
  const name = APPEARANCE[planKey].artwork;

  return (
    <>
      <div aria-hidden className="absolute right-0 bottom-0 -left-[30%] h-[41%]">
        <Image src={`/brand/card/${name}-back-hill.svg`} alt="" fill sizes="676px" />
      </div>
      {planKey === 'premium' && (
        <div aria-hidden className="absolute top-[59.5%] left-[53.5%] aspect-square w-[12.3%]">
          <Image src="/brand/card/premium-sun.svg" alt="" fill sizes="64px" />
        </div>
      )}
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-[30%]">
        <Image src={`/brand/card/${name}-hill.svg`} alt="" fill sizes="520px" />
      </div>
    </>
  );
}

// M-03 and MM-03: the card the member shows in their shop. Everything on it is
// what a customer needs to trust the code and reach the public profile.
export function MemberCard({ membership, publicUrl }: MemberCardProps) {
  const translate = useTranslations('member.card');
  const dates = useDates();
  const { businessName, memberCode, plan, expiresAt, lapsed } = membership;
  const lapsedTerm = lapsed === null ? null : lapsed.validUntil;
  const appearance = APPEARANCE[plan.key];

  const term =
    lapsedTerm === null
      ? expiresAt === null
        ? translate('noExpiry')
        : translate('validUntil', { date: dates.termEnd(expiresAt) })
      : translate('lapsedOn', { date: dates.calendarDay(lapsedTerm) });

  return (
    <article
      aria-label={translate('label', { business: businessName })}
      // Below 440 px of room the card takes the prototype's default size, above it
      // the large one: it answers to the column it sits in, not to the screen. The
      // prototype's height is a minimum, so a long term grows the card instead of
      // being cut off.
      className={classNames(
        'relative isolate @container flex min-h-[228px] w-full max-w-[520px] overflow-hidden rounded-xl shadow-overlay @min-[440px]:min-h-[330px]',
        appearance.surface,
      )}
    >
      <div className="absolute inset-0 -z-10">
        <CardArtwork planKey={plan.key} />
      </div>

      <div className="flex flex-1 gap-4 p-5 @min-[440px]:p-8">
        <div className="flex min-w-0 flex-1 flex-col items-start justify-between gap-3">
          <div className={classNames('rounded-sm bg-surface px-2 py-1', appearance.tile)}>
            <Image
              src="/brand/card/cclu-logo.png"
              alt={translate('chamber')}
              width={136}
              height={44}
              priority
              className="h-[30px] w-[92px] object-contain @min-[440px]:h-11 @min-[440px]:w-[136px]"
            />
          </div>

          <div className="flex w-full min-w-0 flex-col gap-0.5 @min-[440px]:gap-1">
            <p className={classNames('text-caption @min-[440px]:text-label-s', appearance.caption)}>
              {translate('chamber')}
            </p>
            <p
              className={classNames(
                'truncate font-display text-heading-s @min-[440px]:text-heading-l',
                appearance.heading,
              )}
            >
              {businessName}
            </p>
            {/* Always one line. The prototype's size fits a code like CLU001; a
                longer one shrinks with the room the card has rather than wrap. */}
            <p
              className={classNames(
                'font-display leading-[1.1] font-bold whitespace-nowrap @min-[440px]:leading-[1.05] @min-[440px]:tracking-[-1px]',
                memberCode.length > SHORT_CODE_LENGTH
                  ? 'text-[length:7.5cqw] @min-[440px]:text-[length:8cqw]'
                  : 'text-[length:min(2.25rem,10cqw)] @min-[440px]:text-[length:min(3.5rem,10.5cqw)]',
                appearance.heading,
              )}
            >
              {memberCode}
            </p>
          </div>

          <div className="flex flex-col items-start gap-1">
            <PlanBadge planKey={plan.key} name={plan.name} />
            <p className={classNames('text-label-s @min-[440px]:text-label-m', appearance.heading)}>
              {term}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end justify-between">
          <StatusBadge
            tone={lapsed === null ? 'success' : 'warning'}
            label={translate(lapsed === null ? 'active' : 'lapsed')}
          />
          <div className={classNames('rounded-md bg-surface p-2', appearance.tile)}>
            {publicUrl === '' ? (
              <div aria-hidden className="size-[76px] @min-[440px]:size-28" />
            ) : (
              <QRCode
                value={publicUrl}
                size={112}
                level="M"
                bgColor="#ffffff"
                fgColor="#13212c"
                title={translate('qrTitle')}
                className="size-[76px] @min-[440px]:size-28"
              />
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
