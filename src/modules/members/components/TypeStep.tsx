import { Building2, HeartHandshake, Lock, User } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Alert } from '@/shared/components/Alert';
import { Card } from '@/shared/components/Card';
import { FileField } from '@/shared/components/FileField';
import { Input } from '@/shared/components/Input';
import { OptionGroup } from '@/shared/components/OptionGroup';
import { Select } from '@/shared/components/Select';
import { useIsDesktop } from '@/shared/hooks/useMediaQuery';
import type { BusinessStepForm } from '../hooks/useRegistrationWizard';
import { IDENTIFICATION_TYPES_BY_MEMBER_TYPE } from '../validation/registrationRules';

export function TypeStep({ form }: { form: BusinessStepForm }) {
  const translate = useTranslations('registration.stepOne');
  const canDrag = useIsDesktop();
  const { draft, change, errorFor, uploading, uploadError, attached, selectFile, removeFile } =
    form;

  const company = draft.memberType === 'business' || draft.memberType === 'association';
  const identificationTypes =
    draft.memberType === '' ? [] : IDENTIFICATION_TYPES_BY_MEMBER_TYPE[draft.memberType];

  // Written out rather than looked up by a built key, so a label that stops
  // existing stops compiling instead of rendering its own name.
  const identificationLabels: Record<string, string> = {
    legal_entity_id: translate('identificationTypes.legalEntityId'),
    national_id: translate('identificationTypes.nationalId'),
    dimex: translate('identificationTypes.dimex'),
    passport: translate('identificationTypes.passport'),
  };

  return (
    <Card className="p-6 lg:p-8">
      <h2 className="text-heading-l text-fg">{translate('title')}</h2>
      <p className="mt-1 text-body-m text-fg-secondary">{translate('legend')}</p>
      {draft.memberType !== 'independent_professional' && (
        <p className="mt-1 text-body-m text-fg-muted">{translate('allRequired')}</p>
      )}

      <div className="mt-6 flex flex-col gap-8">
        <OptionGroup
          legend={translate('typeQuestion')}
          name="memberType"
          value={draft.memberType}
          error={errorFor('memberType')}
          onChange={(value) => change('memberType', value as typeof draft.memberType)}
          options={[
            {
              value: 'business',
              title: translate('types.business.title'),
              description: translate('types.business.description'),
              icon: <Building2 aria-hidden="true" className="h-5 w-5" />,
            },
            {
              value: 'association',
              title: translate('types.association.title'),
              description: translate('types.association.description'),
              icon: <HeartHandshake aria-hidden="true" className="h-5 w-5" />,
            },
            {
              value: 'independent_professional',
              title: translate('types.independent.title'),
              description: translate('types.independent.description'),
              icon: <User aria-hidden="true" className="h-5 w-5" />,
            },
          ]}
        />

        {draft.memberType !== '' && (
          <section className="flex flex-col gap-4">
            <h3 className="text-heading-s text-fg">{translate('identification')}</h3>

            <div className="grid gap-4 md:grid-cols-2">
              <Select
                label={translate('identificationType')}
                name="identificationType"
                value={draft.identificationType}
                error={errorFor('identificationType')}
                placeholder={translate('identificationType')}
                onChange={(event) => change('identificationType', event.target.value)}
                options={identificationTypes.map((value) => ({
                  value,
                  label: identificationLabels[value],
                }))}
              />

              <Input
                label={
                  company
                    ? translate('identificationNumberLegal')
                    : translate('identificationNumberPersonal')
                }
                name="identificationNumber"
                value={draft.identificationNumber}
                error={errorFor('identificationNumber')}
                help={
                  company
                    ? translate('identificationNumberLegalHelp')
                    : translate('identificationNumberPersonalHelp')
                }
                onChange={(event) => change('identificationNumber', event.target.value)}
              />
            </div>

            {draft.memberType === 'independent_professional' && (
              <>
                <Input
                  label={translate('fullName')}
                  name="name"
                  value={draft.name}
                  error={errorFor('name')}
                  help={translate('fullNameHelp')}
                  onChange={(event) => change('name', event.target.value)}
                />

                <Alert
                  tone="info"
                  title={translate('withoutCertification.title')}
                  message={translate('withoutCertification.message')}
                />
              </>
            )}
          </section>
        )}

        {company && (
          <section className="flex flex-col gap-4">
            <div>
              <h3 className="text-heading-s text-fg">{translate('companyData')}</h3>
              <p className="mt-1 flex items-center gap-2 text-body-s text-fg-muted">
                <Lock aria-hidden="true" className="h-4 w-4 shrink-0" />
                {translate('privateNote')}
              </p>
            </div>

            <Input
              label={translate('legalName')}
              name="legalName"
              value={draft.legalName}
              error={errorFor('legalName')}
              help={translate('legalNameHelp')}
              onChange={(event) => change('legalName', event.target.value)}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label={translate('representative')}
                name="legalRepresentativeName"
                value={draft.legalRepresentativeName}
                error={errorFor('legalRepresentativeName')}
                onChange={(event) => change('legalRepresentativeName', event.target.value)}
              />
              <Input
                label={translate('representativeIdentification')}
                name="legalRepresentativeIdentification"
                value={draft.legalRepresentativeIdentification}
                error={errorFor('legalRepresentativeIdentification')}
                onChange={(event) =>
                  change('legalRepresentativeIdentification', event.target.value)
                }
              />
            </div>

            <FileField
              label={translate('certification')}
              hint={canDrag ? translate('certificationHint') : translate('certificationHintMobile')}
              acceptedFormats={translate('certificationFormats')}
              accept="application/pdf,image/jpeg,image/png"
              status={
                uploading.certification
                  ? 'uploading'
                  : draft.certificationFileKey === ''
                    ? 'empty'
                    : 'stored'
              }
              file={attached.certification}
              error={
                uploadError?.kind === 'certification'
                  ? uploadError.message
                  : errorFor('certificationFileKey')
              }
              onSelect={(file) => void selectFile('certification', file)}
              onRemove={() => removeFile('certification')}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label={translate('certificationIssuedAt')}
                name="certificationIssuedAt"
                type="date"
                value={draft.certificationIssuedAt}
                error={errorFor('certificationIssuedAt')}
                onChange={(event) => change('certificationIssuedAt', event.target.value)}
              />
            </div>
          </section>
        )}
      </div>
    </Card>
  );
}
