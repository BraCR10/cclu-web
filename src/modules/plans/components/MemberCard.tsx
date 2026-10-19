'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import QRCode from 'react-qr-code';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { useDates } from '@/shared/hooks/useDates';
import { classNames } from '@/shared/utils/classNames';
import type { Membership } from '../api/membership';
import type { PlanKey } from '../api/plans';
import { PlanBadge } from './PlanBadge';

// Each plan tints the card, which is what the chamber sells: the prototype has
// the same card in four colours.
const WAVE_CLASSES: Record<PlanKey, string> = {
  free: 'text-plan-free',
  lite: 'text-plan-lite',
  pro: 'text-plan-pro',
  premium: 'text-plan-premium',
};

type MemberCardProps = {
  membership: Membership;
  // Empty until the page knows which address it is being served from.
  publicUrl: string;
};

// M-03 and MM-03: the card the member shows in their shop. Everything on it is
// what a customer needs to trust the code and reach the public profile.
export function MemberCard({ membership, publicUrl }: MemberCardProps) {
  const translate = useTranslations('member.card');
  const dates = useDates();
  const { businessName, memberCode, plan, expiresAt, lapsed } = membership;
  const lapsedTerm = lapsed === null ? null : lapsed.validUntil;

  return (
    <article
      aria-label={translate('label', { business: businessName })}
      className="relative isolate overflow-hidden rounded-xl border border-line-subtle bg-surface shadow-raised"
    >
      <svg
        aria-hidden
        viewBox="0 0 520 150"
        preserveAspectRatio="none"
        className={classNames(
          'absolute inset-x-0 bottom-0 -z-10 h-2/5 w-full',
          WAVE_CLASSES[plan.key],
        )}
      >
        <path
          d="M0 74c92-44 176 34 268 8 96-24 158-46 252-12v80H0z"
          fill="currentColor"
          opacity="0.18"
        />
        <path
          d="M0 112c104-40 176 12 260-6 86-18 158-30 260 6v38H0z"
          fill="currentColor"
          opacity="0.32"
        />
      </svg>

      <div className="flex flex-col gap-5 p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <Image
            src="/brand/cclu-logo.png"
            alt={translate('chamber')}
            width={160}
            height={52}
            priority
            className="h-11 w-auto rounded-md bg-surface px-2 py-1 ring-1 ring-line-subtle"
          />
          <StatusBadge
            tone={lapsed === null ? 'success' : 'warning'}
            label={translate(lapsed === null ? 'active' : 'lapsed')}
          />
        </div>

        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="min-w-0">
            <p className="text-body-s text-fg-muted">{translate('chamber')}</p>
            <p className="mt-1 font-display text-heading-l text-fg">{businessName}</p>
            <p className="mt-1 font-display text-display-section text-fg">{memberCode}</p>
          </div>

          <div className="shrink-0 rounded-lg border border-line-subtle bg-surface p-2 shadow-raised">
            {publicUrl === '' ? (
              <div aria-hidden className="size-[7.5rem]" />
            ) : (
              <QRCode
                value={publicUrl}
                size={120}
                level="M"
                bgColor="#ffffff"
                fgColor="#13212c"
                title={translate('qrTitle')}
              />
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <PlanBadge planKey={plan.key} name={plan.name} />
          <span className="text-body-s text-fg-secondary">
            {lapsedTerm === null
              ? expiresAt === null
                ? translate('noExpiry')
                : translate('validUntil', { date: dates.termEnd(expiresAt) })
              : translate('lapsedOn', { date: dates.calendarDay(lapsedTerm) })}
          </span>
        </div>
      </div>
    </article>
  );
}
