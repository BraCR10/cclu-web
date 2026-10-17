'use client';

import { useTranslations } from 'next-intl';
import { Alert } from '@/shared/components/Alert';
import { formatDate } from '@/shared/utils/formatDate';
import { HowToPay } from '@/modules/plans/components/HowToPay';
import { PlanCard } from '@/modules/plans/components/PlanCard';
import { PlanComparison } from '@/modules/plans/components/PlanComparison';
import type { Plan } from '@/modules/plans/api/plans';
import { useMembership } from '../hooks/useMembership';
import { paymentHref } from '../paymentHref';
import { BannerAllowance } from './BannerAllowance';
import { CurrentPlan } from './CurrentPlan';

export function MembershipPage() {
  const translate = useTranslations('member.membership');
  const translatePlans = useTranslations('plans.cards');
  const translateErrors = useTranslations('errors');
  const state = useMembership();

  // Gratuita is where a plan ends up, never one a member pays to move to.
  function actionFor(plan: Plan) {
    return plan.key === 'free'
      ? null
      : { href: paymentHref(plan.key), label: translatePlans(`${plan.key}.action`) };
  }

  return (
    <div className="flex flex-col gap-6 px-4 py-6 lg:gap-8 lg:px-8 lg:py-8">
      {state.status === 'failed' && (
        <Alert tone="danger" title={translateErrors('network_error')} />
      )}

      {state.status === 'loading' && (
        <div aria-hidden className="grid gap-4 lg:grid-cols-3">
          <div className="h-56 animate-pulse rounded-lg bg-surface-hover lg:col-span-2" />
          <div className="h-56 animate-pulse rounded-lg bg-surface-hover" />
        </div>
      )}

      {state.status === 'loaded' && (
        <>
          {state.membership.lapsed !== null && (
            <Alert
              tone="warning"
              title={translate('lapsed.title', {
                plan: state.membership.lapsed.plan.name,
                date: formatDate(state.membership.lapsed.expiredAt),
              })}
              message={translate('lapsed.message')}
            />
          )}

          <div className="grid gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <CurrentPlan membership={state.membership} />
            </div>
            <BannerAllowance allowance={state.membership.plan.entitlements.banner} />
          </div>

          <section aria-labelledby="change-plan" className="flex scroll-mt-20 flex-col gap-4">
            <h2 id="change-plan" className="font-display text-heading-l text-fg">
              {translate('plansTitle')}
            </h2>
            {/* A carousel on a telephone, a row of equal cards once there is room. */}
            <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 lg:mx-0 lg:grid lg:grid-cols-2 lg:overflow-visible lg:px-0 xl:grid-cols-4">
              {state.plans.map((plan) => (
                <div key={plan.key} className="w-[85%] shrink-0 snap-center lg:w-auto">
                  <PlanCard
                    plan={plan}
                    current={plan.key === state.membership.plan.key}
                    action={actionFor(plan)}
                  />
                </div>
              ))}
            </div>
          </section>

          <PlanComparison plans={state.plans} />
          <HowToPay memberCode={state.membership.memberCode} />
        </>
      )}
    </div>
  );
}
