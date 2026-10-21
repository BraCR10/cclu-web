'use client';

import { useState, type FormEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { MemberCard } from '@/modules/plans/components/MemberCard';
import type { Membership } from '@/modules/plans/api/membership';
import { JOIN_HREF } from '@/shared/layouts/publicNavigation';

type HomeHeroProps = {
  counts: { members: number; vacancies: number } | null;
};

// The card the prototype shows beside the headline: what a member gets.
const SAMPLE_MEMBERSHIP: Membership = {
  memberCode: 'CLU001',
  businessName: 'Café Loma Verde',
  plan: {
    key: 'pro',
    name: 'Pro Pymex',
    monthlyFee: 0,
    entitlements: {
      publishInMarketplace: true,
      publishJobs: true,
      banner: 'one_month',
      onlineWorkshops: true,
      massMailing: true,
    },
  },
  startedAt: null,
  expiresAt: null,
  validUntil: null,
  lapsed: null,
};

function Figure({ value, label, href }: { value: number; label: string; href: string }) {
  return (
    <Link
      href={href}
      className="flex flex-col gap-1 rounded-sm focus-visible:shadow-focus focus-visible:outline-none"
    >
      <span className="font-display text-metric-l text-fg-inverse">{value}</span>
      <span className="text-body-s text-fg-on-sidebar-muted">{label}</span>
    </Link>
  );
}

// P-01 and PM-01: what the chamber is, a way into the directory, and the way in
// for a business that is not affiliated yet.
export function HomeHero({ counts }: HomeHeroProps) {
  const translate = useTranslations('public.home.hero');
  const router = useRouter();
  const [search, setSearch] = useState('');

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = search.trim();
    router.push(query === '' ? '/directory' : `/directory?search=${encodeURIComponent(query)}`);
  }

  return (
    <section
      aria-labelledby="home-title"
      className="relative isolate overflow-hidden bg-brand-union-deep [margin-inline:calc(50%-50vw)]"
    >
      <div className="mx-auto flex max-w-page items-center gap-16 px-4 pt-10 pb-24 lg:px-20 lg:pt-16 lg:pb-28 xl:px-0">
        <div className="flex min-w-0 flex-1 flex-col gap-6">
          <h1
            id="home-title"
            className="font-display text-[2rem] leading-[1.1] font-bold tracking-[-0.5px] text-fg-inverse lg:text-display-hero"
          >
            {translate('title')}
          </h1>
          <p className="text-body-m text-fg-on-sidebar-muted lg:text-body-l">{translate('lead')}</p>

          <form
            role="search"
            onSubmit={submit}
            className="flex gap-2 rounded-md bg-surface p-1.5 lg:bg-transparent lg:p-0"
          >
            <label className="relative flex-1">
              <span className="sr-only">{translate('searchLabel')}</span>
              <Search
                aria-hidden
                className="pointer-events-none absolute top-1/2 left-3 size-[18px] -translate-y-1/2 text-fg-muted"
              />
              <input
                type="search"
                value={search}
                maxLength={100}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={translate('searchPlaceholder')}
                className="h-11 w-full rounded-sm border border-transparent bg-surface pr-3 pl-10 text-body-m text-fg placeholder:text-fg-muted focus-visible:border-primary focus-visible:shadow-focus focus-visible:outline-none lg:h-12 lg:border-line"
              />
            </label>
            <button
              type="submit"
              className="inline-flex h-11 shrink-0 items-center justify-center rounded-sm bg-primary px-5 text-label-m text-on-primary hover:bg-primary-hover focus-visible:shadow-focus focus-visible:outline-none lg:h-12"
            >
              {translate('search')}
            </button>
          </form>

          <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-6">
            <Link
              href={JOIN_HREF}
              className="inline-flex h-12 items-center justify-center rounded-sm border border-secondary-border bg-surface px-5 text-label-m text-fg hover:bg-surface-hover focus-visible:shadow-focus focus-visible:outline-none"
            >
              {translate('join')}
            </Link>
            <Link
              href="/plans"
              className="hidden text-label-m text-fg-inverse underline underline-offset-4 focus-visible:shadow-focus focus-visible:outline-none md:inline"
            >
              {translate('plans')}
            </Link>
          </div>

          {counts !== null && (
            <div className="grid grid-cols-2 gap-6 md:flex md:gap-10">
              <Figure value={counts.members} label={translate('members')} href="/directory" />
              <Figure value={counts.vacancies} label={translate('vacancies')} href="/jobs" />
            </div>
          )}
        </div>

        <div aria-hidden className="hidden w-[520px] shrink-0 lg:block">
          <MemberCard membership={SAMPLE_MEMBERSHIP} publicUrl="/directory/CLU001" />
        </div>
      </div>

      <div aria-hidden className="absolute -inset-x-px -bottom-px h-16">
        <Image src="/brand/home-hill.svg" alt="" fill sizes="100vw" priority />
      </div>
    </section>
  );
}
