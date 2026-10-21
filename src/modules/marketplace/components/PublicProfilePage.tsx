'use client';

import Link from 'next/link';
import { ChevronLeft, Inbox } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Alert } from '@/shared/components/Alert';
import { Tabs } from '@/shared/components/Tabs';
import { UnderConstruction } from '@/shared/components/UnderConstruction';
import { useIsDesktop } from '@/shared/hooks/useMediaQuery';
import type { PublicProfile } from '../api/directory';
import { usePublicProfile } from '../hooks/usePublicProfile';
import { BranchCard } from './BranchCard';
import { AffiliationCard, CategoriesCard, ContactCard, DetailCard } from './ProfileDetails';
import { ProfileSummary } from './ProfileSummary';

function BackToDirectory() {
  const translate = useTranslations('public.directory.profile');

  return (
    <Link
      href="/directory"
      className="inline-flex min-h-10 items-center gap-1 self-start text-label-m text-fg-link hover:underline"
    >
      <ChevronLeft aria-hidden className="size-4" />
      {translate('back')}
    </Link>
  );
}

function Story({ profile }: { profile: PublicProfile }) {
  const translate = useTranslations('public.directory.profile');

  return profile.businessDescription === null || profile.businessDescription === '' ? null : (
    <DetailCard title={translate('story')}>
      <p className="text-body-m whitespace-pre-line text-fg-secondary">
        {profile.businessDescription}
      </p>
    </DetailCard>
  );
}

function Branches({ profile }: { profile: PublicProfile }) {
  const translate = useTranslations('public.directory.profile');

  return profile.branches.length === 0 ? null : (
    <DetailCard title={translate('ourBranches')}>
      <div className="grid gap-4 lg:grid-cols-2">
        {profile.branches.map((branch) => (
          <BranchCard key={branch.name} branch={branch} shopWeek={profile.schedule} />
        ))}
      </div>
    </DetailCard>
  );
}

function Aside({ profile }: { profile: PublicProfile }) {
  return (
    <>
      <ContactCard profile={profile} />
      {profile.categories.length > 0 && <CategoriesCard categories={profile.categories} />}
      <AffiliationCard since={profile.affiliatedSince} />
    </>
  );
}

// The member's publications are not built yet; the page says so where they go.
function Publications() {
  const translate = useTranslations('public.directory.profile');

  return (
    <DetailCard title={translate('publications')}>
      <UnderConstruction headingLevel={2} />
    </DetailCard>
  );
}

function ProfileLayout({ profile }: { profile: PublicProfile }) {
  const translate = useTranslations('public.directory.profile');
  const isDesktop = useIsDesktop();

  if (!isDesktop) {
    return (
      <Tabs
        label={profile.businessName}
        items={[
          {
            id: 'information',
            label: translate('information'),
            content: (
              <div className="flex flex-col gap-4">
                <Story profile={profile} />
                <Aside profile={profile} />
              </div>
            ),
          },
          { id: 'branches', label: translate('branches'), content: <Branches profile={profile} /> },
          { id: 'publications', label: translate('publications'), content: <Publications /> },
        ]}
      />
    );
  }

  return (
    <div className="grid grid-cols-[1fr_20rem] items-start gap-6">
      <div className="flex flex-col gap-6">
        <Story profile={profile} />
        <Branches profile={profile} />
        <Publications />
      </div>
      <aside className="flex flex-col gap-6">
        <Aside profile={profile} />
      </aside>
    </div>
  );
}

// P-03: the public page of one business, the one its card's QR opens.
export function PublicProfilePage({ memberCode }: { memberCode: string }) {
  const translate = useTranslations('public.directory.profile');
  const translateErrors = useTranslations('errors');
  const state = usePublicProfile(memberCode);

  return (
    <div className="flex w-full flex-col gap-6 py-6 lg:py-10">
      <BackToDirectory />

      {state.status === 'loading' && (
        <div aria-hidden className="h-64 animate-pulse rounded-lg bg-surface-hover" />
      )}

      {state.status === 'failed' && (
        <Alert tone="danger" title={translateErrors('network_error')} />
      )}

      {state.status === 'missing' && (
        <div className="flex flex-col items-center gap-4 rounded-lg border border-line-subtle bg-surface p-8 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-brand-union-soft text-fg-brand">
            <Inbox aria-hidden className="size-6" />
          </span>
          <h1 className="text-heading-s text-fg">{translate('notListed')}</h1>
        </div>
      )}

      {state.status === 'loaded' && (
        <>
          <ProfileSummary profile={state.profile} />
          <ProfileLayout profile={state.profile} />
        </>
      )}
    </div>
  );
}
