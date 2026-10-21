'use client';

import { useState, useSyncExternalStore } from 'react';
import { CheckCircle, Lock } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Alert } from '@/shared/components/Alert';
import { Card } from '@/shared/components/Card';
import type { Membership } from '../api/membership';
import type { PaymentEligibility } from '../api/payments';
import { MemberCard } from './MemberCard';
import { MemberCardActions } from './MemberCardActions';
import { MemberCardFullscreen } from './MemberCardFullscreen';
import { MemberPlanSummary } from './MemberPlanSummary';
import { useMembership } from '../hooks/useMembership';
import { useSharePublicProfile } from '../hooks/useSharePublicProfile';
import { publicProfilePath } from '@/shared/utils/publicProfilePath';

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

function QrExplanation() {
  const translate = useTranslations('member.card.qr');

  return (
    <Card as="section" aria-labelledby="card-qr" className="flex flex-col gap-4">
      <h2 id="card-qr" className="font-display text-heading-m text-fg">
        {translate('title')}
      </h2>
      <p className="text-body-m text-fg-secondary">{translate('intro')}</p>

      <ul className="flex flex-col gap-3">
        {[
          { icon: CheckCircle, text: translate('verified') },
          { icon: CheckCircle, text: translate('contact') },
          { icon: Lock, text: translate('private') },
        ].map((point) => (
          <li key={point.text} className="flex gap-3 text-body-m text-fg-secondary">
            <point.icon aria-hidden className="mt-0.5 size-5 shrink-0 text-success" />
            <span>{point.text}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

type LoadedCardProps = {
  membership: Membership;
  eligibility: PaymentEligibility;
  origin: string;
};

function LoadedCard({ membership, eligibility, origin }: LoadedCardProps) {
  const translate = useTranslations('member.card');
  const [shown, setShown] = useState(false);
  const path = publicProfilePath(membership.memberCode);
  const publicUrl = origin === '' ? '' : `${origin}${path}`;
  const share = useSharePublicProfile({ businessName: membership.businessName, publicUrl });

  return (
    <div className="flex flex-col gap-6 px-4 py-6 lg:gap-8 lg:px-8 lg:py-8">
      <p className="max-w-2xl text-body-m text-fg-secondary">{translate('description')}</p>

      {/* One column on a telephone, in reading order: the card, what to do about
          the plan, then what the QR shows. On a wide screen the plan takes the
          right-hand column on its own and the QR note sits under the card. */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,520px)_minmax(0,1fr)] lg:items-start lg:gap-8">
        <div className="flex flex-col gap-4 lg:col-start-1 lg:row-start-1">
          <div className="member-card-sheet">
            <MemberCard membership={membership} publicUrl={publicUrl} />
          </div>

          <MemberCardActions
            publicPath={path}
            onShow={() => setShown(true)}
            onShare={() => void share()}
            onPrint={() => window.print()}
          />
        </div>

        <div className="lg:col-start-2 lg:row-span-2 lg:row-start-1">
          <MemberPlanSummary membership={membership} eligibility={eligibility} />
        </div>

        <div className="lg:col-start-1 lg:row-start-2">
          <QrExplanation />
        </div>
      </div>

      <MemberCardFullscreen
        open={shown}
        membership={membership}
        publicUrl={publicUrl}
        onClose={() => setShown(false)}
      />
    </div>
  );
}

export function MemberCardPage() {
  const translate = useTranslations('member.card');
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

  return (
    <LoadedCard membership={state.membership} eligibility={state.eligibility} origin={origin} />
  );
}
