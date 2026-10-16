import { useTranslations } from 'next-intl';
import { HelpCard } from '@/shared/components/HelpCard';

// The advice beside the form changes with the step: what to have at hand before
// starting, how to be found, and what happens once it is sent.
export function JoiningHelp({ step }: { step: number }) {
  const translate = useTranslations('registration.help');

  if (step === 2) {
    return (
      <HelpCard
        title={translate('branchTitle')}
        items={[
          translate('branchItems.name'),
          translate('branchItems.activity'),
          translate('branchItems.description'),
        ]}
      />
    );
  }

  if (step === 3) {
    return (
      <HelpCard
        title={translate('submitTitle')}
        items={[
          translate('submitItems.review'),
          translate('submitItems.answer'),
          translate('submitItems.approved'),
        ]}
      >
        <p className="text-body-m text-fg-secondary">{translate('whatsapp')}</p>
      </HelpCard>
    );
  }

  return (
    <HelpCard
      title={translate('beforeTitle')}
      items={[
        translate('beforeItems.identification'),
        translate('beforeItems.certification'),
        translate('beforeItems.logo'),
        translate('beforeItems.email'),
      ]}
    >
      <p className="text-body-m text-fg-secondary">{translate('whatsapp')}</p>
    </HelpCard>
  );
}
