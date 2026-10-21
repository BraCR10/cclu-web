'use client';

import Link from 'next/link';
import { Briefcase, ChevronRight, Tag } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { VacancyCard } from '@/modules/jobs/components/VacancyCard';
import { BusinessCard } from '@/modules/marketplace/components/BusinessCard';
import { SubscriptionSection } from '@/modules/marketplace/components/SubscriptionSection';
import { Alert } from '@/shared/components/Alert';
import { useHome } from '../hooks/useHome';
import { HomeHero } from './HomeHero';
import { CardRow, EmptySection, HomeSection } from './HomeSection';
import { JoiningSteps } from './JoiningSteps';
import { PlansSummary } from './PlansSummary';

// On a telephone the vacancies give way to two direct links, as PM-01 draws it.
function QuickLinks() {
  const translate = useTranslations('public.home.quickLinks');
  const links = [
    { href: '/jobs', label: translate('jobs'), icon: Briefcase },
    { href: '/discounts', label: translate('discounts'), icon: Tag },
  ];

  return (
    <nav
      aria-label={translate('label')}
      className="divide-y divide-line-subtle rounded-lg border border-line-subtle bg-surface lg:hidden"
    >
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="flex min-h-13 items-center gap-3 px-4 text-label-m text-fg hover:bg-surface-hover focus-visible:shadow-focus focus-visible:outline-none"
        >
          <link.icon aria-hidden className="size-5 text-fg-secondary" />
          <span className="flex-1">{link.label}</span>
          <ChevronRight aria-hidden className="size-5 text-fg-muted" />
        </Link>
      ))}
    </nav>
  );
}

// P-01 and PM-01: the public home page. Every section reads the API; one with
// nothing to show says so instead of disappearing.
export function HomePage() {
  const translate = useTranslations('public.home');
  const state = useHome();
  const home = state.status === 'loaded' ? state.home : null;

  return (
    <div className="flex flex-col gap-12 pb-12 lg:gap-16 lg:pb-16">
      <HomeHero counts={home?.counts ?? null} />

      {state.status === 'failed' && <Alert tone="danger" title={translate('failed')} />}

      {state.status === 'loading' && (
        <div aria-hidden className="grid gap-4 lg:grid-cols-4">
          {[0, 1, 2, 3].map((placeholder) => (
            <div key={placeholder} className="h-56 animate-pulse rounded-lg bg-surface-hover" />
          ))}
        </div>
      )}

      {state.status === 'loaded' && (
        <>
          <HomeSection
            id="home-featured"
            title={translate('featured.title')}
            link={{ href: '/directory', label: translate('featured.link') }}
          >
            {state.home.featured.length === 0 ? (
              <EmptySection message={translate('featured.empty')} />
            ) : (
              <CardRow>
                {state.home.featured.map((listing) => (
                  <BusinessCard key={listing.memberCode} listing={listing} />
                ))}
              </CardRow>
            )}
          </HomeSection>

          <HomeSection id="home-promotions" title={translate('promotions.title')}>
            <EmptySection message={translate('promotions.empty')} />
          </HomeSection>

          <QuickLinks />

          <div className="hidden lg:block">
            <HomeSection
              id="home-vacancies"
              title={translate('vacancies.title')}
              link={{ href: '/jobs', label: translate('vacancies.link') }}
            >
              {state.home.vacancies.length === 0 ? (
                <EmptySection message={translate('vacancies.empty')} />
              ) : (
                <div className="grid grid-cols-3 gap-4">
                  {state.home.vacancies.map((vacancy) => (
                    <VacancyCard
                      key={vacancy.id}
                      title={vacancy.title}
                      businessName={vacancy.business.name}
                      branch={vacancy.branch}
                      workday={vacancy.workday}
                      publishedAt={vacancy.publishedAt}
                      href={`/jobs/${vacancy.id}`}
                    />
                  ))}
                </div>
              )}
            </HomeSection>
          </div>

          <PlansSummary plans={state.plans} />
        </>
      )}

      <JoiningSteps />
      <SubscriptionSection />
    </div>
  );
}
