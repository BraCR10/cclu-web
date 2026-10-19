'use client';

import Link from 'next/link';
import { useSyncExternalStore } from 'react';
import { CheckCircle, Copy, Download, ExternalLink, Lock } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Alert } from '@/shared/components/Alert';
import { Button } from '@/shared/components/Button';
import { Card } from '@/shared/components/Card';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { useToast } from '@/shared/components/useToast';
import { useDates } from '@/shared/hooks/useDates';
import { PlanBadge } from './PlanBadge';
import { MemberCard } from './MemberCard';
import { useMembership } from '../hooks/useMembership';
import { publicProfilePath } from '../publicProfilePath';

// The absolute address the QR carries. Only the browser knows which host it is
// being served from, and a QR with a relative address is useless once printed,
// so the server renders nothing and the card takes the browser's answer.
const NEVER_CHANGES = () => () => {};

function useOrigin(): string {
  return useSyncExternalStore(
    NEVER_CHANGES,
    () => window.location.origin,
    () => '',
  );
}

export function MemberCardPage() {
  const translate = useTranslations('member.card');
  const dates = useDates();
  const { showToast } = useToast();
  const state = useMembership();
  const origin = useOrigin();

  if (state.status === 'loading') {
    return (
      <div aria-hidden className="grid gap-6 px-4 py-6 lg:grid-cols-2 lg:px-8 lg:py-8">
        <div className="h-80 animate-pulse rounded-lg bg-surface-hover" />
        <div className="h-80 animate-pulse rounded-lg bg-surface-hover" />
      </div>
    );
  }

  if (state.status === 'failed') {
    return (
      <div className="px-4 py-6 lg:px-8 lg:py-8">
        <Alert tone="danger" title={translate('failed')} />
      </div>
    );
  }

  const { membership } = state;
  const isFree = membership.plan.key === 'free';
  const path = publicProfilePath(membership.memberCode);
  const publicUrl = origin === '' ? '' : `${origin}${path}`;

  const term =
    membership.lapsed !== null && membership.lapsed.validUntil !== null
      ? translate('lapsedOn', { date: dates.calendarDay(membership.lapsed.validUntil) })
      : membership.expiresAt === null
        ? translate('noExpiry')
        : translate('validUntil', { date: dates.termEnd(membership.expiresAt) });

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(publicUrl);
      showToast({ tone: 'success', title: translate('copied') });
    } catch {
      showToast({ tone: 'error', title: translate('copyFailed') });
    }
  }

  return (
    <div className="flex flex-col gap-6 px-4 py-6 lg:gap-8 lg:px-8 lg:py-8">
      <p className="max-w-2xl text-body-m text-fg-secondary">{translate('description')}</p>

      {isFree && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex-1">
            <Alert
              tone="info"
              title={translate('freeNoticeTitle', { plan: membership.plan.name })}
              message={translate('freeNoticeMessage')}
            />
          </div>
          <Link
            href="/plans"
            className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-sm bg-primary px-4 text-label-m text-on-primary hover:bg-primary-hover focus-visible:shadow-focus focus-visible:outline-none lg:min-h-10"
          >
            {translate('seePlans')}
          </Link>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] lg:items-start">
        <div className="flex flex-col gap-4">
          <div className="member-card-sheet">
            <MemberCard membership={membership} publicUrl={publicUrl} />
          </div>

          <div className="flex flex-wrap items-center gap-3 print:hidden">
            <Button type="button" onClick={() => window.print()}>
              <Download aria-hidden className="size-4" />
              {translate('download')}
            </Button>
            <Button type="button" variant="secondary" onClick={copyLink}>
              <Copy aria-hidden className="size-4" />
              {translate('copy')}
            </Button>
            <Link
              href={path}
              className="inline-flex min-h-11 items-center gap-2 text-label-m text-fg-link underline-offset-4 hover:underline focus-visible:shadow-focus focus-visible:outline-none lg:min-h-10"
            >
              <ExternalLink aria-hidden className="size-4" />
              {translate('viewPublic')}
            </Link>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <Card as="section" aria-labelledby="card-data" className="flex flex-col gap-4">
            <h2 id="card-data" className="font-display text-heading-m text-fg">
              {translate('dataTitle')}
            </h2>

            <div className="flex flex-wrap items-center gap-2">
              <PlanBadge planKey={membership.plan.key} name={membership.plan.name} />
              <StatusBadge
                tone={membership.lapsed === null ? 'success' : 'warning'}
                label={translate(membership.lapsed === null ? 'active' : 'lapsed')}
              />
            </div>

            <dl className="flex flex-col gap-3">
              {[
                { term: translate('fields.business'), detail: membership.businessName },
                { term: translate('fields.code'), detail: membership.memberCode },
                { term: translate('fields.term'), detail: term },
              ].map((row) => (
                <div key={row.term}>
                  <dt className="text-body-s text-fg-muted">{row.term}</dt>
                  <dd className="text-body-m text-fg">{row.detail}</dd>
                </div>
              ))}
            </dl>
          </Card>

          <Card as="section" aria-labelledby="card-qr" className="flex flex-col gap-4">
            <h2 id="card-qr" className="font-display text-heading-m text-fg">
              {translate('qr.title')}
            </h2>
            <p className="text-body-m text-fg-secondary">{translate('qr.intro')}</p>

            <ul className="flex flex-col gap-3">
              {[
                { icon: CheckCircle, text: translate('qr.public', { url: publicUrl }) },
                { icon: CheckCircle, text: translate('qr.verified') },
                { icon: CheckCircle, text: translate('qr.contact') },
                { icon: Lock, text: translate('qr.private') },
              ].map((point) => (
                <li key={point.text} className="flex gap-3 text-body-m text-fg-secondary">
                  <point.icon aria-hidden className="mt-0.5 size-5 shrink-0 text-success" />
                  <span>{point.text}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
