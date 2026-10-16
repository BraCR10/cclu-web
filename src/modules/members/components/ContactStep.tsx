import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Alert } from '@/shared/components/Alert';
import { Card } from '@/shared/components/Card';
import { Checkbox } from '@/shared/components/Checkbox';
import { Input } from '@/shared/components/Input';
import { PasswordRules } from '@/shared/components/PasswordRules';
import type { ContactStepForm } from '../hooks/useRegistrationWizard';

export function ContactStep({ form }: { form: ContactStepForm }) {
  const translate = useTranslations('registration.stepThree');
  const { draft, change, changeConsent, errorFor, summary } = form;

  return (
    <Card className="p-6 lg:p-8">
      <h2 className="text-heading-l text-fg">{translate('title')}</h2>
      <p className="mt-1 text-body-m text-fg-secondary">{translate('legend')}</p>

      {/* The summary says how many fields are waiting, so nothing has to be
          hunted for down a form that is longer than a screen. */}
      {summary.length > 0 && (
        <div className="mt-4">
          <Alert
            tone="danger"
            title={translate('summaryTitle', { count: summary.length })}
            message={translate('summaryMessage')}
          />
        </div>
      )}

      <div className="mt-6 flex flex-col gap-8">
        <section className="flex flex-col gap-4">
          <h3 className="text-heading-s text-fg">{translate('contact')}</h3>

          <Input
            label={translate('email')}
            name="email"
            type="email"
            autoComplete="email"
            value={draft.email}
            error={errorFor('email')}
            help={translate('emailHelp')}
            onChange={(event) => change('email', event.target.value)}
          />

          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label={translate('phone')}
              name="phone"
              type="tel"
              value={draft.phone}
              error={errorFor('phone')}
              onChange={(event) => change('phone', event.target.value)}
            />
            <Input
              label={translate('whatsapp')}
              name="whatsappNumber"
              type="tel"
              value={draft.whatsappNumber}
              error={errorFor('whatsappNumber')}
              help={translate('whatsappHelp')}
              onChange={(event) => change('whatsappNumber', event.target.value)}
            />
          </div>

          <Input
            label={translate('website')}
            name="website"
            value={draft.website}
            error={errorFor('website')}
            help={translate('websiteHelp')}
            onChange={(event) => change('website', event.target.value)}
          />
        </section>

        <section className="flex flex-col gap-4">
          <div>
            <h3 className="text-heading-s text-fg">{translate('networks')}</h3>
            <p className="mt-1 text-body-s text-fg-muted">{translate('networksNote')}</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label={translate('instagram')}
              name="instagram"
              value={draft.instagram}
              error={errorFor('instagram')}
              onChange={(event) => change('instagram', event.target.value)}
            />
            <Input
              label={translate('facebook')}
              name="facebook"
              value={draft.facebook}
              error={errorFor('facebook')}
              onChange={(event) => change('facebook', event.target.value)}
            />
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <h3 className="text-heading-s text-fg">{translate('billing')}</h3>

          <Input
            label={translate('billingEmail')}
            name="billingEmail"
            type="email"
            value={draft.billingEmail}
            error={errorFor('billingEmail')}
            help={translate('billingHelp')}
            onChange={(event) => change('billingEmail', event.target.value)}
          />
        </section>

        <section className="flex flex-col gap-4">
          <h3 className="text-heading-s text-fg">{translate('account')}</h3>

          <div>
            <Input
              label={translate('password')}
              name="password"
              type="password"
              autoComplete="new-password"
              value={draft.password}
              error={errorFor('password')}
              onChange={(event) => change('password', event.target.value)}
            />
            <PasswordRules password={draft.password} />
          </div>

          <Input
            label={translate('confirmation')}
            name="passwordConfirmation"
            type="password"
            autoComplete="new-password"
            value={draft.passwordConfirmation}
            error={errorFor('passwordConfirmation')}
            onChange={(event) => change('passwordConfirmation', event.target.value)}
          />
        </section>

        <section className="flex flex-col gap-4">
          <h3 className="text-heading-s text-fg">{translate('consents')}</h3>

          <div className="flex flex-col gap-1">
            <Checkbox
              label={translate('consentStatutes')}
              name="statutes"
              checked={draft.consents.statutes}
              error={errorFor('consentStatutes')}
              onChange={(event) => changeConsent('statutes', event.target.checked)}
            />
            <Link href="/legal/statutes" className="text-label-s text-fg-link md:ml-7">
              {translate('readDocument')}
            </Link>
          </div>

          <div className="flex flex-col gap-1">
            <Checkbox
              label={translate('consentMarketplace')}
              name="marketplaceTerms"
              checked={draft.consents.marketplaceTerms}
              error={errorFor('consentMarketplace')}
              onChange={(event) => changeConsent('marketplaceTerms', event.target.checked)}
            />
            <Link href="/legal/marketplace-terms" className="text-label-s text-fg-link md:ml-7">
              {translate('read')}
            </Link>
          </div>

          <div className="flex flex-col gap-1">
            <Checkbox
              label={translate('consentPrivacy')}
              name="privacyPolicy"
              checked={draft.consents.privacyPolicy}
              error={errorFor('consentPrivacy')}
              onChange={(event) => changeConsent('privacyPolicy', event.target.checked)}
            />
            <Link href="/legal/privacy" className="text-label-s text-fg-link md:ml-7">
              {translate('read')}
            </Link>
          </div>
        </section>
      </div>
    </Card>
  );
}
