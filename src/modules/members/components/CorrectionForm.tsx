'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CircleX } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Alert } from '@/shared/components/Alert';
import { Button } from '@/shared/components/Button';
import { Card } from '@/shared/components/Card';
import { Combobox } from '@/shared/components/Combobox';
import { HelpCard } from '@/shared/components/HelpCard';
import { Input } from '@/shared/components/Input';
import { OptionGroup } from '@/shared/components/OptionGroup';
import { PageHeader } from '@/shared/components/PageHeader';
import { Select } from '@/shared/components/Select';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { useDates } from '@/shared/hooks/useDates';
import { useCorrectionForm } from '../hooks/useCorrectionForm';
import { IDENTIFICATION_TYPES_BY_MEMBER_TYPE } from '../validation/registrationRules';
import { CorrectionSent } from './CorrectionSent';

// Written out rather than looked up by a built key, so a label that stops
// existing stops compiling instead of rendering its own name.
const IDENTIFICATION_LABELS = {
  legal_entity_id: 'form.identificationTypes.legalEntityId',
  national_id: 'form.identificationTypes.nationalId',
  dimex: 'form.identificationTypes.dimex',
  passport: 'form.identificationTypes.passport',
} as const;

type IdentificationType = keyof typeof IDENTIFICATION_LABELS;

// Everything a person may hold, which is what a form with no type chosen yet has
// to offer.
const ALL_IDENTIFICATION_TYPES = Object.keys(IDENTIFICATION_LABELS) as IdentificationType[];

export function CorrectionForm({ token }: { token: string }) {
  const translate = useTranslations('correction');
  const dates = useDates();
  const router = useRouter();
  const form = useCorrectionForm(token);
  const { draft, change, errorFor, otherActivity, cantons, activities } = form;

  // Kept here rather than in the draft: which province narrows the list is a way
  // of finding the cantón, not something the application records.
  const [province, setProvince] = useState('');
  const provinces = [...new Set(cantons.map((canton) => canton.province))].sort();
  const visibleCantons =
    province === '' ? cantons : cantons.filter((canton) => canton.province === province);

  const company = draft.memberType === 'business' || draft.memberType === 'association';
  const identificationTypes: IdentificationType[] =
    draft.memberType === ''
      ? ALL_IDENTIFICATION_TYPES
      : (IDENTIFICATION_TYPES_BY_MEMBER_TYPE[draft.memberType] as IdentificationType[]);

  const rejected = form.applicationStatus === 'rejected';

  // The link is the whole screen: a spent, expired or unknown one leaves nothing
  // to correct, so the answer is the screen rather than a toast over an empty
  // form.
  if (form.state === 'failed') {
    return (
      <Card className="p-6 lg:p-8">
        <CircleX aria-hidden="true" className="h-10 w-10 text-danger" />
        <h1 className="mt-4 text-heading-l text-fg">{translate('invalid.title')}</h1>
        <p className="mt-2 text-body-m text-fg-secondary">
          {form.failureMessage ?? translate('invalid.generic')}
        </p>
        <p className="mt-4 text-body-m text-fg-muted">{translate('invalid.message')}</p>
        <Link
          href="/"
          className="mt-6 flex min-h-11 items-center justify-center rounded-sm bg-primary px-6 text-label-m text-on-primary md:inline-flex md:px-8"
        >
          {translate('invalid.action')}
        </Link>
      </Card>
    );
  }

  if (form.state === 'sent') {
    return <CorrectionSent sent={form.sent} />;
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={translate('page.title')}
        legend={draft.businessName}
        backHref="/"
        backLabel={translate('page.back')}
      />

      {form.state === 'loading' && (
        <Card className="p-6 lg:p-8">
          <p className="text-body-m text-fg-secondary">{translate('loading')}</p>
        </Card>
      )}

      {form.state === 'ready' && (
        <div className="flex flex-col gap-4">
          <Alert
            tone="warning"
            title={translate(rejected ? 'notice.rejectedTitle' : 'notice.title')}
            message={`${form.reason ?? ''} ${translate('notice.instruction')}`.trim()}
          />

          {/* Who decided, and when. It is what makes the notice above a decision
              rather than a message that appeared on its own. */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <StatusBadge
              tone="warning"
              label={translate(rejected ? 'notice.rejectedStatus' : 'notice.status')}
            />
            {form.reviewedAt !== null && form.reviewedBy !== null && (
              <p className="text-body-s text-fg-secondary">
                {translate('notice.reviewed', {
                  date: dates.instant(form.reviewedAt, 'short'),
                  reviewer: form.reviewedBy,
                })}
              </p>
            )}
          </div>

          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-start">
            <Card className="p-6 lg:p-8">
              <h2 className="text-heading-l text-fg">{translate('form.title')}</h2>
              <p className="mt-1 text-body-m text-fg-secondary">{translate('form.legend')}</p>

              <div className="mt-6 flex flex-col gap-8">
                <section className="flex flex-col gap-4">
                  <h3 className="text-heading-s text-fg">{translate('form.account')}</h3>

                  {/* The address is the identity of the account and it is changed
                      by its own flow, so it is read here and not written. */}
                  <Input
                    label={translate('form.email')}
                    name="email"
                    type="email"
                    value={draft.email}
                    help={translate('form.emailFixed')}
                    readOnly
                  />
                </section>

                <section className="flex flex-col gap-4">
                  <h3 className="text-heading-s text-fg">{translate('form.type')}</h3>

                  <OptionGroup
                    legend={translate('form.typeQuestion')}
                    name="memberType"
                    value={draft.memberType}
                    error={errorFor('memberType')}
                    onChange={(value) => change('memberType', value as typeof draft.memberType)}
                    options={[
                      {
                        value: 'business',
                        title: translate('form.types.business.title'),
                        description: translate('form.types.business.description'),
                      },
                      {
                        value: 'association',
                        title: translate('form.types.association.title'),
                        description: translate('form.types.association.description'),
                      },
                      {
                        value: 'independent_professional',
                        title: translate('form.types.independent.title'),
                        description: translate('form.types.independent.description'),
                      },
                    ]}
                  />

                  <div className="grid gap-4 md:grid-cols-2">
                    <Select
                      label={translate('form.identificationType')}
                      name="identificationType"
                      value={draft.identificationType}
                      error={errorFor('identificationType')}
                      onChange={(event) => change('identificationType', event.target.value)}
                      options={identificationTypes.map((type) => ({
                        value: type,
                        label: translate(IDENTIFICATION_LABELS[type]),
                      }))}
                    />
                    <Input
                      label={translate(
                        company
                          ? 'form.identificationNumberCompany'
                          : 'form.identificationNumberPerson',
                      )}
                      name="identificationNumber"
                      value={draft.identificationNumber}
                      error={errorFor('identificationNumber')}
                      onChange={(event) => change('identificationNumber', event.target.value)}
                    />
                  </div>

                  {/* One of the two: what the applicant is decides which one, and
                      the API clears the other. */}
                  {company ? (
                    <Input
                      label={translate('form.legalName')}
                      name="legalName"
                      value={draft.legalName}
                      error={errorFor('legalName')}
                      onChange={(event) => change('legalName', event.target.value)}
                    />
                  ) : (
                    <Input
                      label={translate('form.fullName')}
                      name="name"
                      value={draft.name}
                      error={errorFor('name')}
                      onChange={(event) => change('name', event.target.value)}
                    />
                  )}
                </section>

                <section className="flex flex-col gap-4">
                  <h3 className="text-heading-s text-fg">{translate('form.business')}</h3>

                  <div className="grid gap-4 md:grid-cols-2">
                    <Input
                      label={translate('form.businessName')}
                      name="businessName"
                      value={draft.businessName}
                      error={errorFor('businessName')}
                      onChange={(event) => change('businessName', event.target.value)}
                    />
                    <Input
                      label={translate('form.manager')}
                      name="managerName"
                      value={draft.managerName}
                      error={errorFor('managerName')}
                      onChange={(event) => change('managerName', event.target.value)}
                    />
                  </div>

                  <Combobox
                    label={translate('form.activity')}
                    options={[
                      ...activities.map((activity) => ({
                        value: activity._id,
                        label: activity.name,
                      })),
                      { value: otherActivity, label: translate('form.activityOtherOption') },
                    ]}
                    value={draft.activity}
                    placeholder={translate('form.activityPlaceholder')}
                    emptyMessage={translate('form.activityEmpty')}
                    error={errorFor('activity')}
                    onChange={(value) => change('activity', value)}
                  />

                  {(draft.activity === '' || draft.activity === otherActivity) && (
                    <Input
                      label={translate('form.activityOtherField')}
                      name="activityOther"
                      value={draft.activityOther}
                      error={errorFor('activityOther')}
                      onChange={(event) => change('activityOther', event.target.value)}
                    />
                  )}

                  <div className="grid gap-4 md:grid-cols-3">
                    <Select
                      label={translate('form.province')}
                      name="province"
                      value={province}
                      placeholder={translate('form.province')}
                      onChange={(event) => setProvince(event.target.value)}
                      options={provinces.map((name) => ({ value: name, label: name }))}
                    />
                    <Select
                      label={translate('form.canton')}
                      name="canton"
                      value={draft.canton}
                      error={errorFor('canton')}
                      placeholder={translate('form.canton')}
                      onChange={(event) => change('canton', event.target.value)}
                      options={visibleCantons.map((canton) => ({
                        value: canton._id,
                        label: canton.name,
                      }))}
                    />
                    <Input
                      label={translate('form.district')}
                      name="district"
                      value={draft.district}
                      error={errorFor('district')}
                      onChange={(event) => change('district', event.target.value)}
                    />
                  </div>
                </section>

                <section className="flex flex-col gap-4">
                  <h3 className="text-heading-s text-fg">{translate('form.contact')}</h3>

                  <div className="grid gap-4 md:grid-cols-2">
                    <Input
                      label={translate('form.phone')}
                      name="phone"
                      type="tel"
                      value={draft.phone}
                      error={errorFor('phone')}
                      onChange={(event) => change('phone', event.target.value)}
                    />
                    <Input
                      label={translate('form.whatsapp')}
                      name="whatsappNumber"
                      type="tel"
                      value={draft.whatsappNumber}
                      error={errorFor('whatsappNumber')}
                      onChange={(event) => change('whatsappNumber', event.target.value)}
                    />
                  </div>
                </section>
              </div>

              <div className="mt-8 flex items-center justify-end gap-3 border-t border-line-subtle pt-6">
                <Button type="button" variant="ghost" onClick={() => router.push('/')}>
                  {translate('form.cancel')}
                </Button>
                <Button type="button" loading={form.submitting} onClick={() => void form.submit()}>
                  {translate('form.submit')}
                </Button>
              </div>
            </Card>

            <HelpCard
              title={translate('help.title')}
              items={[translate('help.again'), translate('help.kept'), translate('help.notified')]}
            />
          </div>
        </div>
      )}
    </div>
  );
}
