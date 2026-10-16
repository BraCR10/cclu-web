'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Alert } from '@/shared/components/Alert';
import { Button } from '@/shared/components/Button';
import { PageHeader } from '@/shared/components/PageHeader';
import { Stepper } from '@/shared/components/Stepper';
import { StickyActionBar } from '@/shared/components/StickyActionBar';
import { useRegistrationWizard } from '../hooks/useRegistrationWizard';
import { BusinessStep } from './BusinessStep';
import { ContactStep } from './ContactStep';
import { JoiningHelp } from './JoiningHelp';
import { RegistrationSent } from './RegistrationSent';
import { TypeStep } from './TypeStep';

export function RegistrationWizard() {
  const translate = useTranslations('registration');
  const translateActions = useTranslations('common.actions');
  const translateErrors = useTranslations('errors');
  const router = useRouter();
  const wizard = useRegistrationWizard();

  if (wizard.sent !== null) {
    return <RegistrationSent sent={wizard.sent} />;
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={translate('page.title')}
        legend={translate('page.legend')}
        backHref="/"
        backLabel={translate('page.back')}
      />

      {/* Nothing can be picked without the lists the API holds, so a failure is
          said out loud rather than left as an empty select. */}
      {wizard.catalogsFailed && <Alert tone="danger" title={translateErrors('network_error')} />}

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-start">
        {/* Placed rather than ordered: the advice comes first on a telephone and
            sits beside the form once there is room for two columns. */}
        <div className="lg:col-start-2 lg:row-start-1 lg:sticky lg:top-8">
          <JoiningHelp step={wizard.step} />
        </div>

        <div className="flex flex-col gap-6 lg:col-start-1 lg:row-start-1">
          <Stepper
            steps={[
              translate('page.steps.type'),
              translate('page.steps.business'),
              translate('page.steps.contact'),
            ]}
            currentStep={wizard.step}
          />

          {wizard.step === 1 && <TypeStep form={wizard} />}
          {wizard.step === 2 && <BusinessStep form={wizard} />}
          {wizard.step === 3 && <ContactStep form={wizard} />}

          <StickyActionBar>
            <div className="flex items-center justify-between gap-3">
              {wizard.step === 1 ? (
                <Button type="button" variant="secondary" onClick={() => router.push('/')}>
                  {translateActions('cancel')}
                </Button>
              ) : (
                <Button type="button" variant="secondary" onClick={wizard.goBack}>
                  {translateActions('back')}
                </Button>
              )}

              {wizard.step < wizard.totalSteps ? (
                <Button type="button" onClick={wizard.goNext}>
                  {translateActions('continue')}
                </Button>
              ) : (
                <Button
                  type="button"
                  loading={wizard.submitting}
                  onClick={() => void wizard.submit()}
                >
                  {translate('stepThree.submit')}
                </Button>
              )}
            </div>
          </StickyActionBar>
        </div>
      </div>
    </div>
  );
}
