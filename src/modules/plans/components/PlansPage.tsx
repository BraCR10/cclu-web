'use client';

import { Gift } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Alert } from '@/shared/components/Alert';
import { PageHeader } from '@/shared/components/PageHeader';
import { usePlans } from '../hooks/usePlans';
import { HowToPay } from './HowToPay';
import { PlanCard } from './PlanCard';
import { PlanComparison } from './PlanComparison';
import { PlansFaq } from './PlansFaq';

function StartsFree() {
  const translate = useTranslations('plans.startsFree');

  return (
    <div className="flex items-center gap-3 rounded-md border border-success bg-success-soft p-4">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-success text-fg-inverse">
        <Gift aria-hidden className="size-5" />
      </span>
      <div>
        <p className="text-heading-s text-fg">{translate('title')}</p>
        <p className="text-body-s text-fg-secondary">{translate('message')}</p>
      </div>
    </div>
  );
}

export function PlansPage() {
  const translate = useTranslations('plans');
  const translateErrors = useTranslations('errors');
  const state = usePlans();

  return (
    <div className="flex w-full flex-col gap-10 py-6 lg:gap-12 lg:py-12">
      <PageHeader title={translate('page.title')} />
      <StartsFree />

      {state.status === 'failed' && (
        <Alert tone="danger" title={translateErrors('network_error')} />
      )}

      {state.status === 'loading' && (
        <div aria-hidden className="grid gap-4 lg:grid-cols-4">
          {[0, 1, 2, 3].map((index) => (
            <div key={index} className="h-96 animate-pulse rounded-lg bg-surface-hover" />
          ))}
        </div>
      )}

      {state.status === 'loaded' && (
        <>
          {/* A carousel on a telephone, where four cards side by side would be
              unreadable, and a row of equal cards once there is room. */}
          <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 lg:mx-0 lg:grid lg:grid-cols-4 lg:overflow-visible lg:px-0">
            {state.plans.map((plan) => (
              <div key={plan.key} className="w-[85%] shrink-0 snap-center lg:w-auto">
                <PlanCard plan={plan} />
              </div>
            ))}
          </div>
          <PlanComparison plans={state.plans} />
        </>
      )}

      <HowToPay />
      <PlansFaq />
    </div>
  );
}
