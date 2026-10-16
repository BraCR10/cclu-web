import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Alert } from '@/shared/components/Alert';
import { Card } from '@/shared/components/Card';
import { Combobox } from '@/shared/components/Combobox';
import { FileField } from '@/shared/components/FileField';
import { Input } from '@/shared/components/Input';
import { OptionGroup } from '@/shared/components/OptionGroup';
import { Select } from '@/shared/components/Select';
import { Textarea } from '@/shared/components/Textarea';
import { useIsDesktop } from '@/shared/hooks/useMediaQuery';
import type { BusinessStepForm } from '../hooks/useRegistrationWizard';

export function BusinessStep({ form }: { form: BusinessStepForm }) {
  const translate = useTranslations('registration.stepTwo');
  const canDrag = useIsDesktop();
  const {
    draft,
    change,
    errorFor,
    otherActivity,
    cantons,
    activities,
    uploading,
    uploadError,
    attached,
    selectFile,
    removeFile,
  } = form;

  // Kept here rather than in the draft: which province narrows the list is a
  // way of finding the cantón, not something the registration records.
  const [province, setProvince] = useState('');
  const provinces = [...new Set(cantons.map((canton) => canton.province))].sort();
  const visibleCantons =
    province === '' ? cantons : cantons.filter((canton) => canton.province === province);

  const activityOptions = [
    ...activities.map((activity) => ({ value: activity._id, label: activity.name })),
    { value: otherActivity, label: translate('activityOtherOption') },
  ];

  return (
    <Card className="p-6 lg:p-8">
      <h2 className="text-heading-l text-fg">{translate('title')}</h2>
      <p className="mt-1 text-body-m text-fg-secondary">{translate('legend')}</p>
      <p className="mt-1 text-body-m text-fg-muted">{translate('optionalNote')}</p>

      <div className="mt-6 flex flex-col gap-8">
        <section className="flex flex-col gap-4">
          <h3 className="text-heading-s text-fg">{translate('businessData')}</h3>

          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label={translate('businessName')}
              name="businessName"
              value={draft.businessName}
              error={errorFor('businessName')}
              help={translate('businessNameHelp')}
              onChange={(event) => change('businessName', event.target.value)}
            />
            <Input
              label={translate('manager')}
              name="managerName"
              value={draft.managerName}
              error={errorFor('managerName')}
              help={translate('managerHelp')}
              onChange={(event) => change('managerName', event.target.value)}
            />
          </div>

          <Combobox
            label={translate('activity')}
            options={activityOptions}
            value={draft.activity}
            placeholder={translate('activityPlaceholder')}
            emptyMessage={translate('activityEmpty')}
            help={translate('activityHelp')}
            error={errorFor('activity')}
            onChange={(value) => change('activity', value)}
          />

          {draft.activity === otherActivity && (
            <Input
              label={translate('activityOtherField')}
              name="activityOther"
              value={draft.activityOther}
              error={errorFor('activityOther')}
              help={translate('activityHelp')}
              onChange={(event) => change('activityOther', event.target.value)}
            />
          )}

          <Textarea
            label={translate('description')}
            name="businessDescription"
            value={draft.businessDescription}
            error={errorFor('businessDescription')}
            help={translate('descriptionHelp')}
            placeholder={translate('descriptionPlaceholder')}
            maxLength={500}
            onChange={(event) => change('businessDescription', event.target.value)}
          />

          <FileField
            label={translate('logoOptional')}
            hint={canDrag ? translate('logoHint') : translate('logoHintMobile')}
            acceptedFormats={translate('logoFormats')}
            accept="image/jpeg,image/png"
            status={uploading.logo ? 'uploading' : draft.logoFileKey === '' ? 'empty' : 'stored'}
            file={attached.logo}
            error={uploadError?.kind === 'logo' ? uploadError.message : undefined}
            onSelect={(file) => void selectFile('logo', file)}
            onRemove={() => removeFile('logo')}
          />
        </section>

        <section className="flex flex-col gap-4">
          <div>
            <h3 className="text-heading-s text-fg">{translate('branch.title')}</h3>
            <p className="mt-1 text-body-s text-fg-muted">{translate('branch.note')}</p>
          </div>

          <OptionGroup
            legend={translate('branch.modality')}
            name="branchModality"
            value={draft.branchModality}
            error={errorFor('branchModality')}
            onChange={(value) => change('branchModality', value as typeof draft.branchModality)}
            options={[
              {
                value: 'physical',
                title: translate('branch.modalities.physical.title'),
                description: translate('branch.modalities.physical.description'),
              },
              {
                value: 'virtual',
                title: translate('branch.modalities.virtual.title'),
                description: translate('branch.modalities.virtual.description'),
              },
            ]}
          />

          <Input
            label={translate('branch.name')}
            name="branchName"
            value={draft.branchName}
            error={errorFor('branchName')}
            help={translate('branch.nameHelp')}
            onChange={(event) => change('branchName', event.target.value)}
          />

          <div className="grid gap-4 md:grid-cols-3">
            <Select
              label={translate('branch.province')}
              name="province"
              value={province}
              placeholder={translate('branch.province')}
              onChange={(event) => setProvince(event.target.value)}
              options={provinces.map((name) => ({ value: name, label: name }))}
            />
            <Select
              label={translate('branch.canton')}
              name="canton"
              value={draft.canton}
              error={errorFor('canton')}
              placeholder={translate('branch.canton')}
              onChange={(event) => change('canton', event.target.value)}
              options={visibleCantons.map((canton) => ({ value: canton._id, label: canton.name }))}
            />
            <Input
              label={translate('branch.district')}
              name="district"
              value={draft.district}
              error={errorFor('district')}
              onChange={(event) => change('district', event.target.value)}
            />
          </div>

          <Input
            label={translate('branch.address')}
            name="location"
            value={draft.location}
            error={errorFor('location')}
            help={translate('branch.addressHelp')}
            onChange={(event) => change('location', event.target.value)}
          />

          <Input
            label={translate('branch.phone')}
            name="institutionalPhone"
            type="tel"
            value={draft.institutionalPhone}
            error={errorFor('institutionalPhone')}
            help={translate('branch.phoneHelp')}
            onChange={(event) => change('institutionalPhone', event.target.value)}
          />

          <Alert tone="info" title={translate('branch.moreTitle')} />
        </section>
      </div>
    </Card>
  );
}
